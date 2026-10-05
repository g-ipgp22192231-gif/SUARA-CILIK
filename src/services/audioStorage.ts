import { PupilVoiceRecording, StoredAudioClip } from '../types/game';

const DB_NAME = 'suaracilik_local_db_v1';
const DB_VERSION = 1;
const STORE_TEACHER_AUDIO = 'teacher_audio_clips';
const STORE_PUPIL_VOICE = 'pupil_voice_recordings';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('Pelayar ini tidak menyokong storan tempatan IndexedDB.'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_TEACHER_AUDIO)) {
        db.createObjectStore(STORE_TEACHER_AUDIO, { keyPath: 'clipId' });
      }
      if (!db.objectStoreNames.contains(STORE_PUPIL_VOICE)) {
        db.createObjectStore(STORE_PUPIL_VOICE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Gagal membuka pangkalan data audio tempatan.'));
  });
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Gagal menukar fail audio kepada format simpanan.'));
      }
    };
    reader.onerror = () => reject(new Error('Ralat semasa membaca fail audio.'));
    reader.readAsDataURL(blob);
  });
}

export function validateAudioDataUrl(dataUrl: string): Promise<{ valid: boolean; durationSec: number; error?: string }> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:audio')) {
      resolve({ valid: false, durationSec: 0, error: 'Format fail bukan fail audio yang sah.' });
      return;
    }
    const audio = new Audio();
    let settled = false;

    const finish = (result: { valid: boolean; durationSec: number; error?: string }) => {
      if (settled) return;
      settled = true;
      audio.src = '';
      resolve(result);
    };

    const timeout = window.setTimeout(() => {
      finish({ valid: false, durationSec: 0, error: 'Masa pengesahan fail audio tamat. Sila cuba fail lain.' });
    }, 6000);

    audio.onloadedmetadata = () => {
      window.clearTimeout(timeout);
      const dur = Number.isFinite(audio.duration) && audio.duration > 0 ? Number(audio.duration.toFixed(1)) : 1.5;
      finish({ valid: true, durationSec: dur });
    };

    audio.oncanplaythrough = () => {
      window.clearTimeout(timeout);
      const dur = Number.isFinite(audio.duration) && audio.duration > 0 ? Number(audio.duration.toFixed(1)) : 1.5;
      finish({ valid: true, durationSec: dur });
    };

    audio.onerror = () => {
      window.clearTimeout(timeout);
      finish({
        valid: false,
        durationSec: 0,
        error: 'Fail audio ini tidak dapat dimainkan oleh pelayar. Sila gunakan format WAV, MP3, OGG, M4A, atau WebM.'
      });
    };

    audio.src = dataUrl;
    audio.load();
  });
}

export async function getAllTeacherAudioClips(): Promise<Record<string, StoredAudioClip>> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_TEACHER_AUDIO, 'readonly');
      const store = tx.objectStore(STORE_TEACHER_AUDIO);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result || []) as StoredAudioClip[];
        const map: Record<string, StoredAudioClip> = {};
        for (const item of list) {
          map[item.clipId] = item;
        }
        resolve(map);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return {};
  }
}

export async function saveTeacherAudioClip(clip: StoredAudioClip): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TEACHER_AUDIO, 'readwrite');
    const store = tx.objectStore(STORE_TEACHER_AUDIO);
    const req = store.put(clip);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteTeacherAudioClip(clipId: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_TEACHER_AUDIO, 'readwrite');
    const store = tx.objectStore(STORE_TEACHER_AUDIO);
    const req = store.delete(clipId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export interface TeacherAudioPackFile {
  app: 'SUARACILIK';
  version: 1;
  exportedAt: string;
  clips: Record<string, StoredAudioClip>;
}

export async function exportTeacherAudioPack(): Promise<string> {
  const clips = await getAllTeacherAudioClips();
  const payload: TeacherAudioPackFile = {
    app: 'SUARACILIK',
    version: 1,
    exportedAt: new Date().toISOString(),
    clips
  };
  return JSON.stringify(payload, null, 2);
}

export async function importTeacherAudioPack(jsonContent: string): Promise<{ importedCount: number; error?: string }> {
  try {
    const parsed = JSON.parse(jsonContent) as Partial<TeacherAudioPackFile>;
    if (!parsed || parsed.app !== 'SUARACILIK' || !parsed.clips || typeof parsed.clips !== 'object') {
      return { importedCount: 0, error: 'Fail pek audio tidak sah untuk aplikasi SUARACILIK.' };
    }
    let count = 0;
    for (const [clipId, clipData] of Object.entries(parsed.clips)) {
      if (clipData && typeof clipData.base64Data === 'string') {
        const check = await validateAudioDataUrl(clipData.base64Data);
        if (check.valid) {
          await saveTeacherAudioClip({
            clipId,
            base64Data: clipData.base64Data,
            mimeType: clipData.mimeType || 'audio/webm',
            durationSec: clipData.durationSec || check.durationSec,
            updatedAt: clipData.updatedAt || new Date().toISOString(),
            fileName: clipData.fileName
          });
          count++;
        }
      }
    }
    return { importedCount: count };
  } catch {
    return { importedCount: 0, error: 'Fail JSON pek audio gagal dibaca. Sila pastikan fail tidak rosak.' };
  }
}

export async function getAllPupilRecordings(): Promise<PupilVoiceRecording[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PUPIL_VOICE, 'readonly');
      const store = tx.objectStore(STORE_PUPIL_VOICE);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result || []) as PupilVoiceRecording[];
        list.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function savePupilRecording(rec: PupilVoiceRecording): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PUPIL_VOICE, 'readwrite');
    const store = tx.objectStore(STORE_PUPIL_VOICE);
    const req = store.put(rec);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllPupilRecordings(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PUPIL_VOICE, 'readwrite');
    const store = tx.objectStore(STORE_PUPIL_VOICE);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
