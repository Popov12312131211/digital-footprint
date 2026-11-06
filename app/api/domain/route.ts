import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface BreachInfo {
  name: string;
  title: string;
  date: string;
  pwnCount: number;
}

interface BreachCache {
  at: number;
  available: boolean;
  items: BreachInfo[];
}

let breachCache: BreachCache | null = null;
const BREACH_TTL = 60 * 60 * 1000;
const DOMAIN = /^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/i;

async function fetchJson(url: string, timeout = 7000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "User-Agent": "DigitalFootprint-Demo/1.0",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function loadBreaches(): Promise<{ available: boolean; items: BreachInfo[] }> {
  if (breachCache && Date.now() - breachCache.at < BREACH_TTL) {
    return { available: breachCache.available, items: breachCache.items };
  }
  const data = await fetchJson("https://haveibeenpwned.com/api/v3/breaches", 9000);
  if (!Array.isArray(data)) {
    breachCache = { at: Date.now(), available: false, items: [] };
    return { available: false, items: [] };
  }
  const items: BreachInfo[] = data
    .filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null)
    .map((entry) => ({
      name: String(entry.Name ?? ""),
      title: String(entry.Title ?? entry.Name ?? ""),
      date: String(entry.BreachDate ?? ""),
      pwnCount: Number(entry.PwnCount ?? 0),
    }))
    .filter((entry) => entry.name);
  breachCache = { at: Date.now(), available: true, items };
  return { available: true, items };
}

interface DohAnswer {
  type: number;
  data: string;
}

interface DohResponse {
  Status: number;
  Answer?: DohAnswer[];
}

async function lookup(name: string, type: "A" | "AAAA" | "MX") {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`;
  const data = (await fetchJson(url)) as DohResponse | null;
  if (!data?.Answer) return [];
  return data.Answer.map((answer) => answer.data);
}

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("name") ?? "";
  const name = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .replace(/\.$/, "");

  if (!DOMAIN.test(name)) {
    return NextResponse.json({ error: "invalid-domain" }, { status: 400 });
  }

  const [a, aaaa, mx, breaches] = await Promise.all([
    lookup(name, "A"),
    lookup(name, "AAAA"),
    lookup(name, "MX"),
    loadBreaches(),
  ]);

  const addresses = [...a, ...aaaa].filter((value) => value && value !== ".");
  const records = mx.filter(Boolean).map((value) => value.split(" ").pop() ?? value);
  const domainBreaches = breaches.items.filter(
    (entry) => entry.name.toLowerCase() === name || entry.name.toLowerCase().endsWith(`.${name}`),
  );

  return NextResponse.json(
    {
      name,
      ok: addresses.length > 0,
      addresses: Array.from(new Set(addresses)),
      mx: Array.from(new Set(records)),
      breaches: domainBreaches,
      breachesAvailable: breaches.available,
      checkedAt: Date.now(),
      source: "cloudflare-doh",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
