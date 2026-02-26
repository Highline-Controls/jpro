import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime (not edge)

export async function GET() {
  const bffBase = process.env.BFF_BASE_URL;
  const clientId = process.env.CF_ACCESS_CLIENT_ID;
  const clientSecret = process.env.CF_ACCESS_CLIENT_SECRET;

  if (!bffBase || !clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Server misconfigured: missing BFF_BASE_URL / CF_ACCESS_* env vars" },
      { status: 500 }
    );
  }

  const upstream = await fetch(`${bffBase}/api/sites`, {
    method: "GET",
    headers: {
      "CF-Access-Client-Id": clientId,
      "CF-Access-Client-Secret": clientSecret,
      "Accept": "application/json",
    },
    cache: "no-store",
  });

  const contentType = upstream.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!isJson) {
    const text = await upstream.text();
    return NextResponse.json(
      {
        error: "Upstream did not return JSON",
        status: upstream.status,
        contentType,
        preview: text.slice(0, 300),
      },
      { status: 502 }
    );
  }

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}