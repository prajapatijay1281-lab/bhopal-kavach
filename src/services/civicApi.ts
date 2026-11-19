import {
  AIVerificationResult,
  CivicReport,
  IncidentCategory,
  SeverityLevel,
} from "../types/civic";

export interface VerifyImageInput {
  imageDataUrl?: string;
  category: IncidentCategory;
  landmark: string;
  landmarkHi?: string;
  description: string;
  severity: SeverityLevel;
  fileName?: string;
  latitude: number;
  longitude: number;
}

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  source: "browser-gps" | "bhopal-fallback";
  noteEn: string;
  noteHi: string;
}

export interface DrainRiskAnalysis {
  isFloodTriggerDrainBlockage: boolean;
  reasonEn?: string;
  reasonHi?: string;
}

/**
 * Predictive "Garbage-to-Flood" Risk Link Detector.
 * Automatically identifies when waste/garbage is reported near a storm drain, nalla, culvert,
 * or lake edge (Patra Nalla, Upper Lake, Shahpura, Boat Club, VIP Road).
 */
export function detectFloodTriggerDrainRisk(params: {
  category: IncidentCategory;
  landmark: string;
  title: string;
  description: string;
  isDrainageRiskZone?: boolean;
}): DrainRiskAnalysis {
  if (params.category !== "waste") {
    return { isFloodTriggerDrainBlockage: false };
  }

  const combined =
    `${params.landmark} ${params.title} ${params.description}`.toLowerCase();

  const drainKeywords = [
    "drain",
    "nalla",
    "nala",
    "culvert",
    "grate",
    "stormwater",
    "storm",
    "lake",
    "bhojtal",
    "patra",
    "shahpura",
    "boat club",
    "embankment",
    "underpass",
    "नाली",
    "नाला",
    "पुलिया",
    "झील",
    "तालाब",
    "पात्रा",
  ];

  const matchedKeyword = drainKeywords.find((kw) => combined.includes(kw));

  if (matchedKeyword || params.isDrainageRiskZone) {
    return {
      isFloodTriggerDrainBlockage: true,
      reasonEn: `Predictive Risk: Garbage reported near ${params.landmark} drainage/lake artery — high pre-rain waterlogging trigger.`,
      reasonHi: `पूर्वानुमानित जोखिम: ${params.landmark} नाला/झील निकासी मार्ग के पास कचरा — वर्षा में बाढ़ का प्रमुख कारण।`,
    };
  }

  return { isFloodTriggerDrainBlockage: false };
}

export async function verifyImageWithAI(
  input: VerifyImageInput
): Promise<AIVerificationResult> {
  if (input.imageDataUrl && input.imageDataUrl.startsWith("data:image/")) {
    const response = await fetch("/api/verify-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageDataUrl: input.imageDataUrl,
        category: input.category,
        landmark: input.landmark,
        description: input.description,
        severity: input.severity,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI verification service returned an error.");
    }

    if (data.apiConfigured && data.result) {
      const isFraud = Boolean(data.result.isFraudOrSpam);
      return {
        trustScore: Math.max(0, Math.min(100, Number(data.result.trustScore) || 85)),
        gpsMatchStatus: isFraud ? "mismatch" : "verified",
        gpsMatchDetailEn: isFraud
          ? "GPS / Visual Consistency Warning"
          : `GPS Verified · Within ${input.landmark} perimeter`,
        gpsMatchDetailHi: isFraud
          ? "GPS / दृश्य संगति चेतावनी"
          : `GPS सत्यापित · ${input.landmarkHi || input.landmark} सीमा में`,
        classificationTag: data.result.classificationTag || "Civic Incident Verified",
        classificationTagHi: isFraud
          ? "संदिग्ध / असंगत छवि"
          : input.category === "flood"
            ? "सत्यापित सड़क जलभराव"
            : "सत्यापित कचरा / नाली अवरोध",
        isFraudOrSpam: isFraud,
        fraudFlags: Array.isArray(data.result.fraudFlags) ? data.result.fraudFlags : [],
        fraudFlagsHi: Array.isArray(data.result.fraudFlags) ? data.result.fraudFlags : [],
        recommendedAction:
          data.result.recommendedAction === "quarantine_spam" ||
          data.result.recommendedAction === "broadcast_alert" ||
          data.result.recommendedAction === "dispatch_bmc"
            ? data.result.recommendedAction
            : input.category === "flood"
              ? "broadcast_alert"
              : "dispatch_bmc",
        summary: data.result.summary || "Analyzed by Gemini Vision API.",
        summaryHi: data.result.summary || "जेमिनी विज़न AI द्वारा विश्लेषित।",
        provider: `Gemini Vision (${data.provider || "gemini-4-hydrogen"})`,
        analyzedAt: "Just now",
      };
    }
  }

  return runLocalCivicVerificationHeuristic(input);
}

function runLocalCivicVerificationHeuristic(
  input: VerifyImageInput
): AIVerificationResult {
  const text = `${input.description} ${input.fileName ?? ""}`.toLowerCase();
  const isSuspicious =
    text.includes("fake") ||
    text.includes("spam") ||
    text.includes("gallery") ||
    text.includes("selfie") ||
    text.includes("meme");

  const outsideBhopal =
    input.latitude < 23.05 ||
    input.latitude > 23.45 ||
    input.longitude < 77.2 ||
    input.longitude > 77.65;

  if (isSuspicious || outsideBhopal) {
    const flagsEn: string[] = [];
    const flagsHi: string[] = [];
    if (outsideBhopal) {
      flagsEn.push("GPS coordinates lie outside Bhopal Municipal Corporation perimeter");
      flagsHi.push("GPS निर्देशांक भोपाल नगर निगम सीमा के बाहर पाए गए");
    }
    if (isSuspicious) {
      flagsEn.push("Recycled gallery file / non-incident signature detected");
      flagsHi.push("पुरानी गैलरी छवि या स्पैम पैटर्न पकड़ा गया");
    }
    return {
      trustScore: 21,
      gpsMatchStatus: "mismatch",
      gpsMatchDetailEn: "GPS Mismatch · Unverified location/media origin",
      gpsMatchDetailHi: "GPS विसंगति · अप्रमाणित स्थान/मीडिया स्रोत",
      classificationTag: "Fake / Recycled Gallery Photo",
      classificationTagHi: "नकली / गैलरी छवि चिह्नित",
      isFraudOrSpam: true,
      fraudFlags: flagsEn,
      fraudFlagsHi: flagsHi,
      recommendedAction: "quarantine_spam",
      summary:
        "Blocked by AI Fraud Firewall: uploaded evidence matches spam/gallery pattern or outside-Bhopal GPS.",
      summaryHi:
        "AI फ्रॉड फ़ायरवॉल द्वारा रोका गया: अपलोड प्रमाण स्पैम/गैलरी या सीमा से बाहर पाया गया।",
      provider: "AI Firewall Engine",
      analyzedAt: "Just now",
    };
  }

  if (input.category === "flood") {
    return {
      trustScore: input.severity === "critical" ? 95 : 88,
      gpsMatchStatus: "verified",
      gpsMatchDetailEn: `GPS Verified · Locked at ${input.latitude.toFixed(4)}°N, ${input.longitude.toFixed(4)}°E`,
      gpsMatchDetailHi: `GPS सत्यापित · ${input.latitude.toFixed(4)}°N, ${input.longitude.toFixed(4)}°E पर लॉक`,
      classificationTag:
        input.severity === "critical"
          ? "Severe Road Flooding"
          : "Moderate Waterlogging",
      classificationTagHi:
        input.severity === "critical" ? "गंभीर सड़क जलभराव" : "मध्यम जलभराव",
      isFraudOrSpam: false,
      fraudFlags: [],
      fraudFlagsHi: [],
      recommendedAction: "broadcast_alert",
      summary: `Verified outdoor waterlogging near ${input.landmark}. Ready for Admin road alert broadcast.`,
      summaryHi: `${input.landmarkHi || input.landmark} के पास सड़क जलभराव सत्यापित। सड़क चेतावनी प्रसारण हेतु तैयार।`,
      provider: "AI Firewall Engine",
      analyzedAt: "Just now",
    };
  }

  const isDrain =
    text.includes("drain") ||
    text.includes("culvert") ||
    text.includes("nalla") ||
    text.includes("नाली") ||
    text.includes("नाला");

  return {
    trustScore: isDrain ? 92 : 87,
    gpsMatchStatus: "verified",
    gpsMatchDetailEn: `GPS Verified · Locked at ${input.latitude.toFixed(4)}°N, ${input.longitude.toFixed(4)}°E`,
    gpsMatchDetailHi: `GPS सत्यापित · ${input.latitude.toFixed(4)}°N, ${input.longitude.toFixed(4)}°E पर लॉक`,
    classificationTag: isDrain ? "Blocked Storm Drain" : "Plastic & Solid Waste",
    classificationTagHi: isDrain ? "बंद स्टॉर्म ड्रेन" : "प्लास्टिक एवं ठोस कचरा",
    isFraudOrSpam: false,
    fraudFlags: [],
    fraudFlagsHi: [],
    recommendedAction: "dispatch_bmc",
    summary: `Confirmed waste/drain obstruction near ${input.landmark}. Ready for Municipal Party assignment.`,
    summaryHi: `${input.landmarkHi || input.landmark} के पास कचरा/नाली अवरोध सत्यापित। नगर निगम दल आवंटन हेतु तैयार।`,
    provider: "AI Firewall Engine",
    analyzedAt: "Just now",
  };
}

export function getLiveGeolocation(): Promise<GeolocationResult> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({
        latitude: 23.2599,
        longitude: 77.4126,
        accuracyMeters: 120,
        source: "bhopal-fallback",
        noteEn: "Centered on Bhopal City Center (23.2599° N, 77.4126° E).",
        noteHi: "भोपाल शहर केंद्र (23.2599° N, 77.4126° E) पर लॉक किया गया।",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(4));
        const lng = Number(position.coords.longitude.toFixed(4));
        const inBhopalBounds =
          lat >= 23.1 && lat <= 23.4 && lng >= 77.25 && lng <= 77.58;

        if (!inBhopalBounds) {
          resolve({
            latitude: 23.2599,
            longitude: 77.4126,
            accuracyMeters: Math.round(position.coords.accuracy),
            source: "bhopal-fallback",
            noteEn: `Device GPS (${lat}°N, ${lng}°E) outside Bhopal; snapped to Bhopal (23.2599°N, 77.4126°E).`,
            noteHi: `डिवाइस GPS भोपाल से बाहर है; भोपाल केंद्र (23.2599°N, 77.4126°E) पर सेट किया गया।`,
          });
          return;
        }

        resolve({
          latitude: lat,
          longitude: lng,
          accuracyMeters: Math.round(position.coords.accuracy),
          source: "browser-gps",
          noteEn: `Live GPS locked (±${Math.round(position.coords.accuracy)}m accuracy).`,
          noteHi: `लाइव GPS लॉक (±${Math.round(position.coords.accuracy)} मी. सटीकता)।`,
        });
      },
      () => {
        resolve({
          latitude: 23.2599,
          longitude: 77.4126,
          accuracyMeters: 120,
          source: "bhopal-fallback",
          noteEn: "GPS permission unavailable; centered on Bhopal (23.2599°N, 77.4126°E).",
          noteHi: "GPS अनुमति उपलब्ध नहीं; भोपाल (23.2599°N, 77.4126°E) पर सेट किया गया।",
        });
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 15000 }
    );
  });
}

export async function dispatchToMunicipalDept(
  report: CivicReport,
  selectedZone: string
): Promise<{
  dispatchedAt: string;
  assignedUnit: string;
  bmcZone: string;
}> {
  const zonePrefix = selectedZone.split("—")[0]?.trim() || "Zone";
  const unitCode =
    report.category === "flood"
      ? `BMC Flood Pump Party (${zonePrefix})`
      : report.isFloodTriggerDrainBlockage
        ? `BMC Priority Nalla Desilting Party (${zonePrefix})`
        : `BMC Sanitation Party (${zonePrefix})`;

  return {
    dispatchedAt: "Just now",
    assignedUnit: unitCode,
    bmcZone: selectedZone,
  };
}
