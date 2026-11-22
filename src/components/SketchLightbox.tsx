import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Heart, X } from "lucide-react";
import type { Sketch } from "../data/sketches";
import { animate, prefersReducedMotion } from "../lib/anim";

export function SketchLightbox({
  items,
  index,
  liked,
  canDelete,
  onClose,
  onNavigate,
  onToggleLike,
  onDelete,
}: {
  items: Sketch[];
  index: number;
  liked: boolean;
  canDelete: boolean;
  onClose: () => void;
  onNavigate: (next: number) => void;
  onToggleLike: () => void;
  onDelete: () => void;
}) {
  const overlay = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLImageElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [confirming, setConfirming] = useState(false);
  const item = items[index];
  const dir = useRef(1);

  const go = (d: number) => {
    dir.current = d;
    onNavigate((index + d + items.length) % items.length);
  };

  // open animation + scroll lock + focus
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    if (!prefersReducedMotion() && overlay.current) {
      animate(overlay.current, { opacity: [0, 1], duration: 260, ease: "outQuad" });
    }
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // image swap animation
  useEffect(() => {
    setConfirming(false);
    if (prefersReducedMotion() || !figure.current) return;
    const a = animate(figure.current, {
      opacity: [0, 1],
      translateX: [dir.current * 36, 0],
      scale: [0.985, 1],
      duration: 650,
      ease: "outExpo",
    });
    return () => {
      a.cancel();
    };
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && items.length > 1) go(1);
      else if (e.key === "ArrowLeft" && items.length > 1) go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, items.length]);

  if (!item) return null;

  return createPortal(
    <div
      ref={overlay}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-black/95 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex items-center justify-between px-4 py-4 sm:px-8">
        <span className="font-data text-xs">
          {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </span>
        <button
          ref={closeBtn}
          onClick={onClose}
          className="btn-square btn-square-sm"
          aria-label="Close viewer"
        >
          <X size={16} /> Close
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {items.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous sketch"
              className="btn-outline-square absolute left-3 top-1/2 !h-10 !w-10 -translate-y-1/2 !px-0 sm:left-6"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next sketch"
              className="btn-outline-square absolute right-3 top-1/2 !h-10 !w-10 -translate-y-1/2 !px-0 sm:right-6"
            >
              <ArrowRight size={16} />
            </button>
          </>
        )}
        <img
          ref={figure}
          src={item.src}
          alt={item.title}
          className="max-h-full max-w-full border border-line object-contain"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-4 py-5 sm:px-8">
        <div className="min-w-0">
          <h3 className="display-sm truncate">{item.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {item.tags.map((t) => (
              <span key={t} className="pill">
                {t}
              </span>
            ))}
            {item.date && <span className="font-data text-xs">{item.date}</span>}
            {item.local && <span className="pill">Local only</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLike}
            aria-pressed={liked}
            className="btn-outline-square"
          >
            <Heart size={16} className={liked ? "fill-accent text-accent" : ""} />
            {liked ? "Liked" : "Like"}
          </button>
          {canDelete && item.local && (
            <button
              onClick={() => (confirming ? onDelete() : setConfirming(true))}
              className="btn-outline-square"
            >
              {confirming ? "Click again to delete" : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
