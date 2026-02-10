import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const base = process.env.NIAGARA_GATEWAY_URL!;
  const r = await fetch(`${base}/write`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await r.json().catch(() => ({}));
  return NextResponse.json(data, { status: r.status });
}
