import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImagePlus, X } from "lucide-react";
import { animate, prefersReducedMotion } from "../lib/anim";
import { addLocalSketch, processImage } from "../lib/sketchStore";

interface Draft {
  id: string;
  file: File;
  preview: string;
  title: string;
}

const cleanName = (n: string) =>
  n.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Untitled sketch";

export function SketchUploader({
  existingTags,
  onClose,
  onSaved,
}: {
  existingTags: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [tags, setTags] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const urls = useRef<string[]>([]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!prefersReducedMotion() && panel.current) {
      animate(panel.current, { opacity: [0, 1], translateY: [24, 0], duration: 600, ease: "outExpo" });
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      urls.current.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = (list: FileList | File[]) => {
    const imgs = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (!imgs.length) {
      setError("Please choose image files (JPG, PNG, WebP…).");
      return;
    }
    setError(null);
    setDrafts((d) => [
      ...d,
      ...imgs.map((file) => {
        const preview = URL.createObjectURL(file);
        urls.current.push(preview);
        return { id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 6)}`, file, preview, title: cleanName(file.name) };
      }),
    ]);
  };

  const save = async () => {
    if (!drafts.length) return;
    setBusy(true);
    setError(null);
    const tagList = Array.from(
      new Set(tags.split(",").map((t) => t.trim()).filter(Boolean)),
    );
    try {
      for (const d of drafts) {
        const { blob, w, h } = await processImage(d.file);
        await addLocalSketch({ title: d.title.trim() || "Untitled sketch", tags: tagList.length ? tagList : ["Sketches"], blob, w, h });
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save those images.");
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(e) => e.target === e.currentTarget && !busy && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Add sketches"
    >
      <div
        ref={panel}
        className="card flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="display-sm">Add sketches</p>
            <p className="font-data mt-1 text-xs">Saved in this browser · resized to 1600px</p>
          </div>
          <button onClick={onClose} disabled={busy} className="btn-outline-square !h-9 !px-3" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              addFiles(e.dataTransfer.files);
            }}
            onClick={() => input.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed px-6 py-10 text-center transition-colors ${
              over ? "border-accent bg-black" : "border-line-strong hover:border-white/50"
            }`}
          >
            <ImagePlus size={22} className="text-muted" />
            <p className="text-sm">
              <span className="text-white">Drop images here</span>{" "}
              <span className="text-muted">or click to browse</span>
            </p>
            <input
              ref={input}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {drafts.length > 0 && (
            <ul className="space-y-2">
              {drafts.map((d) => (
                <li key={d.id} className="flex items-center gap-3 border border-line p-2">
                  <img src={d.preview} alt="" className="h-14 w-14 flex-none object-cover" />
                  <input
                    value={d.title}
                    onChange={(e) =>
                      setDrafts((all) => all.map((x) => (x.id === d.id ? { ...x, title: e.target.value } : x)))
                    }
                    maxLength={80}
                    aria-label="Sketch title"
                    className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted"
                    placeholder="Title"
                  />
                  <button
                    onClick={() => setDrafts((all) => all.filter((x) => x.id !== d.id))}
                    aria-label="Remove"
                    className="px-2 text-muted hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div>
            <label className="label" htmlFor="sk-tags">
              Tags (comma separated)
            </label>
            <input
              id="sk-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Portrait, Studies"
              className="mt-2 w-full border border-line bg-black px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-line-strong"
            />
            {existingTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {existingTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="pill pill-button"
                    onClick={() =>
                      setTags((cur) => {
                        const parts = cur.split(",").map((x) => x.trim()).filter(Boolean);
                        return parts.includes(t) ? cur : [...parts, t].join(", ");
                      })
                    }
                  >
                    + {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="font-data text-xs text-white">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
          <span className="font-data text-xs">
            {drafts.length} file{drafts.length === 1 ? "" : "s"} selected
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} disabled={busy} className="btn-outline-square">
              Cancel
            </button>
            <button onClick={save} disabled={busy || !drafts.length} className="btn-square">
              {busy ? "Saving…" : "Add to sketchbook"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
