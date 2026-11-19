import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Loader2,
  MapPin,
  Navigation,
  ShieldAlert,
  Trash2,
  Waves,
} from "lucide-react";
import { BHOPAL_LANDMARKS, INITIAL_BHOPAL_ZONES } from "../data/bhopalData";
import { TRANSLATIONS } from "../i18n/translations";
import {
  detectFloodTriggerDrainRisk,
  getLiveGeolocation,
  verifyImageWithAI,
} from "../services/civicApi";
import {
  CivicReport,
  IncidentCategory,
  Language,
  SeverityLevel,
} from "../types/civic";
import { BhopalMap } from "./BhopalMap";
import { CommuterFloodGuard } from "./CommuterFloodGuard";
import { EvidenceVisual } from "./EvidenceVisual";
import {
  LiveCameraCapture,
  LiveCameraCaptureResult,
} from "./LiveCameraCapture";
import { UnderpassSafetyStrip } from "./UnderpassSafetyStrip";

interface CitizenPortalProps {
  language: Language;
  reports: CivicReport[];
  onAddReport: (report: CivicReport) => void;
  selectedMapReportId?: string;
  onSelectMapReport: (report: CivicReport) => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  language,
  reports,
  onAddReport,
  selectedMapReportId,
  onSelectMapReport,
}) => {
  const t = TRANSLATIONS[language];

  const [category, setCategory] = useState<IncidentCategory>("waste");
  const [severity, setSeverity] = useState<SeverityLevel>("moderate");
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>(BHOPAL_LANDMARKS[1].id);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: BHOPAL_LANDMARKS[1].latitude,
    longitude: BHOPAL_LANDMARKS[1].longitude,
  });
  const [gpsStatusNote, setGpsStatusNote] = useState<string>("");
  const [isLocating, setIsLocating] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");

  const [capturedPhoto, setCapturedPhoto] = useState<LiveCameraCaptureResult | null>(
    null
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
  const [trackerFilter, setTrackerFilter] = useState<"all" | "mine" | "flood" | "waste">("all");
  const [mySubmittedIds, setMySubmittedIds] = useState<string[]>([]);

  const currentLandmark =
    BHOPAL_LANDMARKS.find((l) => l.id === selectedLandmarkId) ?? BHOPAL_LANDMARKS[0];

  const handleCategorySwitch = (nextCategory: IncidentCategory) => {
    setCategory(nextCategory);
    if (nextCategory === "flood" && severity === "low") {
      setSeverity("critical");
    }
  };

  const handleLandmarkChange = (landmarkId: string) => {
    setSelectedLandmarkId(landmarkId);
    const lm = BHOPAL_LANDMARKS.find((l) => l.id === landmarkId);
    if (lm) {
      setCoords({ latitude: lm.latitude, longitude: lm.longitude });
      setGpsStatusNote(
        language === "hi"
          ? `${lm.nameHi} (${lm.wardHi}) पर पिन सेट किया गया।`
          : `Pinned to ${lm.name} (${lm.ward}).`
      );
    }
  };

  const handleDetectGPS = async () => {
    setIsLocating(true);
    const result = await getLiveGeolocation();
    setCoords({ latitude: result.latitude, longitude: result.longitude });
    setGpsStatusNote(language === "hi" ? result.noteHi : result.noteEn);
    setIsLocating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim() || !description.trim()) {
      setSubmitError(
        language === "hi"
          ? "कृपया घटना का शीर्षक और संक्षिप्त विवरण दर्ज करें।"
          : "Please enter an incident headline and brief field description."
      );
      return;
    }

    if (!capturedPhoto?.imageUrl) {
      setSubmitError(t.livePhotoRequiredError);
      return;
    }

    setIsSubmitting(true);
    try {
      const aiVerification = await verifyImageWithAI({
        imageDataUrl: capturedPhoto.imageUrl,
        category,
        landmark: currentLandmark.name,
        landmarkHi: currentLandmark.nameHi,
        description: description.trim(),
        severity,
        fileName: `${capturedPhoto.captureSource}_${capturedPhoto.sha256Signature}.jpg`,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      const reportId = `rep-${Date.now()}`;
      const randomNum = Math.floor(1050 + Math.random() * 8900);

      const drainRisk = detectFloodTriggerDrainRisk({
        category,
        landmark: currentLandmark.name,
        title: title.trim(),
        description: description.trim(),
        isDrainageRiskZone: currentLandmark.isDrainageRiskZone,
      });

      const newStatus = aiVerification.isFraudOrSpam
        ? "flagged"
        : aiVerification.trustScore >= 75
          ? "ai_verified"
          : "submitted";

      const newReport: CivicReport = {
        id: reportId,
        referenceCode: `BKV-2026-${randomNum}`,
        title: title.trim(),
        titleHi: title.trim(),
        category,
        severity,
        status: newStatus,
        landmark: currentLandmark.name,
        landmarkHi: currentLandmark.nameHi,
        ward: currentLandmark.ward,
        wardHi: currentLandmark.wardHi,
        bmcZone: currentLandmark.bmcZone,
        latitude: coords.latitude,
        longitude: coords.longitude,
        description: description.trim(),
        descriptionHi: description.trim(),
        reporterName:
          reporterName.trim() || (language === "hi" ? "भोपाल नागरिक" : "Bhopal Citizen"),
        reportedAt: "Just now",
        reportedAtHi: "अभी-अभी",
        auditTimestampIso: capturedPhoto.timestampIso,
        cryptographicHash: capturedPhoto.sha256Signature,
        captureSource: capturedPhoto.captureSource,
        imageUrl: capturedPhoto.imageUrl,
        demoVisualKey:
          category === "flood" ? "flood_habibganj_underpass" : "waste_mp_nagar",
        alternateRoute:
          category === "flood" ? currentLandmark.suggestedAlternateRoute : undefined,
        alternateRouteHi:
          category === "flood" ? currentLandmark.suggestedAlternateRouteHi : undefined,
        isEmergencyBroadcast: false,
        isFloodTriggerDrainBlockage:
          !aiVerification.isFraudOrSpam && drainRisk.isFloodTriggerDrainBlockage,
        drainTriggerReasonEn: drainRisk.reasonEn,
        drainTriggerReasonHi: drainRisk.reasonHi,
        aiVerification,
      };

      onAddReport(newReport);
      setMySubmittedIds((prev) => [reportId, ...prev]);
      setLastSubmittedId(reportId);
      setTitle("");
      setDescription("");
      setCapturedPhoto(null);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Unable to verify and submit report."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const lastSubmittedReport = reports.find((r) => r.id === lastSubmittedId);

  const trackedReports = reports.filter((r) => {
    if (trackerFilter === "mine") return mySubmittedIds.includes(r.id);
    if (trackerFilter === "flood") return r.category === "flood";
    if (trackerFilter === "waste") return r.category === "waste";
    return true;
  });

  const workflowStages = [
    { id: "submitted", label: t.stageSubmitted },
    { id: "ai_verified", label: t.stageVerified },
    { id: "dispatched", label: t.stageAssigned },
    { id: "resolved", label: t.stageResolved },
  ];

  const liveDrainRiskPreview = detectFloodTriggerDrainRisk({
    category,
    landmark: currentLandmark.name,
    title,
    description,
    isDrainageRiskZone: currentLandmark.isDrainageRiskZone,
  });

  const handleLocateFromUnderpass = (reportId?: string) => {
    if (reportId) {
      const target = reports.find((r) => r.id === reportId);
      if (target) onSelectMapReport(target);
    }
    const mapEl = document.getElementById("bhopal-status-map");
    if (mapEl) mapEl.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {/* Commuter Proximity Flood Guard (500m GPS Siren + Detour Overlay) */}
      <CommuterFloodGuard language={language} reports={reports} />

      {/* Bhopal Low-Lying Roads & Underpass Safety Monitor */}
      <UnderpassSafetyStrip
        language={language}
        reports={reports}
        onLocateCoords={handleLocateFromUnderpass}
      />

      {/* Compact Bhopal Lakes & Corridor Telemetry Strip */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-[#0284C7]" />
            <span className="text-xs font-bold text-[#0A192F]">{t.telemetryHeading}</span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              · {t.telemetrySubheading}
            </span>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            23.2599° N · 77.4126° E
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          {INITIAL_BHOPAL_ZONES.map((zone) => {
            const statusText =
              zone.status === "Alert"
                ? t.statusAlert
                : zone.status === "Watch"
                  ? t.statusWatch
                  : t.statusNormal;
            const statusClass =
              zone.status === "Alert"
                ? "text-[#EA580C]"
                : zone.status === "Watch"
                  ? "text-[#D97706]"
                  : "text-[#059669]";

            return (
              <div key={zone.id} className="p-3.5 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#0A192F] truncate">
                    {language === "hi" ? zone.nameHi : zone.name}
                  </span>
                  <span className={`text-[11px] font-bold shrink-0 ${statusClass}`}>
                    {statusText}
                  </span>
                </div>
                <div className="text-xs font-mono tabular-nums text-slate-700 font-semibold">
                  {zone.waterLevelOrLoad}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {language === "hi" ? zone.detailHi : zone.detail}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Panel 1 Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs font-semibold text-[#0284C7]">{t.citizenEyebrow}</div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-[#0A192F] text-balance">
            {t.citizenHeading}
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl">{t.citizenSubheading}</p>
        </div>
      </div>

      {/* Main Swiss-Grid Split: Dual Quick-Report Form + Live Bhopal Status Map */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Dual Quick-Report Form */}
        <section className="xl:col-span-6 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              {t.formStepCategory}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => handleCategorySwitch("waste")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  category === "waste"
                    ? "bg-[#0284C7] text-white shadow-xs"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                {t.categoryWasteBtn}
              </button>
              <button
                type="button"
                onClick={() => handleCategorySwitch("flood")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  category === "flood"
                    ? "bg-[#EA580C] text-white shadow-xs"
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                <Droplets className="w-4 h-4 shrink-0" />
                {t.categoryFloodBtn}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Severity Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                {t.formStepSeverity}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "low", label: t.severityLow },
                    { id: "moderate", label: t.severityModerate },
                    { id: "critical", label: t.severityCritical },
                  ] as { id: SeverityLevel; label: string }[]
                ).map((lvl) => {
                  const active = severity === lvl.id;
                  const activeClasses =
                    lvl.id === "critical"
                      ? "bg-orange-50 border-[#EA580C] text-[#EA580C]"
                      : lvl.id === "moderate"
                        ? "bg-amber-50 border-[#D97706] text-amber-800"
                        : "bg-sky-50 border-[#0284C7] text-[#0284C7]";

                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSeverity(lvl.id)}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                        active
                          ? activeClasses
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  );
                })}
              </div>
              {severity === "critical" && category === "flood" && (
                <p className="mt-1.5 text-xs text-[#EA580C] font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {t.criticalFloodWarning}
                </p>
              )}
            </div>

            {/* Ward & Auto-GPS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="bhopal-ward-select"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  {t.formStepWard}
                </label>
                <select
                  id="bhopal-ward-select"
                  value={selectedLandmarkId}
                  onChange={(e) => handleLandmarkChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                >
                  {BHOPAL_LANDMARKS.map((lm) => (
                    <option key={lm.id} value={lm.id}>
                      {language === "hi" ? lm.nameHi : lm.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.formGpsLabel}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono tabular-nums text-slate-700 truncate">
                    {coords.latitude.toFixed(4)}° N, {coords.longitude.toFixed(4)}° E
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0A192F] hover:bg-[#142c50] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
                  >
                    {isLocating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Navigation className="w-3.5 h-3.5 text-sky-400" />
                    )}
                    {isLocating ? t.detectingGpsBtn : t.detectGpsBtn}
                  </button>
                </div>
              </div>
            </div>

            {gpsStatusNote && (
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                <span>{gpsStatusNote}</span>
              </div>
            )}

            {liveDrainRiskPreview.isFloodTriggerDrainBlockage && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 font-medium">
                <span className="font-bold">{t.drainTriggerTag}</span>
                <span className="mx-1.5" aria-hidden="true">
                  ·
                </span>
                <span>{t.drainTriggerExplain}</span>
              </div>
            )}

            <BhopalMap
              language={language}
              reports={reports}
              pickerMode
              pickedCoords={coords}
              onPickCoords={(newCoords) => {
                setCoords(newCoords);
                setGpsStatusNote(
                  `${newCoords.latitude.toFixed(4)}° N, ${newCoords.longitude.toFixed(4)}° E`
                );
              }}
              heightClass="h-[190px]"
              showFilterBar={false}
            />

            {/* Headline & Details */}
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="citizen-title"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  {t.formStepTitle}
                </label>
                <input
                  id="citizen-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    category === "flood" ? t.titlePlaceholderFlood : t.titlePlaceholderWaste
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[16px] sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>

              <div>
                <label
                  htmlFor="citizen-desc"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  {t.formFieldDesc}
                </label>
                <textarea
                  id="citizen-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.descPlaceholder}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[16px] sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>

              <div>
                <label
                  htmlFor="citizen-reporter"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  {t.formReporterName}
                </label>
                <input
                  id="citizen-reporter"
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder={t.reporterPlaceholder}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[16px] sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                />
              </div>
            </div>

            {/* Hardware-Locked Live Camera Capture (Zero File Uploads) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t.formStepEvidence}
              </label>
              <LiveCameraCapture
                language={language}
                latitude={coords.latitude}
                longitude={coords.longitude}
                landmark={language === "hi" ? currentLandmark.nameHi : currentLandmark.name}
                modeLabel={category === "flood" ? "FLOOD CAM LOCK" : "SANITATION CAM LOCK"}
                accentColor={category === "flood" ? "orange" : "sky"}
                capturedImageUrl={capturedPhoto?.imageUrl}
                capturedHash={capturedPhoto?.sha256Signature}
                capturedTimestampIso={capturedPhoto?.timestampIso}
                captureSource={capturedPhoto?.captureSource}
                onCapture={(res) => {
                  setSubmitError(null);
                  setCapturedPhoto(res);
                }}
                onClear={() => setCapturedPhoto(null)}
              />
            </div>

            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 font-medium">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
                category === "flood"
                  ? "bg-[#EA580C] hover:bg-orange-700"
                  : "bg-[#0284C7] hover:bg-sky-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.submittingBtn}
                </>
              ) : category === "flood" ? (
                t.submitFloodBtn
              ) : (
                t.submitWasteBtn
              )}
            </button>
          </form>

          {lastSubmittedReport && (
            <div
              className={`rounded-lg border p-4 text-xs space-y-1.5 ${
                lastSubmittedReport.status === "flagged"
                  ? "border-amber-300 bg-amber-50 text-amber-900"
                  : "border-emerald-200 bg-emerald-50 text-emerald-900"
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  {lastSubmittedReport.status === "flagged" ? (
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  )}
                  {t.submittedBannerPrefix}: {lastSubmittedReport.referenceCode}
                </span>
                <span className="font-mono tabular-nums">
                  {t.aiTrustLabel}: {lastSubmittedReport.aiVerification.trustScore}%
                </span>
              </div>
              <p>
                {language === "hi"
                  ? lastSubmittedReport.aiVerification.summaryHi
                  : lastSubmittedReport.aiVerification.summary}
              </p>
            </div>
          )}
        </section>

        {/* Right: Live Bhopal Status Map + Safe Routes */}
        <section id="bhopal-status-map" className="xl:col-span-6 space-y-6">
          <BhopalMap
            language={language}
            reports={reports}
            selectedReportId={selectedMapReportId}
            onSelectReport={onSelectMapReport}
            heightClass="h-[490px]"
          />

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-bold text-[#0A192F] mb-3">{t.safeCorridorsTitle}</h2>
            <div className="divide-y divide-slate-100">
              {reports
                .filter(
                  (r) =>
                    r.category === "flood" && r.status !== "resolved" && r.status !== "flagged"
                )
                .map((r) => (
                  <div
                    key={r.id}
                    className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {language === "hi" ? r.landmarkHi : r.landmark}
                      </div>
                      <div className="text-slate-600">
                        {language === "hi"
                          ? r.alternateRouteHi || r.alternateRoute
                          : r.alternateRoute}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectMapReport(r)}
                      className="text-xs font-semibold text-[#0284C7] hover:underline whitespace-nowrap shrink-0 self-start sm:self-center cursor-pointer"
                    >
                      {t.locateOnMapBtn}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </div>

      {/* Live Citizen Report Tracker (with Closed-Loop After-Cleanup Photos) */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#0A192F]">{t.trackerHeading}</h2>
            <p className="text-xs text-slate-600">{t.trackerSubheading}</p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { id: "all", label: t.filterAll },
                { id: "mine", label: `${t.filterMine} (${mySubmittedIds.length})` },
                { id: "flood", label: t.filterFlood },
                { id: "waste", label: t.filterWaste },
              ] as { id: "all" | "mine" | "flood" | "waste"; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTrackerFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  trackerFilter === tab.id
                    ? "bg-white text-[#0A192F] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trackedReports.map((report) => {
            const stageIndex = getStageIndex(report.status);
            const isFlagged = report.status === "flagged";

            return (
              <article
                key={report.id}
                className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
                      <span className="font-mono tabular-nums font-semibold text-[#0A192F]">
                        {report.referenceCode}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{language === "hi" ? report.reportedAtHi : report.reportedAt}</span>
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-slate-900 leading-snug">
                      {language === "hi" ? report.titleHi : report.title}
                    </h3>
                    <div className="mt-0.5 text-xs text-slate-600">
                      {language === "hi" ? report.landmarkHi : report.landmark}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold shrink-0 ${
                      isFlagged
                        ? "text-red-600"
                        : report.status === "resolved"
                          ? "text-[#059669]"
                          : report.status === "broadcasted"
                            ? "text-[#EA580C]"
                            : "text-[#0284C7]"
                    }`}
                  >
                    {getLocalizedStatus(report.status, t)}
                  </span>
                </div>

                {isFlagged ? (
                  <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-800">
                    <span className="font-semibold">{t.spamQuarantinePrefix}</span>{" "}
                    {language === "hi"
                      ? report.aiVerification.fraudFlagsHi[0] || report.aiVerification.summaryHi
                      : report.aiVerification.fraudFlags[0] || report.aiVerification.summary}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {workflowStages.map((step, idx) => {
                      const completed = idx <= stageIndex;
                      const barColor =
                        report.status === "resolved"
                          ? "bg-[#059669]"
                          : report.status === "broadcasted"
                            ? "bg-[#EA580C]"
                            : "bg-[#0284C7]";

                      return (
                        <div key={step.id} className="space-y-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              completed ? barColor : "bg-slate-200"
                            }`}
                          />
                          <div
                            className={`text-[11px] leading-tight ${
                              completed ? "font-semibold text-slate-900" : "text-slate-400"
                            }`}
                          >
                            {step.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {report.status === "resolved" &&
                  (report.afterCleanupImageUrl || report.afterCleanupVisualKey) && (
                    <div
                      className={`grid gap-2 pt-2 border-t border-slate-100 ${
                        report.beforeCleanupImageUrl || report.beforeCleanupVisualKey
                          ? "grid-cols-1 sm:grid-cols-3"
                          : "grid-cols-2"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="text-[11px] font-medium text-slate-600">
                          {t.citizenPhotoLabel}
                        </div>
                        <EvidenceVisual
                          imageUrl={report.imageUrl}
                          demoVisualKey={report.demoVisualKey}
                          alt={t.citizenPhotoLabel}
                          className="w-full h-24"
                        />
                      </div>
                      {(report.beforeCleanupImageUrl ||
                        report.beforeCleanupVisualKey) && (
                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold text-[#EA580C]">
                            {t.municipalBeforeLabel}
                          </div>
                          <EvidenceVisual
                            imageUrl={report.beforeCleanupImageUrl}
                            demoVisualKey={report.beforeCleanupVisualKey}
                            alt={t.municipalBeforeLabel}
                            className="w-full h-24"
                          />
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="text-[11px] font-semibold text-[#059669]">
                          {t.municipalAfterLabel}
                        </div>
                        <EvidenceVisual
                          imageUrl={report.afterCleanupImageUrl}
                          demoVisualKey={report.afterCleanupVisualKey}
                          alt={t.municipalAfterLabel}
                          className="w-full h-24"
                        />
                      </div>
                    </div>
                  )}

                {report.assignedUnit && (
                  <div className="text-xs text-slate-600 pt-1 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="truncate">
                      {t.assignedUnitPrefix}{" "}
                      <strong className="text-slate-800">{report.assignedUnit}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectMapReport(report)}
                      className="text-[#0284C7] font-semibold hover:underline shrink-0 cursor-pointer"
                    >
                      {t.locateOnMapBtn}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

function getStageIndex(status: CivicReport["status"]): number {
  switch (status) {
    case "submitted":
      return 0;
    case "ai_verified":
      return 1;
    case "dispatched":
    case "broadcasted":
      return 2;
    case "resolved":
      return 3;
    default:
      return 0;
  }
}

function getLocalizedStatus(
  status: CivicReport["status"],
  t: (typeof TRANSLATIONS)["en"]
): string {
  switch (status) {
    case "submitted":
      return t.statusSubmitted;
    case "ai_verified":
      return t.statusAiVerified;
    case "dispatched":
      return t.statusDispatched;
    case "broadcasted":
      return t.statusBroadcasted;
    case "resolved":
      return t.statusResolved;
    case "flagged":
      return t.statusFlagged;
  }
}
