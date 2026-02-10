import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const point_ord = searchParams.get("point_ord");
  if (!point_ord) return NextResponse.json({ error: "missing point_ord" }, { status: 400 });

  const base = process.env.NIAGARA_GATEWAY_URL!;
  const r = await fetch(`${base}/read?point_ord=${encodeURIComponent(point_ord)}`, { cache: "no-store" });
  const data = await r.json();

  return NextResponse.json(data, { status: r.status });
}
