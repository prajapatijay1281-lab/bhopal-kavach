import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertOctagon,
  Bell,
  Car,
  Megaphone,
  Music,
  Navigation,
  Play,
  Radio,
  ShieldAlert,
  Square,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
} from "lucide-react";
import { INITIAL_UNDERPASS_MONITORS } from "../data/bhopalData";
import { TRANSLATIONS } from "../i18n/translations";
import { CivicReport, CommuterToneId, Language } from "../types/civic";
import { haversineDistanceMeters } from "../utils/geoAndCrypto";
import {
  clearCustomRingtoneBlob,
  loadCustomRingtoneBlob,
  loadRingtonePreference,
  saveCustomRingtoneBlob,
  saveRingtonePreference,
} from "../utils/ringtoneStorage";
import {
  startCommuterAlertAudio,
  stopCommuterAlertAudio,
  unlockAudioContext,
} from "../utils/sirenAudio";
import { KavachLogoBadge } from "./KavachLogoBadge";

interface FloodHazardTarget {
  id: string;
  name: string;
  nameHi: string;
  latitude: number;
  longitude: number;
  waterDepthFt: number;
  alternateRoute: string;
  alternateRouteHi: string;
}

interface CommuterFloodGuardProps {
  language: Language;
  reports: CivicReport[];
}

const PROXIMITY_THRESHOLD_METERS = 500;
const MAX_AUDIO_BYTES = 5 * 1024 * 1024;

export const CommuterFloodGuard: React.FC<CommuterFloodGuardProps> = ({
  language,
  reports,
}) => {
  const t = TRANSLATIONS[language];

  const [guardEnabled, setGuardEnabled] = useState(false);
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [simulatedAlert, setSimulatedAlert] = useState<{
    hazard: FloodHazardTarget;
    distanceMeters: number;
  } | null>(null);
  const [acknowledgedHazardId, setAcknowledgedHazardId] = useState<string | null>(
    null
  );

  // Custom Ringtone state (persisted in localStorage + IndexedDB)
  const [selectedTone, setSelectedTone] = useState<CommuterToneId>(
    () => loadRingtonePreference().toneId
  );
  const [customFileName, setCustomFileName] = useState<string | undefined>(
    () => loadRingtonePreference().customFileName
  );
  const [customBlob, setCustomBlob] = useState<Blob | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
  const previewTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    loadCustomRingtoneBlob().then((blob) => {
      if (!mounted) return;
      if (blob) {
        setCustomBlob(blob);
      } else if (selectedTone === "custom") {
        setSelectedTone("siren");
        saveRingtonePreference({ toneId: "siren" });
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const activeFloodHazards = useMemo<FloodHazardTarget[]>(() => {
    const targets: FloodHazardTarget[] = [];

    for (const up of INITIAL_UNDERPASS_MONITORS) {
      if (up.safetyLevel === "DANGER" || up.safetyLevel === "CAUTION") {
        targets.push({
          id: up.id,
          name: up.name,
          nameHi: up.nameHi,
          latitude: up.latitude,
          longitude: up.longitude,
          waterDepthFt: up.waterDepthFt,
          alternateRoute: up.alternateRoute,
          alternateRouteHi: up.alternateRouteHi,
        });
      }
    }

    for (const r of reports) {
      if (
        r.category === "flood" &&
        r.status !== "resolved" &&
        r.status !== "flagged"
      ) {
        const alreadyCovered = targets.some(
          (hz) =>
            haversineDistanceMeters(hz.latitude, hz.longitude, r.latitude, r.longitude) <
            120
        );
        if (!alreadyCovered) {
          targets.push({
            id: r.id,
            name: r.landmark,
            nameHi: r.landmarkHi,
            latitude: r.latitude,
            longitude: r.longitude,
            waterDepthFt: r.severity === "critical" ? 2.1 : 1.1,
            alternateRoute:
              r.alternateRoute || "Divert via nearest elevated Bhopal arterial.",
            alternateRouteHi:
              r.alternateRouteHi || "निकटतम ऊँचे वैकल्पिक मार्ग का उपयोग करें।",
          });
        }
      }
    }

    return targets;
  }, [reports]);

  // Nearest hazard distance calculation from real watchPosition
  const nearestRealHazard = useMemo(() => {
    if (!liveCoords || activeFloodHazards.length === 0) return null;
    let best: { hazard: FloodHazardTarget; distanceMeters: number } | null = null;
    for (const hz of activeFloodHazards) {
      const dist = haversineDistanceMeters(
        liveCoords.lat,
        liveCoords.lng,
        hz.latitude,
        hz.longitude
      );
      if (!best || dist < best.distanceMeters) {
        best = { hazard: hz, distanceMeters: dist };
      }
    }
    return best;
  }, [liveCoords, activeFloodHazards]);

  const activeOverlayAlert =
    simulatedAlert ??
    (guardEnabled &&
    nearestRealHazard &&
    nearestRealHazard.distanceMeters <= PROXIMITY_THRESHOLD_METERS &&
    acknowledgedHazardId !== nearestRealHazard.hazard.id
      ? nearestRealHazard
      : null);

  // Start / Stop GPS watchPosition when toggle changes
  useEffect(() => {
    if (!guardEnabled) {
      if (
        watchIdRef.current !== null &&
        typeof navigator !== "undefined" &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (!simulatedAlert && !isPreviewPlaying) {
        stopCommuterAlertAudio();
      }
      return;
    }

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setLiveCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setLiveCoords({ lat: 23.2599, lng: 77.4126 });
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 }
      );
    }

    return () => {
      if (
        watchIdRef.current !== null &&
        typeof navigator !== "undefined" &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [guardEnabled, simulatedAlert, isPreviewPlaying]);

  // Trigger selected ringtone whenever full-screen alert overlay becomes active
  useEffect(() => {
    if (activeOverlayAlert) {
      if (previewTimerRef.current !== null) {
        window.clearTimeout(previewTimerRef.current);
        previewTimerRef.current = null;
      }
      setIsPreviewPlaying(false);
      startCommuterAlertAudio({
        toneId: selectedTone,
        language,
        customBlob,
        landmarkName:
          language === "hi"
            ? activeOverlayAlert.hazard.nameHi
            : activeOverlayAlert.hazard.name,
      });
    } else if (!isPreviewPlaying) {
      stopCommuterAlertAudio();
    }
    return () => {
      stopCommuterAlertAudio();
    };
  }, [activeOverlayAlert?.hazard.id, selectedTone, language]);

  const stopPreview = () => {
    if (previewTimerRef.current !== null) {
      window.clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    stopCommuterAlertAudio();
    setIsPreviewPlaying(false);
  };

  const handleSelectTone = (tone: CommuterToneId) => {
    if (tone === "custom" && !customBlob) {
      audioFileInputRef.current?.click();
      return;
    }
    stopPreview();
    setAudioError(null);
    setSelectedTone(tone);
    saveRingtonePreference({ toneId: tone, customFileName });
  };

  const handleCustomAudioUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const validExt = /\.(mp3|wav|ogg)$/i.test(file.name);
    const validMime = file.type.startsWith("audio/");
    if ((!validExt && !validMime) || file.size > MAX_AUDIO_BYTES) {
      setAudioError(t.customAudioError);
      return;
    }

    setAudioError(null);
    stopPreview();
    await saveCustomRingtoneBlob(file);
    setCustomBlob(file);
    setCustomFileName(file.name);
    setSelectedTone("custom");
    saveRingtonePreference({ toneId: "custom", customFileName: file.name });
  };

  const handleRemoveCustomAudio = async () => {
    stopPreview();
    await clearCustomRingtoneBlob();
    setCustomBlob(null);
    setCustomFileName(undefined);
    setSelectedTone("siren");
    saveRingtonePreference({ toneId: "siren" });
  };

  const handleTogglePreview = () => {
    unlockAudioContext();
    if (isPreviewPlaying) {
      stopPreview();
      return;
    }
    setIsPreviewPlaying(true);
    const sampleLandmark =
      language === "hi" ? "VIP रोड (करबला मार्ग)" : "VIP Road (Karbala Stretch)";
    startCommuterAlertAudio({
      toneId: selectedTone,
      language,
      customBlob,
      landmarkName: sampleLandmark,
    });
    previewTimerRef.current = window.setTimeout(() => {
      stopPreview();
    }, 6500);
  };

  const handleToggleGuard = () => {
    unlockAudioContext();
    setAcknowledgedHazardId(null);
    setGuardEnabled((prev) => !prev);
  };

  const handleSimulateApproaching = () => {
    unlockAudioContext();
    stopPreview();
    setGuardEnabled(true);
    setAcknowledgedHazardId(null);
    const target = activeFloodHazards[0] ?? {
      id: "up-vip",
      name: "VIP Road (Karbala Stretch)",
      nameHi: "VIP रोड (करबला मार्ग)",
      latitude: 23.2584,
      longitude: 77.3885,
      waterDepthFt: 2.4,
      alternateRoute: "Shyamla Hills Road → Polytechnic Square → Roshanpura",
      alternateRouteHi: "श्यामला हिल्स रोड → पॉलिटेक्निक चौराहा → रोशनपुरा",
    };
    setSimulatedAlert({
      hazard: target,
      distanceMeters: 310,
    });
  };

  const handleAcknowledgeMute = () => {
    stopCommuterAlertAudio();
    setIsPreviewPlaying(false);
    if (activeOverlayAlert) {
      setAcknowledgedHazardId(activeOverlayAlert.hazard.id);
    }
    setSimulatedAlert(null);
  };

  const toneButtons: {
    id: CommuterToneId;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "siren",
      label: t.toneSirenLabel,
      icon: <ShieldAlert className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: "bell",
      label: t.toneBellLabel,
      icon: <Bell className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: "voice",
      label: t.toneVoiceLabel,
      icon: <Megaphone className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: "custom",
      label: t.toneCustomLabel,
      icon: <Music className="w-3.5 h-3.5 shrink-0" />,
    },
  ];

  return (
    <>
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                guardEnabled ? "bg-[#DC2626] text-white" : "bg-[#0A192F] text-sky-400"
              }`}
            >
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-[#0A192F]">
                  {t.commuterGuardTitle}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                    guardEnabled
                      ? "bg-emerald-100 text-[#059669]"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  <Radio
                    className={`w-3 h-3 ${guardEnabled ? "animate-pulse" : ""}`}
                  />
                  {guardEnabled ? t.commuterGuardOn : t.commuterGuardOff}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{t.commuterGuardDesc}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {guardEnabled && nearestRealHazard && (
              <span className="text-xs font-mono tabular-nums text-slate-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg">
                {language === "hi"
                  ? nearestRealHazard.hazard.nameHi
                  : nearestRealHazard.hazard.name}
                : {nearestRealHazard.distanceMeters}m
              </span>
            )}

            <button
              type="button"
              onClick={handleToggleGuard}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer min-h-[40px] ${
                guardEnabled
                  ? "bg-slate-800 hover:bg-slate-900 text-white"
                  : "bg-[#0284C7] hover:bg-sky-700 text-white"
              }`}
            >
              {guardEnabled ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  {t.commuterTurnOffBtn}
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  {t.commuterTurnOnBtn}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSimulateApproaching}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#DC2626] hover:bg-red-700 text-white text-xs font-bold transition-colors whitespace-nowrap cursor-pointer min-h-[40px]"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              {t.commuterSimulateBtn}
            </button>
          </div>
        </div>

        {/* Custom Flood Ringtone Selector & Personal Audio Upload Bar */}
        <div className="px-4 py-3 border-t border-slate-200 bg-white flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#0A192F] mr-1">
              {t.ringtoneSelectorLabel}:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {toneButtons.map((btn) => {
                const isSelected = selectedTone === btn.id;
                const isCustomEmpty = btn.id === "custom" && !customBlob;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => handleSelectTone(btn.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap cursor-pointer min-h-[36px] ${
                      isSelected
                        ? "bg-[#0A192F] border-[#0A192F] text-white"
                        : isCustomEmpty
                          ? "bg-slate-50 border-dashed border-slate-300 text-slate-600 hover:border-slate-400"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {btn.icon}
                    <span>{btn.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dedicated audio-only input strictly for Commuter Flood Ringtone */}
            <input
              ref={audioFileInputRef}
              type="file"
              accept="audio/mpeg,audio/wav,audio/ogg,.mp3,.wav,.ogg"
              onChange={handleCustomAudioUpload}
              className="hidden"
              aria-label={t.uploadAudioBtn}
            />

            <button
              type="button"
              onClick={() => audioFileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold whitespace-nowrap cursor-pointer min-h-[36px]"
            >
              <Upload className="w-3.5 h-3.5 text-[#0284C7]" />
              {t.uploadAudioBtn}
            </button>

            {customFileName && customBlob && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-[11px] font-medium text-[#0A192F] max-w-[220px]">
                <Music className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                <span className="truncate" title={customFileName}>
                  {t.customAudioSavedPrefix} {customFileName}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveCustomAudio}
                  aria-label={t.removeCustomAudioBtn}
                  className="text-red-600 hover:text-red-700 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleTogglePreview}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer min-h-[36px] ${
                isPreviewPlaying
                  ? "bg-[#DC2626] hover:bg-red-700 text-white"
                  : "bg-[#0284C7] hover:bg-sky-700 text-white"
              }`}
            >
              {isPreviewPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5" />
                  {t.stopTestRingtoneBtn}
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  {t.testRingtoneBtn}
                </>
              )}
            </button>
          </div>
        </div>

        {audioError && (
          <div className="px-4 py-2 border-t border-red-200 bg-red-50 text-xs text-red-700 font-medium">
            {audioError}
          </div>
        )}
      </section>

      {/* Full-Screen High-Contrast Red Proximity Flood Detour Overlay */}
      {activeOverlayAlert && (
        <div
          className="fixed inset-0 z-50 bg-[#DC2626] text-white flex items-center justify-center p-4 sm:p-6"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="commuter-siren-title"
        >
          <div className="max-w-xl w-full bg-[#991B1B] border-2 border-red-300/60 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-center">
            <div className="flex items-center justify-center gap-3">
              <KavachLogoBadge size="md" />
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white text-[#DC2626] animate-pulse">
                <AlertOctagon className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-mono tabular-nums uppercase tracking-widest text-red-100">
                {t.commuterOverlayEyebrow} · {activeOverlayAlert.distanceMeters}m
              </div>
              <h2
                id="commuter-siren-title"
                className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
              >
                {t.commuterOverlayHeadline}
              </h2>
              <p className="text-sm sm:text-base font-semibold text-red-50">
                {language === "hi"
                  ? activeOverlayAlert.hazard.nameHi
                  : activeOverlayAlert.hazard.name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left bg-black/25 rounded-xl p-4 border border-white/15">
              <div>
                <div className="text-[11px] text-red-200 font-semibold">
                  {t.commuterDistanceLabel}
                </div>
                <div className="text-lg font-mono tabular-nums font-bold">
                  {activeOverlayAlert.distanceMeters} m
                </div>
              </div>
              <div>
                <div className="text-[11px] text-red-200 font-semibold">
                  {t.commuterWaterDepthLabel}
                </div>
                <div className="text-lg font-mono tabular-nums font-bold">
                  {activeOverlayAlert.hazard.waterDepthFt.toFixed(1)} ft
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white text-[#0A192F] p-4 text-left space-y-1">
              <div className="text-xs font-bold text-[#0284C7] flex items-center gap-1.5">
                <Navigation className="w-4 h-4" />
                {t.commuterSafeDetourLabel}
              </div>
              <div className="text-sm font-bold leading-snug">
                {language === "hi"
                  ? activeOverlayAlert.hazard.alternateRouteHi
                  : activeOverlayAlert.hazard.alternateRoute}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAcknowledgeMute}
              className="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-slate-100 text-[#991B1B] text-sm font-extrabold transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
            >
              <VolumeX className="w-5 h-5" />
              {t.commuterAcknowledgeMuteBtn}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
