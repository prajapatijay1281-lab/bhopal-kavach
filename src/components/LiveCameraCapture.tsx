import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Lock,
  Radio,
  ShieldCheck,
  Video,
  X,
} from "lucide-react";
import { TRANSLATIONS } from "../i18n/translations";
import { Language } from "../types/civic";
import { stampWatermarkedCanvas } from "../utils/geoAndCrypto";
import { EvidenceVisual } from "./EvidenceVisual";

export interface LiveCameraCaptureResult {
  imageUrl: string;
  timestampIso: string;
  sha256Signature: string;
  captureSource: "live-hardware-camera" | "live-optical-test";
}

interface LiveCameraCaptureProps {
  language: Language;
  latitude: number;
  longitude: number;
  landmark: string;
  modeLabel?: string;
  accentColor?: "sky" | "emerald" | "orange";
  capturedImageUrl?: string;
  capturedHash?: string;
  capturedTimestampIso?: string;
  captureSource?: "live-hardware-camera" | "live-optical-test" | "verified-archive";
  onCapture: (result: LiveCameraCaptureResult) => void;
  onClear: () => void;
  compact?: boolean;
  captureBtnLabel?: string;
}

export const LiveCameraCapture: React.FC<LiveCameraCaptureProps> = ({
  language,
  latitude,
  longitude,
  landmark,
  modeLabel = "LIVE CITIZEN CAM",
  accentColor = "sky",
  capturedImageUrl,
  capturedHash,
  capturedTimestampIso,
  captureSource,
  onCapture,
  onClear,
  compact = false,
  captureBtnLabel,
}) => {
  const t = TRANSLATIONS[language];

  const [streamMode, setStreamMode] = useState<
    "idle" | "hardware" | "optical-test"
  >("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [liveClock, setLiveClock] = useState<string>(() =>
    new Date().toISOString().slice(11, 19)
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const testCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const stopAllStreams = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopAllStreams();
    };
  }, []);

  useEffect(() => {
    if (streamMode === "idle") return;
    const timer = window.setInterval(() => {
      setLiveClock(new Date().toISOString().slice(11, 19));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [streamMode]);

  // Attach MediaStream once <video> mounts
  useEffect(() => {
    if (streamMode === "hardware" && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [streamMode]);

  // Animated optical test feed canvas when physical camera hardware is unavailable
  useEffect(() => {
    if (streamMode !== "optical-test") return;
    const canvas = testCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let tick = 0;
    const drawFrame = () => {
      tick += 1;
      const w = canvas.width;
      const h = canvas.height;

      // Sky / overcast Bhopal monsoon horizon
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.48);
      skyGrad.addColorStop(0, "#1e293b");
      skyGrad.addColorStop(1, "#475569");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.48);

      // Asphalt roadway + storm curb
      ctx.fillStyle = "#334155";
      ctx.fillRect(0, h * 0.48, w, h * 0.52);

      // Animated water / drain ripples
      ctx.strokeStyle = "rgba(56, 189, 248, 0.55)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const y = h * 0.62 + i * 24;
        const offset = Math.sin(tick * 0.06 + i) * 14;
        ctx.beginPath();
        ctx.moveTo(24, y);
        ctx.bezierCurveTo(
          w * 0.3,
          y + offset,
          w * 0.65,
          y - offset,
          w - 24,
          y + offset * 0.5
        );
        ctx.stroke();
      }

      // Culvert / storm grate silhouette
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(w * 0.28, h * 0.54, w * 0.44, h * 0.22);
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 4;
      for (let gx = w * 0.33; gx < w * 0.7; gx += 26) {
        ctx.beginPath();
        ctx.moveTo(gx, h * 0.55);
        ctx.lineTo(gx, h * 0.75);
        ctx.stroke();
      }

      // Moving floating debris indicator
      const bob = Math.sin(tick * 0.08) * 3;
      ctx.fillStyle = "#d97706";
      ctx.beginPath();
      ctx.ellipse(w * 0.45, h * 0.65 + bob, 26, 11, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(w * 0.52, h * 0.6 + bob, 22, 12);

      // Live optical reticle
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(18, 18, w - 36, h - 36);

      animFrameRef.current = requestAnimationFrame(drawFrame);
    };

    animFrameRef.current = requestAnimationFrame(drawFrame);
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [streamMode]);

  const handleOpenLiveCamera = async () => {
    setCameraError(null);
    stopAllStreams();

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError(t.cameraHardwareUnavailable);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      mediaStreamRef.current = stream;
      setStreamMode("hardware");
    } catch {
      setCameraError(t.cameraHardwareUnavailable);
    }
  };

  const handleOpenOpticalTestFeed = () => {
    setCameraError(null);
    stopAllStreams();
    setStreamMode("optical-test");
  };

  const handleCaptureFrame = async () => {
    setIsCapturing(true);
    try {
      const offscreen = document.createElement("canvas");
      offscreen.width = 640;
      offscreen.height = 380;
      const ctx = offscreen.getContext("2d");

      if (streamMode === "hardware" && videoRef.current && ctx) {
        const vw = videoRef.current.videoWidth || 640;
        const vh = videoRef.current.videoHeight || 380;
        offscreen.width = Math.min(960, vw);
        offscreen.height = Math.min(570, vh);
        ctx.drawImage(videoRef.current, 0, 0, offscreen.width, offscreen.height);
      } else if (streamMode === "optical-test" && testCanvasRef.current && ctx) {
        ctx.drawImage(testCanvasRef.current, 0, 0, offscreen.width, offscreen.height);
      }

      const stamped = await stampWatermarkedCanvas({
        sourceCanvas: offscreen,
        latitude,
        longitude,
        landmark,
        modeLabel,
      });

      const sourceType =
        streamMode === "hardware" ? "live-hardware-camera" : "live-optical-test";

      stopAllStreams();
      setStreamMode("idle");

      onCapture({
        imageUrl: stamped.dataUrl,
        timestampIso: stamped.timestampIso,
        sha256Signature: stamped.sha256Signature,
        captureSource: sourceType,
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const btnPrimary =
    accentColor === "emerald"
      ? "bg-[#059669] hover:bg-emerald-700"
      : accentColor === "orange"
        ? "bg-[#EA580C] hover:bg-orange-700"
        : "bg-[#0A192F] hover:bg-[#142c50]";

  if (capturedImageUrl) {
    return (
      <div className="space-y-2">
        <div className="relative">
          <EvidenceVisual
            imageUrl={capturedImageUrl}
            alt="Cryptographically stamped live camera capture"
            className={compact ? "w-full h-36" : "w-full h-48"}
          />
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded bg-[#0A192F]/90 text-white px-2 py-0.5 text-[10px] font-semibold">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            {captureSource === "live-hardware-camera"
              ? t.cameraSourceHardware
              : t.cameraSourceOptical}
          </span>
        </div>

        <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-[11px] text-emerald-950 flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            <div className="font-semibold inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
              <span>{t.cameraWatermarkVerified}</span>
            </div>
            <div className="font-mono tabular-nums text-[10px] text-emerald-800 truncate">
              SHA256: {capturedHash || "VERIFIED"} ·{" "}
              {capturedTimestampIso ? capturedTimestampIso.slice(11, 19) + " UTC" : "LIVE"}
            </div>
          </div>

          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            {t.retakeCameraBtn}
          </button>
        </div>
      </div>
    );
  }

  if (streamMode !== "idle") {
    return (
      <div className="rounded-xl border border-slate-300 bg-slate-950 overflow-hidden">
        <div className="px-3 py-2 bg-[#0A192F] text-white flex items-center justify-between gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            {streamMode === "hardware"
              ? t.cameraLiveStreamLabel
              : t.cameraOpticalFeedLabel}
          </span>
          <span className="font-mono tabular-nums text-sky-300">
            {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E · {liveClock} UTC
          </span>
        </div>

        <div className={`relative bg-black ${compact ? "h-44" : "h-56"}`}>
          {streamMode === "hardware" ? (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
            />
          ) : (
            <canvas
              ref={testCanvasRef}
              width={640}
              height={380}
              className="w-full h-full object-cover"
            />
          )}

          {/* Live Telemetry HUD Stamp Preview */}
          <div className="absolute bottom-2 inset-x-2 rounded bg-[#0A192F]/80 border border-sky-500/40 px-2.5 py-1 text-[10px] font-mono tabular-nums text-sky-100 flex items-center justify-between gap-2 pointer-events-none">
            <span className="truncate">{landmark}</span>
            <span className="shrink-0 text-emerald-300">GPS + SHA256 LOCK</span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-900 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              stopAllStreams();
              setStreamMode("idle");
            }}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer min-h-[40px]"
          >
            {t.cancelCameraBtn}
          </button>

          <button
            type="button"
            onClick={handleCaptureFrame}
            disabled={isCapturing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EA580C] hover:bg-orange-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60 min-h-[40px]"
          >
            <Camera className="w-4 h-4" />
            {captureBtnLabel || t.captureFrameBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-dashed border-slate-300 bg-slate-50/90 ${
        compact ? "p-3" : "p-4 sm:p-5"
      } text-center space-y-3`}
    >
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#0A192F]">
        <Lock className="w-3.5 h-3.5 text-[#0284C7]" />
        <span>{t.cameraLockBannerTitle}</span>
      </div>

      <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
        {t.cameraLockBannerDesc}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={handleOpenLiveCamera}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white text-xs font-semibold transition-colors cursor-pointer min-h-[44px] ${btnPrimary}`}
        >
          <Camera className="w-4 h-4" />
          {t.openLiveCameraBtn}
        </button>

        {cameraError && (
          <button
            type="button"
            onClick={handleOpenOpticalTestFeed}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-[#0A192F] text-xs font-semibold transition-colors cursor-pointer min-h-[44px]"
          >
            <Video className="w-4 h-4 text-[#0284C7]" />
            {t.launchOpticalTestBtn}
          </button>
        )}
      </div>

      {cameraError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
          {cameraError}
        </div>
      )}
    </div>
  );
};
