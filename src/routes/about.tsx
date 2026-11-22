import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { Reveal } from "../components/Reveal";
import { SplitHeading } from "../components/SplitHeading";
import { Stagger } from "../components/Stagger";
import { Glow } from "../components/Glow";
import { SectionHeader } from "../components/SectionHeader";
import { SpotlightCard } from "../components/SpotlightCard";
import { StatusPill } from "../components/StatusPill";
import { animate, onScroll, prefersReducedMotion } from "../lib/anim";
import { bootDelay } from "../lib/boot";
import { timeline, SITE } from "../data/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Jahnvi Verma (JV)" },
      {
        name: "description",
        content:
          "About Jahnvi Verma — a creative technologist and full-stack developer exploring AI, software and digital craft.",
      },
      { property: "og:title", content: "About — Jahnvi Verma (JV)" },
      {
        property: "og:description",
        content: "A multidisciplinary maker's journey through code, design, and emerging tech.",
      },
    ],
  }),
  component: About,
});

const principles = [
  {
    n: "01",
    t: "Wonder over utility",
    b: "If a tool doesn't make you tilt your head, it could be more.",
  },
  {
    n: "02",
    t: "Craft the unseen",
    b: "Pixels. Latency. The way a button releases. All of it counts.",
  },
  {
    n: "03",
    t: "Stay curious",
    b: "Default aesthetics produce default ideas. Resist the template.",
  },
];

const interests = [
  { title: "Latent space cartography", desc: "Mapping the hidden geometry of generative models." },
  { title: "Slow software", desc: "Tools that breathe, wait, and respond like living things." },
  { title: "Cinematic interfaces", desc: "UI that feels like a scene, not a screen." },
  { title: "Speculative play", desc: "Toys that ask 'what if?' instead of 'how can we ship?'" },
];

function About() {
  const d = bootDelay();
  return (
    <>
      <section className="relative isolate overflow-hidden pb-24 pt-36 md:pt-44">
        <div className="bg-grid-faint absolute inset-0 -z-10" />
        <Glow className="-left-56 -top-48 -z-10" size={760} />
        <div className="container-x">
          <Reveal delay={d}>
            <StatusPill tone="accent">about.me</StatusPill>
          </Reveal>
          <SplitHeading
            as="h1"
            trigger="mount"
            delay={d + 100}
            text="A maker drawn to | *the edges of the medium.*"
            className="display-xl mt-8"
          />

          <div className="mt-16 grid gap-14 lg:grid-cols-[1.4fr_1fr]">
            <Reveal delay={d + 600}>
              <div className="max-w-2xl space-y-6 text-lg leading-relaxed text-muted">
                <p>
                  I'm <span className="text-white">Jahnvi Verma</span> — most people call me{" "}
                  <span className="text-white">JV</span>. A creative technologist and full-stack
                  developer, always a wanderer of strange systems. I build at the seams where
                  artificial intelligence, interactive design and emergent storytelling overlap,
                  treating software as a medium for wonder rather than only a vehicle for
                  productivity.
                </p>
                <p>
                  Half scientist, half artist, fully convinced that the most interesting interfaces
                  haven't been invented yet.
                </p>
              </div>
            </Reveal>

            <Reveal delay={d + 750}>
              <div className="tbl">
                <Field k="Name" v="Jahnvi Verma · JV" />
                <Field k="Role" v="Creative technologist" />
                <Field k="Education" v="B.Tech CSE — VIT Bhopal, 2027" />
                <Field k="Currently" v="Project intern — FOSSEE, IIT Bombay" />
                <Field k="Status" v={<StatusPill tone="ok" pulse>Open to collaboration</StatusPill>} />
                <Field k="Languages" v="TS · Python · C++ · GLSL" />
                <Field
                  k="Links"
                  v={
                    <span className="flex gap-4">
                      <a href={SITE.github} target="_blank" rel="noreferrer" className="text-white underline-offset-4 hover:underline">
                        GitHub ↗
                      </a>
                      <a href={SITE.linkedin} target="_blank" rel="noreferrer" className="text-white underline-offset-4 hover:underline">
                        LinkedIn ↗
                      </a>
                    </span>
                  }
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-y border-line">
        <div className="container-x py-28 md:py-36">
          <SectionHeader index="01" label="Principles" title="Software should feel *inhabited.*" />
          <Stagger className="mt-14 grid gap-4 md:grid-cols-3" gap={110}>
            {principles.map((p) => (
              <SpotlightCard key={p.n} className="h-full p-8">
                <span className="font-data text-xs">{p.n}</span>
                <h3 className="display-sm mt-10">{p.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{p.b}</p>
              </SpotlightCard>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Timeline */}
      <section className="container-x py-28 md:py-36">
        <SectionHeader index="02" label="Trajectory" title="A non-linear *path.*" />
        <Timeline />
      </section>

      {/* Interests */}
      <section className="border-t border-line">
        <div className="container-x py-28 md:py-36">
          <SectionHeader index="03" label="Interests" title="Things I can't stop *thinking about.*" />
          <Stagger className="mt-14 grid gap-4 md:grid-cols-2" gap={90}>
            {interests.map((o) => (
              <SpotlightCard key={o.title} className="p-8 sm:p-10">
                <h3 className="display-md">{o.title}</h3>
                <p className="mt-3 text-muted">{o.desc}</p>
              </SpotlightCard>
            ))}
          </Stagger>

          <Reveal>
            <div className="mt-20 flex flex-wrap gap-3">
              <Link to="/projects" className="btn-square">
                View projects <span aria-hidden>→</span>
              </Link>
              <Link to="/contact" className="btn-outline-square">
                Get in touch
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Field({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="tbl-row grid grid-cols-[92px_1fr] items-center gap-4 px-5 py-3.5 text-sm">
      <span className="font-data text-xs uppercase tracking-wide">{k}</span>
      <span className="text-white">{v}</span>
    </div>
  );
}

/** Vertical timeline — the rail draws with scroll (anime.js onScroll), entries step in. */
function Timeline() {
  const wrap = useRef<HTMLOListElement>(null);
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = wrap.current;
    const r = rail.current;
    if (!w || !r) return;
    if (prefersReducedMotion()) {
      r.style.transform = "scaleY(1)";
      w.querySelectorAll<HTMLElement>("[data-node]").forEach((n) => (n.style.opacity = "1"));
      return;
    }
    const railAnim = animate(r, {
      scaleY: [0, 1],
      ease: "linear",
      autoplay: onScroll({ target: w, enter: "bottom-=80 top", leave: "bottom bottom", sync: 0.2 }),
    });

    const nodes = Array.from(w.querySelectorAll<HTMLElement>("[data-node]"));
    nodes.forEach((n) => (n.style.opacity = "0"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          animate(e.target, {
            opacity: [0, 1],
            translateX: [-18, 0],
            duration: 800,
            ease: "outExpo",
          });
          const dot = e.target.querySelector<HTMLElement>("[data-dot]");
          if (dot)
            animate(dot, { scale: [0, 1], duration: 600, ease: "outBack" });
          io.unobserve(e.target);
        }
      },
      { threshold: 0.3 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => {
      io.disconnect();
      railAnim.revert();
    };
  }, []);

  return (
    <ol ref={wrap} className="relative mt-16 max-w-3xl pl-10">
      <div className="absolute bottom-0 left-[5px] top-0 w-px bg-line" />
      <div
        ref={rail}
        className="absolute bottom-0 left-[5px] top-0 w-px origin-top bg-white"
        style={{ transform: "scaleY(0)" }}
      />
      {timeline.map((t) => (
        <li key={`${t.year}-${t.title}`} data-node className="relative pb-14 last:pb-0">
          <span
            data-dot
            className="absolute -left-[39px] top-1.5 h-[11px] w-[11px] rounded-full border border-white bg-black"
          />
          <div className="flex items-center gap-3">
            <span className="font-data text-xs">{t.year}</span>
            {t.year === "Present" && (
              <StatusPill tone="accent" pulse>
                Current
              </StatusPill>
            )}
          </div>
          <h3 className="display-md mt-2">{t.title}</h3>
          <p className="mt-3 max-w-xl leading-relaxed text-muted">{t.body}</p>
        </li>
      ))}
    </ol>
  );
}
