import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate, stagger, prefersReducedMotion } from "../lib/anim";
import { buildHeatmap, fetchLeetCode, type Cell, type LeetCodeData } from "../lib/leetcode";
import { LEETCODE } from "../data/site";
import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";
import { StatusPill } from "./StatusPill";

const LEVEL_BG = [
  "bg-[#141414]",
  "bg-accent/25",
  "bg-accent/50",
  "bg-accent/75",
  "bg-accent",
] as const;

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

type State = { status: "loading" } | { status: "ready"; data: LeetCodeData } | { status: "error" };

export function LeetCodeHeatmap() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: "loading" });
    fetchLeetCode(ctrl.signal)
      .then((data) => setState({ status: "ready", data }))
      .catch((e) => {
        if ((e as Error).name !== "AbortError") setState({ status: "error" });
      });
    return () => ctrl.abort();
  }, [attempt]);

  const data = state.status === "ready" ? state.data : null;
  const model = useMemo(() => buildHeatmap(data?.calendar ?? {}), [data]);

  // latest weeks visible first on narrow screens
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [state.status]);

  // sweep the cells in once real data is here
  useEffect(() => {
    if (state.status !== "ready" || !grid.current || prefersReducedMotion()) return;
    const cells = grid.current.querySelectorAll<HTMLElement>("[data-cell]");
    let a: ReturnType<typeof animate> | null = null;
    const io = new IntersectionObserver(
      (e) => {
        if (!e.some((x) => x.isIntersecting)) return;
        a = animate(cells, {
          opacity: [0, 1],
          scale: [0.3, 1],
          duration: 500,
          delay: stagger(4),
          ease: "outQuad",
        });
        io.disconnect();
      },
      { threshold: 0.15 },
    );
    io.observe(grid.current);
    return () => {
      io.disconnect();
      a?.cancel();
    };
  }, [state.status]);

  const showTip = useCallback((e: React.MouseEvent<HTMLElement>, c: Cell) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTip({
      x: r.left + r.width / 2,
      y: r.top,
      text: `${c.count} submission${c.count === 1 ? "" : "s"} · ${fmtDate(c.ts)}`,
    });
  }, []);

  const solved = data?.solved;
  const loading = state.status === "loading";
  const error = state.status === "error";

  return (
    <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* Heatmap */}
      <Reveal className="card p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <StatusPill tone={error ? "neutral" : loading ? "accent" : "ok"} pulse={loading || state.status === "ready"}>
              {error ? "Offline" : loading ? "Syncing" : "Live"}
            </StatusPill>
            <span className="font-data text-xs">Past 12 months</span>
          </div>
          <a
            href={LEETCODE.profile}
            target="_blank"
            rel="noreferrer"
            className="font-data text-xs transition-colors hover:text-white"
          >
            {LEETCODE.label} ↗
          </a>
        </div>

        <div ref={scroller} className="mt-6 overflow-x-auto pb-2">
          <div className="relative w-max">
            {/* month labels */}
            <div className="relative ml-8 h-4">
              {model.months.map((m) => (
                <span
                  key={`${m.week}-${m.label}`}
                  className="font-data absolute text-[10px] uppercase"
                  style={{ left: m.week * 15 }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            <div className="mt-1 flex gap-2">
              {/* weekday labels */}
              <div className="font-data grid w-6 grid-rows-7 gap-[3px] text-[10px] leading-3">
                {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                  <span key={i} className="h-3">
                    {d}
                  </span>
                ))}
              </div>

              <div
                ref={grid}
                className={`grid grid-flow-col grid-rows-7 gap-[3px] ${loading ? "animate-pulse" : ""}`}
                onMouseLeave={() => setTip(null)}
              >
                {model.weeks.flatMap((col, w) =>
                  col.map((c, d) =>
                    c ? (
                      <span
                        key={`${w}-${d}`}
                        data-cell
                        onMouseEnter={(e) => showTip(e, c)}
                        className={`h-3 w-3 rounded-[2px] ${LEVEL_BG[c.level]} ${
                          c.level === 0 ? "border border-white/[0.04]" : ""
                        }`}
                        style={state.status === "ready" && !prefersReducedMotion() ? { opacity: 0 } : undefined}
                      />
                    ) : (
                      <span key={`${w}-${d}`} className="h-3 w-3" />
                    ),
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-line px-4 py-3">
            <p className="font-data text-xs">Couldn't reach LeetCode just now.</p>
            <div className="flex gap-2">
              <button onClick={() => setAttempt((n) => n + 1)} className="btn-outline-square !h-8 !px-3 !text-xs">
                Retry
              </button>
              <a href={LEETCODE.profile} target="_blank" rel="noreferrer" className="btn-square btn-square-sm !h-8 !text-xs">
                View on LeetCode ↗
              </a>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="font-data text-[11px]">Each square is one day · UTC</p>
          <div className="font-data flex items-center gap-1.5 text-[11px]">
            Less
            {LEVEL_BG.map((bg, i) => (
              <span key={i} className={`h-3 w-3 rounded-[2px] ${bg} ${i === 0 ? "border border-white/[0.04]" : ""}`} />
            ))}
            More
          </div>
        </div>
      </Reveal>

      {/* Solved */}
      <Reveal className="card flex flex-col p-5 sm:p-7" delay={120}>
        <p className="label">Problems solved</p>
        <div className="mt-4 flex items-baseline gap-2">
          {solved ? (
            <CountUp to={solved.all} className="metric-value" />
          ) : (
            <span className="metric-value">{loading ? "···" : "—"}</span>
          )}
          <span className="font-data text-sm">total</span>
        </div>
        <div className="mt-8 space-y-5">
          {(
            [
              ["Easy", solved?.easy, "#62c073"],
              ["Medium", solved?.medium, "#52a8ff"],
              ["Hard", solved?.hard, "#ededed"],
            ] as const
          ).map(([label, n, color]) => {
            const pct = solved && solved.all ? ((n ?? 0) / solved.all) * 100 : 0;
            return (
              <div key={label}>
                <div className="flex items-center justify-between font-data text-xs">
                  <span>{label}</span>
                  <span className="text-white">{n ?? "—"}</span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-[#141414]">
                  <div
                    className="h-full rounded-[2px] transition-[width] duration-1000 ease-out"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* Metrics row */}
      <div className="grid grid-cols-2 border-l border-t border-line lg:col-span-2 lg:grid-cols-4">
        {[
          { v: model.submissions, unit: "subs", label: "Submissions in the past year." },
          { v: model.activeDays, unit: "days", label: "Days with at least one submission." },
          { v: model.currentStreak, unit: "day streak", label: "Current run of consecutive active days." },
          { v: model.longestStreak, unit: "day best", label: "Longest streak in the past year." },
        ].map((m) => (
          <Reveal key={m.unit} className="border-b border-r border-line p-6 sm:p-8">
            <div className="flex items-baseline gap-2">
              {data ? (
                <CountUp to={m.v} className="metric-value" />
              ) : (
                <span className="metric-value">{loading ? "···" : "—"}</span>
              )}
              <span className="font-data text-sm">{m.unit}</span>
            </div>
            <p className="font-data mt-4 text-xs leading-relaxed">{m.label}</p>
          </Reveal>
        ))}
      </div>

      {tip &&
        createPortal(
          <div
            role="tooltip"
            className="font-data pointer-events-none fixed z-[300] -translate-x-1/2 -translate-y-full whitespace-nowrap border border-line-strong bg-black px-2.5 py-1.5 text-[11px] text-white"
            style={{ left: tip.x, top: tip.y - 8 }}
          >
            {tip.text}
          </div>,
          document.body,
        )}
    </div>
  );
}
