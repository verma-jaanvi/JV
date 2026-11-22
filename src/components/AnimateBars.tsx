import { useEffect, useRef, type ReactNode } from "react";
import { animate, stagger, prefersReducedMotion } from "../lib/anim";

/** Grows every `[data-bar]` descendant from the left when scrolled into view. */
export function AnimateBars({
  children,
  className = "",
  watch,
}: {
  children: ReactNode;
  className?: string;
  watch?: unknown;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const bars = Array.from(el.querySelectorAll<HTMLElement>("[data-bar]"));
    bars.forEach((b) => (b.style.transformOrigin = "left center"));
    if (prefersReducedMotion()) return;
    bars.forEach((b) => (b.style.transform = "scaleX(0)"));
    let a: ReturnType<typeof animate> | null = null;
    const io = new IntersectionObserver(
      (e) => {
        if (!e.some((x) => x.isIntersecting)) return;
        a = animate(bars, { scaleX: [0, 1], duration: 1100, delay: stagger(90), ease: "outExpo" });
        io.disconnect();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      a?.cancel();
    };
  }, [watch]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
