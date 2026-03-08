// IndexedDB wrapper for storing large video files
// localStorage has ~5MB quota — a base64 video easily exceeds this.
// IndexedDB supports hundreds of MB and persists across page reloads.

const DB_NAME = "ahirani_video_db";
const STORE_NAME = "videos";
const DB_VERSION = 2;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
  });
}

/**
 * Save a video File or Blob to IndexedDB.
 * Returns a stable object URL that can be used in <video> tags.
 */
export async function saveVideoToDB(
  id: string,
  urlOrBlob: string | Blob,
): Promise<void> {
  try {
    const db = await openDB();
    let blob: Blob;

    if (typeof urlOrBlob === "string") {
      if (urlOrBlob.startsWith("data:")) {
        // Convert base64 data URL to Blob for efficient storage
        const res = await fetch(urlOrBlob);
        blob = await res.blob();
      } else {
        // Plain URL — store as string reference
        return new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          store.put({ id, url: urlOrBlob, blob: null });
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      }
    } else {
      blob = urlOrBlob;
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put({ id, blob, url: null });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Fallback: try sessionStorage with data URL
    if (typeof urlOrBlob === "string") {
      try {
        sessionStorage.setItem(`ahirani_vid_${id}`, urlOrBlob);
      } catch {
        /* ignore quota */
      }
    }
  }
}

/**
 * Save a video File directly to IndexedDB (most efficient — no base64 conversion).
 */
export async function saveVideoFileToDB(id: string, file: File): Promise<void> {
  return saveVideoToDB(id, file);
}

/**
 * Retrieve video from IndexedDB and return a Blob URL for playback.
 * Returns null if not found.
 */
export async function getVideoFromDB(id: string): Promise<string | null> {
  try {
    const db = await openDB();
    const result = await new Promise<
      { id: string; blob?: Blob; url?: string } | undefined
    >((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () =>
        resolve(
          req.result as { id: string; blob?: Blob; url?: string } | undefined,
        );
      req.onerror = () => resolve(undefined);
    });

    if (!result) {
      // Try sessionStorage fallback
      return sessionStorage.getItem(`ahirani_vid_${id}`);
    }

    if (result.blob) {
      // Return a fresh Blob URL each time (Blob URLs don't persist across sessions)
      return URL.createObjectURL(result.blob);
    }

    if (result.url) {
      return result.url;
    }

    return null;
  } catch {
    // Fallback: try sessionStorage
    return sessionStorage.getItem(`ahirani_vid_${id}`);
  }
}

export async function deleteVideoFromDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    /* ignore */
  }
}
