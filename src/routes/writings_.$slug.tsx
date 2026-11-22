import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Reveal } from "../components/Reveal";
import { SplitHeading } from "../components/SplitHeading";
import { Glow } from "../components/Glow";
import { StatusPill } from "../components/StatusPill";
import { bootDelay } from "../lib/boot";
import { posts } from "../data/posts";

export const Route = createFileRoute("/writings_/$slug")({
  loader: ({ params }) => {
    const post = posts.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Article"} — Jahnvi Verma (JV)` },
      { name: "description", content: loaderData?.excerpt ?? "" },
      { property: "og:title", content: loaderData?.title ?? "" },
      { property: "og:description", content: loaderData?.excerpt ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <p className="font-data">Article not found.</p>
      <Link to="/writings" className="btn-outline-square">
        Back to writing
      </Link>
    </div>
  ),
  component: PostPage,
});

// ─── Minimal Markdown renderer (no dependency) ──────────────────────────────
function renderContent(md: string) {
  return md.split("\n\n").map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="display-md mt-16">
          {block.slice(3)}
        </h2>
      );
    }
    if (block.startsWith("---")) {
      return <hr key={i} className="my-10 border-line" />;
    }
    const parts = block.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} className="font-medium text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
    return (
      <p key={i} className="mt-6 text-[17px] leading-[1.85] text-white/70">
        {parts}
      </p>
    );
  });
}

function PostPage() {
  const post = Route.useLoaderData();
  const d = bootDelay();
  const currentIndex = posts.findIndex((p) => p.slug === post.slug);
  const next = posts[(currentIndex + 1) % posts.length];

  return (
    <>
      <section className="relative isolate overflow-hidden pb-16 pt-36 md:pt-44">
        <div className="bg-grid-faint absolute inset-0 -z-10" />
        <Glow className="-right-48 -top-56 -z-10" size={700} />
        <div className="container-x max-w-4xl">
          <Reveal delay={d}>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/writings" className="pill pill-button">
                ← Writing
              </Link>
              <StatusPill tone="accent">{post.tag}</StatusPill>
              <span className="font-data text-xs">
                {post.date} · {post.read} min read
              </span>
            </div>
          </Reveal>

          <SplitHeading
            as="h1"
            trigger="mount"
            delay={d + 100}
            text={post.title}
            className="display-lg mt-8"
          />

          <Reveal delay={d + 500}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">{post.excerpt}</p>
          </Reveal>
        </div>
      </section>

      <section className="container-x max-w-3xl pb-24 pt-4">
        <Reveal>
          <article className="border-t border-line pt-4">{renderContent(post.content)}</article>
        </Reveal>

        <Reveal>
          <div className="mt-20 flex items-center justify-between border-t border-line pt-8">
            <Link to="/writings" className="btn-outline-square">
              ← All articles
            </Link>
            <span className="font-data text-xs">{post.date}</span>
          </div>
        </Reveal>

        <Reveal>
          <p className="label mt-16">Next article</p>
          <Link
            to="/writings/$slug"
            params={{ slug: next.slug }}
            className="card card-hover group mt-4 block p-8 sm:p-10"
          >
            <div className="font-data flex items-center justify-between text-xs">
              <span>
                {next.tag} · {next.read} min
              </span>
              <span>{next.date}</span>
            </div>
            <h2 className="display-md mt-5">{next.title}</h2>
            <p className="mt-3 max-w-xl text-sm text-muted">{next.excerpt}</p>
            <span className="mt-8 inline-flex text-sm transition-transform duration-300 group-hover:translate-x-1">
              Read article →
            </span>
          </Link>
        </Reveal>
      </section>
    </>
  );
}
