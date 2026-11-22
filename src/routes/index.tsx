import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Reveal } from "../components/Reveal";
import { SplitHeading } from "../components/SplitHeading";
import { Stagger } from "../components/Stagger";
import { Marquee } from "../components/Marquee";
import { Glow } from "../components/Glow";
import { CountUp } from "../components/CountUp";
import { SectionHeader } from "../components/SectionHeader";
import { SpotlightCard } from "../components/SpotlightCard";
import { Scrub } from "../components/Scrub";
import { AnimateBars } from "../components/AnimateBars";
import { StatusPill } from "../components/StatusPill";
import { bootDelay } from "../lib/boot";
import {
  projects,
  skills,
  timeline,
  isInProgress,
  yearLabel,
} from "../data/site";
import { posts } from "../data/posts";
import { LeetCodeHeatmap } from "../components/LeetCodeHeatmap";
import { LEETCODE } from "../data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jahnvi Verma (JV) — Creative Technologist" },
      {
        name: "description",
        content:
          "Portfolio of Jahnvi Verma — a creative technologist building AI-driven software, interactive interfaces and full-stack products.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <StackTicker />
      <Metrics />
      <FeaturedWork />
      <Bento />
      <EventStream />
      <StackMatrix />
      <LeetCode />
      <Writing />
      <CTA />
    </>
  );
}

/* ───────────────────────── Hero ───────────────────────── */

function Hero() {
  const d = bootDelay();
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden pb-16 pt-40">
      <Scrub
        className="absolute inset-x-0 -top-[6%] -z-20 h-[112%]"
        y={[0, 140]}
        scale={[1, 1.12]}
        enter="top top"
        leave="top bottom"
        smooth={0.4}
      >
        <img
          src="/images/hero.jpg"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="h-full w-full object-cover"
        />
      </Scrub>
      <Glow className="-right-40 -top-48 -z-10" size={760} />
      <div className="scrim pointer-events-none absolute inset-0 -z-10" />

      <Scrub
        className="container-x"
        y={[0, -90]}
        opacity={[1, 0.1]}
        enter="top top"
        leave="top bottom"
        smooth={0.35}
      >
        <Reveal delay={d}>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill tone="ok" pulse>
              Open to collaboration
            </StatusPill>
            <span className="font-data text-xs">
              B.Tech CSE · FOSSEE, IIT Bombay
            </span>
          </div>
        </Reveal>

        <SplitHeading
          as="h1"
          trigger="mount"
          delay={d + 100}
          text="I build intelligent, *beautifully crafted* software."
          className="display-xl headline-fluid mt-8"
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_minmax(0,520px)] lg:items-end">
          <div>
            <Reveal delay={d + 700}>
              <p className="max-w-xl text-base leading-relaxed text-[#e7e7e7]">
                I'm Jahnvi — a creative technologist working at the intersection
                of AI, interactive design and full-stack engineering. I turn
                ideas into polished, working products.
              </p>
            </Reveal>
            <Reveal delay={d + 850}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/projects"
                  className="btn-square !h-auto !px-4 !py-3 !text-xl"
                >
                  View projects <Arrow />
                </Link>
                <Link
                  to="/about"
                  className="btn-outline-square !h-auto !px-4 !py-3 !text-xl"
                >
                  About me
                </Link>
              </div>
            </Reveal>
          </div>
          <HeroTable delay={d + 900} />
        </div>
      </Scrub>
    </section>
  );
}

const Arrow = ({ size = 12 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2 10L10 2M10 2H3.5M10 2V8.5"
      stroke="currentColor"
      strokeWidth="1.4"
    />
  </svg>
);

function HeroTable({ delay }: { delay: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="font-data text-xs">~/projects</span>
        <span className="font-data text-xs">{projects.length} ENTRIES</span>
      </div>
      <div className="tbl-head grid grid-cols-[56px_1fr_auto] gap-3 px-4 py-2 sm:grid-cols-[64px_1fr_120px_auto]">
        <span>ID</span>
        <span>Name</span>
        <span className="hidden sm:block">Type</span>
        <span className="text-right">Status</span>
      </div>
      <Stagger immediate delay={delay} gap={80} y={10}>
        {projects.map((p) => (
          <div
            key={p.code}
            className="tbl-row grid grid-cols-[56px_1fr_auto] items-center gap-3 px-4 py-3.5 sm:grid-cols-[64px_1fr_120px_auto]"
          >
            <span className="font-data text-xs">PRJ-{p.code}</span>
            <span className="font-data truncate text-xs !text-white">
              {p.title}
            </span>
            <span className="font-data hidden truncate text-xs sm:block">
              {p.cat}
            </span>
            <span className="justify-self-end">
              {isInProgress(p) ? (
                <StatusPill tone="accent">In progress</StatusPill>
              ) : (
                <StatusPill tone="ok">Shipped</StatusPill>
              )}
            </span>
          </div>
        ))}
      </Stagger>
    </div>
  );
}

/* ───────────────────────── Metrics grid ───────────────────────── */

function Metrics() {
  const tools = new Set(skills.flatMap((s) => s.v)).size;
  const items = [
    {
      v: 3,
      unit: "+ yrs",
      label: "Building software, from first commit to freelance work.",
    },
    {
      v: projects.length,
      unit: "built",
      label: "Projects across AI, desktop, Android and web.",
    },
    {
      v: posts.length,
      unit: "posts",
      label: "Essays and field notes on AI, design and craft.",
    },
    {
      v: tools,
      unit: "tools",
      label: "Languages, frameworks and platforms in the toolkit.",
    },
  ];
  return (
    <section className="container-x pt-24">
      <div className="grid grid-cols-2 border-l border-t border-line lg:grid-cols-4">
        {items.map((m) => (
          <Reveal
            key={m.unit}
            className="border-b border-r border-line p-6 sm:p-8"
          >
            <div className="flex items-baseline gap-2">
              <CountUp to={m.v} className="metric-value" />
              <span className="font-data text-sm">{m.unit}</span>
            </div>
            <p className="font-data mt-4 text-xs leading-relaxed">{m.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Stack ticker ───────────────────────── */

function StackTicker() {
  const items = Array.from(
    new Set(skills.flatMap((s) => s.v).filter((v) => !/\(learning\)/i.test(v))),
  ).slice(0, 28);
  return (
    <section
      aria-label="Technologies"
      className="border-y border-line bg-black py-5"
    >
      <Marquee>
        {items.map((t) => (
          <div key={t} className="flex items-center gap-10">
            <span className="font-data whitespace-nowrap text-sm">{t}</span>
            <span className="text-line-strong">/</span>
          </div>
        ))}
      </Marquee>
    </section>
  );
}

/* ───────────────────────── Featured work ───────────────────────── */

function FeaturedWork() {
  const featured = projects
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
  return (
    <section className="container-x py-28 md:py-36">
      <SectionHeader
        index="01"
        label="Selected work"
        title="Things I've *designed and shipped*"
        action={
          <Link to="/projects" className="btn-outline-square">
            All projects <span aria-hidden>→</span>
          </Link>
        }
      />

      <Stagger className="mt-14 grid gap-4 md:grid-cols-2" gap={90}>
        {featured.map((p, i) => (
          <Link key={p.code} to="/projects" className="block">
            <Scrub
              y={i % 2 ? [70, -30] : [20, -20]}
              smooth={0.45}
              className="h-full"
            >
              <SpotlightCard className="h-full p-7 sm:p-9">
                <div className="flex items-start justify-between">
                  <span className="font-data text-xs">
                    0{i + 1} / PRJ-{p.code}
                  </span>
                  <StatusPill tone={isInProgress(p) ? "accent" : "ok"}>
                    {isInProgress(p) ? "In progress" : "Shipped"}
                  </StatusPill>
                </div>
                <div className="mt-16 sm:mt-24">
                  <p className="font-data text-xs">{p.tag}</p>
                  <h3 className="display-md mt-3">{p.title}</h3>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
                    {p.desc}
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-line pt-4 font-data text-xs">
                  <span>
                    {yearLabel(p)} · {p.cat}
                  </span>
                  <span className="text-white transition-transform duration-300 group-hover:translate-x-1">
                    View →
                  </span>
                </div>
              </SpotlightCard>
            </Scrub>
          </Link>
        ))}
      </Stagger>
    </section>
  );
}

/* ───────────────────────── Bento ───────────────────────── */

function Bento() {
  const max = Math.max(...skills.map((s) => s.v.length));
  return (
    <section className="border-y border-line bg-black">
      <div className="container-x py-28 md:py-36">
        <SectionHeader
          index="02"
          label="Overview"
          title="The work, *at a glance.*"
        />
        <Stagger className="mt-14 grid gap-4 lg:grid-cols-3" gap={110}>
          {/* 1 — project status */}
          <div className="card p-6">
            <p className="label">Project status</p>
            <div className="mt-5 divide-y divide-line">
              {projects.map((p) => (
                <div
                  key={p.code}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-data truncate text-xs !text-white">
                      {p.title}
                    </p>
                    <p className="font-data text-[11px]">{yearLabel(p)}</p>
                  </div>
                  {isInProgress(p) ? (
                    <StatusPill tone="accent">In progress</StatusPill>
                  ) : (
                    <StatusPill tone="ok">Pass</StatusPill>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2 — stack coverage */}
          <div className="card p-6">
            <p className="label">Stack coverage</p>
            <AnimateBars className="mt-5 space-y-4">
              {skills.map((s) => (
                <div key={s.k}>
                  <div className="font-data mb-1.5 flex justify-between text-[11px]">
                    <span className="truncate">{s.k}</span>
                    <span>{String(s.v.length).padStart(2, "0")}</span>
                  </div>
                  <div className="tl-track">
                    <div
                      data-bar
                      className="tl-bar"
                      data-active={s.v.length === max}
                      style={{ left: 0, width: `${(s.v.length / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </AnimateBars>
          </div>

          {/* 3 — profile diff */}
          <div className="card p-6">
            <p className="label">Profile diff</p>
            <div className="font-data mt-5 overflow-hidden border border-line bg-black py-2 text-xs leading-relaxed">
              <div className="diff-line"> name: "Jahnvi Verma"</div>
              <div className="diff-line diff-mod !text-white">
                ~ role: "Creative technologist"
              </div>
              <div className="diff-line diff-add !text-white">
                + education: "B.Tech CSE, VIT Bhopal"
              </div>
              <div className="diff-line diff-add !text-white">
                + internship: "FOSSEE, IIT Bombay"
              </div>
              <div className="diff-line diff-add !text-white">
                + freelance: true
              </div>
              <div className="diff-line diff-add !text-white">
                + focus: ["AI", "Full-stack"]
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <StatusPill tone="ok">Added</StatusPill>
              <StatusPill tone="accent">Modified</StatusPill>
            </div>
          </div>
        </Stagger>
      </div>
    </section>
  );
}

/* ───────────────────────── Event stream ───────────────────────── */

const DOMAIN_START = 2024;
const DOMAIN_YEARS = 3;
function spanOf(t: (typeof timeline)[number]) {
  if (t.year === "Present")
    return { left: 0.86, width: 0.14, start: "NOW", dur: "ONGOING" };
  const y = Number(t.year);
  return {
    left: (y - DOMAIN_START) / DOMAIN_YEARS,
    width: 1 / DOMAIN_YEARS,
    start: t.year,
    dur: `${t.duration} months`,
  };
}

function EventStream() {
  const [active, setActive] = useState(timeline.length - 1);
  return (
    <section className="container-x py-28 md:py-36">
      <SectionHeader
        index="03"
        label="Event stream"
        title="A trace of *how I got here.*"
      />
      <Reveal>
        <div className="card mt-14 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <span className="font-data text-xs !text-white">
              TRACE · jv-2024-2026
            </span>
            <div className="flex gap-2">
              <StatusPill>{timeline.length} spans</StatusPill>
              <StatusPill>3 yrs</StatusPill>
              <StatusPill tone="accent">Live</StatusPill>
            </div>
          </div>

          <div className="grid md:grid-cols-[240px_1fr]">
            <ul className="max-h-[360px] overflow-y-auto border-b border-line md:border-b-0 md:border-r">
              {timeline.map((t, i) => (
                <li key={`${t.year}-${t.title}`}>
                  <button
                    onClick={() => setActive(i)}
                    className={`font-data flex w-full items-center gap-3 border-b border-line px-5 py-3.5 text-left text-xs transition-colors hover:bg-[#111] ${
                      active === i ? "bg-[#111] !text-white" : ""
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background:
                          i === timeline.length - 1 ? "#52a8ff" : "#62c073",
                      }}
                    />
                    EVT-{String(i + 1).padStart(2, "0")}
                  </button>
                </li>
              ))}
            </ul>

            <div>
              <div className="tbl-head grid grid-cols-[1fr_64px] gap-4 px-5 py-3 sm:grid-cols-[minmax(0,1.2fr)_64px_minmax(0,1.4fr)_72px]">
                <span>Span</span>
                <span>Start</span>
                <span className="hidden sm:block">Timeline</span>
                <span className="hidden text-right sm:block">Duration</span>
              </div>
              <AnimateBars watch={active}>
                {timeline.map((t, i) => {
                  const sp = spanOf(t);
                  return (
                    <div
                      key={`${t.year}-${t.title}`}
                      onClick={() => setActive(i)}
                      className={`tbl-row font-data grid cursor-pointer grid-cols-[1fr_64px] items-center gap-4 px-5 py-4 text-xs sm:grid-cols-[minmax(0,1.2fr)_64px_minmax(0,1.4fr)_72px] ${
                        active === i ? "bg-[#111]" : ""
                      }`}
                    >
                      <span
                        className={`truncate ${active === i ? "!text-white" : ""}`}
                      >
                        {t.title}
                      </span>
                      <span>{sp.start}</span>
                      <div className="tl-track hidden sm:block">
                        <div
                          data-bar
                          className="tl-bar"
                          data-active={active === i}
                          style={{
                            left: `${sp.left * 100}%`,
                            width: `${sp.width * 100}%`,
                          }}
                        />
                      </div>
                      <span className="hidden text-right sm:block">
                        {sp.dur}
                      </span>
                    </div>
                  );
                })}
              </AnimateBars>
              <div className="border-t border-line px-5 py-5">
                <p className="font-data text-xs !text-white">
                  {timeline[active].title}
                </p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                  {timeline[active].body}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ───────────────────────── Stack matrix ───────────────────────── */

function StackMatrix() {
  return (
    <section className="border-y border-line bg-black">
      <div className="container-x py-28 md:py-36">
        <SectionHeader
          index="04"
          label="Capabilities"
          title="A multidisciplinary toolkit *for building products.*"
        />

        <div className="tbl mt-14">
          <div className="tbl-head hidden grid-cols-[72px_260px_1fr] gap-4 px-5 py-3 md:grid">
            <span>No.</span>
            <span>Domain</span>
            <span>Technologies</span>
          </div>
          <Stagger gap={50} y={12}>
            {skills.map((s, i) => (
              <div
                key={s.k}
                className="tbl-row grid gap-2 px-5 py-5 md:grid-cols-[72px_260px_1fr] md:gap-4"
              >
                <span className="font-data text-xs md:pt-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="display-sm">{s.k}</h3>
                <ul className="flex flex-wrap gap-x-5 gap-y-1.5 font-data text-[13px]">
                  {s.v.map((x) => (
                    <li key={x} className="transition-colors hover:text-white">
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Writing ───────────────────────── */

function LeetCode() {
  return (
    <section className="container-x py-28 md:py-36">
      <SectionHeader
        index="05"
        label="Problem solving"
        title="Practice, *tracked daily.*"
        action={
          <a
            href={LEETCODE.profile}
            target="_blank"
            rel="noreferrer"
            className="btn-outline-square"
          >
            View LeetCode profile <span aria-hidden>↗</span>
          </a>
        }
      />
      <Reveal delay={120}>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
          Strong engineering starts with strong fundamentals. I work through
          data structures and algorithms problems on LeetCode to keep my
          problem-solving sharp. This heatmap is pulled live from my public
          profile — an unedited, day-by-day record of how consistently I show
          up.
        </p>
      </Reveal>
      <LeetCodeHeatmap />
    </section>
  );
}

function Writing() {
  const latest = [...posts]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3);
  return (
    <section className="border-t border-line">
      <div className="container-x py-28 md:py-36">
        <SectionHeader
          index="06"
          label="Writing"
          title="Notes on *AI, design and craft.*"
          action={
            <Link to="/writings" className="btn-outline-square">
              All articles <span aria-hidden>→</span>
            </Link>
          }
        />

        <div className="tbl mt-14">
          <Stagger gap={80} y={12}>
            {latest.map((p) => (
              <Link
                key={p.slug}
                to="/writings/$slug"
                params={{ slug: p.slug }}
                className="tbl-row group grid grid-cols-[1fr_auto] items-baseline gap-4 px-5 py-6 sm:grid-cols-[120px_1fr_auto_32px]"
              >
                <span className="font-data order-2 text-xs sm:order-none">
                  {p.date}
                </span>
                <span className="display-sm col-span-2 transition-transform duration-300 group-hover:translate-x-1 sm:col-span-1">
                  {p.title}
                </span>
                <span className="font-data hidden text-xs sm:block">
                  {p.tag} · {p.read} min
                </span>
                <span className="hidden text-right text-muted transition-colors group-hover:text-white sm:block">
                  →
                </span>
              </Link>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── CTA ───────────────────────── */

function CTA() {
  return (
    <section className="container-x pb-8">
      <Reveal>
        <div className="card relative overflow-hidden px-7 py-16 sm:px-12 md:py-24">
          <Glow className="-left-40 -top-56" size={720} />
          <Glow className="-bottom-72 -right-40" size={640} tone="white" />
          <div className="relative">
            <p className="label">Get in touch</p>
            <SplitHeading
              text="Have an idea *worth building?*"
              className="display-lg mt-5 max-w-3xl"
            />
            <p className="mt-6 max-w-lg text-muted">
              Open to collaborations, freelance projects and opportunities. I
              read every message.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/contact" className="btn-square">
                Start a conversation <Arrow />
              </Link>
              <Link to="/projects" className="btn-outline-square">
                See my work
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
