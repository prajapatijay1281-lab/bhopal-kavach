export type Language = "en" | "hi";

export type IncidentCategory = "flood" | "waste";

export type SeverityLevel = "low" | "moderate" | "critical";

export type ReportStatus =
  | "submitted"
  | "ai_verified"
  | "dispatched"
  | "broadcasted"
  | "resolved"
  | "flagged";

export type AppRolePanel = "citizen" | "admin" | "municipal" | "leaderboard";

export type UserAuthRole = "CITIZEN" | "ADMIN" | "MUNICIPAL_CREW";

export interface AuthSession {
  role: UserAuthRole;
  displayName: string;
  displayNameHi: string;
  badgeId: string;
  assignedZone?: string;
}

export type DemoVisualKey =
  | "flood_vip_road"
  | "flood_habibganj_underpass"
  | "drain_shahpura"
  | "waste_mp_nagar"
  | "resolved_new_market"
  | "spam_kolar";

export interface AIVerificationResult {
  trustScore: number;
  gpsMatchStatus: "verified" | "mismatch";
  gpsMatchDetailEn: string;
  gpsMatchDetailHi: string;
  classificationTag: string;
  classificationTagHi: string;
  isFraudOrSpam: boolean;
  fraudFlags: string[];
  fraudFlagsHi: string[];
  recommendedAction: "broadcast_alert" | "dispatch_bmc" | "quarantine_spam";
  summary: string;
  summaryHi: string;
  provider: string;
  analyzedAt: string;
}

export type CommuterToneId = "siren" | "bell" | "voice" | "custom";

export interface CivicReport {
  id: string;
  referenceCode: string;
  title: string;
  titleHi: string;
  category: IncidentCategory;
  severity: SeverityLevel;
  status: ReportStatus;
  landmark: string;
  landmarkHi: string;
  ward: string;
  wardHi: string;
  bmcZone: string;
  latitude: number;
  longitude: number;
  description: string;
  descriptionHi: string;
  reporterName: string;
  reportedAt: string;
  reportedAtHi: string;
  auditTimestampIso?: string;
  cryptographicHash?: string;
  captureSource?: "live-hardware-camera" | "live-optical-test" | "verified-archive";
  imageUrl?: string;
  demoVisualKey?: DemoVisualKey;
  beforeCleanupImageUrl?: string;
  beforeCleanupVisualKey?: DemoVisualKey;
  beforeCleanupHash?: string;
  beforeCleanupTimestampIso?: string;
  arrivalDistanceMeters?: number;
  afterCleanupImageUrl?: string;
  afterCleanupVisualKey?: DemoVisualKey;
  afterCleanupHash?: string;
  resolvedAt?: string;
  resolvedByCrew?: string;
  cleanupNotes?: string;
  aiVerification: AIVerificationResult;
  assignedUnit?: string;
  alternateRoute?: string;
  alternateRouteHi?: string;
  isEmergencyBroadcast?: boolean;
  isFloodTriggerDrainBlockage?: boolean;
  drainTriggerReasonEn?: string;
  drainTriggerReasonHi?: string;
}

export interface BhopalZoneStatus {
  id: string;
  name: string;
  nameHi: string;
  waterLevelOrLoad: string;
  status: "Normal" | "Watch" | "Alert";
  detail: string;
  detailHi: string;
}

export interface BhopalLandmarkOption {
  id: string;
  name: string;
  nameHi: string;
  ward: string;
  wardHi: string;
  bmcZone: string;
  latitude: number;
  longitude: number;
  suggestedAlternateRoute: string;
  suggestedAlternateRouteHi: string;
  isDrainageRiskZone?: boolean;
}

export type UnderpassSafetyLevel = "SAFE" | "CAUTION" | "DANGER";

export interface UnderpassMonitorItem {
  id: string;
  name: string;
  nameHi: string;
  waterDepthFt: number;
  safetyLevel: UnderpassSafetyLevel;
  alternateRoute: string;
  alternateRouteHi: string;
  latitude: number;
  longitude: number;
  linkedReportId?: string;
}

export interface WardPerformanceMetric {
  id: string;
  wardName: string;
  wardNameHi: string;
  bmcZone: string;
  avgCleanupMinutes: number;
  baseResolvedCount: number;
  citizenRating: number;
  drainTriggersPrevented: number;
}
