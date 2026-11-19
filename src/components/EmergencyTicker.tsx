import React, { useState } from "react";
import { AlertTriangle, ChevronRight, PhoneCall, ShieldCheck } from "lucide-react";
import { BHOPAL_HELPLINES } from "../data/bhopalData";
import { TRANSLATIONS } from "../i18n/translations";
import { CivicReport, Language } from "../types/civic";

interface EmergencyTickerProps {
  language: Language;
  activeBroadcasts: CivicReport[];
  onInspectMap: () => void;
}

export const EmergencyTicker: React.FC<EmergencyTickerProps> = ({
  language,
  activeBroadcasts,
  onInspectMap,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const t = TRANSLATIONS[language];

  if (activeBroadcasts.length === 0) {
    return (
      <div className="bg-[#0A192F] text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" />
            <span className="font-semibold tracking-wide text-emerald-300">
              {t.tickerNominalTitle}
            </span>
            <span className="text-slate-300">{t.tickerNominalDesc}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-200 font-mono tabular-nums">
            {BHOPAL_HELPLINES.map((h) => (
              <span key={h.number} className="inline-flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {language === "hi" ? h.labelHi : h.labelEn}: <strong>{h.number}</strong>
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const safeIndex = activeIndex % activeBroadcasts.length;
  const current = activeBroadcasts[safeIndex];
  const landmarkName = language === "hi" ? current.landmarkHi : current.landmark;
  const altRoute =
    language === "hi"
      ? current.alternateRouteHi || current.alternateRoute
      : current.alternateRoute;

  return (
    <div className="bg-[#EA580C] text-white border-b border-orange-700" role="alert">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <AlertTriangle className="w-5 h-5 text-white shrink-0 mt-0.5 sm:mt-0" />
          <div className="min-w-0 text-sm leading-snug">
            <span className="font-bold tracking-wide mr-2">
              {t.tickerAlertPrefix} ({safeIndex + 1}/{activeBroadcasts.length}):
            </span>
            <span className="font-semibold">{landmarkName}</span>
            <span className="mx-2 opacity-75" aria-hidden="true">
              —
            </span>
            <span className="text-orange-50">
              {altRoute ? `${t.tickerAvoidPrefix} ${altRoute}` : t.tickerAvoidPrefix}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2.5 font-mono tabular-nums text-orange-50">
            <span>{t.helplineBmc}: 1079</span>
            <span aria-hidden="true">/</span>
            <span>{t.helplineSos}: 112</span>
            <span aria-hidden="true">/</span>
            <span>0755-2542222</span>
          </div>

          {activeBroadcasts.length > 1 && (
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => (prev + 1) % activeBroadcasts.length)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-orange-800/80 hover:bg-orange-900 text-white font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.tickerNextAlert}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onInspectMap}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white text-[#EA580C] hover:bg-orange-50 font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.tickerViewMap}
          </button>
        </div>
      </div>
    </div>
  );
};
