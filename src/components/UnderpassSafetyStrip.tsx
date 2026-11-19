import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, MapPin, Navigation, ShieldAlert } from "lucide-react";
import { INITIAL_UNDERPASS_MONITORS } from "../data/bhopalData";
import { TRANSLATIONS } from "../i18n/translations";
import { CivicReport, Language, UnderpassSafetyLevel } from "../types/civic";

interface UnderpassSafetyStripProps {
  language: Language;
  reports: CivicReport[];
  onLocateCoords: (reportId?: string) => void;
}

export const UnderpassSafetyStrip: React.FC<UnderpassSafetyStripProps> = ({
  language,
  reports,
  onLocateCoords,
}) => {
  const t = TRANSLATIONS[language];
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>("up-vip");

  const computedItems = INITIAL_UNDERPASS_MONITORS.map((item) => {
    if (!item.linkedReportId) return item;
    const linked = reports.find((r) => r.id === item.linkedReportId);
    if (!linked) return item;

    if (linked.status === "resolved") {
      return {
        ...item,
        waterDepthFt: 0.1,
        safetyLevel: "SAFE" as UnderpassSafetyLevel,
      };
    }
    if (linked.status === "broadcasted") {
      return {
        ...item,
        safetyLevel: "DANGER" as UnderpassSafetyLevel,
        alternateRoute: linked.alternateRoute || item.alternateRoute,
        alternateRouteHi: linked.alternateRouteHi || item.alternateRouteHi,
      };
    }
    return item;
  });

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-[#0A192F] text-white flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#EA580C] shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold tracking-tight">{t.underpassHeading}</h2>
        </div>
        <span className="text-[11px] text-slate-300">{t.underpassSubheading}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        {computedItems.map((item) => {
          const isExpanded = expandedRouteId === item.id;
          const badgeConfig = getSafetyBadge(item.safetyLevel, t);

          return (
            <div key={item.id} className="p-4 flex flex-col justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-bold text-[#0A192F] leading-snug">
                    {language === "hi" ? item.nameHi : item.name}
                  </div>
                  <span className="font-mono tabular-nums text-xs font-bold text-slate-800 shrink-0">
                    {item.waterDepthFt.toFixed(1)} {t.waterDepthUnit}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${badgeConfig.classes}`}
                  >
                    {badgeConfig.icon}
                    {badgeConfig.label}
                  </span>

                  <button
                    type="button"
                    onClick={() => setExpandedRouteId(isExpanded ? null : item.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0284C7] hover:underline cursor-pointer whitespace-nowrap"
                  >
                    <Navigation className="w-3 h-3" />
                    {isExpanded ? t.hideRouteBtn : t.safeRouteBtn}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[11px] text-slate-700 space-y-1.5">
                  <div className="font-medium leading-snug">
                    {language === "hi" ? item.alternateRouteHi : item.alternateRoute}
                  </div>
                  {item.linkedReportId && (
                    <button
                      type="button"
                      onClick={() => onLocateCoords(item.linkedReportId)}
                      className="inline-flex items-center gap-1 font-semibold text-[#0284C7] hover:underline cursor-pointer"
                    >
                      <MapPin className="w-3 h-3" />
                      {t.locateZoneBtn}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

function getSafetyBadge(
  level: UnderpassSafetyLevel,
  t: (typeof TRANSLATIONS)["en"]
) {
  switch (level) {
    case "DANGER":
      return {
        label: t.safetyDanger,
        classes: "bg-red-100 text-[#DC2626] border border-red-200",
        icon: <AlertTriangle className="w-3 h-3 shrink-0" />,
      };
    case "CAUTION":
      return {
        label: t.safetyCaution,
        classes: "bg-amber-100 text-amber-800 border border-amber-200",
        icon: <AlertTriangle className="w-3 h-3 shrink-0" />,
      };
    case "SAFE":
      return {
        label: t.safetySafe,
        classes: "bg-emerald-100 text-[#059669] border border-emerald-200",
        icon: <CheckCircle2 className="w-3 h-3 shrink-0" />,
      };
  }
}
