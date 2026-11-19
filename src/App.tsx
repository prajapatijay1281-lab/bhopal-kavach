import { useEffect, useMemo, useState } from "react";
import {
  Award,
  FileDown,
  Globe,
  Lock,
  LogOut,
  MapPin,
  ShieldCheck,
  UserCheck,
  Wrench,
} from "lucide-react";
import { AdminCommandCenter } from "./components/AdminCommandCenter";
import { CitizenPortal } from "./components/CitizenPortal";
import { EmergencyTicker } from "./components/EmergencyTicker";
import { KavachLogoBadge } from "./components/KavachLogoBadge";
import { MunicipalPartyPanel } from "./components/MunicipalPartyPanel";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { OfficialLoginModal } from "./components/OfficialLoginModal";
import { PWAInstallButton } from "./components/PWAInstallButton";
import { SiteGuideModal } from "./components/SiteGuideModal";
import { WardLeaderboard } from "./components/WardLeaderboard";
import { INITIAL_DEMO_REPORTS } from "./data/bhopalData";
import { TRANSLATIONS } from "./i18n/translations";
import {
  AppRolePanel,
  AuthSession,
  CivicReport,
  Language,
} from "./types/civic";

const STORAGE_KEY_REPORTS = "bhopal_kavach_reports_v1";
const STORAGE_KEY_LANG = "bhopal_kavach_lang_v1";
const STORAGE_KEY_AUTH = "bhopal_kavach_auth_v1";

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      return saved === "hi" ? "hi" : "en";
    } catch {
      return "en";
    }
  });

  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.role === "ADMIN" || parsed.role === "MUNICIPAL_CREW")) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [activePanel, setActivePanel] = useState<AppRolePanel>("citizen");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPreferredRole, setLoginPreferredRole] = useState<
    "ADMIN" | "MUNICIPAL_CREW"
  >("ADMIN");

  const [reports, setReports] = useState<CivicReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_DEMO_REPORTS;
  });

  const [selectedMapReportId, setSelectedMapReportId] = useState<string | undefined>(
    INITIAL_DEMO_REPORTS[0]?.id
  );
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    } catch {
      // ignore quota errors
    }
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LANG, language);
      document.documentElement.lang = language === "hi" ? "hi" : "en";
    } catch {
      // ignore
    }
  }, [language]);

  useEffect(() => {
    try {
      if (authSession) {
        sessionStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(authSession));
      } else {
        sessionStorage.removeItem(STORAGE_KEY_AUTH);
      }
    } catch {
      // ignore
    }
  }, [authSession]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isGuideModalOpen) setIsGuideModalOpen(false);
        if (isLoginModalOpen) setIsLoginModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isGuideModalOpen, isLoginModalOpen]);

  const activeBroadcasts = useMemo(
    () =>
      reports.filter(
        (r) =>
          r.category === "flood" &&
          r.status === "broadcasted" &&
          r.isEmergencyBroadcast
      ),
    [reports]
  );

  const municipalQueueCount = useMemo(
    () =>
      reports.filter(
        (r) =>
          !r.aiVerification.isFraudOrSpam &&
          (r.status === "dispatched" || r.status === "broadcasted")
      ).length,
    [reports]
  );

  const handleAddReport = (newReport: CivicReport) => {
    setReports((prev) => [newReport, ...prev]);
    setSelectedMapReportId(newReport.id);
  };

  const handleUpdateReport = (updated: CivicReport) => {
    setReports((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    setSelectedMapReportId(updated.id);
  };

  const handleSwitchPanel = (panel: AppRolePanel) => {
    if (panel === "admin" && authSession?.role !== "ADMIN") {
      setLoginPreferredRole("ADMIN");
      setIsLoginModalOpen(true);
    } else if (panel === "municipal" && authSession?.role !== "MUNICIPAL_CREW") {
      setLoginPreferredRole("MUNICIPAL_CREW");
      setIsLoginModalOpen(true);
    }
    setActivePanel(panel);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginSuccess = (session: AuthSession) => {
    setAuthSession(session);
    if (session.role === "ADMIN") {
      setActivePanel("admin");
    } else if (session.role === "MUNICIPAL_CREW") {
      setActivePanel("municipal");
    }
  };

  const handleLogout = () => {
    setAuthSession(null);
    if (activePanel === "admin" || activePanel === "municipal") {
      setActivePanel("citizen");
    }
  };

  const handleJumpToCitizenMap = (report: CivicReport) => {
    setSelectedMapReportId(report.id);
    setActivePanel("citizen");
    setTimeout(() => {
      const el = document.getElementById("bhopal-status-map");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 60);
  };

  const handleInspectMapFromTicker = () => {
    if (activeBroadcasts[0]) {
      handleJumpToCitizenMap(activeBroadcasts[0]);
      return;
    }
    setActivePanel("citizen");
  };

  const handleResetDemoData = () => {
    setReports(INITIAL_DEMO_REPORTS);
    setSelectedMapReportId(INITIAL_DEMO_REPORTS[0]?.id);
  };

  const isAdminAuthorized = authSession?.role === "ADMIN";
  const isCrewAuthorized = authSession?.role === "MUNICIPAL_CREW";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 overflow-x-hidden">
      {/* Deep Navy (#0A192F) Top Command Header */}
      <header className="bg-[#0A192F] text-white border-b border-slate-800 pt-safe print:hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 min-h-16 py-2 flex items-center justify-between gap-2 sm:gap-4">
          {/* Zone 1: Combined Shield/Wave + Leaf Logo Badge & Brand Title/Tagline */}
          <button
            type="button"
            onClick={() => handleSwitchPanel("citizen")}
            className="flex items-center gap-2.5 text-left min-w-0 shrink cursor-pointer"
          >
            <KavachLogoBadge size="md" />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-white truncate font-display">
                {t.brandTitle}
              </div>
              <div className="hidden lg:block text-[11px] text-sky-300/90 truncate">
                {t.brandSubline}
              </div>
            </div>
          </button>

          {/* Zone 2: Desktop Navigation Links */}
          <nav
            aria-label="Role Switcher Navigation"
            className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-300"
          >
            <button
              type="button"
              onClick={() => handleSwitchPanel("citizen")}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activePanel === "citizen" ? "text-white border-b-2 border-[#0284C7]" : ""
              }`}
            >
              {t.navCitizen}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPanel("admin")}
              className={`inline-flex items-center gap-1 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activePanel === "admin" ? "text-white border-b-2 border-[#0284C7]" : ""
              }`}
            >
              {!isAdminAuthorized && <Lock className="w-3 h-3 text-slate-400" />}
              {t.navAdmin}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPanel("municipal")}
              className={`inline-flex items-center gap-1 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activePanel === "municipal" ? "text-white border-b-2 border-[#059669]" : ""
              }`}
            >
              {!isCrewAuthorized && <Lock className="w-3 h-3 text-slate-400" />}
              {t.navMunicipal}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPanel("leaderboard")}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
                activePanel === "leaderboard" ? "text-white border-b-2 border-[#0284C7]" : ""
              }`}
            >
              {t.navLeaderboard}
            </button>
          </nav>

          {/* Zone 3: Official Login + Install App + PPT + Bilingual Toggle (EN | हिंदी) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {authSession ? (
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden md:inline font-semibold text-white truncate max-w-[140px]">
                  {authSession.role === "ADMIN" ? "ADMIN" : "CREW"} · {authSession.badgeId}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  title={t.officialLogoutBtn}
                  className="inline-flex items-center gap-1 text-red-300 hover:text-red-200 font-semibold cursor-pointer pl-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.officialLogoutBtn}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setLoginPreferredRole("ADMIN");
                  setIsLoginModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">{t.officialLoginBtn}</span>
                <span className="sm:hidden">{language === "hi" ? "लॉगिन" : "Login"}</span>
              </button>
            )}

            <PWAInstallButton language={language} />

            <button
              type="button"
              onClick={() => setIsGuideModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-sky-600 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t.downloadGuideBtn}</span>
              <span className="sm:hidden">PPT</span>
            </button>

            <div
              role="group"
              aria-label="Language Switcher"
              className="inline-flex items-center gap-0.5 p-1 rounded-lg bg-slate-800/90 border border-slate-700"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400 ml-1 mr-0.5 shrink-0 hidden sm:block" />
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  language === "en"
                    ? "bg-[#0284C7] text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  language === "hi"
                    ? "bg-[#0284C7] text-white"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Live Flood SOS Ticker */}
      <div className="print:hidden">
        <EmergencyTicker
          language={language}
          activeBroadcasts={activeBroadcasts}
          onInspectMap={handleInspectMapFromTicker}
        />
      </div>

      {/* Desktop / Tablet Role Switcher Bar */}
      <div className="hidden md:block bg-white border-b border-slate-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => handleSwitchPanel("citizen")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePanel === "citizen"
                  ? "bg-[#0284C7] text-white shadow-xs"
                  : "text-slate-700 hover:text-[#0A192F]"
              }`}
            >
              1. {t.navCitizen}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPanel("admin")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePanel === "admin"
                  ? "bg-[#0A192F] text-white shadow-xs"
                  : "text-slate-700 hover:text-[#0A192F]"
              }`}
            >
              {!isAdminAuthorized && <Lock className="w-3 h-3 opacity-70" />}
              2. {t.navAdmin} ({reports.length})
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPanel("municipal")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePanel === "municipal"
                  ? "bg-[#059669] text-white shadow-xs"
                  : "text-slate-700 hover:text-[#0A192F]"
              }`}
            >
              {!isCrewAuthorized && <Lock className="w-3 h-3 opacity-70" />}
              3. {t.navMunicipal} ({municipalQueueCount})
            </button>
            <button
              type="button"
              onClick={() => handleSwitchPanel("leaderboard")}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePanel === "leaderboard"
                  ? "bg-[#0A192F] text-white shadow-xs"
                  : "text-slate-700 hover:text-[#0A192F]"
              }`}
            >
              {t.navLeaderboard}
            </button>
          </div>

          <div className="text-xs font-medium text-slate-500 hidden xl:block">
            {activePanel === "citizen"
              ? t.roleBadgeCitizen
              : activePanel === "admin"
                ? t.roleBadgeAdmin
                : activePanel === "municipal"
                  ? t.roleBadgeMunicipal
                  : t.roleBadgeLeaderboard}
          </div>
        </div>
      </div>

      {/* Active Role-Based Dashboard Viewport */}
      <main
        className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-7 pb-24 md:pb-8 print:px-0 print:py-0 print:pb-0 print:max-w-none print:bg-white ${
          isGuideModalOpen ? "print:hidden" : ""
        }`}
      >
        {activePanel === "citizen" && (
          <CitizenPortal
            language={language}
            reports={reports}
            onAddReport={handleAddReport}
            selectedMapReportId={selectedMapReportId}
            onSelectMapReport={(r) => setSelectedMapReportId(r.id)}
          />
        )}

        {activePanel === "admin" &&
          (isAdminAuthorized ? (
            <AdminCommandCenter
              language={language}
              reports={reports}
              onUpdateReport={handleUpdateReport}
              onJumpToCitizenMap={handleJumpToCitizenMap}
              onOpenMunicipalPanel={() => handleSwitchPanel("municipal")}
            />
          ) : (
            <ProtectedRoleGate
              title={t.protectedPanelTitle}
              description={t.protectedPanelAdminDesc}
              unlockLabel={t.protectedPanelUnlockBtn}
              backLabel={t.protectedPanelBackCitizenBtn}
              onUnlock={() => {
                setLoginPreferredRole("ADMIN");
                setIsLoginModalOpen(true);
              }}
              onBack={() => setActivePanel("citizen")}
            />
          ))}

        {activePanel === "municipal" &&
          (isCrewAuthorized ? (
            <MunicipalPartyPanel
              language={language}
              reports={reports}
              onUpdateReport={handleUpdateReport}
              onJumpToCitizenMap={handleJumpToCitizenMap}
            />
          ) : (
            <ProtectedRoleGate
              title={t.protectedPanelTitle}
              description={t.protectedPanelCrewDesc}
              unlockLabel={t.protectedPanelUnlockBtn}
              backLabel={t.protectedPanelBackCitizenBtn}
              onUnlock={() => {
                setLoginPreferredRole("MUNICIPAL_CREW");
                setIsLoginModalOpen(true);
              }}
              onBack={() => setActivePanel("citizen")}
            />
          ))}

        {activePanel === "leaderboard" && (
          <WardLeaderboard language={language} reports={reports} />
        )}
      </main>

      {/* Civic Footer */}
      <footer className="bg-white border-t border-slate-200 mt-4 mb-16 md:mb-0 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-[#0A192F]">{t.brandTitle}</span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <span>{t.footerSub}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-mono tabular-nums text-slate-600">
              {t.helplineBmc}: 1079 · {t.helplineSos}: 112 · 0755-2542222
            </span>
            <button
              type="button"
              onClick={handleResetDemoData}
              className="text-slate-500 hover:text-[#0A192F] underline cursor-pointer"
            >
              {language === "hi" ? "डेमो डेटा रीसेट करें" : "Reset Demo"}
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom App Navigation Bar (iOS & Android 1-Thumb Ergonomics) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-sm border-t border-slate-200 pb-safe print:hidden"
      >
        <div className="grid grid-cols-4 h-14">
          <button
            type="button"
            onClick={() => handleSwitchPanel("citizen")}
            className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold cursor-pointer ${
              activePanel === "citizen" ? "text-[#0284C7]" : "text-slate-500"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-[78px]">{t.navCitizen}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchPanel("admin")}
            className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold cursor-pointer ${
              activePanel === "admin" ? "text-[#0A192F]" : "text-slate-500"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="truncate max-w-[78px]">
              {!isAdminAuthorized ? "🔒 " : ""}
              {t.navAdmin}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchPanel("municipal")}
            className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold cursor-pointer ${
              activePanel === "municipal" ? "text-[#059669]" : "text-slate-500"
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span className="truncate max-w-[78px]">
              {!isCrewAuthorized ? "🔒 " : ""}
              {t.navMunicipal}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchPanel("leaderboard")}
            className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold cursor-pointer ${
              activePanel === "leaderboard" ? "text-[#0284C7]" : "text-slate-500"
            }`}
          >
            <Award className="w-4 h-4" />
            <span className="truncate max-w-[78px]">{t.navLeaderboard}</span>
          </button>
        </div>
      </nav>

      {/* Offline Connectivity Banner */}
      <OfflineIndicator language={language} />

      {/* 8-Slide Executive Overview & User Guide Modal */}
      <SiteGuideModal
        language={language}
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* Role-Based Official Command Login Modal */}
      <OfficialLoginModal
        language={language}
        isOpen={isLoginModalOpen}
        preferredRole={loginPreferredRole}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

interface ProtectedRoleGateProps {
  title: string;
  description: string;
  unlockLabel: string;
  backLabel: string;
  onUnlock: () => void;
  onBack: () => void;
}

function ProtectedRoleGate({
  title,
  description,
  unlockLabel,
  backLabel,
  onUnlock,
  onBack,
}: ProtectedRoleGateProps) {
  return (
    <section className="max-w-xl mx-auto my-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xs">
      <div className="flex items-center justify-center gap-3">
        <KavachLogoBadge size="lg" />
      </div>
      <h1 className="text-lg sm:text-xl font-bold text-[#0A192F]">{title}</h1>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
        <button
          type="button"
          onClick={onUnlock}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0284C7] hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px]"
        >
          <Lock className="w-4 h-4" />
          {unlockLabel}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px]"
        >
          {backLabel}
        </button>
      </div>
    </section>
  );
}
