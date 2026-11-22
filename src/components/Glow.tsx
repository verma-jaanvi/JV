import { useEffect, useRef } from "react";
import { animate, prefersReducedMotion } from "../lib/anim";

/**
 * Subtle radial accent glows that drift slowly (anime.js loop).
 * Position it absolutely inside a relatively-positioned parent.
 */
export function Glow({
  className = "",
  size = 720,
  tone = "accent",
}: {
  className?: string;
  size?: number;
  tone?: "accent" | "white";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const a = animate(el, {
      translateX: [-40, 40],
      translateY: [-24, 24],
      scale: [0.94, 1.08],
      duration: 9000,
      ease: "inOutSine",
      alternate: true,
      loop: true,
    });
    return () => {
      a.cancel();
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        ref={ref}
        className={`h-full w-full ${tone === "accent" ? "glow-accent" : "glow-white"}`}
      />
    </div>
  );
}
