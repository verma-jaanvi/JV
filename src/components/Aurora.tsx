import { useEffect, useRef } from "react";
import { animate, prefersReducedMotion } from "../lib/anim";

/**
 * Slow, smooth drifting light — soft violet/blue glows plus tiny floating sparks (anime.js).
 * Purely decorative: absolutely positioned, pointer-events none. Put it inside a `relative overflow-hidden` parent.
 */
type Orb = {
  size: number;
  x: number;
  y: number;
  c: string;
  dx: number;
  dy: number;
  s: number;
  dur: number;
};

const ORBS: Orb[] = [
  {
    size: 760,
    x: 8,
    y: 58,
    c: "139,92,246",
    dx: 140,
    dy: -90,
    s: 1.18,
    dur: 16000,
  },
  {
    size: 620,
    x: 62,
    y: 8,
    c: "82,168,255",
    dx: -160,
    dy: 110,
    s: 1.22,
    dur: 19000,
  },
  {
    size: 560,
    x: 70,
    y: 62,
    c: "217,70,239",
    dx: -120,
    dy: -120,
    s: 1.15,
    dur: 22000,
  },
  {
    size: 460,
    x: 30,
    y: 18,
    c: "99,102,241",
    dx: 100,
    dy: 130,
    s: 1.25,
    dur: 17000,
  },
];

const SPARKS = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 17) % 100,
  size: 2 + (i % 3),
  rise: 40 + ((i * 29) % 90),
  dur: 7000 + ((i * 1300) % 8000),
}));

export function Aurora({
  className = "",
  intensity = 1,
}: {
  className?: string;
  intensity?: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const anims: ReturnType<typeof animate>[] = [];

    el.querySelectorAll<HTMLElement>("[data-orb]").forEach((o, i) => {
      const d = ORBS[i];
      anims.push(
        animate(o, {
          translateX: [0, d.dx],
          translateY: [0, d.dy],
          scale: [1, d.s],
          duration: d.dur,
          ease: "inOutSine",
          loop: true,
          alternate: true,
        }),
      );
    });

    el.querySelectorAll<HTMLElement>("[data-spark]").forEach((sp, i) => {
      const d = SPARKS[i];
      anims.push(
        animate(sp, {
          translateY: [0, -d.rise],
          translateX: [0, i % 2 ? 18 : -18],
          opacity: [0.05, 0.9],
          duration: d.dur,
          delay: (i * 400) % 3000,
          ease: "inOutSine",
          loop: true,
          alternate: true,
        }),
      );
    });

    return () => anims.forEach((a) => a.revert());
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity: intensity }}
    >
      {ORBS.map((o, i) => (
        <div
          key={i}
          data-orb
          className="absolute rounded-full will-change-transform"
          style={{
            width: o.size,
            height: o.size,
            left: `${o.x}%`,
            top: `${o.y}%`,
            marginLeft: -o.size / 2,
            marginTop: -o.size / 2,
            background: `radial-gradient(circle, rgba(${o.c},0.34) 0%, rgba(${o.c},0.12) 38%, transparent 68%)`,
            mixBlendMode: "screen",
          }}
        />
      ))}
      {SPARKS.map((s, i) => (
        <span
          key={i}
          data-spark
          className="absolute rounded-full bg-white will-change-transform"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: 0.05,
            boxShadow: "0 0 10px 2px rgba(167,139,250,0.9)",
          }}
        />
      ))}
    </div>
  );
}
