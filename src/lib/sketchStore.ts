import type { Sketch } from "../data/sketches";

const DB_NAME = "jv-sketchbook";
const STORE = "sketches";

interface StoredSketch {
  id: string;
  title: string;
  tags: string[];
  createdAt: number;
  w: number;
  h: number;
  blob: Blob;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("IndexedDB unavailable"));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const r = run(t.objectStore(STORE));
        t.oncomplete = () => {
          db.close();
          resolve(r.result);
        };
        t.onerror = () => {
          db.close();
          reject(t.error);
        };
      }),
  );
}

export async function listLocalSketches(): Promise<Sketch[]> {
  try {
    const all = (await tx<StoredSketch[]>("readonly", (s) => s.getAll())) ?? [];
    return all
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((r) => ({
        id: r.id,
        title: r.title,
        tags: r.tags,
        w: r.w,
        h: r.h,
        src: URL.createObjectURL(r.blob),
        date: new Date(r.createdAt).toISOString().slice(0, 10),
        local: true,
      }));
  } catch {
    return [];
  }
}

export async function addLocalSketch(input: {
  title: string;
  tags: string[];
  blob: Blob;
  w: number;
  h: number;
}): Promise<void> {
  const rec: StoredSketch = {
    id: `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    tags: input.tags,
    createdAt: Date.now(),
    w: input.w,
    h: input.h,
    blob: input.blob,
  };
  await tx("readwrite", (s) => s.put(rec));
}

export async function removeLocalSketch(id: string): Promise<void> {
  await tx("readwrite", (s) => s.delete(id));
}

/** Downscale to maxSide and re-encode (keeps IndexedDB small and the page fast). */
export async function processImage(
  file: File,
  maxSide = 1600,
): Promise<{ blob: Blob; w: number; h: number }> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode image"))),
      "image/webp",
      0.88,
    ),
  );
  return { blob, w, h };
}

const LIKES_KEY = "jv_sketch_likes";
export function readLikes(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LIKES_KEY) || "[]");
  } catch {
    return [];
  }
}
export function writeLikes(ids: string[]) {
  try {
    localStorage.setItem(LIKES_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable */
  }
}
