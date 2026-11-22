import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Download, ExternalLink, X } from "lucide-react";
import type { Resume } from "../data/site";
import { animate, prefersReducedMotion } from "../lib/anim";

/** Full-screen PDF viewer. Rendered in a portal so it's always viewport-fixed. */
export function ResumeViewer({ resume, onClose }: { resume: Resume; onClose: () => void }) {
  const overlay = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    if (!prefersReducedMotion()) {
      if (overlay.current) animate(overlay.current, { opacity: [0, 1], duration: 240, ease: "outQuad" });
      if (panel.current)
        animate(panel.current, { opacity: [0, 1], translateY: [24, 0], duration: 600, ease: "outExpo" });
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div
      ref={overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`Resume — ${resume.label}`}
      className="fixed inset-0 z-[200] flex items-stretch justify-center bg-black/90 p-0 backdrop-blur-sm sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div ref={panel} className="card flex w-full max-w-5xl flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="label">Resume · {resume.short}</p>
            <p className="display-sm truncate">{resume.label}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={resume.file}
              target="_blank"
              rel="noreferrer"
              className="btn-outline-square !h-9 !px-3 !text-[13px]"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Open in new tab</span>
            </a>
            <a
              href={resume.file}
              download={`Jahnvi_Verma_Resume_${resume.short}.pdf`}
              className="btn-outline-square !h-9 !px-3 !text-[13px]"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button ref={closeBtn} onClick={onClose} className="btn-square btn-square-sm" aria-label="Close resume viewer">
              <X size={16} /> Close
            </button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 bg-[#0a0a0a]">
          <iframe
            key={resume.id}
            src={`${resume.file}#view=FitH`}
            title={`Resume — ${resume.label}`}
            className="absolute inset-0 h-full w-full border-0 bg-white"
          />
        </div>

        <p className="font-data border-t border-line px-4 py-2.5 text-[11px] sm:px-5">
          PDF not showing on your device?{" "}
          <a href={resume.file} target="_blank" rel="noreferrer" className="text-white underline underline-offset-4">
            Open it in a new tab
          </a>
          .
        </p>
      </div>
    </div>,
    document.body,
  );
}
