import { useEffect, useRef } from "react";
import { createAnimatable, prefersReducedMotion } from "../lib/anim";

/** A faint radial glow that eases toward the cursor (anime.js animatable). */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const a = createAnimatable(el, { x: 700, y: 700, ease: "out(3)" });
    const onMove = (e: MouseEvent) => {
      a.x(e.clientX - 260);
      a.y(e.clientY - 260);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      a.revert();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 hidden h-[520px] w-[520px] md:block"
      style={{
        background:
          "radial-gradient(closest-side, rgba(82,168,255,0.09), rgba(82,168,255,0) 70%)",
      }}
    />
  );
}
