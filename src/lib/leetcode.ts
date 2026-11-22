import { LEETCODE } from "../data/site";

export interface LeetCodeData {
  /** unix-seconds (UTC midnight) → submission count */
  calendar: Record<string, number>;
  solved: { all: number; easy: number; medium: number; hard: number } | null;
}

const CACHE_KEY = "jv_leetcode_v1";
const CACHE_MS = 30 * 60 * 1000;

function readCache(): LeetCodeData | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { t, d } = JSON.parse(raw);
    return Date.now() - t < CACHE_MS ? d : null;
  } catch {
    return null;
  }
}
function writeCache(d: LeetCodeData) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d }));
  } catch {
    /* ignore */
  }
}

const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : 0);

function parseCalendar(raw: unknown): Record<string, number> {
  let obj: unknown = raw;
  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (!obj || typeof obj !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) out[k] = num(v);
  return out;
}

async function getJson(url: string, signal?: AbortSignal) {
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  const type = res.headers.get("content-type") || "";
  if (!res.ok || !type.includes("json")) throw new Error(`bad response ${res.status}`);
  return res.json();
}

/** Primary: our own /api/leetcode (Vercel function). Fallback: a public community API. */
export async function fetchLeetCode(signal?: AbortSignal): Promise<LeetCodeData> {
  const cached = readCache();
  if (cached) return cached;

  try {
    const j = await getJson("/api/leetcode", signal);
    if (!j || typeof j.calendar !== "object") throw new Error("bad payload");
    const data: LeetCodeData = {
      calendar: parseCalendar(j.calendar),
      solved: j.solved
        ? { all: num(j.solved.all), easy: num(j.solved.easy), medium: num(j.solved.medium), hard: num(j.solved.hard) }
        : null,
    };
    writeCache(data);
    return data;
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
  }

  // fallback (best-effort; third-party service)
  const base = `https://alfa-leetcode-api.onrender.com/${LEETCODE.username}`;
  const [cal, solved] = await Promise.allSettled([
    getJson(`${base}/calendar`, signal),
    getJson(`${base}/solved`, signal),
  ]);
  if (cal.status !== "fulfilled") throw new Error("LeetCode data unavailable");
  const s = solved.status === "fulfilled" ? solved.value : null;
  const data: LeetCodeData = {
    calendar: parseCalendar(cal.value?.submissionCalendar),
    solved: s
      ? { all: num(s.solvedProblem), easy: num(s.easySolved), medium: num(s.mediumSolved), hard: num(s.hardSolved) }
      : null,
  };
  writeCache(data);
  return data;
}

/* ───────────── heatmap maths (all UTC, matching LeetCode's day buckets) ───────────── */

const DAY = 86_400_000;

export interface Cell {
  ts: number; // ms, UTC midnight
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface HeatmapModel {
  weeks: (Cell | null)[][]; // [week][dayOfWeek 0=Sun] ; null = outside the window
  months: { week: number; label: string }[];
  submissions: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
}

export const levelFor = (n: number): 0 | 1 | 2 | 3 | 4 =>
  n <= 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 2 : n <= 9 ? 3 : 4;

export function buildHeatmap(calendar: Record<string, number>, now = new Date()): HeatmapModel {
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const windowStart = end - 364 * DAY;
  const gridStart = windowStart - new Date(windowStart).getUTCDay() * DAY; // back to Sunday
  const totalWeeks = Math.ceil(((end - gridStart) / DAY + 1) / 7);

  const weeks: (Cell | null)[][] = [];
  const months: { week: number; label: string }[] = [];
  let submissions = 0;
  let activeDays = 0;
  let lastMonth = -1;
  const daily: number[] = [];

  for (let w = 0; w < totalWeeks; w++) {
    const col: (Cell | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const ts = gridStart + (w * 7 + d) * DAY;
      if (ts < windowStart || ts > end) {
        col.push(null);
        continue;
      }
      const count = num(calendar[String(ts / 1000)]);
      col.push({ ts, count, level: levelFor(count) });
      submissions += count;
      if (count > 0) activeDays++;
      daily.push(count);
    }
    // month label: month of the first in-window day of this week, if it changed
    const first = col.find(Boolean) as Cell | undefined;
    if (first) {
      const m = new Date(first.ts).getUTCMonth();
      if (m !== lastMonth) {
        months.push({ week: w, label: new Date(first.ts).toLocaleString("en", { month: "short", timeZone: "UTC" }) });
        lastMonth = m;
      }
    }
    weeks.push(col);
  }

  // streaks (a quiet "today" doesn't break a streak that ran through yesterday)
  let longest = 0;
  let run = 0;
  for (const c of daily) {
    run = c > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let current = 0;
  let i = daily.length - 1;
  if (daily[i] === 0) i--;
  while (i >= 0 && daily[i] > 0) {
    current++;
    i--;
  }

  return { weeks, months, submissions, activeDays, currentStreak: current, longestStreak: longest };
}
