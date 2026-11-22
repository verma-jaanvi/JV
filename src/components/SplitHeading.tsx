import { useEffect, useRef, type ElementType } from "react";
import { animate, stagger, prefersReducedMotion } from "../lib/anim";

interface Props {
  /** Words wrapped in *asterisks* render in muted grey. Use "|" for a forced line break. */
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** "mount" animates immediately, "view" waits until scrolled into view */
  trigger?: "mount" | "view";
}

type Token = { kind: "word"; text: string; muted: boolean } | { kind: "br" };

function tokenize(text: string): Token[] {
  const out: Token[] = [];
  let muted = false;
  for (const raw of text.split(/\s+/)) {
    if (!raw) continue;
    if (raw === "|") {
      out.push({ kind: "br" });
      continue;
    }
    let w = raw;
    const starts = w.startsWith("*");
    const ends = w.endsWith("*") && w.length > 1;
    if (starts) {
      muted = true;
      w = w.slice(1);
    }
    if (ends) w = w.slice(0, -1);
    out.push({ kind: "word", text: w, muted });
    if (ends) muted = false;
  }
  return out;
}

/** Headline whose words slide up out of a mask, staggered with anime.js. */
export function SplitHeading({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
  trigger = "view",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const plain = text.replace(/\*/g, "").replace(/\s*\|\s*/g, " ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLElement>("[data-w]");
    if (prefersReducedMotion()) {
      words.forEach((w) => {
        w.style.transform = "none";
        w.style.opacity = "1";
      });
      return;
    }
    let anim: ReturnType<typeof animate> | null = null;
    const run = () => {
      anim = animate(words, {
        translateY: ["112%", "0%"],
        opacity: [0, 1],
        duration: 1100,
        delay: stagger(55, { start: delay }),
        ease: "outExpo",
      });
    };
    if (trigger === "mount") {
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
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      anim?.cancel();
    };
  }, [text, delay, trigger]);

  const Component = Tag as ElementType;
  return (
    <Component ref={ref} className={className} aria-label={plain}>
      {tokenize(text).map((t, i) =>
        t.kind === "br" ? (
          <br key={i} aria-hidden="true" />
        ) : (
          <span
            key={i}
            aria-hidden="true"
            className="inline-block overflow-hidden align-bottom"
            style={{ paddingBottom: "0.14em", marginBottom: "-0.14em", marginRight: "0.24em" }}
          >
            <span
              data-w
              className={`inline-block ${t.muted ? "text-muted" : ""}`}
              style={{ opacity: 0, transform: "translateY(112%)" }}
            >
              {t.text}
            </span>
          </span>
        ),
      )}
    </Component>
  );
}
