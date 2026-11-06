import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PREFIX = /^[0-9a-fA-F]{5}$/;

export async function GET(request: Request) {
  const prefix = new URL(request.url).searchParams.get("prefix")?.toUpperCase() ?? "";
  if (!PREFIX.test(prefix)) {
    return NextResponse.json({ error: "invalid-prefix" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        "Add-Padding": "true",
        "User-Agent": "DigitalFootprint-Demo/1.0",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) {
      return NextResponse.json({ error: "upstream-unavailable" }, { status: 502 });
    }
    const text = await response.text();
    return new NextResponse(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "upstream-unavailable" }, { status: 502 });
  }
}
