import React from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { Language } from "../types/civic";

interface OfflineIndicatorProps {
  language: Language;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ language }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="fixed bottom-16 md:bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg print:hidden"
      role="status"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        {language === "hi"
          ? "ऑफ़लाइन मोड — कैश्ड भोपाल मानचित्र एवं रिपोर्ट डेटा सक्रिय है।"
          : "Offline Mode — Cached Bhopal alerts & report data active."}
      </span>
    </div>
  );
};
