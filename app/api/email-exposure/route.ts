import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase() ?? "";
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "invalid-email" }, { status: 400 });
  }

  const key = process.env.HIBP_API_KEY;
  if (!key) {
    return NextResponse.json({ available: false, breaches: [] });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        headers: {
          "hibp-api-key": key,
          "User-Agent": "DigitalFootprint-Demo/1.0",
        },
        cache: "no-store",
        signal: controller.signal,
      },
    );
    if (response.status === 404) {
      return NextResponse.json({ available: true, breaches: [] });
    }
    if (!response.ok) {
      return NextResponse.json({ available: false, breaches: [] }, { status: 502 });
    }
    const data = await response.json();
    const breaches = Array.isArray(data)
      ? data.map((entry: Record<string, unknown>) => ({
          name: String(entry.Name ?? ""),
          title: String(entry.Title ?? entry.Name ?? ""),
          date: String(entry.BreachDate ?? ""),
          pwnCount: Number(entry.PwnCount ?? 0),
          dataClasses: Array.isArray(entry.DataClasses) ? entry.DataClasses : [],
        }))
      : [];
    return NextResponse.json({ available: true, breaches });
  } catch {
    return NextResponse.json({ available: false, breaches: [] }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
