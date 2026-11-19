import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  Printer,
  QrCode,
  X,
} from "lucide-react";
import { TRANSLATIONS } from "../i18n/translations";
import { Language } from "../types/civic";
import { KavachLogoBadge } from "./KavachLogoBadge";

interface SiteGuideModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

interface SlideContent {
  number: number;
  kickerEn: string;
  kickerHi: string;
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
  bulletsEn: string[];
  bulletsHi: string[];
  accentHex: string;
  highlightMetricEn: string;
  highlightMetricHi: string;
}

const DECK_SLIDES: SlideContent[] = [
  {
    number: 1,
    kickerEn: "01 · Vision & Civic Mission",
    kickerHi: "01 · दृष्टिकोण एवं मिशन",
    titleEn: "Bhopal Kavach | Swachh & Surakshit Bhopal",
    titleHi: "भोपाल कवच | स्वच्छ एवं सुरक्षित भोपाल",
    subtitleEn: "AI-Powered Flood Safety & Smart Garbage Management Command for Bhopal",
    subtitleHi: "भोपाल के लिए एआई-आधारित बाढ़ सुरक्षा एवं स्मार्ट कचरा प्रबंधन प्रणाली",
    bulletsEn: [
      "Unified 3-tier civic platform connecting Bhopal citizens, Admin Command, and BMC field crews.",
      "Real-time protection across Upper Lake (Bhojtal), VIP Road, Rani Kamlapati Underpass, and Patra Nalla.",
      "Instant EN | हिंदी bilingual accessibility so every resident and sanitation worker operates effortlessly.",
    ],
    bulletsHi: [
      "भोपाल नागरिकों, एडमिन नियंत्रण कक्ष और नगर निगम फील्ड दल को जोड़ने वाला एकीकृत 3-स्तरीय मंच।",
      "बड़ा तालाब (भोजताल), VIP रोड, रानी कमलापति अंडरपास और पात्रा नाला की वास्तविक समय निगरानी।",
      "तत्काल हिंदी | EN द्विभाषी सुविधा ताकि हर नागरिक और सफाई कर्मी आसानी से उपयोग कर सके।",
    ],
    accentHex: "#0284C7",
    highlightMetricEn: "3-Tier Live Loop: Citizen → AI Command → Field Proof",
    highlightMetricHi: "3-स्तरीय लाइव चक्र: नागरिक → AI कक्ष → फील्ड प्रमाण",
  },
  {
    number: 2,
    kickerEn: "02 · Citizen Empowerment",
    kickerHi: "02 · नागरिक उपयोग मार्गदर्शिका",
    titleEn: "How Citizens Use the Site",
    titleHi: "नागरिक पोर्टल का उपयोग कैसे करें",
    subtitleEn: "Live Camera Reporting + Custom Commuter Flood Guard Ringtones",
    subtitleHi: "लाइव कैमरा रिपोर्टिंग + कस्टम यात्री बाढ़ अलार्म रिंगटोन",
    bulletsEn: [
      "Step 1: Enable Commuter Flood Guard (choose Siren, Warning Bell, Voice Alert, or upload your own .MP3/.WAV ringtone) for 500m detour alerts.",
      "Step 2: Choose 'Report Road Flood Danger' or 'Report Garbage / Clogged Drain' with 1-click Auto-GPS capture.",
      "Step 3: Open Live Camera (zero gallery uploads) to capture GPS + SHA-256 stamped evidence and track live cleanup.",
    ],
    bulletsHi: [
      "चरण 1: 500 मी. बाढ़ चेतावनी के लिए यात्री बाढ़ अलार्म चालू करें और सायरन, घंटी, वॉइस टोन या अपना कस्टम .MP3/.WAV चुनें।",
      "चरण 2: 'सड़क जलभराव' या 'कचरा / बंद नाली' चुनें और ऑटो-GPS से सटीक लोकेशन कैप्चर करें।",
      "चरण 3: लाइव कैमरे से GPS + SHA-256 वॉटरमार्क प्रमाण खींचें (गैलरी अपलोड बंद) और लाइव स्टेटस ट्रैक करें।",
    ],
    accentHex: "#0284C7",
    highlightMetricEn: "Auto-GPS Center: 23.2599° N, 77.4126° E (Bhopal)",
    highlightMetricHi: "ऑटो-GPS केंद्र: 23.2599° N, 77.4126° E (भोपाल)",
  },
  {
    number: 3,
    kickerEn: "03 · Trust & Security Layer",
    kickerHi: "03 · AI सुरक्षा एवं विश्वास कवच",
    titleEn: "How the AI Fraud & GPS Shield Works",
    titleHi: "AI फ्रॉड फ़ायरवॉल एवं GPS सुरक्षा कवच",
    subtitleEn: "Zero Wasted Municipal Dispatch on Fake, Gallery, or Spoofed Uploads",
    subtitleHi: "नकली, पुरानी गैलरी या गलत GPS अपलोड पर नगर निगम संसाधनों की बचत",
    bulletsEn: [
      "Vision AI inspects every submitted photo and assigns an AI Confidence Score (0–100%).",
      "Cross-verifies photo EXIF & browser GPS coordinates against Bhopal ward boundaries.",
      "Automatically quarantines recycled gallery photos or indoor spam before they reach field crews.",
    ],
    bulletsHi: [
      "विज़न AI प्रत्येक अपलोड फोटो की जाँच कर 0–100% विश्वसनीयता स्कोर देता है।",
      "फोटो EXIF और ब्राउज़र GPS निर्देशांकों का भोपाल वार्ड सीमा से मिलान करता है।",
      "पुरानी गैलरी या असंगत स्पैम फ़ाइलों को फील्ड दल तक पहुँचने से पहले ही ब्लॉक करता है।",
    ],
    accentHex: "#0A192F",
    highlightMetricEn: "Live Demo Ready: Kolar Sector B Spam Flagged at 18%",
    highlightMetricHi: "लाइव डेमो: कोलार सेक्टर B स्पैम 18% स्कोर पर ब्लॉक",
  },
  {
    number: 4,
    kickerEn: "04 · Emergency Response",
    kickerHi: "04 · आपातकालीन बाढ़ प्रतिक्रिया",
    titleEn: "How Admins Broadcast Life-Saving Flood Sirens",
    titleHi: "एडमिन द्वारा जीवन-रक्षक बाढ़ अलर्ट प्रसारण",
    subtitleEn: "Instant Road-Closure Warnings & Safe Commute Diversions",
    subtitleHi: "तत्काल सड़क-बंदी चेतावनी एवं सुरक्षित वैकल्पिक मार्ग सूचना",
    bulletsEn: [
      "Admins inspect AI-verified critical flood reports in Panel 2 (Admin Command Center).",
      "1-Click 'Broadcast Flood Road Alert' pushes an emergency ticker directly to every Citizen screen.",
      "Citizens immediately see pulsing red danger pins on the Leaflet map with safe alternate routes.",
    ],
    bulletsHi: [
      "एडमिन पैनल 2 में AI-सत्यापित गंभीर बाढ़ रिपोर्ट की जाँच करते हैं।",
      "वन-क्लिक 'बाढ़ सड़क चेतावनी प्रसारित करें' बटन तुरंत हर नागरिक स्क्रीन पर अलर्ट भेजता है।",
      "नागरिक मानचित्र पर पल्सिंग लाल पिन और सुरक्षित वैकल्पिक मार्ग तुरंत देख सकते हैं।",
    ],
    accentHex: "#EA580C",
    highlightMetricEn: "< 2 Seconds from Admin Click to Citizen SOS Ticker",
    highlightMetricHi: "< 2 सेकंड में एडमिन क्लिक से नागरिक SOS टिकर पर लाइव",
  },
  {
    number: 5,
    kickerEn: "05 · Ground Execution",
    kickerHi: "05 · ज़मीनी कार्यवाही एवं सत्यापन",
    titleEn: "How the Municipal Party Closes Tasks with Photo Proof",
    titleHi: "नगर निगम दल द्वारा फोटो प्रमाण के साथ कार्य पूर्णता",
    subtitleEn: "50m GPS Lock + Mandatory 2-Stage Before & After Live Camera Proof",
    subtitleHi: "50 मी. GPS लॉक + अनिवार्य 2-चरण (पहले व बाद) लाइव कैमरा प्रमाण",
    bulletsEn: [
      "Step 0 & 1: Field crew verifies physical GPS within 50m of the site to capture a geo-tagged 'Before-Cleaning' live photo.",
      "Step 2: Once cleared, crew captures a second geo-tagged 'After-Cleaning (Spotless)' live camera photo.",
      "Admin Database & Citizen Tracker display a 3-way Citizen vs. Before vs. After comparison and turn the map marker Emerald Green.",
    ],
    bulletsHi: [
      "चरण 0 व 1: निगम दल स्थल के 50 मी. भीतर GPS सत्यापित कर 'सफाई से पहले' की लाइव फोटो खींचता है।",
      "चरण 2: सफाई पूर्ण होने पर दल 'सफाई के बाद (स्वच्छ)' की दूसरी लाइव कैमरा फोटो खींचता है।",
      "एडमिन डेटाबेस और नागरिक ट्रैकर में 3-तरफ़ा तुलना दिखती है और मानचित्र का मार्कर हरा हो जाता है।",
    ],
    accentHex: "#059669",
    highlightMetricEn: "100% 3-Way Photo-Verified Closure (Citizen · Before · After)",
    highlightMetricHi: "100% 3-स्तरीय फोटो प्रमाणित कार्य पूर्णता (नागरिक · पहले · बाद)",
  },
  {
    number: 6,
    kickerEn: "06 · Predictive Prevention",
    kickerHi: "06 · पूर्वानुमानित बाढ़ रोकथाम",
    titleEn: "Predictive Drain-to-Flood Prevention",
    titleHi: "कचरे से बाढ़ रोकथाम (प्रेडिक्टिव ड्रेन लिंक)",
    subtitleEn: "Stopping Garbage Before It Chokes Patra Nalla, Shahpura & Lake Drains",
    subtitleHi: "पात्रा नाला, शाहपुरा और झील नालों को चोक होने से पहले रोकना",
    bulletsEn: [
      "System automatically detects waste reports near storm drains, culverts, nallas, or lake edges.",
      "Tickets are auto-tagged '⚠️ Flood-Trigger Drain Blockage' in Admin & Municipal Party queues.",
      "Field teams prioritize desilting those hotspots before monsoon cloudbursts trigger street flooding.",
    ],
    bulletsHi: [
      "सिस्टम नाली, पुलिया, पात्रा नाला या झील किनारे के कचरे को स्वचालित पहचानता है।",
      "ऐसे टिकटों पर एडमिन व फील्ड पैनल में '⚠️ बाढ़-कारक नाला अवरोध' टैग लग जाता है।",
      "बारिश से पहले ही इन अवरोधों को प्राथमिकता से साफ कर बाढ़ को रोका जाता है।",
    ],
    accentHex: "#D97706",
    highlightMetricEn: "Proactive Pre-Rain Desilting Priority Engine",
    highlightMetricHi: "वर्षा-पूर्व सक्रिय नाला सफाई प्राथमिकता इंजन",
  },
  {
    number: 7,
    kickerEn: "07 · Civic Accountability",
    kickerHi: "07 · वार्ड प्रदर्शन एवं प्रभाव",
    titleEn: "Bhopal Ward Leaderboard & Real-Time Impact Metrics",
    titleHi: "भोपाल वार्ड स्कोरबोर्ड एवं वास्तविक समय प्रभाव",
    subtitleEn: "Transparent Performance Tracking Across Bhopal Municipal Wards",
    subtitleHi: "भोपाल के सभी नगर निगम वार्डों की पारदर्शी रैंकिंग",
    bulletsEn: [
      "Tracks average Municipal Party cleanup time per ward (down to 34 mins in top-performing wards).",
      "Counts live resolved hotspots, cleared flood-trigger drain blockages, and citizen ratings.",
      "Updates automatically in real time as field teams close assignments in Panel 3.",
    ],
    bulletsHi: [
      "प्रत्येक वार्ड के औसत सफाई समय (शीर्ष वार्डों में 34 मिनट तक) की लाइव गणना।",
      "हल किए गए हॉटस्पॉट, साफ किए गए नाला अवरोध और नागरिक रेटिंग का पारदर्शी प्रदर्शन।",
      "पैनल 3 में कार्य पूर्ण होते ही वार्ड स्कोरबोर्ड स्वतः अपडेट होता है।",
    ],
    accentHex: "#059669",
    highlightMetricEn: "Live Ward Benchmarking: Speed · Volume · Citizen Rating",
    highlightMetricHi: "लाइव वार्ड रैंकिंग: गति · कार्य संख्या · नागरिक रेटिंग",
  },
  {
    number: 8,
    kickerEn: "08 · Emergency Directory & Access",
    kickerHi: "08 · आपातकालीन हेल्पलाइन एवं त्वरित पहुँच",
    titleEn: "Emergency Helplines & Quick Start Access",
    titleHi: "आपातकालीन हेल्पलाइन एवं त्वरित प्रारंभ",
    subtitleEn: "24x7 Bhopal Disaster & Municipal Sanitation Control Contacts",
    subtitleHi: "24x7 भोपाल आपदा एवं नगर निगम स्वच्छता नियंत्रण संपर्क",
    bulletsEn: [
      "BMC Flood & Sanitation Control Room: 1079  |  State Emergency SOS: 112",
      "Bhopal Municipal Flood Cell Direct Line: 0755-2542222",
      "Scan QR or bookmark Bhopal Kavach portal for instant EN / हिंदी reporting on mobile.",
    ],
    bulletsHi: [
      "BMC बाढ़ एवं स्वच्छता नियंत्रण कक्ष: 1079  |  राज्य आपातकाल SOS: 112",
      "भोपाल नगर निगम बाढ़ प्रकोष्ठ हेल्पलाइन: 0755-2542222",
      "मोबाइल पर त्वरित हिंदी / EN रिपोर्टिंग हेतु QR स्कैन करें या भोपाल कवच पोर्टल बुकमार्क करें।",
    ],
    accentHex: "#EA580C",
    highlightMetricEn: "Helplines: 1079 · 112 · 0755-2542222",
    highlightMetricHi: "हेल्पलाइन: 1079 · 112 · 0755-2542222",
  },
];

export const SiteGuideModal: React.FC<SiteGuideModalProps> = ({
  language,
  isOpen,
  onClose,
}) => {
  const t = TRANSLATIONS[language];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isExportingPpt, setIsExportingPpt] = useState(false);

  if (!isOpen) return null;

  const slide = DECK_SLIDES[currentIdx];

  const handleDownloadPptx = async () => {
    setIsExportingPpt(true);
    try {
      const PptxGenJSModule = await import("pptxgenjs");
      const PptxGenJS = PptxGenJSModule.default;
      const pptx = new PptxGenJS();

      pptx.layout = "LAYOUT_16x9";
      pptx.author = "Bhopal Kavach | Swachh & Surakshit Bhopal";
      pptx.title =
        language === "hi"
          ? "भोपाल कवच | स्वच्छ एवं सुरक्षित भोपाल — प्रस्तुति एवं गाइड"
          : "Bhopal Kavach | Swachh & Surakshit Bhopal — Executive Overview & User Guide";

      DECK_SLIDES.forEach((s) => {
        const pptSlide = pptx.addSlide();
        pptSlide.background = { color: "F8FAFC" };

        // Top Deep Navy Command Header Bar
        pptSlide.addShape(pptx.ShapeType.rect, {
          x: 0,
          y: 0,
          w: 10,
          h: 0.72,
          fill: { color: "0A192F" },
        });

        pptSlide.addText(
          language === "hi"
            ? "भोपाल कवच | स्वच्छ एवं सुरक्षित भोपाल"
            : "BHOPAL KAVACH | SWACHH & SURAKSHIT BHOPAL",
          {
            x: 0.5,
            y: 0.16,
            w: 6.8,
            h: 0.4,
            fontSize: 12,
            bold: true,
            color: "FFFFFF",
          }
        );

        pptSlide.addText(
          `${language === "hi" ? "स्लाइड" : "Slide"} ${s.number} / 8`,
          {
            x: 7.5,
            y: 0.16,
            w: 2.0,
            h: 0.4,
            fontSize: 12,
            bold: true,
            align: "right",
            color: "38BDF8",
          }
        );

        // Kicker
        pptSlide.addText(language === "hi" ? s.kickerHi : s.kickerEn, {
          x: 0.6,
          y: 0.95,
          w: 8.8,
          h: 0.3,
          fontSize: 11,
          bold: true,
          color: s.accentHex.replace("#", ""),
        });

        // Main Title
        pptSlide.addText(language === "hi" ? s.titleHi : s.titleEn, {
          x: 0.6,
          y: 1.28,
          w: 8.8,
          h: 0.65,
          fontSize: 25,
          bold: true,
          color: "0A192F",
        });

        // Subtitle
        pptSlide.addText(language === "hi" ? s.subtitleHi : s.subtitleEn, {
          x: 0.6,
          y: 1.95,
          w: 8.8,
          h: 0.4,
          fontSize: 14,
          color: "475569",
        });

        // Content Card
        pptSlide.addShape(pptx.ShapeType.roundRect, {
          x: 0.6,
          y: 2.5,
          w: 8.8,
          h: 2.25,
          fill: { color: "FFFFFF" },
          line: { color: "CBD5E1", width: 1 },
          rectRadius: 0.08,
        });

        const bullets = language === "hi" ? s.bulletsHi : s.bulletsEn;
        pptSlide.addText(
          bullets.map((b) => ({
            text: `•  ${b}\n`,
            options: { breakLine: true },
          })),
          {
            x: 0.85,
            y: 2.7,
            w: 8.3,
            h: 1.9,
            fontSize: 14,
            color: "0F172A",
            valign: "top",
            paraSpaceAfter: 10,
          }
        );

        // Bottom Highlight Strip
        pptSlide.addShape(pptx.ShapeType.roundRect, {
          x: 0.6,
          y: 4.92,
          w: 8.8,
          h: 0.48,
          fill: { color: s.accentHex.replace("#", "") },
          rectRadius: 0.06,
        });

        pptSlide.addText(
          language === "hi" ? s.highlightMetricHi : s.highlightMetricEn,
          {
            x: 0.8,
            y: 4.98,
            w: 8.4,
            h: 0.36,
            fontSize: 12,
            bold: true,
            color: "FFFFFF",
          }
        );
      });

      const fileName =
        language === "hi"
          ? "Bhopal_Kavach_Guide_HI.pptx"
          : "Bhopal_Kavach_Guide_EN.pptx";
      await pptx.writeFile({ fileName });
    } finally {
      setIsExportingPpt(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={t.guideModalTitle}
    >
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl my-auto">
        {/* Modal Header */}
        <div className="bg-[#0A192F] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm sm:text-base font-bold">{t.guideModalTitle}</h2>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{t.guideModalSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPptx}
              disabled={isExportingPpt}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0284C7] hover:bg-sky-600 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer disabled:opacity-60"
            >
              {isExportingPpt ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {isExportingPpt ? t.generatingPptxBtn : t.downloadPptxBtn}
            </button>

            <button
              type="button"
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              {t.printPdfBtn}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeModalBtn}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Strip Selector */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          {DECK_SLIDES.map((s, idx) => (
            <button
              key={s.number}
              type="button"
              onClick={() => setCurrentIdx(idx)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                idx === currentIdx
                  ? "bg-[#0A192F] text-white"
                  : "bg-white text-slate-600 hover:text-[#0A192F] border border-slate-200"
              }`}
            >
              {t.slideCounterPrefix} {s.number}
            </button>
          ))}
        </div>

        {/* Slide Preview Canvas */}
        <div className="p-5 sm:p-7 bg-[#F8FAFC]">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="bg-[#0A192F] text-white px-6 py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <KavachLogoBadge size="sm" />
                <span className="font-bold tracking-wide truncate">{t.brandTitle}</span>
              </div>
              <span className="font-mono tabular-nums text-sky-300 shrink-0">
                {t.slideCounterPrefix} {slide.number} / {DECK_SLIDES.length}
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div className="space-y-1.5">
                <div
                  className="text-xs font-bold tracking-wide"
                  style={{ color: slide.accentHex }}
                >
                  {language === "hi" ? slide.kickerHi : slide.kickerEn}
                </div>
                <h3 className="text-2xl font-bold text-[#0A192F]">
                  {language === "hi" ? slide.titleHi : slide.titleEn}
                </h3>
                <p className="text-sm text-slate-600">
                  {language === "hi" ? slide.subtitleHi : slide.subtitleEn}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                <ul className="md:col-span-9 space-y-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-5">
                  {(language === "hi" ? slide.bulletsHi : slide.bulletsEn).map(
                    (bullet, i) => (
                      <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                        <span
                          className="w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono"
                          style={{ backgroundColor: slide.accentHex }}
                        >
                          {i + 1}
                        </span>
                        <span>{bullet}</span>
                      </li>
                    )
                  )}
                </ul>

                <div className="md:col-span-3 border border-slate-200 rounded-lg p-4 bg-white flex flex-col items-center justify-center text-center gap-2">
                  {slide.number === 8 ? (
                    <>
                      <QrCode className="w-16 h-16 text-[#0A192F]" />
                      <div className="text-[11px] font-semibold text-slate-600">
                        {language === "hi" ? "त्वरित मोबाइल एक्सेस" : "Quick Mobile Access"}
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-12 h-12 rounded-lg text-white flex items-center justify-center font-mono text-lg font-bold"
                        style={{ backgroundColor: slide.accentHex }}
                      >
                        0{slide.number}
                      </div>
                      <div className="text-xs font-semibold text-[#0A192F]">
                        {language === "hi" ? "भोपाल स्मार्ट सिटी" : "Bhopal Civic Deck"}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div
                className="rounded-lg px-4 py-2.5 text-xs font-semibold text-white"
                style={{ backgroundColor: slide.accentHex }}
              >
                {language === "hi" ? slide.highlightMetricHi : slide.highlightMetricEn}
              </div>
            </div>
          </div>

          {/* Slide Navigation Controls */}
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              {t.prevSlideBtn}
            </button>

            <span className="text-xs font-mono tabular-nums text-slate-500">
              {currentIdx + 1} / {DECK_SLIDES.length}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentIdx((prev) => Math.min(DECK_SLIDES.length - 1, prev + 1))
              }
              disabled={currentIdx === DECK_SLIDES.length - 1}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0A192F] text-white text-xs font-semibold hover:bg-[#142c50] disabled:opacity-40 cursor-pointer"
            >
              {t.nextSlideBtn}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
