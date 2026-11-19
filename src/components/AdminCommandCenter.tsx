import React, { useEffect, useState } from "react";
import {
  AlertOctagon,
  Database,
  Download,
  Loader2,
  MapPin,
  Printer,
  Radio,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { BMC_SANITATION_ZONES } from "../data/bhopalData";
import { TRANSLATIONS } from "../i18n/translations";
import { dispatchToMunicipalDept, verifyImageWithAI } from "../services/civicApi";
import { CivicReport, Language } from "../types/civic";
import { EvidenceVisual } from "./EvidenceVisual";
import { KavachLogoBadge } from "./KavachLogoBadge";

interface AdminCommandCenterProps {
  language: Language;
  reports: CivicReport[];
  onUpdateReport: (updated: CivicReport) => void;
  onJumpToCitizenMap: (report: CivicReport) => void;
  onOpenMunicipalPanel: () => void;
}

type QueueFilter = "all" | "flood" | "waste" | "drain_risk" | "flagged" | "resolved";

export const AdminCommandCenter: React.FC<AdminCommandCenterProps> = ({
  language,
  reports,
  onUpdateReport,
  onJumpToCitizenMap,
  onOpenMunicipalPanel,
}) => {
  const t = TRANSLATIONS[language];

  const [filter, setFilter] = useState<QueueFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(reports[0]?.id ?? "");

  const [selectedZone, setSelectedZone] = useState<string>(BMC_SANITATION_ZONES[0]);
  const [alternateRouteDraft, setAlternateRouteDraft] = useState<string>("");
  const [isReverifying, setIsReverifying] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const selectedReport =
    reports.find((r) => r.id === selectedId) ?? reports[0] ?? null;

  useEffect(() => {
    if (selectedReport) {
      setSelectedZone(selectedReport.bmcZone || BMC_SANITATION_ZONES[0]);
      setAlternateRouteDraft(
        language === "hi"
          ? selectedReport.alternateRouteHi ||
              selectedReport.alternateRoute ||
              "वैकल्पिक ऊँचे मार्ग से निकलें।"
          : selectedReport.alternateRoute ||
              "Avoid submerged road; divert via nearest elevated arterial."
      );
    }
  }, [selectedReport?.id, language]);

  // Executive KPIs
  const totalActiveFloodAlerts = reports.filter(
    (r) => r.category === "flood" && r.status !== "resolved" && r.status !== "flagged"
  ).length;
  const criticalLifeSafety = reports.filter(
    (r) => r.severity === "critical" && r.status !== "resolved" && r.status !== "flagged"
  ).length;
  const pendingWasteReports = reports.filter(
    (r) =>
      r.category === "waste" &&
      (r.status === "submitted" || r.status === "ai_verified")
  ).length;
  const flaggedSpamReports = reports.filter(
    (r) => r.status === "flagged" || r.aiVerification.isFraudOrSpam
  ).length;
  const resolvedToday = reports.filter((r) => r.status === "resolved").length;

  const filteredReports = reports
    .filter((r) => {
      if (filter === "flood") return r.category === "flood" && r.status !== "flagged";
      if (filter === "waste") return r.category === "waste" && r.status !== "flagged";
      if (filter === "drain_risk")
        return Boolean(r.isFloodTriggerDrainBlockage) && r.status !== "flagged";
      if (filter === "flagged")
        return r.status === "flagged" || r.aiVerification.isFraudOrSpam;
      if (filter === "resolved") return r.status === "resolved";
      return true;
    })
    .filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.titleHi.toLowerCase().includes(q) ||
        r.landmark.toLowerCase().includes(q) ||
        r.landmarkHi.toLowerCase().includes(q) ||
        r.referenceCode.toLowerCase().includes(q)
      );
    });

  const showNotice = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 5000);
  };

  const handleRerunAI = async () => {
    if (!selectedReport) return;
    setIsReverifying(true);
    try {
      const freshResult = await verifyImageWithAI({
        imageDataUrl: selectedReport.imageUrl,
        category: selectedReport.category,
        landmark: selectedReport.landmark,
        landmarkHi: selectedReport.landmarkHi,
        description: selectedReport.description,
        severity: selectedReport.severity,
        latitude: selectedReport.latitude,
        longitude: selectedReport.longitude,
      });

      onUpdateReport({
        ...selectedReport,
        status: freshResult.isFraudOrSpam
          ? "flagged"
          : selectedReport.status === "submitted"
            ? "ai_verified"
            : selectedReport.status,
        aiVerification: freshResult,
      });
      showNotice(
        `${selectedReport.referenceCode}: AI Confidence ${freshResult.trustScore}%`
      );
    } catch (err: unknown) {
      showNotice(
        err instanceof Error ? err.message : "Failed to re-run AI verification."
      );
    } finally {
      setIsReverifying(false);
    }
  };

  const handleAssignToMunicipalParty = async () => {
    if (!selectedReport) return;
    setIsDispatching(true);
    try {
      const dispatchRes = await dispatchToMunicipalDept(selectedReport, selectedZone);
      onUpdateReport({
        ...selectedReport,
        status: "dispatched",
        bmcZone: dispatchRes.bmcZone,
        assignedUnit: dispatchRes.assignedUnit,
      });
      showNotice(
        language === "hi"
          ? `${selectedReport.referenceCode} नगर निगम फील्ड दल (${dispatchRes.bmcZone}) को सौंपा गया।`
          : `Assigned ${selectedReport.referenceCode} to Municipal Party (${dispatchRes.bmcZone}).`
      );
    } finally {
      setIsDispatching(false);
    }
  };

  const handleBroadcastFloodAlert = () => {
    if (!selectedReport) return;
    const isCurrentlyBroadcasted =
      selectedReport.status === "broadcasted" && selectedReport.isEmergencyBroadcast;

    if (isCurrentlyBroadcasted) {
      onUpdateReport({
        ...selectedReport,
        status: "dispatched",
        isEmergencyBroadcast: false,
      });
      showNotice(
        language === "hi"
          ? `${selectedReport.landmarkHi} के लिए सड़क चेतावनी हटाई गई।`
          : `Cleared emergency road alert for ${selectedReport.landmark}.`
      );
      return;
    }

    onUpdateReport({
      ...selectedReport,
      status: "broadcasted",
      isEmergencyBroadcast: true,
      alternateRoute: alternateRouteDraft.trim() || selectedReport.alternateRoute,
      alternateRouteHi: alternateRouteDraft.trim() || selectedReport.alternateRouteHi,
      assignedUnit:
        selectedReport.assignedUnit || "SDRF & BMC Flood Pump Party",
    });
    showNotice(
      language === "hi"
        ? `बाढ़ चेतावनी लाइव: ${selectedReport.landmarkHi} का अलर्ट नागरिक पोर्टल पर प्रसारित।`
        : `FLOOD ALERT LIVE: Pushed emergency road warning to Citizen Panel for ${selectedReport.landmark}.`
    );
  };

  const handleQuarantineSpam = () => {
    if (!selectedReport) return;
    onUpdateReport({
      ...selectedReport,
      status: "flagged",
      isEmergencyBroadcast: false,
      aiVerification: {
        ...selectedReport.aiVerification,
        isFraudOrSpam: true,
        recommendedAction: "quarantine_spam",
      },
    });
    showNotice(
      language === "hi"
        ? `${selectedReport.referenceCode} को स्पैम के रूप में अलग किया गया।`
        : `Quarantined ${selectedReport.referenceCode} as Spam / Fraud.`
    );
  };

  const handleQuickApproveDispatch = (report: CivicReport) => {
    const zone = report.bmcZone || BMC_SANITATION_ZONES[0];
    const zonePrefix = zone.split("—")[0]?.trim() || "Zone";
    onUpdateReport({
      ...report,
      status: "dispatched",
      bmcZone: zone,
      assignedUnit:
        report.assignedUnit ||
        (report.category === "flood"
          ? `BMC Flood Pump Party (${zonePrefix})`
          : `BMC Sanitation Party (${zonePrefix})`),
    });
    setSelectedId(report.id);
    showNotice(
      language === "hi"
        ? `${report.referenceCode} स्वीकृत एवं ${zone} को डिस्पैच किया गया।`
        : `Approved & dispatched ${report.referenceCode} to ${zone}.`
    );
  };

  const handleQuickTriggerDangerZone = (report: CivicReport) => {
    onUpdateReport({
      ...report,
      category: "flood",
      severity: "critical",
      status: "broadcasted",
      isEmergencyBroadcast: true,
      assignedUnit: report.assignedUnit || "SDRF & BMC Flood Pump Party",
    });
    setSelectedId(report.id);
    showNotice(
      language === "hi"
        ? `बाढ़ खतरा सक्रिय: ${report.landmarkHi} भोपाल मानचित्र पर प्रसारित।`
        : `Live Flood Danger Zone triggered on Bhopal map for ${report.landmark}.`
    );
  };

  const handleExportCsv = () => {
    if (filteredReports.length === 0) return;

    const escapeCsvCell = (value: unknown): string => {
      const str = value === undefined || value === null ? "" : String(value);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = [
      "Reference ID",
      "Audit Timestamp",
      "Category",
      "Severity",
      "Status",
      "Title",
      "Landmark",
      "Ward",
      "BMC Zone",
      "Latitude",
      "Longitude",
      "AI Verification Score (%)",
      "GPS Match Status",
      "AI Classification",
      "Spam / Fraud Flagged",
      "Flood-Trigger Drain Risk",
      "Cryptographic Hash",
      "Capture Source",
      "Assigned Municipal Unit",
      "Crew Arrival Distance (m)",
      "Before-Cleanup Hash",
      "After-Cleanup Hash",
      "Resolved At",
      "AI Audit Summary",
    ];

    const rows = filteredReports.map((r) => [
      r.referenceCode,
      r.auditTimestampIso || r.reportedAt,
      r.category,
      r.severity,
      r.status,
      language === "hi" ? r.titleHi : r.title,
      language === "hi" ? r.landmarkHi : r.landmark,
      language === "hi" ? r.wardHi : r.ward,
      r.bmcZone,
      r.latitude.toFixed(6),
      r.longitude.toFixed(6),
      r.aiVerification.trustScore,
      r.aiVerification.gpsMatchStatus,
      language === "hi"
        ? r.aiVerification.classificationTagHi
        : r.aiVerification.classificationTag,
      r.aiVerification.isFraudOrSpam ? "YES" : "NO",
      r.isFloodTriggerDrainBlockage ? "YES" : "NO",
      r.cryptographicHash || "",
      r.captureSource || "",
      r.assignedUnit || "",
      r.arrivalDistanceMeters ?? "",
      r.beforeCleanupHash || "",
      r.afterCleanupHash || "",
      r.resolvedAt || "",
      language === "hi" ? r.aiVerification.summaryHi : r.aiVerification.summary,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers, ...rows]
        .map((row) => row.map(escapeCsvCell).join(","))
        .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateSlug = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `bhopal-kavach-audit-${filter}-${dateSlug}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    showNotice(
      language === "hi"
        ? `${filteredReports.length} ऑडिट रिकॉर्ड CSV फ़ाइल में डाउनलोड किए गए।`
        : `Exported ${filteredReports.length} visible audit records to CSV.`
    );
  };

  return (
    <div className="space-y-6 admin-print-root">
      {/* Formal A4 Print-Only Audit Masthead */}
      <div className="hidden admin-print-header">
        <div className="flex items-center gap-3">
          <KavachLogoBadge size="md" />
          <div>
            <div className="text-base font-bold text-[#0A192F]">{t.brandTitle}</div>
            <div className="text-xs text-slate-600">{t.adminDbHeading}</div>
          </div>
        </div>
        <div className="text-right text-[11px] font-mono tabular-nums text-slate-700">
          <div>
            {filteredReports.length} / {reports.length} {t.itemsLabel} · {filter.toUpperCase()}
          </div>
          <div>{new Date().toISOString().replace("T", " ").slice(0, 19)} UTC</div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4 admin-print-hide">
        <div>
          <div className="text-xs font-semibold text-[#0284C7]">{t.adminEyebrow}</div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-[#0A192F]">
            {t.adminHeading}
          </h1>
        </div>
        {actionToast && (
          <div className="rounded-lg bg-[#0A192F] text-white px-4 py-2 text-xs font-medium shadow-xs">
            {actionToast}
          </div>
        )}
      </div>

      {/* 5 Executive KPI Cards */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 admin-print-kpis">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500">{t.kpiFloodAlerts}</div>
          <div className="mt-1.5 text-2xl font-bold text-[#EA580C] font-mono tabular-nums">
            {totalActiveFloodAlerts}
          </div>
          <div className="mt-1 text-[11px] text-slate-600">{t.kpiFloodSub}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500">{t.kpiCriticalSafety}</div>
          <div className="mt-1.5 text-2xl font-bold text-[#EA580C] font-mono tabular-nums">
            {criticalLifeSafety}
          </div>
          <div className="mt-1 text-[11px] text-slate-600">{t.kpiCriticalSub}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500">{t.kpiPendingWaste}</div>
          <div className="mt-1.5 text-2xl font-bold text-[#0284C7] font-mono tabular-nums">
            {pendingWasteReports}
          </div>
          <div className="mt-1 text-[11px] text-slate-600">{t.kpiPendingSub}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500">{t.kpiFlaggedSpam}</div>
          <div className="mt-1.5 text-2xl font-bold text-red-600 font-mono tabular-nums">
            {flaggedSpamReports}
          </div>
          <div className="mt-1 text-[11px] text-slate-600">{t.kpiFlaggedSub}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 col-span-2 md:col-span-1">
          <div className="text-xs font-medium text-slate-500">{t.kpiResolvedToday}</div>
          <div className="mt-1.5 text-2xl font-bold text-[#059669] font-mono tabular-nums">
            {resolvedToday}
          </div>
          <div className="mt-1 text-[11px] text-slate-600">{t.kpiResolvedSub}</div>
        </div>
      </section>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 admin-print-hide">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {(
            [
              { id: "all", label: `${t.adminFilterAll} (${reports.length})` },
              { id: "flood", label: t.adminFilterFlood },
              { id: "waste", label: t.adminFilterWaste },
              { id: "drain_risk", label: t.adminFilterDrainRisk },
              { id: "flagged", label: `${t.adminFilterFlagged} (${flaggedSpamReports})` },
              { id: "resolved", label: t.adminFilterResolved },
            ] as { id: QueueFilter; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === tab.id
                  ? "bg-white text-[#0A192F] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
          />
        </div>
      </div>

      {/* Queue + AI Firewall Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start admin-print-interactive-split">
        {/* Left: Queue */}
        <section className="xl:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold text-[#0A192F]">
            <span>{t.queueHeading}</span>
            <span className="font-mono tabular-nums text-slate-500">
              {filteredReports.length} {t.itemsLabel}
            </span>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredReports.map((report) => {
              const isSelected = selectedReport?.id === report.id;
              const trust = report.aiVerification.trustScore;
              const trustColor =
                trust >= 80
                  ? "text-[#059669]"
                  : trust >= 50
                    ? "text-[#D97706]"
                    : "text-red-600";

              return (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => setSelectedId(report.id)}
                  className={`w-full text-left px-4 py-3.5 transition-colors cursor-pointer flex items-start justify-between gap-4 ${
                    isSelected ? "bg-sky-50/70" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
                      <span className="font-mono tabular-nums font-semibold text-[#0A192F]">
                        {report.referenceCode}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-semibold ${
                          report.category === "flood" ? "text-[#EA580C]" : "text-[#0284C7]"
                        }`}
                      >
                        {report.category === "flood" ? t.filterFlood : t.filterWaste}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {language === "hi"
                          ? report.aiVerification.classificationTagHi
                          : report.aiVerification.classificationTag}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {report.aiVerification.gpsMatchStatus === "verified"
                          ? "GPS OK"
                          : "GPS MISMATCH"}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-900 truncate">
                      {language === "hi" ? report.titleHi : report.title}
                    </div>

                    {report.isFloodTriggerDrainBlockage && (
                      <div className="inline-block rounded bg-amber-100 border border-amber-300 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                        {t.drainTriggerTag}
                      </div>
                    )}

                    <div className="text-xs text-slate-600 truncate">
                      {language === "hi" ? report.landmarkHi : report.landmark} ·{" "}
                      {language === "hi" ? report.wardHi : report.ward}
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <div className={`text-xs font-mono tabular-nums font-bold ${trustColor}`}>
                      {trust}% AI
                    </div>
                    <div className="text-[11px] font-semibold text-slate-700">
                      {getAdminStatus(report.status, t)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Right: AI Fraud Firewall & One-Click Dispatch */}
        <section className="xl:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-5">
          {selectedReport && (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="text-xs font-mono tabular-nums text-slate-500">
                    {selectedReport.referenceCode} · {selectedReport.latitude.toFixed(4)}° N,{" "}
                    {selectedReport.longitude.toFixed(4)}° E
                  </div>
                  <h2 className="mt-1 text-base font-bold text-[#0A192F] leading-snug">
                    {language === "hi" ? selectedReport.titleHi : selectedReport.title}
                  </h2>
                  <div className="mt-1 text-xs text-slate-600">
                    {language === "hi" ? selectedReport.landmarkHi : selectedReport.landmark} ·{" "}
                    {selectedReport.reporterName}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onJumpToCitizenMap(selectedReport)}
                  className="text-xs font-semibold text-[#0284C7] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t.openOnMapBtn}
                </button>
              </div>

              {selectedReport.status === "resolved" &&
              (selectedReport.afterCleanupImageUrl ||
                selectedReport.afterCleanupVisualKey) ? (
                <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
                  <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#059669]">
                    <span>{t.threeWayComparisonHeading}</span>
                    {selectedReport.arrivalDistanceMeters !== undefined && (
                      <span className="font-mono tabular-nums text-[11px] text-slate-600">
                        GPS {selectedReport.arrivalDistanceMeters}m
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-slate-700">
                        {t.citizenPhotoLabel}
                      </div>
                      <EvidenceVisual
                        imageUrl={selectedReport.imageUrl}
                        demoVisualKey={selectedReport.demoVisualKey}
                        alt={t.citizenPhotoLabel}
                        className="w-full h-28"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-[#EA580C]">
                        {t.municipalBeforeLabel}
                      </div>
                      <EvidenceVisual
                        imageUrl={selectedReport.beforeCleanupImageUrl}
                        demoVisualKey={
                          selectedReport.beforeCleanupVisualKey ||
                          selectedReport.demoVisualKey
                        }
                        alt={t.municipalBeforeLabel}
                        className="w-full h-28"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-[#059669]">
                        {t.municipalAfterLabel}
                      </div>
                      <EvidenceVisual
                        imageUrl={selectedReport.afterCleanupImageUrl}
                        demoVisualKey={selectedReport.afterCleanupVisualKey}
                        alt={t.municipalAfterLabel}
                        className="w-full h-28"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <EvidenceVisual
                  imageUrl={selectedReport.imageUrl}
                  demoVisualKey={selectedReport.demoVisualKey}
                  alt={selectedReport.title}
                  className="w-full h-48"
                />
              )}

              <p className="text-xs text-slate-700 leading-relaxed">
                {language === "hi"
                  ? selectedReport.descriptionHi
                  : selectedReport.description}
              </p>

              {selectedReport.isFloodTriggerDrainBlockage && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 space-y-1 text-xs text-amber-900">
                  <div className="font-bold">{t.drainTriggerTag}</div>
                  <div>
                    {language === "hi"
                      ? selectedReport.drainTriggerReasonHi || t.drainTriggerExplain
                      : selectedReport.drainTriggerReasonEn || t.drainTriggerExplain}
                  </div>
                </div>
              )}

              {/* AI Fraud & Authenticity Firewall */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {selectedReport.aiVerification.isFraudOrSpam ? (
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-[#059669]" />
                    )}
                    <span className="text-xs font-bold text-[#0A192F]">
                      {t.firewallHeading}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRerunAI}
                    disabled={isReverifying}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {isReverifying ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    {t.rerunAiBtn}
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{t.aiTrustLabel}</span>
                    <span
                      className={`font-mono tabular-nums font-bold ${
                        selectedReport.aiVerification.trustScore >= 80
                          ? "text-[#059669]"
                          : selectedReport.aiVerification.trustScore >= 50
                            ? "text-[#D97706]"
                            : "text-red-600"
                      }`}
                    >
                      {selectedReport.aiVerification.trustScore}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        selectedReport.aiVerification.trustScore >= 80
                          ? "bg-[#059669]"
                          : selectedReport.aiVerification.trustScore >= 50
                            ? "bg-[#D97706]"
                            : "bg-red-600"
                      }`}
                      style={{ width: `${selectedReport.aiVerification.trustScore}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs space-y-1.5 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500 shrink-0">{t.gpsMatchLabel}</span>
                    <span
                      className={`font-semibold text-right inline-flex items-center gap-1 ${
                        selectedReport.aiVerification.gpsMatchStatus === "verified"
                          ? "text-[#059669]"
                          : "text-red-600"
                      }`}
                    >
                      <MapPin className="w-3 h-3 shrink-0" />
                      {language === "hi"
                        ? selectedReport.aiVerification.gpsMatchDetailHi
                        : selectedReport.aiVerification.gpsMatchDetailEn}
                    </span>
                  </div>

                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">{t.classificationLabel}</span>
                    <span className="font-semibold text-slate-900">
                      {language === "hi"
                        ? selectedReport.aiVerification.classificationTagHi
                        : selectedReport.aiVerification.classificationTag}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 border-t border-slate-200 pt-2">
                  {language === "hi"
                    ? selectedReport.aiVerification.summaryHi
                    : selectedReport.aiVerification.summary}
                </p>

                {selectedReport.aiVerification.fraudFlags.length > 0 && (
                  <div className="rounded-md bg-red-50 border border-red-200 p-2.5 space-y-1">
                    <div className="text-xs font-bold text-red-700">
                      {t.fraudSignalsHeading}:
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-xs text-red-800">
                      {(language === "hi"
                        ? selectedReport.aiVerification.fraudFlagsHi
                        : selectedReport.aiVerification.fraudFlags
                      ).map((flag, i) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* One-Click Admin Command Actions */}
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <h3 className="text-xs font-bold text-[#0A192F]">
                  {t.adminActionsHeading}
                </h3>

                {selectedReport.category === "flood" && (
                  <div className="space-y-2.5">
                    <div>
                      <label
                        htmlFor="admin-alt-route"
                        className="block text-xs font-medium text-slate-600 mb-1"
                      >
                        {t.altRouteInputLabel}
                      </label>
                      <input
                        id="admin-alt-route"
                        type="text"
                        value={alternateRouteDraft}
                        onChange={(e) => setAlternateRouteDraft(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EA580C]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleBroadcastFloodAlert}
                      disabled={
                        selectedReport.status === "resolved" ||
                        selectedReport.status === "flagged"
                      }
                      className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                        selectedReport.status === "broadcasted" &&
                        selectedReport.isEmergencyBroadcast
                          ? "bg-slate-800 hover:bg-slate-900 text-white"
                          : "bg-[#EA580C] hover:bg-orange-700 text-white"
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      {selectedReport.status === "broadcasted" &&
                      selectedReport.isEmergencyBroadcast
                        ? t.clearBroadcastBtn
                        : t.broadcastFloodBtn}
                    </button>
                  </div>
                )}

                <div className="space-y-2.5">
                  <div>
                    <label
                      htmlFor="admin-zone-select"
                      className="block text-xs font-medium text-slate-600 mb-1"
                    >
                      {t.selectBmcZoneLabel}
                    </label>
                    <select
                      id="admin-zone-select"
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                    >
                      {BMC_SANITATION_ZONES.map((z) => (
                        <option key={z} value={z}>
                          {z}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleAssignToMunicipalParty}
                    disabled={
                      isDispatching ||
                      selectedReport.status === "resolved" ||
                      selectedReport.status === "flagged"
                    }
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#0284C7] hover:bg-sky-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {t.assignMunicipalBtn}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={onOpenMunicipalPanel}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#0A192F] hover:bg-[#142c50] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    {t.navMunicipal}
                  </button>

                  <button
                    type="button"
                    onClick={handleQuarantineSpam}
                    disabled={selectedReport.status === "flagged"}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-red-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <AlertOctagon className="w-3.5 h-3.5" />
                    {t.quarantineSpamBtn}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Centralized Admin Database & Audit Verification Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden admin-print-db-section">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-200 bg-[#0A192F] text-white flex flex-wrap items-center justify-between gap-2 admin-print-db-banner">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <h2 className="text-sm font-bold">{t.adminDbHeading}</h2>
              <p className="text-[11px] text-slate-300">{t.adminDbSubheading}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs font-mono tabular-nums text-sky-300">
              {filteredReports.length} / {reports.length} {t.itemsLabel}
            </span>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredReports.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-sky-600 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed admin-print-hide"
            >
              <Download className="w-3.5 h-3.5" />
              {t.exportCsvBtn}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={filteredReports.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed admin-print-hide"
            >
              <Printer className="w-3.5 h-3.5" />
              {t.printPdfBtn}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs admin-print-db-table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                <th className="py-3 px-4 whitespace-nowrap">{t.colReportId}</th>
                <th className="py-3 px-3 whitespace-nowrap">{t.colLiveThumb}</th>
                <th className="py-3 px-3 whitespace-nowrap">{t.colGpsCoords}</th>
                <th className="py-3 px-3 whitespace-nowrap">{t.colAiScore}</th>
                <th className="py-3 px-3 whitespace-nowrap">{t.colHazardCat}</th>
                <th className="py-3 px-3 whitespace-nowrap">{t.colStatus}</th>
                <th className="py-3 px-3 whitespace-nowrap">{t.colAuditTime}</th>
                <th className="py-3 px-4 whitespace-nowrap text-right admin-print-no-col">
                  {t.colDbActions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredReports.map((report) => {
                const score = report.aiVerification.trustScore;
                const scoreClass =
                  score >= 80
                    ? "text-[#059669] bg-emerald-50 border-emerald-200"
                    : score >= 50
                      ? "text-amber-800 bg-amber-50 border-amber-200"
                      : "text-red-700 bg-red-50 border-red-200";

                const statusClass =
                  report.status === "resolved"
                    ? "text-[#059669]"
                    : report.status === "broadcasted"
                      ? "text-[#DC2626]"
                      : report.status === "flagged"
                        ? "text-red-600"
                        : "text-[#0284C7]";

                return (
                  <tr
                    key={report.id}
                    onClick={() => setSelectedId(report.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedReport?.id === report.id
                        ? "bg-sky-50/70"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono tabular-nums font-bold text-[#0A192F]">
                        {report.referenceCode}
                      </div>
                      {report.cryptographicHash && (
                        <div className="font-mono text-[10px] text-slate-500">
                          #{report.cryptographicHash.slice(0, 10)}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <EvidenceVisual
                        imageUrl={report.imageUrl}
                        demoVisualKey={report.demoVisualKey}
                        alt={report.referenceCode}
                        className="w-16 h-11"
                      />
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono tabular-nums text-slate-800 font-medium">
                        {report.latitude.toFixed(4)}° N, {report.longitude.toFixed(4)}° E
                      </div>
                      <div className="text-[11px] text-slate-500 max-w-[180px] truncate">
                        {language === "hi" ? report.landmarkHi : report.landmark}
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded border font-mono tabular-nums font-bold ${scoreClass}`}
                      >
                        {score}%
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">
                        {report.isFloodTriggerDrainBlockage
                          ? t.drainTriggerTag
                          : report.category === "flood"
                            ? t.filterFlood
                            : t.filterWaste}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {language === "hi"
                          ? report.aiVerification.classificationTagHi
                          : report.aiVerification.classificationTag}
                      </div>
                    </td>

                    <td className={`py-3 px-3 whitespace-nowrap font-bold ${statusClass}`}>
                      <div>{getAdminStatus(report.status, t)}</div>
                      {report.status === "resolved" &&
                        (report.beforeCleanupImageUrl ||
                          report.beforeCleanupVisualKey) && (
                          <div className="text-[10px] font-medium text-emerald-700">
                            {t.threeStageProofBadge}
                          </div>
                        )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-mono tabular-nums text-[11px] text-slate-600">
                      {report.auditTimestampIso
                        ? report.auditTimestampIso.replace("T", " ").slice(0, 19)
                        : report.reportedAt}
                    </td>

                    <td
                      className="py-3 px-4 whitespace-nowrap text-right admin-print-no-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickApproveDispatch(report)}
                          disabled={
                            report.status === "resolved" || report.status === "flagged"
                          }
                          className="px-2.5 py-1.5 rounded-md bg-[#0284C7] hover:bg-sky-700 text-white text-[11px] font-semibold cursor-pointer disabled:opacity-40"
                        >
                          {t.dbApproveDispatchBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickTriggerDangerZone(report)}
                          disabled={
                            report.status === "resolved" || report.status === "flagged"
                          }
                          className="px-2.5 py-1.5 rounded-md bg-[#DC2626] hover:bg-red-700 text-white text-[11px] font-semibold cursor-pointer disabled:opacity-40"
                        >
                          {t.dbTriggerDangerZoneBtn}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

function getAdminStatus(
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
