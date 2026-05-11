// Server fn that fetches SoleSearch press mentions live from Firecrawl's
// /search endpoint. Falls back to the curated list if the connector isn't
// linked or the API errors. Cached for 1h via response headers.
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import { SOLESEARCH_PRESS_FALLBACK, type PressItem } from "@/components/portfolio/pressFallback";

const QUERIES = [
  '"SoleSearch" sneakers India',
  '"SoleSearch" Param Minhas',
  '"SoleSearch" CNBC Rannvijay',
];

type FCResult = { url?: string; title?: string; description?: string };

function sourceOf(url: string): string {
  try {
    const h = new URL(url).hostname.replace(/^www\./, "");
    const root = h.split(".").slice(-2, -1)[0] ?? h;
    // Friendly-case the host
    return root === "cnbctv18" ? "CNBC-TV18"
      : root === "yourstory" ? "YourStory"
      : root === "inc42" ? "Inc42"
      : root === "entrepreneur" ? "Entrepreneur"
      : root === "moneycontrol" ? "Moneycontrol"
      : root === "gqindia" || root === "gq" ? "GQ"
      : root === "economictimes" ? "Economic Times"
      : root.charAt(0).toUpperCase() + root.slice(1);
  } catch {
    return "Web";
  }
}

export const getSoleSearchPress = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeaders(new Headers({ "Cache-Control": "public, max-age=3600, s-maxage=3600" }));

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return { items: SOLESEARCH_PRESS_FALLBACK, source: "fallback" as const };
  }

  try {
    const all: PressItem[] = [];
    const seen = new Set<string>();
    for (const q of QUERIES) {
      const res = await fetch("https://api.firecrawl.dev/v2/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: q, limit: 5 }),
      });
      if (!res.ok) continue;
      const json = (await res.json()) as { data?: { web?: FCResult[] } | FCResult[] };
      const list: FCResult[] = Array.isArray(json.data)
        ? json.data
        : (json.data?.web ?? []);
      for (const r of list) {
        if (!r.url || !r.title) continue;
        if (seen.has(r.url)) continue;
        seen.add(r.url);
        all.push({
          title: r.title,
          url: r.url,
          source: sourceOf(r.url),
          snippet: r.description,
        });
        if (all.length >= 8) break;
      }
      if (all.length >= 8) break;
    }
    if (all.length === 0) {
      return { items: SOLESEARCH_PRESS_FALLBACK, source: "fallback" as const };
    }
    return { items: all, source: "live" as const };
  } catch (err) {
    console.error("Firecrawl press fetch failed:", err);
    return { items: SOLESEARCH_PRESS_FALLBACK, source: "fallback" as const };
  }
});
