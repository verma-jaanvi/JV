import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Reveal } from "../components/Reveal";
import { SplitHeading } from "../components/SplitHeading";
import { Stagger } from "../components/Stagger";
import { Glow } from "../components/Glow";
import { StatusPill } from "../components/StatusPill";
import { bootDelay } from "../lib/boot";
import { CATEGORIES, projects, isInProgress, yearLabel, type Category } from "../data/site";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Jahnvi Verma (JV)" },
      {
        name: "description",
        content:
          "Selected projects spanning AI, desktop and Android apps, and full-stack web development.",
      },
      { property: "og:title", content: "Projects — Jahnvi Verma (JV)" },
      {
        property: "og:description",
        content: "A index of shipped systems and works in progress.",
      },
    ],
  }),
  component: Projects,
});

const COLS = "md:grid-cols-[72px_minmax(0,1.1fr)_140px_130px_minmax(0,1.8fr)]";

function Projects() {
  const [active, setActive] = useState<Category>("All");
  const filtered = active === "All" ? projects : projects.filter((p) => p.cat === active);
  const d = bootDelay();

  return (
    <>
      <section className="relative isolate overflow-hidden pb-16 pt-36 md:pt-44">
        <div className="bg-grid-faint absolute inset-0 -z-10" />
        <Glow className="-right-48 -top-56 -z-10" size={760} />
        <div className="container-x">
          <Reveal delay={d}>
            <div className="flex items-center gap-3">
              <StatusPill tone="accent">projects.index</StatusPill>
              <span className="font-data text-xs">{projects.length} entries</span>
            </div>
          </Reveal>
          <SplitHeading
            as="h1"
            trigger="mount"
            delay={d + 100}
            text="Selected work, | *from idea to shipped.*"
            className="display-xl mt-8"
          />
          <Reveal delay={d + 600}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
              Each project is a contained system with its own constraints — across AI, desktop,
              Android and the web.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-x pb-24">
        <Reveal>
          <div className="flex flex-wrap items-center gap-2 pb-6">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                data-active={active === c}
                className="pill pill-button"
              >
                {c}
              </button>
            ))}
            <span className="font-data w-full text-xs sm:ml-auto sm:w-auto">
              showing {filtered.length} / {projects.length}
            </span>
          </div>
        </Reveal>

        <Reveal>
          <div className="tbl">
            <div className={`tbl-head hidden gap-4 px-5 py-3 md:grid ${COLS}`}>
              <span>ID</span>
              <span>Project</span>
              <span>Category</span>
              <span>Status</span>
              <span>Description</span>
            </div>

            <Stagger watch={active} gap={70} y={12}>
              {filtered.map((p) => (
                <article
                  key={p.code}
                  className={`tbl-row grid gap-3 px-5 py-6 md:items-start md:gap-4 ${COLS}`}
                >
                  <div className="flex items-center justify-between md:block">
                    <span className="font-data text-xs">PRJ-{p.code}</span>
                    <span className="md:hidden">
                      <StatusPill tone={isInProgress(p) ? "accent" : "ok"} pulse={isInProgress(p)}>
                        {yearLabel(p)}
                      </StatusPill>
                    </span>
                  </div>

                  <div>
                    <h3 className="display-sm">{p.title}</h3>
                    <p className="font-data mt-1.5 text-xs">{p.tag}</p>
                  </div>

                  <span className="font-data text-xs md:pt-1">{p.cat}</span>

                  <span className="hidden md:block">
                    <StatusPill tone={isInProgress(p) ? "accent" : "ok"} pulse={isInProgress(p)}>
                      {yearLabel(p)}
                    </StatusPill>
                  </span>

                  <p className="text-sm leading-relaxed text-muted">{p.desc}</p>
                </article>
              ))}
            </Stagger>

            {filtered.length === 0 && (
              <div className="font-data px-5 py-12 text-center text-sm">No entries in this category.</div>
            )}
          </div>
        </Reveal>

        <Reveal>
          <div className="card mt-16 flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center">
            <div>
              <p className="display-sm">Have a project in mind?</p>
              <p className="mt-1 text-sm text-muted">I'm open to freelance work and collaborations.</p>
            </div>
            <Link to="/contact" className="btn-square">
              Start a conversation <span aria-hidden>↗</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
