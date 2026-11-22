import { useEffect, useRef } from "react";
import { animate, createTimeline, prefersReducedMotion } from "../lib/anim";

/** Minimal boot sequence: counter 000→100, then the curtain lifts. */
export default function Loader({ onComplete }: { onComplete?: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      onComplete?.();
      return;
    }
    const state = { v: 0 };
    const steps = ["init workspace", "load interface", "mount components", "ready"];
    const counter = animate(state, {
      v: 100,
      duration: 1500,
      ease: "inOutQuad",
      onUpdate: () => {
        const n = Math.round(state.v);
        if (num.current) num.current.textContent = String(n).padStart(3, "0");
        if (bar.current) bar.current.style.transform = `scaleX(${state.v / 100})`;
        if (label.current) label.current.textContent = steps[Math.min(3, Math.floor(state.v / 26))];
      },
    });

    const tl = createTimeline({ delay: 1600, onComplete: () => onComplete?.() });
    if (root.current) {
      tl.add(root.current.querySelectorAll("[data-fade]"), {
        opacity: [1, 0],
        translateY: [0, -12],
        duration: 350,
        ease: "inQuad",
      }).add(
        root.current,
        { translateY: ["0%", "-100%"], duration: 800, ease: "inOutExpo" },
        "-=100",
      );
    }
    return () => {
      counter.cancel();
      tl.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-black p-6 sm:p-10"
      role="status"
      aria-label="Loading"
    >
      <div data-fade className="flex items-center justify-between font-data text-xs">
        <span>JV / PORTFOLIO</span>
        <span>v3.0</span>
      </div>
      <div data-fade>
        <div className="font-display text-[clamp(5rem,22vw,16rem)] leading-none tracking-[-0.05em] text-white">
          <span ref={num}>000</span>
        </div>
        <div className="mt-6 h-px w-full bg-line">
          <div ref={bar} className="h-px origin-left bg-white" style={{ transform: "scaleX(0)" }} />
        </div>
        <div className="mt-3 flex justify-between font-data text-xs">
          <span ref={label}>init workspace</span>
          <span>creative technologist</span>
        </div>
      </div>
    </div>
  );
}
