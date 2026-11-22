import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { animate, stagger, prefersReducedMotion } from "../lib/anim";

/**
 * Animates its direct children in sequence (fade + rise).
 * `immediate` runs on mount (use for above-the-fold content), otherwise on scroll-into-view.
 * Pass `watch` to replay when data changes (e.g. a filter).
 */
export function Stagger({
  children,
  className = "",
  as: Tag = "div",
  immediate = false,
  delay = 0,
  gap = 60,
  y = 18,
  watch,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  immediate?: boolean;
  delay?: number;
  gap?: number;
  y?: number;
  watch?: unknown;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const kids = Array.from(el.children) as HTMLElement[];
    if (!kids.length) return;
    if (prefersReducedMotion()) {
      kids.forEach((k) => (k.style.opacity = "1"));
      return;
    }
    kids.forEach((k) => (k.style.opacity = "0"));
    let anim: ReturnType<typeof animate> | null = null;
    const run = () => {
      anim = animate(kids, {
        opacity: [0, 1],
        translateY: [y, 0],
        duration: 800,
        delay: stagger(gap, { start: delay }),
        ease: "outExpo",
      });
    };
    if (immediate) {
      run();
      return () => anim?.cancel();
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      anim?.cancel();
    };
  }, [immediate, delay, gap, y, watch]);

  const Component = Tag as ElementType;
  return (
    <Component ref={ref} className={`stagger-init ${className}`}>
      {children}
    </Component>
  );
}
