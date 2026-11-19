import React, { useState } from "react";
import { Download, Share, Smartphone, X } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { Language } from "../types/civic";

interface PWAInstallButtonProps {
  language: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, isMacSafari, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const labelInstall = language === "hi" ? "ऐप इंस्टॉल" : "Install App";
  const labelDevice = isIOS
    ? language === "hi"
      ? "iPhone पर इंस्टॉल"
      : "Install iOS"
    : isMacSafari
      ? language === "hi"
        ? "Mac डॉक में जोड़ें"
        : "Add to Mac"
      : labelInstall;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#059669] hover:bg-emerald-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">{labelInstall}</span>
        <span className="sm:hidden">{language === "hi" ? "ऐप" : "App"}</span>
      </button>
    );
  }

  if (isIOS || isMacSafari) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowGuideModal(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="hidden sm:inline">{labelDevice}</span>
        </button>

        {showGuideModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold text-[#0A192F]">
                  {isIOS
                    ? language === "hi"
                      ? "iPhone / iPad पर ऐप इंस्टॉल करें"
                      : "Install on iPhone / iPad"
                    : language === "hi"
                      ? "Mac Safari डॉक में जोड़ें"
                      : "Add to Mac Dock"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isIOS ? (
                <ol className="space-y-2 text-xs text-slate-700 list-decimal pl-4">
                  <li>
                    {language === "hi" ? (
                      <>
                        Safari टूलबार में <strong>Share</strong> (<Share className="w-3.5 h-3.5 inline text-[#0284C7]" />) आइकन पर टैप करें।
                      </>
                    ) : (
                      <>
                        Tap the <strong>Share</strong> (<Share className="w-3.5 h-3.5 inline text-[#0284C7]" />) button in Safari toolbar.
                      </>
                    )}
                  </li>
                  <li>
                    {language === "hi" ? (
                      <>
                        नीचे स्क्रॉल करें और <strong>Add to Home Screen</strong> चुनें।
                      </>
                    ) : (
                      <>
                        Scroll down and tap <strong>Add to Home Screen</strong>.
                      </>
                    )}
                  </li>
                </ol>
              ) : (
                <ol className="space-y-2 text-xs text-slate-700 list-decimal pl-4">
                  <li>
                    {language === "hi"
                      ? "macOS Safari मेनू में File → Add to Dock चुनें।"
                      : "In macOS Safari menu bar, click File → Add to Dock."}
                  </li>
                  <li>
                    {language === "hi"
                      ? "भोपाल कवच आपके Mac डॉक में एक स्वतंत्र ऐप की तरह खुलेगा।"
                      : "Bhopal Kavach launches as a standalone macOS app."}
                  </li>
                </ol>
              )}

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full rounded-lg bg-[#0A192F] py-2.5 text-xs font-semibold text-white hover:bg-[#142c50] cursor-pointer"
              >
                {language === "hi" ? "ठीक है" : "Got it"}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
