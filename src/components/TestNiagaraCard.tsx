"use client";

import { useEffect, useRef, useState, memo, useCallback } from "react";

type Props = {
  title: string;
  setpointOrd: string;
  zoneTempOrd: string;
  pollMs?: number;
  debounceMs?: number;
};

async function readPoint(pointOrd: string): Promise<number | null> {
  const r = await fetch(
    `/api/niagara/read?point_ord=${encodeURIComponent(pointOrd)}`,
    { cache: "no-store" }
  );
  const data = await r.json();
  if (!r.ok) throw new Error(data?.detail ?? "read failed");

  const v = data?.curVal;
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

async function writePoint(pointOrd: string, value: number) {
  const r = await fetch("/api/niagara/write", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      point_ord: pointOrd,
      value,
      level: 6,
      who: "ui",
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.detail ?? "write failed");
}

const LiveReadout = memo(function LiveReadout({
  zoneTempOrd,
  setpointOrd,
  pollMs,
  onRemoteSetpoint,
}: {
  zoneTempOrd: string;
  setpointOrd: string;
  pollMs: number;
  onRemoteSetpoint?: (sp: number | null) => void;
}) {
  const [zoneTemp, setZoneTemp] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function tick() {
      try {
        const [zt, sp] = await Promise.all([
          readPoint(zoneTempOrd),
          readPoint(setpointOrd),
        ]);
        if (!alive) return;

        setZoneTemp(zt);
        setError(null);
        onRemoteSetpoint?.(sp);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? String(e));
      }
    }

    tick();
    const id = setInterval(tick, pollMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [pollMs, zoneTempOrd, setpointOrd, onRemoteSetpoint]);

  return (
    <>
      <div className="mt-4 border-t border-zinc-800 pt-4 text-sm">
        <div className="flex justify-between py-1">
          <span className="text-zinc-400">Zone Temp</span>
          <span>{zoneTemp ?? "--"}°F</span>
        </div>
      </div>

      {error ? <div className="mt-2 text-xs text-red-400">{error}</div> : null}
    </>
  );
});

export default function TestNiagaraCard({
  title,
  setpointOrd,
  zoneTempOrd,
  pollMs = 2000,
  debounceMs = 600,
}: Props) {
  const [uiSetpoint, setUiSetpoint] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const debounceTimer = useRef<any>(null);
  const lastUserEditAt = useRef<number>(0);

  // Only let remote reads update the UI value when user isn't actively editing
  const handleRemoteSetpoint = useCallback((sp: number | null) => {
  const recentlyEdited = Date.now() - lastUserEditAt.current < 1500;
  if (recentlyEdited) return;
  if (typeof sp === "number" && Number.isFinite(sp)) setUiSetpoint(sp);
}, []);

  function bump(delta: number) {
    const next = uiSetpoint + delta;
    setUiSetpoint(next);
    setError(null);
    lastUserEditAt.current = Date.now();

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
    await writePoint(setpointOrd, next);
    setError(null);
  } catch (e: any) {
    setError(e?.message ?? String(e));
      }
    }, debounceMs);
  }

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <div className="w-[260px] rounded-2xl bg-zinc-900 text-zinc-100 p-5 shadow-lg">
      <div className="text-xs tracking-widest text-zinc-400">
        {title.toUpperCase()}
      </div>

      <div className="mt-3 flex items-start justify-between">
        <div className="text-5xl font-semibold leading-none">{uiSetpoint}°</div>

        <div className="flex flex-col gap-2">
          <button
            className="h-10 w-10 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
            onClick={() => bump(+1)}
            aria-label="increase"
          >
            +
          </button>
          <button
            className="h-10 w-10 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
            onClick={() => bump(-1)}
            aria-label="decrease"
          >
            -
          </button>
        </div>
      </div>

      <LiveReadout
        zoneTempOrd={zoneTempOrd}
        setpointOrd={setpointOrd}
        pollMs={pollMs}
        onRemoteSetpoint={handleRemoteSetpoint}
      />

      <div className="mt-3 text-xs">
        {error ? <div className="mt-1 text-red-400">{error}</div> : null}
      </div>
    </div>
  );
}
