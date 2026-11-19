import React, { useState } from "react";
import { KeyRound, ShieldCheck, UserCheck, Wrench, X } from "lucide-react";
import { DEMO_OFFICIAL_CREDENTIALS } from "../data/bhopalData";
import { TRANSLATIONS } from "../i18n/translations";
import { AuthSession, Language } from "../types/civic";
import { KavachLogoBadge } from "./KavachLogoBadge";

interface OfficialLoginModalProps {
  language: Language;
  isOpen: boolean;
  preferredRole?: "ADMIN" | "MUNICIPAL_CREW";
  onClose: () => void;
  onLoginSuccess: (session: AuthSession) => void;
}

export const OfficialLoginModal: React.FC<OfficialLoginModalProps> = ({
  language,
  isOpen,
  preferredRole = "ADMIN",
  onClose,
  onLoginSuccess,
}) => {
  const t = TRANSLATIONS[language];

  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "MUNICIPAL_CREW">(
    preferredRole
  );
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedRole(preferredRole);
      setErrorMsg(null);
    }
  }, [isOpen, preferredRole]);

  if (!isOpen) return null;

  const authenticateWithCredentials = (
    targetRole: "ADMIN" | "MUNICIPAL_CREW",
    inputEmail: string,
    inputCode: string
  ) => {
    const matched = DEMO_OFFICIAL_CREDENTIALS.find(
      (acct) =>
        acct.role === targetRole &&
        acct.email.toLowerCase() === inputEmail.trim().toLowerCase() &&
        acct.accessCode === inputCode.trim()
    );

    if (!matched) {
      setErrorMsg(t.loginErrorInvalid);
      return;
    }

    setErrorMsg(null);
    onLoginSuccess({
      role: matched.role,
      displayName: matched.displayName,
      displayNameHi: matched.displayNameHi,
      badgeId: matched.badgeId,
      assignedZone: matched.assignedZone,
    });
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authenticateWithCredentials(selectedRole, email, accessCode);
  };

  const handleQuickDemoLogin = (role: "ADMIN" | "MUNICIPAL_CREW") => {
    const acct = DEMO_OFFICIAL_CREDENTIALS.find((c) => c.role === role);
    if (!acct) return;
    setSelectedRole(role);
    setEmail(acct.email);
    setAccessCode(acct.accessCode);
    authenticateWithCredentials(role, acct.email, acct.accessCode);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="official-login-title"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#0A192F] text-white px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <KavachLogoBadge size="md" />
            <div className="min-w-0">
              <h2 id="official-login-title" className="text-sm font-bold leading-snug">
                {t.loginModalTitle}
              </h2>
              <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                {t.loginModalSubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeModalBtn}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Role Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.loginSelectRole}
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole("ADMIN");
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  selectedRole === "ADMIN"
                    ? "bg-[#0A192F] text-white shadow-xs"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                {t.loginRoleAdmin}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole("MUNICIPAL_CREW");
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  selectedRole === "MUNICIPAL_CREW"
                    ? "bg-[#059669] text-white shadow-xs"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                <Wrench className="w-3.5 h-3.5 shrink-0" />
                {t.loginRoleCrew}
              </button>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="official-email"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                {t.loginEmailLabel}
              </label>
              <input
                id="official-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="official@bhopal.gov.in"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[16px] sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>

            <div>
              <label
                htmlFor="official-code"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                {t.loginPasscodeLabel}
              </label>
              <input
                id="official-code"
                type="password"
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-[16px] sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
              />
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-[#0284C7] hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <KeyRound className="w-4 h-4" />
              {t.loginSubmitBtn}
            </button>
          </form>

          {/* 1-Click Hackathon Demo Credentials */}
          <div className="border-t border-slate-200 pt-3.5 space-y-2">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              {t.loginDemoHeading}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("ADMIN")}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-[#0A192F] cursor-pointer min-h-[40px]"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                {t.demoAdminLoginBtn}
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("MUNICIPAL_CREW")}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-[#059669] cursor-pointer min-h-[40px]"
              >
                <Wrench className="w-3.5 h-3.5 shrink-0" />
                {t.demoCrewLoginBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
