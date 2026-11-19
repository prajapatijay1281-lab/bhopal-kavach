import { CommuterToneId, Language } from "../types/civic";

/**
 * Multi-Tone Commuter Flood Alert Engine:
 * 1. "siren"  -> Dual-tone Web Audio emergency siren
 * 2. "bell"   -> Loud warning / temple bell harmonic strike loop
 * 3. "voice"  -> Attention chime + bilingual spoken Web Speech detour alert
 * 4. "custom" -> User-uploaded .mp3 / .wav / .ogg stored in IndexedDB
 */

let audioCtx: AudioContext | null = null;
let activeOscillators: OscillatorNode[] = [];
let activeGain: GainNode | null = null;
let loopTimer: number | null = null;
let htmlAudioEl: HTMLAudioElement | null = null;
let htmlAudioUrl: string | null = null;
let isPlaying = false;

export function unlockAudioContext(): void {
  if (typeof window === "undefined") return;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return;

  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
}

function stopWebAudioNodes(): void {
  if (loopTimer !== null) {
    window.clearInterval(loopTimer);
    loopTimer = null;
  }
  try {
    if (activeGain && audioCtx) {
      activeGain.gain.setValueAtTime(
        Math.max(0.0001, activeGain.gain.value),
        audioCtx.currentTime
      );
      activeGain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime + 0.06
      );
    }
    const oscs = activeOscillators;
    activeOscillators = [];
    setTimeout(() => {
      oscs.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
    }, 80);
  } catch {
    activeOscillators = [];
  }
  activeGain = null;
}

export function stopCommuterAlertAudio(): void {
  stopWebAudioNodes();

  if (htmlAudioEl) {
    try {
      htmlAudioEl.pause();
      htmlAudioEl.currentTime = 0;
    } catch {
      // ignore
    }
    htmlAudioEl = null;
  }

  if (htmlAudioUrl) {
    try {
      URL.revokeObjectURL(htmlAudioUrl);
    } catch {
      // ignore
    }
    htmlAudioUrl = null;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  isPlaying = false;
}

export interface StartCommuterAlertOptions {
  toneId: CommuterToneId;
  language?: Language;
  customBlob?: Blob | null;
  landmarkName?: string;
}

export function startCommuterAlertAudio(
  options: StartCommuterAlertOptions
): boolean {
  stopCommuterAlertAudio();
  if (typeof window === "undefined") return false;

  const {
    toneId,
    language = "en",
    customBlob = null,
    landmarkName = "Bhopal Flood Zone",
  } = options;

  // Mode 4: Custom Uploaded Audio (.mp3 / .wav / .ogg)
  if (toneId === "custom" && customBlob) {
    try {
      const url = URL.createObjectURL(customBlob);
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = 0.95;
      htmlAudioUrl = url;
      htmlAudioEl = audio;
      isPlaying = true;
      audio.play().catch(() => {
        // Fallback to built-in siren if autoplay is blocked
        startBuiltInSiren();
      });
      return true;
    } catch {
      // Fallback below
    }
  }

  // Mode 2: Loud Warning / Temple Bell
  if (toneId === "bell") {
    return startTempleWarningBell();
  }

  // Mode 3: Bilingual Voice Alert Tone + Attention Chime
  if (toneId === "voice") {
    return startVoiceAlertTone(language, landmarkName);
  }

  // Mode 1 (Default): Emergency Siren
  return startBuiltInSiren();
}

function startBuiltInSiren(): boolean {
  try {
    unlockAudioContext();
    if (!audioCtx) return false;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(660, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.24, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();

    activeOscillators = [osc];
    activeGain = gain;
    isPlaying = true;

    let highTone = true;
    const toggleTone = () => {
      if (!audioCtx || activeOscillators.length === 0) return;
      const now = audioCtx.currentTime;
      const targetFreq = highTone ? 980 : 640;
      activeOscillators[0].frequency.exponentialRampToValueAtTime(
        targetFreq,
        now + 0.28
      );
      highTone = !highTone;
    };

    toggleTone();
    loopTimer = window.setInterval(toggleTone, 360);
    return true;
  } catch {
    return false;
  }
}

function strikeBellCluster(): void {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const freqs = [880, 1318.5, 1760];
  freqs.forEach((f, idx) => {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = idx === 0 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(f, now);

    const peak = idx === 0 ? 0.28 : 0.14;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.74);
  });
}

function startTempleWarningBell(): boolean {
  try {
    unlockAudioContext();
    if (!audioCtx) return false;
    isPlaying = true;
    strikeBellCluster();
    loopTimer = window.setInterval(() => {
      if (!isPlaying) return;
      strikeBellCluster();
    }, 820);
    return true;
  } catch {
    return false;
  }
}

function playTwoNoteChime(): void {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  [784, 1046.5].forEach((freq, i) => {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + i * 0.16);
    gain.gain.setValueAtTime(0.001, now + i * 0.16);
    gain.gain.exponentialRampToValueAtTime(0.22, now + i * 0.16 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.16 + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + i * 0.16);
    osc.stop(now + i * 0.16 + 0.36);
  });
}

function speakFloodWarning(language: Language, landmarkName: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const text =
      language === "hi"
        ? `भोपाल कवच बाढ़ चेतावनी। आगे ${landmarkName} पर जलभराव है। कृपया वैकल्पिक मार्ग लें।`
        : `Bhopal Kavach flood alert. Waterlogging ahead near ${landmarkName}. Please take a safe detour.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 1.02;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  } catch {
    // ignore speech errors
  }
}

function startVoiceAlertTone(language: Language, landmarkName: string): boolean {
  try {
    unlockAudioContext();
    isPlaying = true;
    playTwoNoteChime();
    speakFloodWarning(language, landmarkName);

    loopTimer = window.setInterval(() => {
      if (!isPlaying) return;
      playTwoNoteChime();
      speakFloodWarning(language, landmarkName);
    }, 4600);
    return true;
  } catch {
    return false;
  }
}

export function startEmergencySiren(): boolean {
  return startCommuterAlertAudio({ toneId: "siren" });
}

export function stopEmergencySiren(): void {
  stopCommuterAlertAudio();
}
