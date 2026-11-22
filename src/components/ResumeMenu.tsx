import { useEffect, useRef, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { RESUMES, type Resume } from "../data/site";
import { animate, stagger, prefersReducedMotion } from "../lib/anim";

/** "Resume" button + dropdown of role-specific resumes (desktop nav). */
export function ResumeMenu({ onPick }: { onPick: (r: Resume) => void }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !list.current || prefersReducedMotion()) return;
    const a = animate(list.current, { opacity: [0, 1], translateY: [-8, 0], duration: 350, ease: "outExpo" });
    const b = animate(list.current.querySelectorAll("[role=menuitem]"), {
      opacity: [0, 1],
      translateX: [-8, 0],
      duration: 450,
      delay: stagger(40, { start: 60 }),
      ease: "outExpo",
    });
    return () => {
      a.cancel();
      b.cancel();
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative hidden md:block">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="btn-outline-square !h-auto !gap-2 !px-3 !py-2 !text-base"
      >
        Resume
        <ChevronDown size={14} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          ref={list}
          role="menu"
          aria-label="Choose a resume"
          className="card absolute right-0 top-full z-[60] mt-2 w-72 bg-black p-1.5"
        >
          <p className="label px-3 pb-2 pt-2">View resume as</p>
          {RESUMES.map((r) => (
            <button
              key={r.id}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onPick(r);
              }}
              className="group flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-[15px] transition-colors hover:bg-card"
            >
              <span className="flex items-center gap-3">
                <FileText size={15} className="text-muted transition-colors group-hover:text-white" />
                {r.label}
              </span>
              <span className="font-data text-[11px]">{r.short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
