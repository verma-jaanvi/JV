import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Heart, Plus } from "lucide-react";

import { Reveal } from "../components/Reveal";
import { SplitHeading } from "../components/SplitHeading";
import { Glow } from "../components/Glow";
import { StatusPill } from "../components/StatusPill";
import { SketchLightbox } from "../components/SketchLightbox";
import { SketchUploader } from "../components/SketchUploader";
import { bootDelay } from "../lib/boot";
import { animate, prefersReducedMotion } from "../lib/anim";
import { listLocalSketches, readLikes, removeLocalSketch, writeLikes } from "../lib/sketchStore";
import { sketches as published, type Sketch } from "../data/sketches";

export const Route = createFileRoute("/sketches")({
  head: () => ({
    meta: [
      { title: "Sketchbook — Jahnvi Verma (JV)" },
      {
        name: "description",
        content: "A pinboard of sketches, studies and doodles by Jahnvi Verma.",
      },
      { property: "og:title", content: "Sketchbook — Jahnvi Verma (JV)" },
      { property: "og:description", content: "Sketches, studies and doodles." },
    ],
  }),
  component: Sketches,
});

const GAP = 14;
const CAPTION_H = 30; // approx caption height used for column balancing

/* ── edit mode: dev server, or open /sketches?edit=1 once (remembered; ?edit=0 turns it off) ── */
function useEditMode() {
  const [edit, setEdit] = useState(false);
  useEffect(() => {
    let on = import.meta.env.DEV;
    try {
      const q = new URLSearchParams(window.location.search).get("edit");
      if (q === "1") localStorage.setItem("jv_edit", "1");
      if (q === "0") localStorage.removeItem("jv_edit");
      if (localStorage.getItem("jv_edit") === "1") on = true;
      if (q === "0") on = false;
    } catch {
      /* storage unavailable */
    }
    setEdit(on);
  }, []);
  return edit;
}

/* ── responsive column count from container width ── */
function useMasonryWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(el);
    setWidth(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  const cols = width >= 1500 ? 7 : width >= 1240 ? 6 : width >= 960 ? 5 : width >= 700 ? 4 : width >= 480 ? 3 : 2;
  return { ref, width, cols };
}

/** Pinterest-style ratios (w/h). Used to vary tile heights when the source images are all similar. */
const PIN_RATIOS = [0.66, 0.8, 1, 0.56, 0.75, 1.25, 0.62, 0.9, 0.7, 1.1, 0.6, 0.85];

/**
 * Display shape for each tile: the image's own ratio, clamped to a Pinterest-like range (0.5–1.4 w/h).
 * If all images share nearly the same ratio the board would look like a plain grid, so we vary
 * the crop per tile (stable per id) to get the uneven masonry look. Lightbox still shows the full image.
 */
function shapeTiles(items: Sketch[]): Sketch[] {
  const r = items.map((s) => s.w / s.h);
  const spread = r.length ? Math.max(...r) - Math.min(...r) : 0;
  return items.map((s, i) => {
    let ratio = Math.min(1.4, Math.max(0.5, s.w / s.h));
    if (spread < 0.3 && items.length > 2) ratio = PIN_RATIOS[(i * 5 + 3) % PIN_RATIOS.length];
    return { ...s, w: 1000, h: Math.round(1000 / ratio) };
  });
}

function distribute(items: Sketch[], cols: number, width: number) {
  const colW = Math.max(1, (width - GAP * (cols - 1)) / cols);
  const heights = new Array(cols).fill(0);
  const out: { item: Sketch; order: number }[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => {
    let c = 0;
    for (let k = 1; k < cols; k++) if (heights[k] < heights[c]) c = k;
    out[c].push({ item, order: i });
    heights[c] += (colW * item.h) / item.w + CAPTION_H + GAP;
  });
  return out;
}

function Sketches() {
  const d = bootDelay();
  const edit = useEditMode();
  const { ref, width, cols } = useMasonryWidth();

  const [local, setLocal] = useState<Sketch[]>([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [tag, setTag] = useState<string>("All");
  const [open, setOpen] = useState<number | null>(null);
  const [uploader, setUploader] = useState(false);

  const refreshLocal = useCallback(async () => {
    setLocal((old) => {
      old.forEach((s) => URL.revokeObjectURL(s.src));
      return old;
    });
    setLocal(await listLocalSketches());
  }, []);

  useEffect(() => {
    setLikes(readLikes());
    void refreshLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const real = useMemo(() => [...local, ...published], [local]);
  const all = real;

  const tags = useMemo(() => {
    const set = new Set<string>();
    all.forEach((s) => s.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [all]);

  const visible = useMemo(() => {
    if (tag === "All") return all;
    if (tag === "__liked") return all.filter((s) => likes.includes(s.id));
    return all.filter((s) => s.tags.includes(tag));
  }, [all, tag, likes]);

  // if the active filter disappears (e.g. deleted last item), fall back to All
  useEffect(() => {
    if (tag !== "All" && tag !== "__liked" && !tags.includes(tag)) setTag("All");
  }, [tags, tag]);

  const toggleLike = (id: string) =>
    setLikes((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      writeLikes(next);
      return next;
    });

  const shaped = useMemo(() => shapeTiles(visible), [visible]);
  const columns = useMemo(() => distribute(shaped, cols, width || 1000), [shaped, cols, width]);

  const current = open !== null ? visible[open] : undefined;

  return (
    <>
      <section className="relative isolate overflow-hidden pb-10 pt-36 md:pt-44">
        <div className="bg-grid-faint absolute inset-0 -z-10" />
        <Glow className="-right-48 -top-56 -z-10" size={760} />
        <div className="container-x">
          <Reveal delay={d}>
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill tone="accent">sketchbook.board</StatusPill>
              <span className="font-data text-xs">{all.length} sketches</span>
              {edit && <StatusPill tone="ok">Edit mode</StatusPill>}
            </div>
          </Reveal>
          <SplitHeading
            as="h1"
            trigger="mount"
            delay={d + 100}
            text="Loose lines, | *half-formed ideas.*"
            className="display-xl mt-8"
          />
          <Reveal delay={d + 600}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">
              A pinboard of what I draw when I'm not writing code — studies, characters and doodles.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1600px] px-4 pb-24 sm:px-6">
        {/* filter bar */}
        <Reveal>
          <div className="flex flex-wrap items-center gap-2 border-b border-line pb-5">
            <button data-active={tag === "All"} onClick={() => setTag("All")} className="pill pill-button">
              All
            </button>
            {tags.map((t) => (
              <button key={t} data-active={tag === t} onClick={() => setTag(t)} className="pill pill-button">
                {t}
              </button>
            ))}
            {likes.some((id) => all.some((s) => s.id === id)) && (
              <button
                data-active={tag === "__liked"}
                onClick={() => setTag("__liked")}
                className="pill pill-button"
              >
                <Heart size={12} /> Liked
              </button>
            )}
            <div className="ml-auto flex items-center gap-3">
              <span className="font-data text-xs">
                {visible.length} / {all.length}
              </span>
              {edit && (
                <button onClick={() => setUploader(true)} className="btn-square btn-square-sm">
                  <Plus size={14} /> Add sketch
                </button>
              )}
            </div>
          </div>
        </Reveal>

        {/* masonry */}
        <div ref={ref} className="mt-6">
          {visible.length === 0 ? (
            <EmptyState
              edit={edit}
              filtered={all.length > 0}
              onAdd={() => setUploader(true)}
              onReset={() => setTag("All")}
            />
          ) : (
            <div className="flex items-start" style={{ gap: GAP }}>
              {columns.map((col, ci) => (
                <div key={ci} className="flex min-w-0 flex-1 flex-col" style={{ gap: GAP }}>
                  {col.map(({ item, order }) => (
                    <SketchCard
                      key={`${tag}-${item.id}`}
                      item={item}
                      delay={Math.min(order, 14) * 55}
                      liked={likes.includes(item.id)}
                      onLike={() => toggleLike(item.id)}
                      onOpen={() => setOpen(visible.findIndex((v) => v.id === item.id))}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {current && open !== null && (
        <SketchLightbox
          items={visible}
          index={open}
          liked={likes.includes(current.id)}
          canDelete={edit}
          onClose={() => setOpen(null)}
          onNavigate={setOpen}
          onToggleLike={() => toggleLike(current.id)}
          onDelete={async () => {
            await removeLocalSketch(current.id);
            setOpen(null);
            await refreshLocal();
          }}
        />
      )}

      {uploader && (
        <SketchUploader
          existingTags={tags}
          onClose={() => setUploader(false)}
          onSaved={async () => {
            setUploader(false);
            setTag("All");
            await refreshLocal();
          }}
        />
      )}
    </>
  );
}

function SketchCard({
  item,
  delay,
  liked,
  onLike,
  onOpen,
}: {
  item: Sketch;
  delay: number;
  liked: boolean;
  onLike: () => void;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.opacity = "1";
      return;
    }
    let a: ReturnType<typeof animate> | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        a = animate(el, {
          opacity: [0, 1],
          translateY: [28, 0],
          scale: [0.97, 1],
          duration: 850,
          delay,
          ease: "outExpo",
        });
        io.disconnect();
      },
      { rootMargin: "0px 0px -30px 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      a?.cancel();
    };
  }, [delay]);

  return (
    <figure ref={ref} className="hidden-until-anim group m-0">
      <div className="card card-hover relative overflow-hidden !rounded-[18px]">
        <button
          onClick={onOpen}
          aria-label={`Open ${item.title}`}
          className="block w-full cursor-zoom-in"
          style={{ aspectRatio: `${item.w} / ${item.h}` }}
        >
          <img
            src={item.src}
            alt={item.title}
            width={item.w}
            height={item.h}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </button>

        {/* hover scrim + tag */}
        <div className="scrim pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {item.tags.slice(0, 2).map((t) => (
            <span key={t} className="pill">
              {t}
            </span>
          ))}
        </div>

        <button
          onClick={onLike}
          aria-pressed={liked}
          aria-label={liked ? "Unlike" : "Like"}
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center border border-line bg-black/70 backdrop-blur transition-opacity duration-300 hover:border-line-strong ${
            liked ? "opacity-100" : "opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
          }`}
        >
          <Heart size={15} className={liked ? "fill-accent text-accent" : "text-white"} />
        </button>
      </div>
      <figcaption className="flex items-center justify-between gap-3 px-1 pt-2">
        <span className="truncate text-xs tracking-[-0.01em] text-white/80">{item.title}</span>
              </figcaption>
    </figure>
  );
}

function EmptyState({
  edit,
  filtered,
  onAdd,
  onReset,
}: {
  edit: boolean;
  filtered: boolean;
  onAdd: () => void;
  onReset: () => void;
}) {
  return (
    <div className="card mx-auto mt-10 flex max-w-xl flex-col items-center px-8 py-16 text-center">
      <p className="label">{filtered ? "No matches" : "Empty board"}</p>
      <h2 className="display-md mt-4">
        {filtered ? "Nothing under this filter yet." : "The sketchbook is being filled."}
      </h2>
      <p className="mt-3 text-sm text-muted">
        {filtered ? "Try another tag." : "Drop images into public/sketches/ and they appear here."}
      </p>
      {filtered ? (
        <button onClick={onReset} className="btn-outline-square mt-8">
          Show all
        </button>
      ) : (
        edit && (
          <button onClick={onAdd} className="btn-square mt-8">
            <Plus size={14} /> Add your first sketch
          </button>
        )
      )}
    </div>
  );
}
