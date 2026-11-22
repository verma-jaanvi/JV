import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { animate, onScroll, prefersReducedMotion } from "../lib/anim";

/**
 * Scroll-scrubbed motion: the element's transform/opacity is tied to its position in the
 * viewport (anime.js onScroll with smoothing) so movement feels fluid, not triggered.
 */
export function Scrub({
  children,
  className = "",
  as: Tag = "div",
  y,
  x,
  scale,
  opacity,
  rotate,
  smooth = 0.35,
  enter = "bottom top",
  leave = "top bottom",
  target: targetSelf = true,
}: {
  children?: ReactNode;
  className?: string;
  as?: ElementType;
  y?: [number, number];
  x?: [number, number];
  scale?: [number, number];
  opacity?: [number, number];
  rotate?: [number, number];
  smooth?: number;
  enter?: string;
  leave?: string;
  target?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const props: Record<string, unknown> = { ease: "linear" };
    if (y) props.translateY = y;
    if (x) props.translateX = x;
    if (scale) props.scale = scale;
    if (opacity) props.opacity = opacity;
    if (rotate) props.rotate = rotate;
    const a = animate(el, {
      ...props,
      autoplay: onScroll({ target: targetSelf ? el : undefined, enter, leave, sync: smooth }),
    } as never);
    return () => {
      a.revert();
    };
  }, [y, x, scale, opacity, rotate, smooth, enter, leave, targetSelf]);

  const C = Tag as ElementType;
  return (
    <C ref={ref} className={className}>
      {children}
    </C>
  );
}
