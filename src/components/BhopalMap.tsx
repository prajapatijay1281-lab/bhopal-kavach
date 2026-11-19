import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Crosshair, Layers } from "lucide-react";
import { BHOPAL_CENTER } from "../data/bhopalData";
import { TRANSLATIONS } from "../i18n/translations";
import { CivicReport, Language } from "../types/civic";

interface BhopalMapProps {
  language: Language;
  reports: CivicReport[];
  selectedReportId?: string;
  onSelectReport?: (report: CivicReport) => void;
  pickerMode?: boolean;
  pickedCoords?: { latitude: number; longitude: number };
  onPickCoords?: (coords: { latitude: number; longitude: number }) => void;
  heightClass?: string;
  showFilterBar?: boolean;
}

type MapFilter = "all" | "flood" | "waste" | "resolved";

export const BhopalMap: React.FC<BhopalMapProps> = ({
  language,
  reports,
  selectedReportId,
  onSelectReport,
  pickerMode = false,
  pickedCoords,
  onPickCoords,
  heightClass = "h-[430px]",
  showFilterBar = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  const [filter, setFilter] = useState<MapFilter>("all");
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initialCenter: [number, number] = pickedCoords
      ? [pickedCoords.latitude, pickedCoords.longitude]
      : BHOPAL_CENTER;

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: pickerMode ? 14 : 12.5,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    mapRef.current = map;
    markersLayerRef.current = markersLayer;

    if (pickerMode && onPickCoords) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onPickCoords({
          latitude: Number(e.latlng.lat.toFixed(4)),
          longitude: Number(e.latlng.lng.toFixed(4)),
        });
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      pickerMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !pickerMode || !pickedCoords) return;

    const pinIcon = L.divIcon({
      className: "",
      html: `<div style="width:26px;height:26px;border-radius:9999px;background:#0A192F;border:3px solid #ffffff;box-shadow:0 3px 10px rgba(10,25,47,0.45);display:flex;align-items:center;justify-content:center;"><div style="width:8px;height:8px;border-radius:9999px;background:#0284C7;"></div></div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    if (!pickerMarkerRef.current) {
      const marker = L.marker([pickedCoords.latitude, pickedCoords.longitude], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onPickCoords?.({
          latitude: Number(pos.lat.toFixed(4)),
          longitude: Number(pos.lng.toFixed(4)),
        });
      });
      pickerMarkerRef.current = marker;
    } else {
      pickerMarkerRef.current.setLatLng([pickedCoords.latitude, pickedCoords.longitude]);
    }

    map.panTo([pickedCoords.latitude, pickedCoords.longitude], { animate: true });
  }, [pickerMode, pickedCoords?.latitude, pickedCoords?.longitude]);

  useEffect(() => {
    const layer = markersLayerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;

    layer.clearLayers();

    const visibleReports = reports.filter((r) => {
      if (filter === "flood")
        return r.category === "flood" && r.status !== "resolved" && r.status !== "flagged";
      if (filter === "waste")
        return r.category === "waste" && r.status !== "resolved" && r.status !== "flagged";
      if (filter === "resolved") return r.status === "resolved";
      return r.status !== "flagged";
    });

    visibleReports.forEach((report) => {
      const isResolved = report.status === "resolved";
      const isFloodActive = report.category === "flood" && !isResolved;
      const isSelected = report.id === selectedReportId;

      let marker: L.Marker;

      if (isFloodActive) {
        const floodIcon = L.divIcon({
          className: "",
          html: `<div class="flood-pulse-marker"><div class="flood-pulse-ring"></div><div class="flood-pulse-core" style="${
            isSelected ? "transform:scale(1.25);box-shadow:0 0 0 3px #0A192F;" : ""
          }"></div></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        marker = L.marker([report.latitude, report.longitude], { icon: floodIcon });
      } else {
        const bgColor = isResolved ? "#059669" : "#D97706";
        const ringColor = isSelected ? "#0A192F" : "#ffffff";
        const dotIcon = L.divIcon({
          className: "",
          html: `<div style="width:18px;height:18px;border-radius:9999px;background:${bgColor};border:2.5px solid ${ringColor};box-shadow:0 2px 6px rgba(10,25,47,0.35);"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        marker = L.marker([report.latitude, report.longitude], { icon: dotIcon });
      }

      const statusLabel =
        report.status === "broadcasted"
          ? t.statusBroadcasted
          : report.status === "dispatched"
            ? t.statusDispatched
            : report.status === "resolved"
              ? t.statusResolved
              : report.status === "ai_verified"
                ? t.statusAiVerified
                : t.statusSubmitted;

      const titleText = language === "hi" ? report.titleHi : report.title;
      const landmarkText = language === "hi" ? report.landmarkHi : report.landmark;
      const altText =
        language === "hi"
          ? report.alternateRouteHi || report.alternateRoute
          : report.alternateRoute;

      marker.bindPopup(
        `<div style="min-width:215px;max-width:260px;">
          <div style="font-size:11px;font-weight:700;color:${
            isResolved ? "#059669" : report.category === "flood" ? "#EA580C" : "#B45309"
          };margin-bottom:3px;">
            ${
              report.category === "flood"
                ? language === "hi"
                  ? "बाढ़ क्षेत्र"
                  : "FLOOD ZONE"
                : language === "hi"
                  ? "कचरा / नाली"
                  : "WASTE / DRAIN"
            } · ${escapeHtml(statusLabel)}
          </div>
          <div style="font-size:13px;font-weight:700;color:#0A192F;line-height:1.35;margin-bottom:4px;">
            ${escapeHtml(titleText)}
          </div>
          <div style="font-size:11px;color:#475569;margin-bottom:4px;">
            ${escapeHtml(landmarkText)}
          </div>
          <div style="font-size:11px;color:#64748b;font-family:monospace;">
            ${report.latitude.toFixed(4)}° N, ${report.longitude.toFixed(4)}° E · AI ${
          report.aiVerification.trustScore
        }%
          </div>
          ${
            altText
              ? `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e2e8f0;font-size:11px;color:#0A192F;"><strong>${
                  language === "hi" ? "वैकल्पिक मार्ग:" : "Safe Route:"
                }</strong> ${escapeHtml(altText)}</div>`
              : ""
          }
        </div>`
      );

      marker.on("click", () => {
        onSelectReport?.(report);
      });

      marker.addTo(layer);
    });
  }, [reports, filter, selectedReportId, language]);

  const handleRecenter = () => {
    mapRef.current?.setView(BHOPAL_CENTER, 12.5, { animate: true });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {showFilterBar && (
        <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Layers className="w-4 h-4 text-[#0284C7]" />
            <span className="font-semibold text-[#0A192F]">{t.mapHeading}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-slate-500">23.2599° N, 77.4126° E</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
              {(
                [
                  { id: "all", label: t.mapAllBtn },
                  { id: "flood", label: t.mapFloodBtn },
                  { id: "waste", label: t.mapWasteBtn },
                  { id: "resolved", label: t.mapResolvedBtn },
                ] as { id: MapFilter; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    filter === tab.id
                      ? "bg-white text-[#0A192F] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleRecenter}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#0A192F] bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5 text-[#0284C7]" />
              {t.mapCenterBtn}
            </button>
          </div>
        </div>
      )}

      <div ref={containerRef} className={`w-full ${heightClass} z-0`} />

      <div className="px-4 py-2.5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C] inline-block" />
            {t.legendFlood}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] inline-block" />
            {t.legendWaste}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669] inline-block" />
            {t.legendResolved}
          </span>
        </div>
        {pickerMode && <span className="text-[#0284C7] font-medium">{t.pickerHint}</span>}
      </div>
    </div>
  );
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
