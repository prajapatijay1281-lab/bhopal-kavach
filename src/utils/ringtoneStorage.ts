import { CommuterToneId } from "../types/civic";

const PREF_STORAGE_KEY = "bhopal_kavach_ringtone_pref_v1";
const IDB_NAME = "bhopal_kavach_audio_db";
const IDB_STORE = "ringtones";
const IDB_KEY_CUSTOM = "custom_commuter_ringtone";

export interface RingtonePreference {
  toneId: CommuterToneId;
  customFileName?: string;
}

export function loadRingtonePreference(): RingtonePreference {
  try {
    const raw = localStorage.getItem(PREF_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        (parsed.toneId === "siren" ||
          parsed.toneId === "bell" ||
          parsed.toneId === "voice" ||
          parsed.toneId === "custom")
      ) {
        return {
          toneId: parsed.toneId,
          customFileName:
            typeof parsed.customFileName === "string"
              ? parsed.customFileName
              : undefined,
        };
      }
    }
  } catch {
    // ignore storage read error
  }
  return { toneId: "siren" };
}

export function saveRingtonePreference(pref: RingtonePreference): void {
  try {
    localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(pref));
  } catch {
    // ignore
  }
}

function openAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("Failed to open IndexedDB"));
  });
}

export async function saveCustomRingtoneBlob(blob: Blob): Promise<void> {
  try {
    const db = await openAudioDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      const store = tx.objectStore(IDB_STORE);
      store.put(blob, IDB_KEY_CUSTOM);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // ignore in restricted environments
  }
}

export async function loadCustomRingtoneBlob(): Promise<Blob | null> {
  try {
    const db = await openAudioDB();
    const result = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_KEY_CUSTOM);
      req.onsuccess = () => {
        const val = req.result;
        resolve(val instanceof Blob ? val : null);
      };
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  } catch {
    return null;
  }
}

export async function clearCustomRingtoneBlob(): Promise<void> {
  try {
    const db = await openAudioDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(IDB_KEY_CUSTOM);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // ignore
  }
}
