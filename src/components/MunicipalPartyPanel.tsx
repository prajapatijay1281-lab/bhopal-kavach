import React, { useState } from "react";
import {
  CheckCircle2,
  Lock,
  MapPin,
  Navigation,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { BMC_SANITATION_ZONES } from "../data/bhopalData";
import { TRANSLATIONS } from "../i18n/translations";
import { CivicReport, Language } from "../types/civic";
import { haversineDistanceMeters } from "../utils/geoAndCrypto";
import { EvidenceVisual } from "./EvidenceVisual";
import {
  LiveCameraCapture,
  LiveCameraCaptureResult,
} from "./LiveCameraCapture";

interface MunicipalPartyPanelProps {
  language: Language;
  reports: CivicReport[];
  onUpdateReport: (updated: CivicReport) => void;
  onJumpToCitizenMap: (report: CivicReport) => void;
}

const MAX_CREW_ARRIVAL_METERS = 50;

export const MunicipalPartyPanel: React.FC<MunicipalPartyPanelProps> = ({
  language,
  reports,
  onUpdateReport,
  onJumpToCitizenMap,
}) => {
  const t = TRANSLATIONS[language];

  const [queueTab, setQueueTab] = useState<"active" | "completed">("active");
  const [wardFilter, setWardFilter] = useState<string>("all");

  // Step 0: Per-job GPS arrival distance & demo arrival switch
  const [crewDistances, setCrewDistances] = useState<Record<string, number>>({});
  const [checkingGpsId, setCheckingGpsId] = useState<string | null>(null);

  // Step 1 & Step 2: Mandatory Before-Cleaning + After-Cleaning Live Camera Proofs
  const [beforePhotos, setBeforePhotos] = useState<
    Record<string, LiveCameraCaptureResult>
  >({});
  const [afterPhotos, setAfterPhotos] = useState<
    Record<string, LiveCameraCaptureResult>
  >({});
  const [crewNotes, setCrewNotes] = useState<Record<string, string>>({});
  const [completionBanner, setCompletionBanner] = useState<string | null>(null);

  // Only AI-verified tasks assigned to Municipal Party — prioritizing Flood-Trigger Drain Blockages
  const activeFieldJobs = reports
    .filter(
      (r) =>
        !r.aiVerification.isFraudOrSpam &&
        (r.status === "dispatched" || r.status === "broadcasted") &&
        (wardFilter === "all" || r.bmcZone === wardFilter)
    )
    .sort((a, b) => {
      const aTrigger = a.isFloodTriggerDrainBlockage ? 1 : 0;
      const bTrigger = b.isFloodTriggerDrainBlockage ? 1 : 0;
      return bTrigger - aTrigger;
    });

  const completedJobs = reports.filter(
    (r) =>
      r.status === "resolved" && (wardFilter === "all" || r.bmcZone === wardFilter)
  );

  const displayedJobs = queueTab === "active" ? activeFieldJobs : completedJobs;

  const handleCheckSiteGps = (job: CivicReport) => {
    setCheckingGpsId(job.id);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setCrewDistances((prev) => ({
        ...prev,
        [job.id]: haversineDistanceMeters(23.2599, 77.4126, job.latitude, job.longitude),
      }));
      setCheckingGpsId(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = haversineDistanceMeters(
          pos.coords.latitude,
          pos.coords.longitude,
          job.latitude,
          job.longitude
        );
        setCrewDistances((prev) => ({ ...prev, [job.id]: dist }));
        setCheckingGpsId(null);
      },
      () => {
        const dist = haversineDistanceMeters(
          23.2599,
          77.4126,
          job.latitude,
          job.longitude
        );
        setCrewDistances((prev) => ({ ...prev, [job.id]: dist }));
        setCheckingGpsId(null);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 5000 }
    );
  };

  const handleSimulateArrival = (job: CivicReport) => {
    setCrewDistances((prev) => ({ ...prev, [job.id]: 18 }));
  };

  const handleResolveJob = (report: CivicReport) => {
    const beforeProof = beforePhotos[report.id];
    const afterProof = afterPhotos[report.id];
    const arrivalDist = crewDistances[report.id];

    if (
      !beforeProof?.imageUrl ||
      !afterProof?.imageUrl ||
      arrivalDist === undefined ||
      arrivalDist > MAX_CREW_ARRIVAL_METERS
    ) {
      return;
    }

    onUpdateReport({
      ...report,
      status: "resolved",
      isEmergencyBroadcast: false,
      beforeCleanupImageUrl: beforeProof.imageUrl,
      beforeCleanupHash: beforeProof.sha256Signature,
      beforeCleanupTimestampIso: beforeProof.timestampIso,
      arrivalDistanceMeters: arrivalDist,
      afterCleanupImageUrl: afterProof.imageUrl,
      afterCleanupHash: afterProof.sha256Signature,
      resolvedAt: "Just now",
      resolvedByCrew: report.assignedUnit || "BMC Field Party",
      cleanupNotes:
        crewNotes[report.id]?.trim() ||
        (language === "hi"
          ? "स्थल पर 50 मी. GPS लॉक के साथ पहले और बाद की लाइव फोटो द्वारा सफाई सत्यापित।"
          : "Site cleared and verified with 50m GPS lock and 2-stage Before/After live camera proof."),
    });

    setCompletionBanner(
      language === "hi"
        ? `${report.referenceCode} 2-चरण प्रमाण सहित पूर्ण चिह्नित — नागरिक मानचित्र पर हरा मार्कर अपडेट।`
        : `${report.referenceCode} verified with 2-stage Before/After proof — Citizen Map marker turned Emerald Green.`
    );
    setTimeout(() => setCompletionBanner(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs font-semibold text-[#059669]">{t.municipalEyebrow}</div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-[#0A192F]">
            {t.municipalHeading}
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl">{t.municipalSubheading}</p>
        </div>

        {completionBanner && (
          <div className="rounded-lg bg-[#059669] text-white px-4 py-2 text-xs font-semibold shadow-xs">
            {completionBanner}
          </div>
        )}
      </div>

      {/* Ward-Wise Filter & Queue Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setQueueTab("active")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              queueTab === "active"
                ? "bg-white text-[#0A192F] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.tabActiveQueue} ({activeFieldJobs.length})
          </button>
          <button
            type="button"
            onClick={() => setQueueTab("completed")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              queueTab === "completed"
                ? "bg-white text-[#059669] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.tabCompletedJobs} ({completedJobs.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            aria-label={t.wardFilterAll}
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#059669]"
          >
            <option value="all">{t.wardFilterAll}</option>
            {BMC_SANITATION_ZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ward-Wise Action Queue Cards */}
      {displayedJobs.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-sm text-slate-500">
          {t.noFieldJobsMsg}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayedJobs.map((job) => {
            const crewDist = crewDistances[job.id];
            const isWithin50m =
              crewDist !== undefined && crewDist <= MAX_CREW_ARRIVAL_METERS;
            const beforeProof = beforePhotos[job.id];
            const afterProof = afterPhotos[job.id];
            const hasBefore = Boolean(beforeProof?.imageUrl);
            const hasAfter = Boolean(afterProof?.imageUrl);
            const canResolve = isWithin50m && hasBefore && hasAfter;
            const isResolved = job.status === "resolved";

            return (
              <article
                key={job.id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Job Metadata Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="min-w-0">
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
                        <span className="font-mono tabular-nums font-bold text-[#0A192F]">
                          {job.referenceCode}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-[#0284C7]">{job.bmcZone}</span>
                      </div>
                      <h2 className="mt-1 text-base font-bold text-[#0A192F] leading-snug">
                        {language === "hi" ? job.titleHi : job.title}
                      </h2>
                      <div className="mt-0.5 text-xs text-slate-600">
                        {language === "hi" ? job.landmarkHi : job.landmark} ·{" "}
                        {language === "hi" ? job.wardHi : job.ward}
                      </div>
                      {job.isFloodTriggerDrainBlockage && (
                        <div className="mt-1.5 inline-block rounded bg-amber-100 border border-amber-300 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                          {t.drainTriggerTag}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold ${
                          isResolved
                            ? "text-[#059669]"
                            : job.severity === "critical"
                              ? "text-[#EA580C]"
                              : "text-[#D97706]"
                        }`}
                      >
                        {isResolved
                          ? t.statusResolved
                          : job.severity === "critical"
                            ? t.severityCritical
                            : t.severityModerate}
                      </span>
                      <div className="mt-0.5 text-[11px] font-mono tabular-nums text-slate-500">
                        AI {job.aiVerification.trustScore}%
                      </div>
                    </div>
                  </div>

                  {/* Coordinates & Dispatch Unit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div>
                      <div className="text-slate-500 font-medium">{t.coordinatesLabel}</div>
                      <div className="mt-0.5 font-mono tabular-nums font-semibold text-[#0A192F] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#0284C7]" />
                        {job.latitude.toFixed(4)}° N, {job.longitude.toFixed(4)}° E
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-medium">
                        {t.fieldInstructionsLabel}
                      </div>
                      <div className="mt-0.5 font-semibold text-[#0A192F] flex items-center gap-1 truncate">
                        <Wrench className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                        <span className="truncate">{job.assignedUnit || job.bmcZone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Citizen Original Evidence */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-slate-700">
                      {t.citizenPhotoLabel}
                    </div>
                    <EvidenceVisual
                      imageUrl={job.imageUrl}
                      demoVisualKey={job.demoVisualKey}
                      alt={job.title}
                      className="w-full h-36"
                    />
                  </div>

                  {isResolved ? (
                    /* Resolved 3-Way Proof Display */
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="text-xs font-bold text-[#059669] flex items-center justify-between gap-2">
                        <span>{t.threeWayComparisonHeading}</span>
                        {job.arrivalDistanceMeters !== undefined && (
                          <span className="font-mono tabular-nums text-[11px] text-slate-600">
                            GPS {job.arrivalDistanceMeters}m
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold text-[#EA580C]">
                            {t.municipalBeforeLabel}
                          </div>
                          <EvidenceVisual
                            imageUrl={job.beforeCleanupImageUrl}
                            demoVisualKey={
                              job.beforeCleanupVisualKey || job.demoVisualKey
                            }
                            alt={t.municipalBeforeLabel}
                            className="w-full h-32"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold text-[#059669]">
                            {t.municipalAfterLabel}
                          </div>
                          <EvidenceVisual
                            imageUrl={job.afterCleanupImageUrl}
                            demoVisualKey={job.afterCleanupVisualKey}
                            alt={t.municipalAfterLabel}
                            className="w-full h-32"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Active Job: Step 0 GPS Proximity (<=50m) + Step 1 Before + Step 2 After */
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      {/* Step 0: On-Site GPS Arrival Verification */}
                      <div
                        className={`rounded-xl border p-3.5 space-y-2.5 ${
                          isWithin50m
                            ? "border-emerald-200 bg-emerald-50/70"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[#0A192F] inline-flex items-center gap-1.5">
                            <Navigation className="w-3.5 h-3.5 text-[#0284C7]" />
                            {t.gpsArrivalHeading}
                          </span>
                          {crewDist !== undefined && (
                            <span
                              className={`font-mono tabular-nums text-[11px] font-bold ${
                                isWithin50m ? "text-[#059669]" : "text-[#EA580C]"
                              }`}
                            >
                              {t.crewDistanceAwayPrefix} {crewDist}m
                            </span>
                          )}
                        </div>

                        {isWithin50m ? (
                          <div className="text-[11px] font-semibold text-[#059669] inline-flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {t.crewWithin50mBadge}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {t.crewTooFarWarning}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCheckSiteGps(job)}
                            disabled={checkingGpsId === job.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A192F] hover:bg-[#142c50] text-white text-xs font-semibold cursor-pointer disabled:opacity-60 min-h-[36px]"
                          >
                            <MapPin className="w-3.5 h-3.5 text-sky-400" />
                            {t.checkCrewGpsBtn}
                          </button>

                          {!isWithin50m && (
                            <button
                              type="button"
                              onClick={() => handleSimulateArrival(job)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-50 text-[#059669] text-xs font-semibold cursor-pointer min-h-[36px]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {t.simulateArrivalBtn}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Step 1 & Step 2 Side-by-Side Live Camera Proof */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Step 1: Arrival Before-Cleaning */}
                        <div className="space-y-1.5">
                          <div className="text-xs font-bold text-[#EA580C]">
                            {t.stage1BeforeHeading}
                          </div>
                          {isWithin50m ? (
                            <LiveCameraCapture
                              language={language}
                              latitude={job.latitude}
                              longitude={job.longitude}
                              landmark={
                                language === "hi" ? job.landmarkHi : job.landmark
                              }
                              modeLabel="BMC ARRIVAL BEFORE-CLEANING"
                              accentColor="orange"
                              compact
                              captureBtnLabel={t.captureBeforeEvidenceBtn}
                              capturedImageUrl={beforeProof?.imageUrl}
                              capturedHash={beforeProof?.sha256Signature}
                              capturedTimestampIso={beforeProof?.timestampIso}
                              captureSource={beforeProof?.captureSource}
                              onCapture={(res) =>
                                setBeforePhotos((prev) => ({
                                  ...prev,
                                  [job.id]: res,
                                }))
                              }
                              onClear={() => {
                                setBeforePhotos((prev) => {
                                  const next = { ...prev };
                                  delete next[job.id];
                                  return next;
                                });
                                setAfterPhotos((prev) => {
                                  const next = { ...prev };
                                  delete next[job.id];
                                  return next;
                                });
                              }}
                            />
                          ) : (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center space-y-1.5 h-36 flex flex-col items-center justify-center">
                              <Lock className="w-5 h-5 text-slate-400" />
                              <div className="text-[11px] font-medium text-slate-500">
                                {t.stage1BeforeHint}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Step 2: Completion After-Cleaning */}
                        <div className="space-y-1.5">
                          <div className="text-xs font-bold text-[#059669]">
                            {t.stage2AfterHeading}
                          </div>
                          {isWithin50m && hasBefore ? (
                            <LiveCameraCapture
                              language={language}
                              latitude={job.latitude}
                              longitude={job.longitude}
                              landmark={
                                language === "hi" ? job.landmarkHi : job.landmark
                              }
                              modeLabel="BMC SPOTLESS AFTER-CLEANING"
                              accentColor="emerald"
                              compact
                              captureBtnLabel={t.captureAfterEvidenceBtn}
                              capturedImageUrl={afterProof?.imageUrl}
                              capturedHash={afterProof?.sha256Signature}
                              capturedTimestampIso={afterProof?.timestampIso}
                              captureSource={afterProof?.captureSource}
                              onCapture={(res) =>
                                setAfterPhotos((prev) => ({
                                  ...prev,
                                  [job.id]: res,
                                }))
                              }
                              onClear={() =>
                                setAfterPhotos((prev) => {
                                  const next = { ...prev };
                                  delete next[job.id];
                                  return next;
                                })
                              }
                            />
                          ) : (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center space-y-1.5 h-36 flex flex-col items-center justify-center">
                              <Lock className="w-5 h-5 text-slate-400" />
                              <div className="text-[11px] font-medium text-slate-500">
                                {t.stage2AfterLockedHint}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Closed-Loop Resolution Footer */}
                {isResolved ? (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[#059669]">
                      <CheckCircle2 className="w-4 h-4" />
                      {t.completedBadgeText}
                    </span>
                    <button
                      type="button"
                      onClick={() => onJumpToCitizenMap(job)}
                      className="text-[#0284C7] font-semibold hover:underline cursor-pointer"
                    >
                      {t.openOnMapBtn}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {t.cleanupNotesLabel}
                      </label>
                      <input
                        type="text"
                        value={crewNotes[job.id] ?? ""}
                        onChange={(e) =>
                          setCrewNotes((prev) => ({ ...prev, [job.id]: e.target.value }))
                        }
                        placeholder={t.cleanupNotesPlaceholder}
                        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                      />
                    </div>

                    {!canResolve && (
                      <div className="text-[11px] text-amber-700 font-medium">
                        {t.bothPhotosRequiredMsg}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleResolveJob(job)}
                      disabled={!canResolve}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#059669] hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed min-h-[44px]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {t.markJobResolvedBtn}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
