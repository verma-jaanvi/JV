import { useEffect, useRef } from "react";
import { animate, prefersReducedMotion } from "../lib/anim";

export function CountUp({
  to,
  pad = 0,
  suffix = "",
  duration = 1600,
  className = "",
}: {
  to: number;
  pad?: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => String(Math.round(n)).padStart(pad, "0") + suffix;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.textContent = fmt(to);
      return;
    }
    let anim: ReturnType<typeof animate> | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        const state = { v: 0 };
        anim = animate(state, {
          v: to,
          duration,
          ease: "outExpo",
          onUpdate: () => {
            el.textContent = fmt(state.v);
          },
        });
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      anim?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, pad, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      {fmt(0)}
    </span>
  );
}
