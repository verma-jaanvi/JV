import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Reveal } from "../components/Reveal";
import { SplitHeading } from "../components/SplitHeading";
import { Stagger } from "../components/Stagger";
import { Glow } from "../components/Glow";
import { StatusPill } from "../components/StatusPill";
import { bootDelay } from "../lib/boot";
import { posts } from "../data/posts";

export const Route = createFileRoute("/writings")({
  head: () => ({
    meta: [
      { title: "Writing — Jahnvi Verma (JV)" },
      {
        name: "description",
        content:
          "Essays, field notes, and fragments on AI, creative coding, design, and the craft of building software.",
      },
      { property: "og:title", content: "Writing — Jahnvi Verma (JV)" },
      { property: "og:description", content: "Essays and field notes on AI, design and craft." },
    ],
  }),
  component: Writings,
});

const tags = ["All", "Essays", "Field notes", "AI", "Design", "Process"] as const;

function Writings() {
  const [tag, setTag] = useState<(typeof tags)[number]>("All");
  const filtered = tag === "All" ? posts : posts.filter((p) => p.tag === tag);
  const featured = posts.find((p) => p.featured)!;
  const d = bootDelay();

  return (
    <>
      <section className="relative isolate overflow-hidden pb-16 pt-36 md:pt-44">
        <div className="bg-grid-faint absolute inset-0 -z-10" />
        <Glow className="-right-48 -top-56 -z-10" size={760} />
        <div className="container-x">
          <Reveal delay={d}>
            <div className="flex items-center gap-3">
              <StatusPill tone="accent">writing.log</StatusPill>
              <span className="font-data text-xs">{posts.length} articles</span>
            </div>
          </Reveal>
          <SplitHeading
            as="h1"
            trigger="mount"
            delay={d + 100}
            text="Notes from | *the work.*"
            className="display-xl mt-8"
          />
          <Reveal delay={d + 600}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
              Essays, half-formed thoughts and field notes on artificial intelligence, creative
              engineering and the small details that make digital things feel alive.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Featured */}
      <section className="container-x pb-12">
        <Reveal>
          <Link to="/writings/$slug" params={{ slug: featured.slug }} className="group block">
            <article className="card card-hover relative overflow-hidden p-8 sm:p-12">
              <Glow className="-right-40 -top-56" size={620} />
              <div className="relative">
                <StatusPill tone="accent">Featured</StatusPill>
                <h2 className="display-lg mt-8 max-w-3xl">{featured.title}</h2>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{featured.excerpt}</p>
                <div className="font-data mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-5 text-xs">
                  <span>{featured.date}</span>
                  <span>·</span>
                  <span>{featured.read} min read</span>
                  <span>·</span>
                  <span>{featured.tag}</span>
                  <span className="ml-auto text-white transition-transform duration-300 group-hover:translate-x-1">
                    Read article →
                  </span>
                </div>
              </div>
            </article>
          </Link>
        </Reveal>
      </section>

      {/* Filter + list */}
      <section className="container-x pb-24 pt-8 md:pb-32">
        <Reveal>
          <div className="flex flex-wrap items-center gap-2 pb-6">
            {tags.map((t) => (
              <button key={t} onClick={() => setTag(t)} data-active={tag === t} className="pill pill-button">
                {t}
              </button>
            ))}
            <span className="font-data w-full text-xs sm:ml-auto sm:w-auto">
              {filtered.length} / {posts.length}
            </span>
          </div>
        </Reveal>

        <Reveal>
          <div className="tbl">
            <div className="tbl-head hidden grid-cols-[120px_1fr_150px_32px] gap-4 px-5 py-3 sm:grid">
              <span>Date</span>
              <span>Title</span>
              <span>Topic</span>
              <span />
            </div>
            <Stagger watch={tag} gap={60} y={12}>
              {filtered.map((p) => (
                <Link
                  key={p.slug}
                  to="/writings/$slug"
                  params={{ slug: p.slug }}
                  className="tbl-row group grid gap-2 px-5 py-6 sm:grid-cols-[120px_1fr_150px_32px] sm:gap-4"
                >
                  <span className="font-data text-xs sm:pt-1.5">{p.date}</span>
                  <span>
                    <h3 className="display-sm transition-transform duration-300 group-hover:translate-x-1">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{p.excerpt}</p>
                  </span>
                  <span className="font-data text-xs sm:pt-1.5">
                    {p.tag} · {p.read} min
                  </span>
                  <span className="hidden text-right text-muted transition-colors group-hover:text-white sm:block">
                    →
                  </span>
                </Link>
              ))}
            </Stagger>
            {filtered.length === 0 && (
              <div className="font-data px-5 py-12 text-center text-sm">No articles under this topic yet.</div>
            )}
          </div>
        </Reveal>
      </section>
    </>
  );
}
