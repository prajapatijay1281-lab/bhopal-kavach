import React from "react";
import { Leaf, Shield, Waves } from "lucide-react";

interface KavachLogoBadgeProps {
  size?: "sm" | "md" | "lg";
}

export const KavachLogoBadge: React.FC<KavachLogoBadgeProps> = ({
  size = "md",
}) => {
  const dims =
    size === "lg"
      ? "w-12 h-12 rounded-xl"
      : size === "sm"
        ? "w-8 h-8 rounded-lg"
        : "w-9 h-9 rounded-lg";

  const shieldSize =
    size === "lg" ? "w-7 h-7" : size === "sm" ? "w-5 h-5" : "w-5 h-5";
  const waveSize =
    size === "lg" ? "w-3.5 h-3.5" : size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3";
  const leafSize =
    size === "lg" ? "w-4 h-4" : size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  return (
    <div
      className={`relative ${dims} bg-[#0F2942] border border-sky-400/50 flex items-center justify-center shrink-0 shadow-xs`}
      aria-hidden="true"
    >
      {/* Flood Protection Shield + Water Wave */}
      <Shield className={`${shieldSize} text-[#38BDF8]`} strokeWidth={2.2} />
      <Waves
        className={`${waveSize} text-white absolute bottom-1.5 left-1.5`}
        strokeWidth={2.4}
      />
      {/* Clean-City Leaf Badge (Garbage Removal) */}
      <span className="absolute -top-1 -right-1 rounded-full bg-[#059669] border border-[#0A192F] p-0.5 flex items-center justify-center">
        <Leaf className={`${leafSize} text-white`} strokeWidth={2.4} />
      </span>
    </div>
  );
};
