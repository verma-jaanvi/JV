/**
 * Vercel serverless function: GET /api/leetcode
 * Proxies LeetCode's public GraphQL endpoint (browsers can't call it directly — CORS)
 * and returns a compact payload for the homepage heatmap. Cached at the edge for 1 hour.
 */
const USERNAME = "verma-jaanvi";

const QUERY = `
  query ($username: String!) {
    matchedUser(username: $username) {
      submitStatsGlobal { acSubmissionNum { difficulty count } }
      userCalendar { streak totalActiveDays submissionCalendar }
    }
  }
`;

type Res = {
  setHeader: (k: string, v: string) => void;
  status: (c: number) => Res;
  json: (b: unknown) => void;
};

export default async function handler(_req: unknown, res: Res) {
  try {
    const upstream = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: `https://leetcode.com/u/${USERNAME}/`,
        "User-Agent": "Mozilla/5.0 (compatible; portfolio-heatmap/1.0)",
      },
      body: JSON.stringify({ query: QUERY, variables: { username: USERNAME } }),
    });
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`);

    const json = (await upstream.json()) as {
      data?: {
        matchedUser?: {
          submitStatsGlobal?: { acSubmissionNum?: { difficulty: string; count: number }[] };
          userCalendar?: { streak?: number; totalActiveDays?: number; submissionCalendar?: string };
        } | null;
      };
    };
    const user = json.data?.matchedUser;
    if (!user?.userCalendar) {
      res.status(404).json({ error: "not_found" });
      return;
    }

    const ac = user.submitStatsGlobal?.acSubmissionNum ?? [];
    const pick = (d: string) => ac.find((x) => x.difficulty === d)?.count ?? 0;

    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).json({
      username: USERNAME,
      calendar: JSON.parse(user.userCalendar.submissionCalendar || "{}"),
      streak: user.userCalendar.streak ?? 0,
      totalActiveDays: user.userCalendar.totalActiveDays ?? 0,
      solved: { all: pick("All"), easy: pick("Easy"), medium: pick("Medium"), hard: pick("Hard") },
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    res.status(502).json({ error: "upstream_unavailable" });
  }
}
