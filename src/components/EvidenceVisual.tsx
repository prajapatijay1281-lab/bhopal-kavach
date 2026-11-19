import React, { useState } from "react";
import { ImageOff } from "lucide-react";
import { DemoVisualKey } from "../types/civic";

interface EvidenceVisualProps {
  imageUrl?: string;
  demoVisualKey?: DemoVisualKey;
  alt: string;
  className?: string;
}

export const EvidenceVisual: React.FC<EvidenceVisualProps> = ({
  imageUrl,
  demoVisualKey,
  alt,
  className = "w-full h-44",
}) => {
  const [imgError, setImgError] = useState(false);

  if (imageUrl && !imgError) {
    return (
      <div className={`relative overflow-hidden rounded-lg bg-slate-100 border border-slate-200 ${className}`}>
        <img
          src={imageUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-slate-200 bg-slate-900 ${className}`}
      role="img"
      aria-label={alt}
    >
      {renderCivicScene(demoVisualKey)}
    </div>
  );
};

function renderCivicScene(key?: DemoVisualKey) {
  switch (key) {
    case "flood_vip_road":
      return (
        <svg viewBox="0 0 400 240" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="skyMonsoon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            <linearGradient id="floodWater" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#3b4c5e" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          <rect width="400" height="125" fill="url(#skyMonsoon)" />
          {/* Distant Bhopal hills & lakefront */}
          <path d="M0 105 Q70 82 150 98 T320 90 L400 102 L400 125 L0 125 Z" fill="#1e293b" opacity="0.7" />
          {/* VIP Road parapet & streetlamps */}
          <rect x="0" y="114" width="400" height="12" fill="#94a3b8" />
          <line x1="65" y1="45" x2="65" y2="114" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="72" cy="45" r="4" fill="#fef08a" />
          <line x1="210" y1="52" x2="210" y2="114" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="217" cy="52" r="4" fill="#fef08a" />
          <line x1="345" y1="48" x2="345" y2="114" stroke="#cbd5e1" strokeWidth="3" />
          {/* Flooded asphalt */}
          <rect x="0" y="125" width="400" height="115" fill="url(#floodWater)" />
          {/* Submerged lane divider ripples */}
          <path d="M25 162 Q85 156 140 163 T265 158 T380 164" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.45" />
          <path d="M10 194 Q90 187 180 196 T370 190" stroke="#cbd5e1" strokeWidth="1.5" fill="none" opacity="0.35" />
          {/* Partially submerged vehicle & traffic barrier */}
          <rect x="242" y="138" width="96" height="34" rx="6" fill="#e2e8f0" />
          <rect x="256" y="142" width="32" height="14" rx="2" fill="#334155" />
          <rect x="294" y="142" width="28" height="14" rx="2" fill="#334155" />
          <rect x="238" y="168" width="108" height="8" fill="#1e293b" opacity="0.75" />
          {/* Red hazard barrier cone */}
          <polygon points="88,180 96,144 104,180" fill="#dc2626" />
          <rect x="83" y="178" width="26" height="5" fill="#991b1b" />
          <rect x="14" y="14" width="134" height="22" rx="4" fill="#0f2942" opacity="0.88" />
          <text x="22" y="29" fill="#f8fafc" fontSize="10" fontFamily="monospace">VIP RD · 2.4 FT SURGE</text>
        </svg>
      );

    case "flood_habibganj_underpass":
      return (
        <svg viewBox="0 0 400 240" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="240" fill="#1e293b" />
          {/* Concrete railway bridge girder */}
          <rect x="0" y="0" width="400" height="62" fill="#475569" />
          <rect x="0" y="54" width="400" height="10" fill="#334155" />
          {/* Warning clearance stripe */}
          <rect x="130" y="34" width="140" height="16" rx="2" fill="#f59e0b" />
          <text x="142" y="45" fill="#0f172a" fontSize="9" fontWeight="bold" fontFamily="monospace">UNDERPASS · 4.2M CLEAR</text>
          {/* Side retaining walls */}
          <polygon points="0,64 115,126 115,180 0,210" fill="#64748b" />
          <polygon points="400,64 285,126 285,180 400,210" fill="#64748b" />
          {/* Flooded dip */}
          <polygon points="0,152 400,152 400,240 0,240" fill="#0f2942" />
          <path d="M20 176 Q110 169 200 177 T385 174" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.45" />
          <path d="M40 206 Q140 198 240 208 T370 204" stroke="#94a3b8" strokeWidth="1.5" fill="none" opacity="0.4" />
          {/* Depth gauge pole */}
          <rect x="108" y="108" width="6" height="80" fill="#f8fafc" />
          <rect x="108" y="138" width="6" height="14" fill="#dc2626" />
          <rect x="14" y="14" width="152" height="22" rx="4" fill="#7f1d1d" opacity="0.92" />
          <text x="22" y="29" fill="#fef2f2" fontSize="10" fontFamily="monospace">UNDERPASS · RISING LEVEL</text>
        </svg>
      );

    case "drain_shahpura":
      return (
        <svg viewBox="0 0 400 240" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="240" fill="#cbd5e1" />
          {/* Asphalt road + concrete curb */}
          <rect x="0" y="0" width="400" height="105" fill="#475569" />
          <rect x="0" y="105" width="400" height="20" fill="#94a3b8" />
          {/* Storm grate */}
          <rect x="115" y="128" width="170" height="82" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="3" />
          <line x1="145" y1="132" x2="145" y2="206" stroke="#475569" strokeWidth="6" />
          <line x1="175" y1="132" x2="175" y2="206" stroke="#475569" strokeWidth="6" />
          <line x1="205" y1="132" x2="205" y2="206" stroke="#475569" strokeWidth="6" />
          <line x1="235" y1="132" x2="235" y2="206" stroke="#475569" strokeWidth="6" />
          <line x1="265" y1="132" x2="265" y2="206" stroke="#475569" strokeWidth="6" />
          {/* Choked plastic & organic debris */}
          <ellipse cx="168" cy="166" rx="34" ry="18" fill="#d97706" opacity="0.88" />
          <ellipse cx="218" cy="176" rx="42" ry="20" fill="#78350f" opacity="0.85" />
          <rect x="150" y="148" width="32" height="18" rx="4" transform="rotate(-12 150 148)" fill="#f8fafc" opacity="0.9" />
          <rect x="204" y="144" width="26" height="14" rx="3" transform="rotate(18 204 144)" fill="#38bdf8" opacity="0.85" />
          <circle cx="242" cy="168" r="11" fill="#65a30d" opacity="0.85" />
          {/* Stagnant water pooling */}
          <ellipse cx="200" cy="212" rx="145" ry="20" fill="#0f2942" opacity="0.35" />
          <rect x="14" y="14" width="160" height="22" rx="4" fill="#78350f" opacity="0.92" />
          <text x="22" y="29" fill="#fef3c7" fontSize="10" fontFamily="monospace">SHAHPURA · DRAIN CHOKED</text>
        </svg>
      );

    case "waste_mp_nagar":
      return (
        <svg viewBox="0 0 400 240" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="130" fill="#e2e8f0" />
          <rect x="0" y="130" width="400" height="110" fill="#64748b" />
          {/* Commercial building facade */}
          <rect x="22" y="28" width="120" height="102" fill="#94a3b8" />
          <rect x="38" y="46" width="28" height="24" fill="#334155" />
          <rect x="86" y="46" width="28" height="24" fill="#334155" />
          {/* Overflowing municipal bin */}
          <rect x="165" y="102" width="76" height="86" rx="4" fill="#0f2942" />
          <rect x="158" y="96" width="90" height="12" rx="2" fill="#1e3a5f" />
          {/* Overflowing waste mound */}
          <circle cx="192" cy="90" r="18" fill="#cbd5e1" />
          <circle cx="218" cy="92" r="16" fill="#d97706" />
          <rect x="140" y="176" width="136" height="28" rx="12" fill="#475569" />
          <rect x="152" y="168" width="24" height="14" rx="3" fill="#f8fafc" />
          <rect x="196" y="172" width="28" height="12" rx="2" fill="#0284c7" />
          <circle cx="242" cy="180" r="10" fill="#ca8a04" />
          <rect x="14" y="14" width="166" height="22" rx="4" fill="#0f2942" opacity="0.9" />
          <text x="22" y="29" fill="#f8fafc" fontSize="10" fontFamily="monospace">MP NAGAR Z-II · WASTE POINT</text>
        </svg>
      );

    case "resolved_new_market":
      return (
        <svg viewBox="0 0 400 240" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="110" fill="#dbeafe" />
          <rect x="0" y="110" width="400" height="130" fill="#475569" />
          {/* Clean concrete sidewalk */}
          <rect x="0" y="110" width="400" height="32" fill="#e2e8f0" />
          {/* Clean open storm grate */}
          <rect x="135" y="150" width="130" height="60" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
          <line x1="160" y1="154" x2="160" y2="206" stroke="#64748b" strokeWidth="5" />
          <line x1="186" y1="154" x2="186" y2="206" stroke="#64748b" strokeWidth="5" />
          <line x1="212" y1="154" x2="212" y2="206" stroke="#64748b" strokeWidth="5" />
          <line x1="238" y1="154" x2="238" y2="206" stroke="#64748b" strokeWidth="5" />
          <rect x="14" y="14" width="168" height="22" rx="4" fill="#065f46" opacity="0.92" />
          <text x="22" y="29" fill="#ecfdf5" fontSize="10" fontFamily="monospace">NEW MARKET · CLEARED</text>
        </svg>
      );

    case "spam_kolar":
      return (
        <svg viewBox="0 0 400 240" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="240" fill="#f1f5f9" />
          {/* Indoor tiled wall & sofa — clearly unrelated to outdoor flooding */}
          <rect x="0" y="0" width="400" height="165" fill="#e2e8f0" />
          <rect x="85" y="42" width="90" height="65" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="3" />
          <rect x="65" y="128" width="270" height="68" rx="10" fill="#94a3b8" />
          {/* Red diagonal quarantine cross */}
          <line x1="28" y1="28" x2="372" y2="212" stroke="#dc2626" strokeWidth="3" strokeDasharray="8 6" opacity="0.7" />
          <line x1="372" y1="28" x2="28" y2="212" stroke="#dc2626" strokeWidth="3" strokeDasharray="8 6" opacity="0.7" />
          <rect x="14" y="14" width="212" height="22" rx="4" fill="#991b1b" opacity="0.94" />
          <text x="22" y="29" fill="#fef2f2" fontSize="10" fontFamily="monospace">AI FRAUD GUARD · NON-CIVIC</text>
        </svg>
      );

    default:
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500 p-4">
          <ImageOff className="w-7 h-7 mb-1.5 text-slate-400" />
          <span className="text-xs font-medium">Field Evidence Unavailable</span>
        </div>
      );
  }
}
