import React from "react";
import { Award, CheckCircle2, Clock, ShieldCheck, Star } from "lucide-react";
import { INITIAL_WARD_LEADERBOARD } from "../data/bhopalData";
import { TRANSLATIONS } from "../i18n/translations";
import { CivicReport, Language } from "../types/civic";

interface WardLeaderboardProps {
  language: Language;
  reports: CivicReport[];
}

export const WardLeaderboard: React.FC<WardLeaderboardProps> = ({
  language,
  reports,
}) => {
  const t = TRANSLATIONS[language];

  const enrichedWards = INITIAL_WARD_LEADERBOARD.map((ward) => {
    const wardPrefix = ward.wardName.split("—")[0]?.trim();
    const matchingReports = reports.filter((r) =>
      wardPrefix ? r.ward.startsWith(wardPrefix) : false
    );

    const liveResolved = matchingReports.filter((r) => r.status === "resolved").length;
    const liveActive = matchingReports.filter(
      (r) =>
        r.status !== "resolved" && r.status !== "flagged"
    ).length;
    const livePreventedTriggers = matchingReports.filter(
      (r) => r.status === "resolved" && r.isFloodTriggerDrainBlockage
    ).length;

    return {
      ...ward,
      totalResolved: ward.baseResolvedCount + liveResolved,
      activeQueue: liveActive,
      totalTriggersPrevented: ward.drainTriggersPrevented + livePreventedTriggers,
    };
  }).sort((a, b) => a.avgCleanupMinutes - b.avgCleanupMinutes);

  const topWard = enrichedWards[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs font-semibold text-[#0284C7]">{t.leaderboardEyebrow}</div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-[#0A192F]">
            {t.leaderboardHeading}
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-3xl">{t.leaderboardSubheading}</p>
        </div>
      </div>

      {/* Top Ward Spotlight + Summary Metrics */}
      {topWard && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0A192F] text-white rounded-xl p-5 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                {t.topWardLabel}
              </div>
              <div className="mt-1.5 text-lg font-bold leading-snug">
                {language === "hi" ? topWard.wardNameHi : topWard.wardName}
              </div>
              <div className="mt-1 text-xs text-slate-300">{topWard.bmcZone}</div>
            </div>
            <div className="text-right font-mono tabular-nums shrink-0">
              <div className="text-2xl font-bold text-emerald-400">
                {topWard.avgCleanupMinutes} {t.minutesUnit}
              </div>
              <div className="text-xs text-slate-300">
                ★ {topWard.citizenRating.toFixed(1)} {t.ratingOutOf}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-500">{t.colResolved}</div>
              <div className="mt-1 text-3xl font-bold text-[#059669] font-mono tabular-nums">
                {enrichedWards.reduce((sum, w) => sum + w.totalResolved, 0)}
              </div>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-200" />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-500">
                {t.colPreventedTriggers}
              </div>
              <div className="mt-1 text-3xl font-bold text-[#0284C7] font-mono tabular-nums">
                {enrichedWards.reduce((sum, w) => sum + w.totalTriggersPrevented, 0)}
              </div>
            </div>
            <ShieldCheck className="w-8 h-8 text-sky-200" />
          </div>
        </section>
      )}

      {/* Swiss-Grid Leaderboard Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">{t.colRank}</th>
                <th className="py-3 px-4">{t.colWard}</th>
                <th className="py-3 px-4 text-right">{t.colAvgTime}</th>
                <th className="py-3 px-4 text-right">{t.colResolved}</th>
                <th className="py-3 px-4 text-right">{t.colPreventedTriggers}</th>
                <th className="py-3 px-4 text-right">{t.colCitizenRating}</th>
                <th className="py-3 px-4 text-right">{t.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {enrichedWards.map((ward, index) => (
                <tr key={ward.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono tabular-nums font-bold text-[#0A192F]">
                    #{index + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">
                      {language === "hi" ? ward.wardNameHi : ward.wardName}
                    </div>
                    <div className="text-xs text-slate-500">{ward.bmcZone}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-[#0284C7]">
                    <span className="inline-flex items-center justify-end gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {ward.avgCleanupMinutes} {t.minutesUnit}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-[#059669]">
                    {ward.totalResolved}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-800">
                    {ward.totalTriggersPrevented}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-amber-700">
                    <span className="inline-flex items-center justify-end gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      {ward.citizenRating.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs">
                    {ward.activeQueue > 0 ? (
                      <span className="font-semibold text-[#EA580C]">
                        {ward.activeQueue} active
                      </span>
                    ) : (
                      <span className="font-semibold text-[#059669]">All Clear</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
