import { Language } from "../types/civic";

export const TRANSLATIONS: Record<
  Language,
  {
    brandTitle: string;
    brandSubline: string;
    navCitizen: string;
    navAdmin: string;
    navMunicipal: string;
    navLeaderboard: string;
    downloadGuideBtn: string;
    roleBadgeCitizen: string;
    roleBadgeAdmin: string;
    roleBadgeMunicipal: string;
    roleBadgeLeaderboard: string;
    // Emergency Ticker
    tickerNominalTitle: string;
    tickerNominalDesc: string;
    tickerAlertPrefix: string;
    tickerAvoidPrefix: string;
    tickerNextAlert: string;
    tickerViewMap: string;
    helplineBmc: string;
    helplineSos: string;
    // Underpass & Road Water-Level Safety Strip
    underpassHeading: string;
    underpassSubheading: string;
    safetySafe: string;
    safetyCaution: string;
    safetyDanger: string;
    waterDepthUnit: string;
    safeRouteBtn: string;
    hideRouteBtn: string;
    locateZoneBtn: string;
    // Lake & Zone telemetry strip
    telemetryHeading: string;
    telemetrySubheading: string;
    statusNormal: string;
    statusWatch: string;
    statusAlert: string;
    // Predictive Drain Blockage Risk
    drainTriggerTag: string;
    drainTriggerExplain: string;
    // Panel 1: Citizen Panel
    citizenEyebrow: string;
    citizenHeading: string;
    citizenSubheading: string;
    formStepCategory: string;
    categoryWasteBtn: string;
    categoryFloodBtn: string;
    formStepSeverity: string;
    severityLow: string;
    severityModerate: string;
    severityCritical: string;
    criticalFloodWarning: string;
    formStepWard: string;
    formGpsLabel: string;
    detectGpsBtn: string;
    detectingGpsBtn: string;
    formStepTitle: string;
    titlePlaceholderFlood: string;
    titlePlaceholderWaste: string;
    formFieldDesc: string;
    descPlaceholder: string;
    formReporterName: string;
    reporterPlaceholder: string;
    formStepEvidence: string;
    attachSampleFlood: string;
    attachSampleDrain: string;
    attachSampleSpam: string;
    dropzoneHint: string;
    uploadPhotoBtn: string;
    captureCameraBtn: string;
    removePhotoBtn: string;
    submitFloodBtn: string;
    submitWasteBtn: string;
    submittingBtn: string;
    submittedBannerPrefix: string;
    aiTrustLabel: string;
    safeCorridorsTitle: string;
    locateOnMapBtn: string;
    // Map
    mapHeading: string;
    mapAllBtn: string;
    mapFloodBtn: string;
    mapWasteBtn: string;
    mapResolvedBtn: string;
    mapCenterBtn: string;
    legendFlood: string;
    legendWaste: string;
    legendResolved: string;
    pickerHint: string;
    // Tracker
    trackerHeading: string;
    trackerSubheading: string;
    filterAll: string;
    filterMine: string;
    filterFlood: string;
    filterWaste: string;
    stageSubmitted: string;
    stageVerified: string;
    stageAssigned: string;
    stageResolved: string;
    spamQuarantinePrefix: string;
    assignedUnitPrefix: string;
    beforeLabel: string;
    afterCleanupLabel: string;
    // Panel 2: Admin Command Center
    adminEyebrow: string;
    adminHeading: string;
    kpiFloodAlerts: string;
    kpiFloodSub: string;
    kpiCriticalSafety: string;
    kpiCriticalSub: string;
    kpiPendingWaste: string;
    kpiPendingSub: string;
    kpiFlaggedSpam: string;
    kpiFlaggedSub: string;
    kpiResolvedToday: string;
    kpiResolvedSub: string;
    adminFilterAll: string;
    adminFilterFlood: string;
    adminFilterWaste: string;
    adminFilterDrainRisk: string;
    adminFilterFlagged: string;
    adminFilterResolved: string;
    searchPlaceholder: string;
    queueHeading: string;
    itemsLabel: string;
    firewallHeading: string;
    rerunAiBtn: string;
    gpsMatchLabel: string;
    classificationLabel: string;
    fraudSignalsHeading: string;
    adminActionsHeading: string;
    selectBmcZoneLabel: string;
    assignMunicipalBtn: string;
    altRouteInputLabel: string;
    broadcastFloodBtn: string;
    clearBroadcastBtn: string;
    quarantineSpamBtn: string;
    openOnMapBtn: string;
    // Panel 3: Municipal Party Field Panel
    municipalEyebrow: string;
    municipalHeading: string;
    municipalSubheading: string;
    wardFilterAll: string;
    tabActiveQueue: string;
    tabCompletedJobs: string;
    noFieldJobsMsg: string;
    fieldInstructionsLabel: string;
    coordinatesLabel: string;
    closedLoopHeading: string;
    closedLoopHint: string;
    uploadAfterPhotoBtn: string;
    captureAfterPhotoBtn: string;
    attachSampleCleanedBtn: string;
    cleanupNotesLabel: string;
    cleanupNotesPlaceholder: string;
    markJobResolvedBtn: string;
    afterPhotoRequiredMsg: string;
    completedBadgeText: string;
    // Ward Scoreboard Leaderboard
    leaderboardEyebrow: string;
    leaderboardHeading: string;
    leaderboardSubheading: string;
    colRank: string;
    colWard: string;
    colAvgTime: string;
    colResolved: string;
    colPreventedTriggers: string;
    colCitizenRating: string;
    colStatus: string;
    topWardLabel: string;
    minutesUnit: string;
    ratingOutOf: string;
    // Site Guide & PPT Modal
    guideModalTitle: string;
    guideModalSubtitle: string;
    downloadPptxBtn: string;
    generatingPptxBtn: string;
    printPdfBtn: string;
    closeModalBtn: string;
    prevSlideBtn: string;
    nextSlideBtn: string;
    slideCounterPrefix: string;
    // Status labels
    statusSubmitted: string;
    statusAiVerified: string;
    statusDispatched: string;
    statusBroadcasted: string;
    statusResolved: string;
    statusFlagged: string;
    // Live Camera Hardware Lock (Zero File Upload)
    cameraLockBannerTitle: string;
    cameraLockBannerDesc: string;
    openLiveCameraBtn: string;
    launchOpticalTestBtn: string;
    cameraHardwareUnavailable: string;
    cameraLiveStreamLabel: string;
    cameraOpticalFeedLabel: string;
    cancelCameraBtn: string;
    captureFrameBtn: string;
    cameraSourceHardware: string;
    cameraSourceOptical: string;
    cameraWatermarkVerified: string;
    retakeCameraBtn: string;
    livePhotoRequiredError: string;
    // Official Login & Role Access Control
    officialLoginBtn: string;
    officialLogoutBtn: string;
    loginModalTitle: string;
    loginModalSubtitle: string;
    loginSelectRole: string;
    loginRoleAdmin: string;
    loginRoleCrew: string;
    loginEmailLabel: string;
    loginPasscodeLabel: string;
    loginSubmitBtn: string;
    loginErrorInvalid: string;
    loginDemoHeading: string;
    demoAdminLoginBtn: string;
    demoCrewLoginBtn: string;
    protectedPanelTitle: string;
    protectedPanelAdminDesc: string;
    protectedPanelCrewDesc: string;
    protectedPanelUnlockBtn: string;
    protectedPanelBackCitizenBtn: string;
    // Admin Database & Verification Table
    adminDbHeading: string;
    adminDbSubheading: string;
    colReportId: string;
    colLiveThumb: string;
    colGpsCoords: string;
    colAiScore: string;
    colHazardCat: string;
    colAuditTime: string;
    colDbActions: string;
    dbApproveDispatchBtn: string;
    dbTriggerDangerZoneBtn: string;
    exportCsvBtn: string;
    // Commuter Flood Guard
    commuterGuardTitle: string;
    commuterGuardOn: string;
    commuterGuardOff: string;
    commuterGuardDesc: string;
    commuterTurnOnBtn: string;
    commuterTurnOffBtn: string;
    commuterSimulateBtn: string;
    commuterOverlayEyebrow: string;
    commuterOverlayHeadline: string;
    commuterDistanceLabel: string;
    commuterWaterDepthLabel: string;
    commuterSafeDetourLabel: string;
    commuterAcknowledgeMuteBtn: string;
    // Custom Flood Ringtone Selector
    ringtoneSelectorLabel: string;
    toneSirenLabel: string;
    toneBellLabel: string;
    toneVoiceLabel: string;
    toneCustomLabel: string;
    uploadAudioBtn: string;
    testRingtoneBtn: string;
    stopTestRingtoneBtn: string;
    removeCustomAudioBtn: string;
    customAudioSavedPrefix: string;
    customAudioError: string;
    // 2-Stage Municipal Crew Proof (50m GPS + Before & After)
    gpsArrivalHeading: string;
    checkCrewGpsBtn: string;
    simulateArrivalBtn: string;
    crewDistanceAwayPrefix: string;
    crewWithin50mBadge: string;
    crewTooFarWarning: string;
    stage1BeforeHeading: string;
    stage1BeforeHint: string;
    stage2AfterHeading: string;
    stage2AfterLockedHint: string;
    bothPhotosRequiredMsg: string;
    captureBeforeEvidenceBtn: string;
    captureAfterEvidenceBtn: string;
    // 3-Way Comparison
    threeWayComparisonHeading: string;
    citizenPhotoLabel: string;
    municipalBeforeLabel: string;
    municipalAfterLabel: string;
    threeStageProofBadge: string;
    // Footer
    footerSub: string;
  }
> = {
  en: {
    brandTitle: "Bhopal Kavach | Swachh & Surakshit Bhopal",
    brandSubline: "AI-Powered Flood Safety & Smart Garbage Management Command for Bhopal",
    navCitizen: "Citizen Panel",
    navAdmin: "Admin Command",
    navMunicipal: "Municipal Party",
    navLeaderboard: "Ward Scoreboard",
    downloadGuideBtn: "Download Site Guide & PPT",
    roleBadgeCitizen: "Panel 1 · Public Reporting & Safety",
    roleBadgeAdmin: "Panel 2 · AI Firewall & Dispatch",
    roleBadgeMunicipal: "Panel 3 · Field Crew Execution",
    roleBadgeLeaderboard: "Bhopal Ward Cleanliness & Response Scoreboard",
    tickerNominalTitle: "ALL CORRIDORS NOMINAL",
    tickerNominalDesc: "No active road-closure flood broadcasts across Bhopal primary arteries.",
    tickerAlertPrefix: "FLOOD SOS ALERT",
    tickerAvoidPrefix: "Avoid route.",
    tickerNextAlert: "Next Alert",
    tickerViewMap: "View Flood Map",
    helplineBmc: "BMC Control",
    helplineSos: "SOS",
    underpassHeading: "Bhopal Low-Lying Roads & Underpass Safety Monitor",
    underpassSubheading: "Live water-depth passability & 1-click safe alternate routes",
    safetySafe: "SAFE",
    safetyCaution: "CAUTION",
    safetyDanger: "DANGER - DO NOT ENTER",
    waterDepthUnit: "ft water",
    safeRouteBtn: "Safe Alternate Route",
    hideRouteBtn: "Hide Route",
    locateZoneBtn: "Pin on Map",
    telemetryHeading: "Bhopal Lakes & Corridor Telemetry",
    telemetrySubheading: "Live monitoring across Upper Lake, VIP Road & major drainage wards",
    statusNormal: "Normal",
    statusWatch: "Watch",
    statusAlert: "Flood Alert",
    drainTriggerTag: "⚠️ Flood-Trigger Drain Blockage",
    drainTriggerExplain: "Prioritize before rainfall to prevent flash waterlogging",
    citizenEyebrow: "Panel 1 · Citizen Panel (नागरिक पोर्टल)",
    citizenHeading: "Report Flood Danger or Clogged Garbage Hotspots",
    citizenSubheading:
      "Geotagged citizen reports pass through the AI Fraud Firewall and route straight to Bhopal Municipal Party crews.",
    formStepCategory: "1. Select Report Category",
    categoryWasteBtn: "Report Garbage / Clogged Drain",
    categoryFloodBtn: "Report Road Flood Danger",
    formStepSeverity: "2. Severity Level",
    severityLow: "Low",
    severityModerate: "Moderate",
    severityCritical: "Critical / Life-Safety",
    criticalFloodWarning:
      "Priority Flood Flag activated — escalated immediately to Admin Command for road alert broadcast.",
    formStepWard: "3. Bhopal Ward / Landmark",
    formGpsLabel: "Auto-GPS Coordinates",
    detectGpsBtn: "Capture GPS",
    detectingGpsBtn: "Locating...",
    formStepTitle: "4. Incident Headline",
    titlePlaceholderFlood: "e.g., Knee-deep waterlogging blocking VIP Road lane",
    titlePlaceholderWaste: "e.g., Plastic debris choking Patra Nalla culvert",
    formFieldDesc: "Field Details & Road Impact",
    descPlaceholder: "Describe water depth, traffic blockage, or drain/nalla obstruction...",
    formReporterName: "Citizen Name (Optional)",
    reporterPlaceholder: "e.g., Aarav Patel",
    formStepEvidence: "5. Camera / Photo Evidence",
    attachSampleFlood: "Sample Flood Photo",
    attachSampleDrain: "Sample Drain Photo",
    attachSampleSpam: "Test Spam Photo",
    dropzoneHint: "Drag & drop street photo or capture directly from mobile camera",
    uploadPhotoBtn: "Upload Photo",
    captureCameraBtn: "Use Camera",
    removePhotoBtn: "Remove",
    submitFloodBtn: "Submit Flood Emergency Report",
    submitWasteBtn: "Submit Garbage / Drain Report",
    submittingBtn: "Running AI Firewall & Submitting...",
    submittedBannerPrefix: "Report Logged",
    aiTrustLabel: "AI Confidence",
    safeCorridorsTitle: "Active Flood Advisories & Safe Alternate Routes",
    locateOnMapBtn: "Locate on Map",
    mapHeading: "Live Bhopal Status Map",
    mapAllBtn: "All Zones",
    mapFloodBtn: "Flood Zones",
    mapWasteBtn: "Garbage Hotspots",
    mapResolvedBtn: "Cleaned Zones",
    mapCenterBtn: "Center Bhopal",
    legendFlood: "Red: Flood Danger Zone",
    legendWaste: "Amber: Garbage / Drain Hotspot",
    legendResolved: "Green: Cleaned & Verified Zone",
    pickerHint: "Click map or drag pin to refine exact Bhopal coordinates",
    trackerHeading: "Live Citizen Report Tracker",
    trackerSubheading:
      "Follow reports from AI verification to Municipal Party field cleanup and after-photo proof.",
    filterAll: "All Reports",
    filterMine: "My Submissions",
    filterFlood: "Floods",
    filterWaste: "Garbage & Drains",
    stageSubmitted: "Submitted",
    stageVerified: "AI Verified",
    stageAssigned: "Assigned to Party",
    stageResolved: "Cleaned & Green",
    spamQuarantinePrefix: "AI Firewall Blocked:",
    assignedUnitPrefix: "Assigned Crew:",
    beforeLabel: "Reported Evidence",
    afterCleanupLabel: "After-Cleanup Proof",
    adminEyebrow: "Panel 2 · Admin Command Center (एडमिन नियंत्रण कक्ष)",
    adminHeading: "AI Fraud Firewall & Municipal Dispatch Command",
    kpiFloodAlerts: "Active Flood Alerts",
    kpiFloodSub: "Unresolved waterlogging zones",
    kpiCriticalSafety: "Critical Life-Safety",
    kpiCriticalSub: "High-priority road hazards",
    kpiPendingWaste: "Pending Waste / Drains",
    kpiPendingSub: "Awaiting Municipal Party assignment",
    kpiFlaggedSpam: "AI-Flagged Spam / Fake",
    kpiFlaggedSub: "Blocked gallery or GPS spoofs",
    kpiResolvedToday: "Cleaned & Resolved",
    kpiResolvedSub: "Verified with after-cleanup photo",
    adminFilterAll: "All Queue",
    adminFilterFlood: "Flood Hazards",
    adminFilterWaste: "Waste & Drains",
    adminFilterDrainRisk: "Flood-Trigger Drains",
    adminFilterFlagged: "AI Flagged Spam",
    adminFilterResolved: "Resolved",
    searchPlaceholder: "Search ward, landmark, ID...",
    queueHeading: "Incoming Citizen Reports Queue",
    itemsLabel: "reports",
    firewallHeading: "AI Fraud & Authenticity Firewall",
    rerunAiBtn: "Re-run AI Scan",
    gpsMatchLabel: "GPS Match Status",
    classificationLabel: "AI Classification",
    fraudSignalsHeading: "Spam / Duplicate Flags Detected",
    adminActionsHeading: "One-Click Command Actions",
    selectBmcZoneLabel: "Target Municipal Party Ward / Zone",
    assignMunicipalBtn: "Assign to Municipal Party",
    altRouteInputLabel: "Safe Alternate Route (pushed live to Citizen SOS Ticker)",
    broadcastFloodBtn: "Broadcast Flood Road Alert",
    clearBroadcastBtn: "Clear Active Road Alert",
    quarantineSpamBtn: "Quarantine Spam",
    openOnMapBtn: "View on Map",
    municipalEyebrow: "Panel 3 · Municipal Party Field Panel (नगर निगम फील्ड दल)",
    municipalHeading: "Ward-Wise Action Queue & Closed-Loop Cleanup",
    municipalSubheading:
      "Flood-Trigger Drain Blockages are prioritized at the top. Upload an After-Cleanup Photo to close the job and turn the Citizen Map marker green.",
    wardFilterAll: "All Assigned Wards",
    tabActiveQueue: "Active Field Queue",
    tabCompletedJobs: "Completed Cleanups",
    noFieldJobsMsg: "No pending field tasks in this ward queue.",
    fieldInstructionsLabel: "Field Crew Dispatch Details",
    coordinatesLabel: "GPS Coordinates",
    closedLoopHeading: "Closed-Loop Cleanup Verification",
    closedLoopHint:
      "Mandatory: Upload an After-Cleanup Photo from the site before marking this job Resolved.",
    uploadAfterPhotoBtn: "Upload After-Cleanup Photo",
    captureAfterPhotoBtn: "Capture Site Photo",
    attachSampleCleanedBtn: "Attach Sample Cleaned Photo",
    cleanupNotesLabel: "Crew Completion Note",
    cleanupNotesPlaceholder: "e.g., Silt and plastic cleared from storm grate; water draining freely.",
    markJobResolvedBtn: "Verify & Mark Job Resolved",
    afterPhotoRequiredMsg: "Upload an After-Cleanup Photo to unlock resolution.",
    completedBadgeText: "Verified & Cleared — Citizen Map Updated to Green",
    leaderboardEyebrow: "Civic Transparency · Bhopal Municipal Corporation",
    leaderboardHeading: "Bhopal Ward Cleanliness & Response Scoreboard",
    leaderboardSubheading:
      "Live ward rankings based on average Municipal Party cleanup time, resolved hotspots, prevented drain-flood triggers, and citizen verification ratings.",
    colRank: "Rank",
    colWard: "Bhopal Ward & BMC Zone",
    colAvgTime: "Avg Cleanup Time",
    colResolved: "Resolved Hotspots",
    colPreventedTriggers: "Drain Triggers Cleared",
    colCitizenRating: "Citizen Rating",
    colStatus: "Live Queue",
    topWardLabel: "Top Performing Ward",
    minutesUnit: "mins",
    ratingOutOf: "/ 5.0",
    guideModalTitle: "Bhopal Kavach | Swachh & Surakshit Bhopal — 8-Slide Guide",
    guideModalSubtitle:
      "AI-Powered Flood Safety & Smart Garbage Management Command for Bhopal. Export .PPTX or PDF.",
    downloadPptxBtn: "Download Presentation (.PPTX)",
    generatingPptxBtn: "Generating .PPTX...",
    printPdfBtn: "Print / Save PDF",
    closeModalBtn: "Close",
    prevSlideBtn: "Previous Slide",
    nextSlideBtn: "Next Slide",
    slideCounterPrefix: "Slide",
    statusSubmitted: "Submitted",
    statusAiVerified: "AI Verified",
    statusDispatched: "Assigned to Municipal Party",
    statusBroadcasted: "Flood Alert Broadcasted",
    statusResolved: "Resolved (Cleaned)",
    statusFlagged: "Flagged Spam",
    cameraLockBannerTitle: "Hardware Camera Lock · Zero Gallery Uploads",
    cameraLockBannerDesc:
      "File & gallery uploads are disabled to prevent fake reports. Capture live evidence directly with cryptographic GPS + timestamp watermarking.",
    openLiveCameraBtn: "Open Live Camera",
    launchOpticalTestBtn: "Launch Live Optical Test Feed",
    cameraHardwareUnavailable:
      "Camera hardware unavailable or permission denied in this browser. Launch the Live Optical Test Feed below to test live frame stamping & AI check.",
    cameraLiveStreamLabel: "LIVE HARDWARE CAMERA",
    cameraOpticalFeedLabel: "LIVE OPTICAL TEST FEED",
    cancelCameraBtn: "Cancel Camera",
    captureFrameBtn: "Capture Live Evidence",
    cameraSourceHardware: "Live Hardware Camera",
    cameraSourceOptical: "Live Optical Test",
    cameraWatermarkVerified: "Cryptographic GPS + Timestamp + SHA-256 Stamped",
    retakeCameraBtn: "Retake Live Photo",
    livePhotoRequiredError:
      "Please capture a live camera photo first (gallery uploads are disabled).",
    officialLoginBtn: "Official Command Login",
    officialLogoutBtn: "Sign Out",
    loginModalTitle: "Bhopal Kavach — Official Command Access",
    loginModalSubtitle: "AI-Powered Flood Safety & Smart Garbage Management Command for Bhopal",
    loginSelectRole: "Select Official Role",
    loginRoleAdmin: "Admin Command (ADMIN)",
    loginRoleCrew: "Municipal Party (CREW)",
    loginEmailLabel: "Official Email ID",
    loginPasscodeLabel: "Command Access Code",
    loginSubmitBtn: "Authenticate & Enter Portal",
    loginErrorInvalid:
      "Invalid official email or access code for the selected role. Use Demo buttons below for instant access.",
    loginDemoHeading: "Hackathon Judge Quick-Fill Demo Access",
    demoAdminLoginBtn: "Demo Admin Login",
    demoCrewLoginBtn: "Demo Municipal Crew Login",
    protectedPanelTitle: "Protected Command Portal — Role Authentication Required",
    protectedPanelAdminDesc:
      "Only authenticated BMC Admin Command Officers can inspect the centralized database, run AI firewall overrides, or trigger citywide flood sirens.",
    protectedPanelCrewDesc:
      "Only authenticated Municipal Party Field Units can accept ward dispatches and submit closed-loop after-cleanup camera proofs.",
    protectedPanelUnlockBtn: "Authenticate via Official Login",
    protectedPanelBackCitizenBtn: "Return to Public Citizen Panel",
    adminDbHeading: "Centralized Admin Database & Verification Log",
    adminDbSubheading:
      "Tamper-proof audit ledger with live camera thumbnails, auto-GPS coordinates, AI Vision scores, and 1-click command triggers.",
    colReportId: "Report ID",
    colLiveThumb: "Live Camera",
    colGpsCoords: "Auto-GPS",
    colAiScore: "AI Score",
    colHazardCat: "Hazard Category",
    colAuditTime: "Audit Timestamp",
    colDbActions: "Command Actions",
    dbApproveDispatchBtn: "Approve & Dispatch",
    dbTriggerDangerZoneBtn: "Trigger Danger Zone",
    exportCsvBtn: "Export to CSV",
    commuterGuardTitle: "Commuter Flood Guard (Bike & Car Safety Mode)",
    commuterGuardOn: "GUARD ACTIVE",
    commuterGuardOff: "STANDBY",
    commuterGuardDesc:
      "Monitors live GPS proximity within 500m of flooded Bhopal roads & underpasses and triggers an audible emergency detour siren.",
    commuterTurnOnBtn: "Commuter Flood Guard: ON",
    commuterTurnOffBtn: "Commuter Flood Guard: OFF",
    commuterSimulateBtn: "Simulate Approaching Flood Zone (Demo Test)",
    commuterOverlayEyebrow: "BHOPAL KAVACH · PROXIMITY FLOOD SIREN",
    commuterOverlayHeadline: "DANGER: FLOOD AHEAD — TAKE DETOUR",
    commuterDistanceLabel: "Distance to Flood Zone",
    commuterWaterDepthLabel: "Reported Water Depth",
    commuterSafeDetourLabel: "Safest Alternate Route",
    commuterAcknowledgeMuteBtn: "Mute / Acknowledge Warning",
    ringtoneSelectorLabel: "Custom Flood Alert Ringtone",
    toneSirenLabel: "Emergency Siren",
    toneBellLabel: "Warning Bell",
    toneVoiceLabel: "Voice Alert Tone",
    toneCustomLabel: "Custom Audio",
    uploadAudioBtn: "Upload .MP3 / .WAV",
    testRingtoneBtn: "Test My Ringtone",
    stopTestRingtoneBtn: "Stop Preview",
    removeCustomAudioBtn: "Clear Custom",
    customAudioSavedPrefix: "Saved Ringtone:",
    customAudioError: "Please select a valid .mp3, .wav, or .ogg audio file (max 5 MB).",
    gpsArrivalHeading: "Step 0 · On-Site GPS Proximity Lock (≤ 50m)",
    checkCrewGpsBtn: "Verify Site GPS",
    simulateArrivalBtn: "Simulate On-Site Arrival (50m Demo)",
    crewDistanceAwayPrefix: "Crew Distance:",
    crewWithin50mBadge: "Within 50m Geofence · Camera Unlocked",
    crewTooFarWarning: "Crew must arrive within 50m of reported coordinates (or activate Demo Arrival) to unlock live site cameras.",
    stage1BeforeHeading: "Step 1 · Arrival 'Before-Cleaning' Live Photo",
    stage1BeforeHint: "Capture live geo-tagged arrival evidence before starting cleanup.",
    stage2AfterHeading: "Step 2 · Completion 'After-Cleaning' Live Photo",
    stage2AfterLockedHint: "Complete Step 1 (Before-Cleaning Live Photo) to unlock Step 2.",
    bothPhotosRequiredMsg: "Capture both Step 1 (Before) and Step 2 (After) live photos to resolve this ticket.",
    captureBeforeEvidenceBtn: "Capture Before-Cleaning Photo",
    captureAfterEvidenceBtn: "Capture After-Cleaning Photo",
    threeWayComparisonHeading: "3-Way Anti-Fraud Verification (Citizen vs. Before vs. After)",
    citizenPhotoLabel: "1. Citizen Live Photo",
    municipalBeforeLabel: "2. Crew Arrival (Before)",
    municipalAfterLabel: "3. Crew Spotless (After)",
    threeStageProofBadge: "3-Photo Proof",
    footerSub: "AI-Powered Flood Safety & Smart Garbage Management Command for Bhopal",
  },
  hi: {
    brandTitle: "भोपाल कवच | स्वच्छ एवं सुरक्षित भोपाल",
    brandSubline: "भोपाल के लिए एआई-आधारित बाढ़ सुरक्षा एवं स्मार्ट कचरा प्रबंधन प्रणाली",
    navCitizen: "नागरिक पोर्टल",
    navAdmin: "एडमिन कक्ष",
    navMunicipal: "नगर निगम दल",
    navLeaderboard: "वार्ड स्कोरबोर्ड",
    downloadGuideBtn: "साइट गाइड एवं PPT डाउनलोड करें",
    roleBadgeCitizen: "पैनल 1 · जन शिकायत एवं सुरक्षा",
    roleBadgeAdmin: "पैनल 2 · AI सुरक्षा एवं डिस्पैच",
    roleBadgeMunicipal: "पैनल 3 · फील्ड दल कार्यवाही",
    roleBadgeLeaderboard: "भोपाल वार्ड स्वच्छता एवं त्वरित प्रतिक्रिया स्कोरबोर्ड",
    tickerNominalTitle: "सभी मार्ग सामान्य",
    tickerNominalDesc: "भोपाल के मुख्य मार्गों पर अभी कोई बाढ़ सड़क बंदी चेतावनी सक्रिय नहीं है।",
    tickerAlertPrefix: "बाढ़ SOS चेतावनी",
    tickerAvoidPrefix: "इस मार्ग से बचें।",
    tickerNextAlert: "अगली चेतावनी",
    tickerViewMap: "बाढ़ मानचित्र देखें",
    helplineBmc: "BMC नियंत्रण",
    helplineSos: "आपातकाल",
    underpassHeading: "भोपाल निचली सड़क एवं अंडरपास सुरक्षा मॉनिटर",
    underpassSubheading: "वास्तविक समय जल-स्तर स्थिति एवं 1-क्लिक सुरक्षित वैकल्पिक मार्ग",
    safetySafe: "सुरक्षित",
    safetyCaution: "सावधानी",
    safetyDanger: "खतरा — प्रवेश वर्जित",
    waterDepthUnit: "फीट पानी",
    safeRouteBtn: "सुरक्षित वैकल्पिक मार्ग",
    hideRouteBtn: "मार्ग छिपाएं",
    locateZoneBtn: "मानचित्र पर देखें",
    telemetryHeading: "भोपाल झील एवं प्रमुख मार्ग स्थिति",
    telemetrySubheading: "बड़ा तालाब, VIP रोड और प्रमुख नाला क्षेत्रों की लाइव निगरानी",
    statusNormal: "सामान्य",
    statusWatch: "निगरानी",
    statusAlert: "बाढ़ चेतावनी",
    drainTriggerTag: "⚠️ बाढ़-कारक नाला अवरोध",
    drainTriggerExplain: "बारिश से पहले जलभराव रोकने हेतु प्राथमिकता से सफाई आवश्यक",
    citizenEyebrow: "पैनल 1 · नागरिक पोर्टल (Citizen Panel)",
    citizenHeading: "सड़क जलभराव या कचरा / बंद नाली की रिपोर्ट करें",
    citizenSubheading:
      "GPS युक्त नागरिक रिपोर्ट तुरंत AI फ्रॉड फ़ायरवॉल से सत्यापित होकर नगर निगम फील्ड दल तक पहुँचती हैं।",
    formStepCategory: "1. शिकायत का प्रकार चुनें",
    categoryWasteBtn: "कचरा / बंद नाली की रिपोर्ट",
    categoryFloodBtn: "सड़क जलभराव / बाढ़ खतरा",
    formStepSeverity: "2. गंभीरता स्तर",
    severityLow: "सामान्य",
    severityModerate: "मध्यम",
    severityCritical: "अति-गंभीर / जीवन सुरक्षा",
    criticalFloodWarning:
      "उच्च प्राथमिकता बाढ़ चेतावनी सक्रिय — सड़क अलर्ट प्रसारण हेतु एडमिन कक्ष को तुरंत भेजा जाएगा।",
    formStepWard: "3. भोपाल वार्ड / प्रमुख स्थान",
    formGpsLabel: "स्वचालित GPS निर्देशांक",
    detectGpsBtn: "GPS कैप्चर करें",
    detectingGpsBtn: "खोजा जा रहा है...",
    formStepTitle: "4. घटना का शीर्षक",
    titlePlaceholderFlood: "जैसे: VIP रोड पर घुटनों तक जलभराव से यातायात बाधित",
    titlePlaceholderWaste: "जैसे: पात्रा नाला पुलिया में प्लास्टिक कचरा जमा",
    formFieldDesc: "स्थल विवरण एवं प्रभाव",
    descPlaceholder: "पानी की गहराई, सड़क जाम या नाला/नाली अवरोध का विवरण लिखें...",
    formReporterName: "नागरिक का नाम (वैकल्पिक)",
    reporterPlaceholder: "जैसे: आरव पटेल",
    formStepEvidence: "5. कैमरा / फोटो प्रमाण",
    attachSampleFlood: "नमूना बाढ़ फोटो",
    attachSampleDrain: "नमूना नाली फोटो",
    attachSampleSpam: "स्पैम परीक्षण फोटो",
    dropzoneHint: "यहाँ सड़क की फोटो डालें या मोबाइल कैमरे से सीधे खींचें",
    uploadPhotoBtn: "फोटो अपलोड करें",
    captureCameraBtn: "कैमरा खोलें",
    removePhotoBtn: "हटाएं",
    submitFloodBtn: "बाढ़ आपात रिपोर्ट दर्ज करें",
    submitWasteBtn: "कचरा / नाली रिपोर्ट दर्ज करें",
    submittingBtn: "AI जाँच एवं सबमिट हो रहा है...",
    submittedBannerPrefix: "रिपोर्ट दर्ज",
    aiTrustLabel: "AI विश्वसनीयता",
    safeCorridorsTitle: "सक्रिय बाढ़ सलाह एवं सुरक्षित वैकल्पिक मार्ग",
    locateOnMapBtn: "मानचित्र पर देखें",
    mapHeading: "भोपाल लाइव स्थिति मानचित्र",
    mapAllBtn: "सभी क्षेत्र",
    mapFloodBtn: "बाढ़ क्षेत्र",
    mapWasteBtn: "कचरा स्थान",
    mapResolvedBtn: "साफ किए गए क्षेत्र",
    mapCenterBtn: "भोपाल केंद्र",
    legendFlood: "लाल: बाढ़ खतरा क्षेत्र",
    legendWaste: "अम्बर: कचरा / बंद नाली",
    legendResolved: "हरा: स्वच्छ एवं सुरक्षित क्षेत्र",
    pickerHint: "सटीक स्थान चुनने के लिए मानचित्र पर क्लिक करें या पिन खिसकाएं",
    trackerHeading: "लाइव नागरिक रिपोर्ट ट्रैकर",
    trackerSubheading:
      "AI सत्यापन से लेकर नगर निगम दल की सफाई और बाद की फोटो तक लाइव स्थिति देखें।",
    filterAll: "सभी रिपोर्ट",
    filterMine: "मेरी रिपोर्ट",
    filterFlood: "बाढ़",
    filterWaste: "कचरा / नाली",
    stageSubmitted: "दर्ज",
    stageVerified: "AI सत्यापित",
    stageAssigned: "दल को सौंपा गया",
    stageResolved: "स्वच्छ एवं हरा",
    spamQuarantinePrefix: "AI फ़ायरवॉल द्वारा रोका गया:",
    assignedUnitPrefix: "नियुक्त दल:",
    beforeLabel: "शिकायत फोटो",
    afterCleanupLabel: "सफाई के बाद की फोटो",
    adminEyebrow: "पैनल 2 · एडमिन नियंत्रण कक्ष (Admin Command)",
    adminHeading: "AI फ्रॉड फ़ायरवॉल एवं नगर निगम डिस्पैच केंद्र",
    kpiFloodAlerts: "सक्रिय बाढ़ अलर्ट",
    kpiFloodSub: "अनसुलझे जलभराव क्षेत्र",
    kpiCriticalSafety: "अति-गंभीर चेतावनी",
    kpiCriticalSub: "तत्काल जीवन-सुरक्षा मामले",
    kpiPendingWaste: "लंबित कचरा / नाली",
    kpiPendingSub: "निगम दल आवंटन की प्रतीक्षा",
    kpiFlaggedSpam: "AI द्वारा रोका गया स्पैम",
    kpiFlaggedSub: "नकली या गलत GPS अपलोड",
    kpiResolvedToday: "आज साफ एवं पूर्ण",
    kpiResolvedSub: "सफाई बाद फोटो से सत्यापित",
    adminFilterAll: "सभी कतार",
    adminFilterFlood: "बाढ़ खतरे",
    adminFilterWaste: "कचरा / नाली",
    adminFilterDrainRisk: "बाढ़-कारक नाले",
    adminFilterFlagged: "AI फ्लैग स्पैम",
    adminFilterResolved: "पूर्ण कार्य",
    searchPlaceholder: "वार्ड, स्थान या ID खोजें...",
    queueHeading: "नागरिक रिपोर्ट कतार",
    itemsLabel: "रिपोर्ट",
    firewallHeading: "AI फ्रॉड एवं प्रामाणिकता फ़ायरवॉल",
    rerunAiBtn: "AI स्कैन पुनः चलाएं",
    gpsMatchLabel: "GPS मिलान स्थिति",
    classificationLabel: "AI वर्गीकरण",
    fraudSignalsHeading: "पहचाने गए स्पैम / डुप्लिकेट संकेत",
    adminActionsHeading: "वन-क्लिक नियंत्रण कार्यवाही",
    selectBmcZoneLabel: "नगर निगम फील्ड दल वार्ड / ज़ोन चुनें",
    assignMunicipalBtn: "नगर निगम दल को सौंपें",
    altRouteInputLabel: "सुरक्षित वैकल्पिक मार्ग (नागरिक SOS टिकर पर लाइव दिखेगा)",
    broadcastFloodBtn: "बाढ़ सड़क चेतावनी प्रसारित करें",
    clearBroadcastBtn: "सक्रिय सड़क चेतावनी हटाएं",
    quarantineSpamBtn: "स्पैम अलग करें",
    openOnMapBtn: "मानचित्र पर देखें",
    municipalEyebrow: "पैनल 3 · नगर निगम फील्ड दल (Municipal Party)",
    municipalHeading: "वार्ड-वार कार्य सूची एवं क्लोज़्ड-लूप सफाई सत्यापन",
    municipalSubheading:
      "बाढ़-कारक नाला अवरोध सबसे ऊपर प्राथमिकता पर हैं। कार्य पूर्ण करने हेतु 'सफाई के बाद की फोटो' अपलोड करें।",
    wardFilterAll: "सभी आवंटित वार्ड",
    tabActiveQueue: "सक्रिय फील्ड कार्य",
    tabCompletedJobs: "पूर्ण किए गए कार्य",
    noFieldJobsMsg: "इस वार्ड में कोई लंबित फील्ड कार्य नहीं है।",
    fieldInstructionsLabel: "फील्ड दल कार्य विवरण",
    coordinatesLabel: "GPS निर्देशांक",
    closedLoopHeading: "क्लोज़्ड-लूप सफाई सत्यापन",
    closedLoopHint:
      "अनिवार्य: कार्य को पूर्ण (Resolved) चिह्नित करने से पहले स्थल की 'सफाई के बाद की फोटो' अपलोड करें।",
    uploadAfterPhotoBtn: "सफाई बाद फोटो अपलोड करें",
    captureAfterPhotoBtn: "साइट फोटो खींचें",
    attachSampleCleanedBtn: "नमूना स्वच्छ फोटो लगाएं",
    cleanupNotesLabel: "फील्ड दल टिप्पणी",
    cleanupNotesPlaceholder: "जैसे: नाली से प्लास्टिक और गाद हटाई गई; जल निकासी सामान्य।",
    markJobResolvedBtn: "सत्यापित करें एवं कार्य पूर्ण मानें",
    afterPhotoRequiredMsg: "कार्य पूर्ण करने हेतु सफाई के बाद की फोटो अपलोड करें।",
    completedBadgeText: "सत्यापित एवं स्वच्छ — नागरिक मानचित्र पर हरा मार्कर अपडेट",
    leaderboardEyebrow: "नागरिक पारदर्शिता · भोपाल नगर निगम",
    leaderboardHeading: "भोपाल वार्ड स्वच्छता एवं प्रतिक्रिया स्कोरबोर्ड",
    leaderboardSubheading:
      "औसत सफाई समय, हल किए गए हॉटस्पॉट, रोके गए नाला अवरोध और नागरिक रेटिंग के आधार पर लाइव वार्ड रैंकिंग।",
    colRank: "रैंक",
    colWard: "भोपाल वार्ड एवं BMC ज़ोन",
    colAvgTime: "औसत सफाई समय",
    colResolved: "पूर्ण हॉटस्पॉट",
    colPreventedTriggers: "नाला जोखिम समाप्त",
    colCitizenRating: "नागरिक रेटिंग",
    colStatus: "सक्रिय कार्य",
    topWardLabel: "सर्वश्रेष्ठ प्रदर्शन वार्ड",
    minutesUnit: "मिनट",
    ratingOutOf: "/ 5.0",
    guideModalTitle: "भोपाल कवच | स्वच्छ एवं सुरक्षित भोपाल — 8-स्लाइड गाइड",
    guideModalSubtitle:
      "भोपाल के लिए एआई-आधारित बाढ़ सुरक्षा एवं स्मार्ट कचरा प्रबंधन प्रणाली। .PPTX या PDF डाउनलोड करें।",
    downloadPptxBtn: "प्रस्तुति डाउनलोड करें (.PPTX)",
    generatingPptxBtn: ".PPTX बन रही है...",
    printPdfBtn: "प्रिंट / PDF सहेजें",
    closeModalBtn: "बंद करें",
    prevSlideBtn: "पिछली स्लाइड",
    nextSlideBtn: "अगली स्लाइड",
    slideCounterPrefix: "स्लाइड",
    statusSubmitted: "दर्ज",
    statusAiVerified: "AI सत्यापित",
    statusDispatched: "नगर निगम दल को सौंपा गया",
    statusBroadcasted: "बाढ़ चेतावनी प्रसारित",
    statusResolved: "पूर्ण (स्वच्छ)",
    statusFlagged: "स्पैम चिह्नित",
    cameraLockBannerTitle: "लाइव कैमरा लॉक · गैलरी अपलोड पूरी तरह बंद",
    cameraLockBannerDesc:
      "फर्जी रिपोर्ट रोकने हेतु फ़ाइल/गैलरी अपलोड बंद है। लाइव कैमरे से GPS + समय + SHA-256 वॉटरमार्क के साथ फोटो खींचें।",
    openLiveCameraBtn: "लाइव कैमरा खोलें",
    launchOpticalTestBtn: "लाइव ऑप्टिकल टेस्ट फ़ीड खोलें",
    cameraHardwareUnavailable:
      "इस डिवाइस में कैमरा उपलब्ध नहीं है या अनुमति नहीं मिली। लाइव फ्रेम स्टैम्पिंग व AI जाँच के लिए नीचे 'लाइव ऑप्टिकल टेस्ट फ़ीड' खोलें।",
    cameraLiveStreamLabel: "लाइव हार्डवेयर कैमरा",
    cameraOpticalFeedLabel: "लाइव ऑप्टिकल टेस्ट फ़ीड",
    cancelCameraBtn: "कैमरा बंद करें",
    captureFrameBtn: "लाइव प्रमाण खींचें",
    cameraSourceHardware: "लाइव हार्डवेयर कैमरा",
    cameraSourceOptical: "लाइव ऑप्टिकल टेस्ट",
    cameraWatermarkVerified: "क्रिप्टोग्राफ़िक GPS + समय + SHA-256 अंकित",
    retakeCameraBtn: "पुनः लाइव फोटो लें",
    livePhotoRequiredError:
      "कृपया पहले लाइव कैमरे से फोटो खींचें (गैलरी अपलोड प्रतिबंधित है)।",
    officialLoginBtn: "अधिकारी लॉगिन",
    officialLogoutBtn: "लॉगआउट",
    loginModalTitle: "भोपाल कवच — अधिकारी कमांड लॉगिन",
    loginModalSubtitle: "भोपाल के लिए एआई-आधारित बाढ़ सुरक्षा एवं स्मार्ट कचरा प्रबंधन प्रणाली",
    loginSelectRole: "अधिकारी भूमिका चुनें",
    loginRoleAdmin: "एडमिन कमांड (ADMIN)",
    loginRoleCrew: "नगर निगम दल (CREW)",
    loginEmailLabel: "अधिकारी ईमेल ID",
    loginPasscodeLabel: "कमांड एक्सेस कोड",
    loginSubmitBtn: "सत्यापित करें एवं प्रवेश करें",
    loginErrorInvalid:
      "चुनी गई भूमिका के लिए ईमेल या एक्सेस कोड गलत है। त्वरित जाँच हेतु नीचे डेमो बटन उपयोग करें।",
    loginDemoHeading: "हैकथॉन जज त्वरित डेमो लॉगिन",
    demoAdminLoginBtn: "डेमो एडमिन लॉगिन",
    demoCrewLoginBtn: "डेमो नगर निगम दल लॉगिन",
    protectedPanelTitle: "सुरक्षित कमांड पोर्टल — अधिकारी प्रमाणीकरण आवश्यक",
    protectedPanelAdminDesc:
      "केवल प्रमाणित BMC एडमिन अधिकारी ही केंद्रीय डेटाबेस देख सकते हैं या शहरव्यापी बाढ़ चेतावनी प्रसारित कर सकते हैं।",
    protectedPanelCrewDesc:
      "केवल प्रमाणित नगर निगम फील्ड दल ही आवंटित कार्य देख सकते हैं और सफाई-पश्चात लाइव कैमरा प्रमाण जमा कर सकते हैं।",
    protectedPanelUnlockBtn: "अधिकारी लॉगिन से अनलॉक करें",
    protectedPanelBackCitizenBtn: "सार्वजनिक नागरिक पोर्टल पर लौटें",
    adminDbHeading: "केंद्रीय एडमिन डेटाबेस एवं सत्यापन लॉग",
    adminDbSubheading:
      "लाइव कैमरा थंबनेल, स्वचालित GPS निर्देशांक, AI स्कोर और 1-क्लिक डिस्पैच/बाढ़ अलर्ट के साथ छेड़छाड़-रोधी रजिस्टर।",
    colReportId: "रिपोर्ट ID",
    colLiveThumb: "लाइव कैमरा",
    colGpsCoords: "स्वचालित GPS",
    colAiScore: "AI स्कोर",
    colHazardCat: "खतरा श्रेणी",
    colAuditTime: "ऑडिट समय",
    colDbActions: "कमांड कार्यवाही",
    dbApproveDispatchBtn: "स्वीकृत व डिस्पैच",
    dbTriggerDangerZoneBtn: "बाढ़ खतरा घोषित",
    exportCsvBtn: "CSV में निर्यात करें",
    commuterGuardTitle: "यात्री बाढ़ अलार्म (बाइक एवं कार सुरक्षा मोड)",
    commuterGuardOn: "अलार्म सक्रिय",
    commuterGuardOff: "निष्क्रिय",
    commuterGuardDesc:
      "भोपाल की बाढ़ग्रस्त सड़कों/अंडरपास से 500 मी. की दूरी पर आते ही लाइव GPS द्वारा सायरन अलार्म बजाता है।",
    commuterTurnOnBtn: "यात्री बाढ़ अलार्म: चालू",
    commuterTurnOffBtn: "यात्री बाढ़ अलार्म: बंद",
    commuterSimulateBtn: "बाढ़ क्षेत्र निकट आने का परीक्षण (डेमो)",
    commuterOverlayEyebrow: "भोपाल कवच · निकटता बाढ़ सायरन चेतावनी",
    commuterOverlayHeadline: "खतरा: आगे बाढ़ है — वैकल्पिक मार्ग लें",
    commuterDistanceLabel: "बाढ़ क्षेत्र से दूरी",
    commuterWaterDepthLabel: "दर्ज जल-स्तर गहराई",
    commuterSafeDetourLabel: "सबसे सुरक्षित वैकल्पिक मार्ग",
    commuterAcknowledgeMuteBtn: "सायरन बंद करें / चेतावनी स्वीकारें",
    ringtoneSelectorLabel: "कस्टम बाढ़ चेतावनी रिंगटोन चुनें",
    toneSirenLabel: "आपातकालीन सायरन",
    toneBellLabel: "चेतावनी घंटी",
    toneVoiceLabel: "वॉइस अलर्ट टोन",
    toneCustomLabel: "कस्टम ऑडियो",
    uploadAudioBtn: ".MP3 / .WAV अपलोड करें",
    testRingtoneBtn: "मेरी रिंगटोन जांचें",
    stopTestRingtoneBtn: "प्रीव्यू बंद करें",
    removeCustomAudioBtn: "हटाएं",
    customAudioSavedPrefix: "सहेजी गई रिंगटोन:",
    customAudioError: "कृपया मान्य .mp3, .wav या .ogg ऑडियो फ़ाइल चुनें (अधिकतम 5 MB)।",
    gpsArrivalHeading: "चरण 0 · स्थल GPS निकटता सत्यापन (≤ 50 मी.)",
    checkCrewGpsBtn: "स्थल GPS जांचें",
    simulateArrivalBtn: "स्थल आगमन डेमो (50 मी.)",
    crewDistanceAwayPrefix: "दल की दूरी:",
    crewWithin50mBadge: "50 मी. के भीतर · लाइव कैमरा अनलॉक",
    crewTooFarWarning: "कैमरा अनलॉक करने के लिए स्थल के 50 मी. के भीतर पहुँचें (या डेमो आगमन सक्रिय करें)।",
    stage1BeforeHeading: "चरण 1 · आगमन 'सफाई से पहले' लाइव फोटो",
    stage1BeforeHint: "सफाई शुरू करने से पहले GPS-टैग लाइव फोटो खींचें।",
    stage2AfterHeading: "चरण 2 · पूर्णता 'सफाई के बाद' लाइव फोटो",
    stage2AfterLockedHint: "चरण 2 अनलॉक करने के लिए पहले चरण 1 (सफाई से पहले फोटो) पूर्ण करें।",
    bothPhotosRequiredMsg: "टिकट पूर्ण करने के लिए चरण 1 (पहले) और चरण 2 (बाद में) दोनों लाइव फोटो आवश्यक हैं।",
    captureBeforeEvidenceBtn: "सफाई से पहले फोटो खींचें",
    captureAfterEvidenceBtn: "सफाई के बाद फोटो खींचें",
    threeWayComparisonHeading: "3-स्तरीय प्रमाण तुलना (नागरिक बनाम पहले बनाम बाद में)",
    citizenPhotoLabel: "1. नागरिक लाइव फोटो",
    municipalBeforeLabel: "2. निगम आगमन (पहले)",
    municipalAfterLabel: "3. निगम स्वच्छ (बाद में)",
    threeStageProofBadge: "3-फोटो प्रमाण",
    footerSub: "भोपाल के लिए एआई-आधारित बाढ़ सुरक्षा एवं स्मार्ट कचरा प्रबंधन प्रणाली",
  },
};
