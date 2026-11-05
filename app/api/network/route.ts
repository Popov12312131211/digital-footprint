import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const LOOPBACK = /^(::1|127\.|::ffff:127\.|0\.0\.0\.0)/;

/**
 * Reports what the server can see about the caller: the public IP address
 * and, when the hosting platform supplies it, the country.
 *
 * No third-party lookup is made and nothing is stored. On localhost there is
 * no public IP, so the route returns null instead of inventing one.
 */
export async function GET(request: Request) {
  const h = request.headers;
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const raw = forwarded || h.get("x-real-ip") || h.get("cf-connecting-ip") || null;
  const ip = raw && !LOOPBACK.test(raw) ? raw : null;

  const country = h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || null;
  const city = h.get("x-vercel-ip-city");
  let region: string | null = null;
  if (country && country !== "XX") {
    let name = country;
    try {
      name = new Intl.DisplayNames(["en"], { type: "region" }).of(country) ?? country;
    } catch {
      /* keep the code */
    }
    region = city ? `${decodeURIComponent(city)}, ${name}` : name;
  }

  return NextResponse.json(
    { ip, region },
    { headers: { "Cache-Control": "no-store" } },
  );
}
