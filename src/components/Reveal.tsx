import React, { useEffect, useRef, type ReactNode, type ElementType } from "react";
import { animate, prefersReducedMotion } from "../lib/anim";

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
  y?: number;
  /** animate once the element is this far into view (0–1) */
  threshold?: number;
}

/** Fade + rise on scroll-into-view, driven by anime.js. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  y = 24,
  threshold = 0.12,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.opacity = "1";
      return;
    }
    let anim: ReturnType<typeof animate> | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          anim = animate(el, {
            opacity: [0, 1],
            translateY: [y, 0],
            duration: 900,
            delay,
            ease: "outExpo",
          });
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      anim?.cancel();
    };
  }, [delay, y, threshold]);

  const Component = Tag as React.ComponentType<
    React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }
  >;
  return (
    <Component ref={ref} className={`hidden-until-anim ${className}`}>
      {children}
    </Component>
  );
}
