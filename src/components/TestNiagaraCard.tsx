"use client";

import { useEffect, useRef, useState, memo, useCallback } from "react";

type Props = {
  title: string;
  spInOrd: string;
  spOutOrd: string;
  ModeInOrd: string;
  ModeOutOrd: string;
  FanModeInOrd: string;
  FanModeOutOrd: string;
  TempOutOrd: string;
  RHOutOrd: string;
  DewpointOut: string;
  StatusOutOrd: string;
  pollMs?: number;
  debounceMs?: number;
};

type CurVal =
  | number
  | string
  | {
      value: number | null;
      unit?: string | null;
    };

async function parseResponse(r: Response): Promise<any> {
  const ct = r.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return await r.json();
    } catch {
      return await r.text().catch(() => "");
    }
  }
  return await r.text().catch(() => "");
}

function curValToNumber(v: CurVal): number | null {
  if (v === null || v === undefined) return null;

  if (typeof v === "object") {
    const n = (v as any).value;
    return typeof n === "number" && Number.isFinite(n) ? n : null;
  }

  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function curValToString(v: CurVal): string | null {
  if (v === null || v === undefined) return null;

  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);

  if (typeof v === "object" && "value" in v) {
    const vv = (v as any).value;
    if (vv === null || vv === undefined) return null;
    return String(vv);
  }

  return null;
}

function normalizeEnum<T extends string>(
  raw: string | null,
  options: readonly T[]
): T | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if ((options as readonly string[]).includes(trimmed)) return trimmed as T;

  const lower = trimmed.toLowerCase();
  const hit = options.find((o) => o.toLowerCase() === lower);
  return hit ?? null;
}

async function readRaw(pointOrd: string): Promise<any> {
  const r = await fetch(
    `/api/niagara/read?point_ord=${encodeURIComponent(pointOrd)}`,
    { cache: "no-store" }
  );

  const data = await parseResponse(r);

  if (!r.ok) {
    const msg =
      typeof data === "object" && data && "detail" in data
        ? (data as any).detail
        : String(data);
    throw new Error(msg || "read failed");
  }

  return data;
}

async function readPointNumber(pointOrd: string): Promise<number | null> {
  const data = await readRaw(pointOrd);
  const v: CurVal = (data as any)?.curVal;
  return curValToNumber(v);
}

async function readPointString(pointOrd: string): Promise<string | null> {
  const data = await readRaw(pointOrd);
  const v: CurVal = (data as any)?.curVal;
  return curValToString(v);
}

async function writePoint(pointOrd: string, value: number | string) {
  const r = await fetch("/api/niagara/write", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      point_ord: pointOrd,
      value,
      level: 17,
      who: "ui",
    }),
  });

  const data = await parseResponse(r);

  if (!r.ok) {
    const msg =
      typeof data === "object" && data && "detail" in data
        ? (data as any).detail
        : String(data);
    throw new Error(msg || "write failed");
  }
}

const MODE_OPTIONS = ["Off", "Auto", "Cool", "Heat", "Dry"] as const;
type ModeOption = (typeof MODE_OPTIONS)[number];

const FAN_OPTIONS = ["On", "Auto", "Smart"] as const;
type FanOption = (typeof FAN_OPTIONS)[number];

const STATUS_OPTIONS = [
  "Heating",
  "Cooling",
  "Dry",
  "Fan",
  "Satisfied",
  "Off",
] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

const LiveReadout = memo(function LiveReadout({
  TempOutOrd,
  RHOutOrd,
  DewpointOutOrd,
  spOutOrd,
  ModeOutOrd,
  FanModeOutOrd,
  StatusOutOrd,
  pollMs,
  onRemoteSetpoint,
  onRemoteMode,
  onRemoteFanMode,
  onRemoteStatus,
}: {
  TempOutOrd: string;
  RHOutOrd: string;
  DewpointOutOrd: string;
  spOutOrd: string;
  ModeOutOrd: string;
  FanModeOutOrd: string;
  StatusOutOrd: string;
  pollMs: number;
  onRemoteSetpoint?: (sp: number | null) => void;
  onRemoteMode?: (m: ModeOption | null) => void;
  onRemoteFanMode?: (fm: FanOption | null) => void;
  onRemoteStatus?: (s: StatusOption | null) => void;
}) {
  const [zoneTemp, setZoneTemp] = useState<number | null>(null);
  const [rh, setRh] = useState<number | null>(null);
  const [dewpoint, setDewpoint] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function tick() {
      try {
        const [zt, rhv, dp, sp, modeRaw, fanRaw, statusRaw] =
          await Promise.all([
            readPointNumber(TempOutOrd),
            readPointNumber(RHOutOrd),
            readPointNumber(DewpointOutOrd),
            readPointNumber(spOutOrd),
            readPointString(ModeOutOrd),
            readPointString(FanModeOutOrd),
            readPointString(StatusOutOrd),
          ]);

        if (!alive) return;

        setZoneTemp(zt);
        setRh(rhv);
        setDewpoint(dp);
        setError(null);

        onRemoteSetpoint?.(sp);
        onRemoteMode?.(normalizeEnum(modeRaw, MODE_OPTIONS));
        onRemoteFanMode?.(normalizeEnum(fanRaw, FAN_OPTIONS));
        onRemoteStatus?.(normalizeEnum(statusRaw, STATUS_OPTIONS));
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
  }, [
    pollMs,
    TempOutOrd,
    RHOutOrd,
    DewpointOutOrd,
    spOutOrd,
    ModeOutOrd,
    FanModeOutOrd,
    StatusOutOrd,
    onRemoteSetpoint,
    onRemoteMode,
    onRemoteFanMode,
    onRemoteStatus,
  ]);

  return (
    <>
      <div className="mt-4 border-t border-zinc-800 pt-4 text-sm">
        <div className="flex justify-between py-1">
          <span className="text-zinc-400">Zone Temp</span>
          <span>{zoneTemp?.toFixed(1) ?? "--"}</span>
        </div>

        <div className="flex justify-between py-1">
          <span className="text-zinc-400">RH</span>
          <span>{rh !== null ? `${rh.toFixed(1)}%` : "--"}</span>
        </div>

        <div className="flex justify-between py-1">
          <span className="text-zinc-400">Dewpoint</span>
          <span>{dewpoint?.toFixed(1) ?? "--"}</span>
        </div>
      </div>

      {error ? <div className="mt-2 text-xs text-red-400">{error}</div> : null}
    </>
  );
});

export default function TestNiagaraCard({
  title,
  spInOrd,
  spOutOrd,
  ModeInOrd,
  ModeOutOrd,
  FanModeInOrd,
  FanModeOutOrd,
  TempOutOrd,
  RHOutOrd,
  DewpointOut,
  StatusOutOrd,
  pollMs = 2000,
  debounceMs = 600,
}: Props) {
  const [uiSetpoint, setUiSetpoint] = useState<number>(0);
  const [mode, setMode] = useState<ModeOption>("Auto");
  const [fanmode, setFanMode] = useState<FanOption>("Auto");
  const [status, setStatus] = useState<StatusOption | null>(null);
  const [error, setError] = useState<string | null>(null);

  const spDebounceTimer = useRef<any>(null);
  const modeDebounceTimer = useRef<any>(null);
  const fanDebounceTimer = useRef<any>(null);

  const lastSpEditAt = useRef<number>(0);
  const lastModeEditAt = useRef<number>(0);
  const lastFanEditAt = useRef<number>(0);

  const handleRemoteSetpoint = useCallback((sp: number | null) => {
    const recentlyEdited = Date.now() - lastSpEditAt.current < 1500;
    if (recentlyEdited) return;
    if (typeof sp === "number" && Number.isFinite(sp)) setUiSetpoint(sp);
  }, []);

  const handleRemoteMode = useCallback((m: ModeOption | null) => {
    const recentlyEdited = Date.now() - lastModeEditAt.current < 1500;
    if (recentlyEdited) return;
    if (m) setMode(m);
  }, []);

  const handleRemoteFanMode = useCallback((fm: FanOption | null) => {
    const recentlyEdited = Date.now() - lastFanEditAt.current < 1500;
    if (recentlyEdited) return;
    if (fm) setFanMode(fm);
  }, []);

  const handleRemoteStatus = useCallback((s: StatusOption | null) => {
    setStatus(s);
  }, []);

  function bump(delta: number) {
    const next = uiSetpoint + delta;

    setUiSetpoint(next);
    setError(null);
    lastSpEditAt.current = Date.now();

    if (spDebounceTimer.current) clearTimeout(spDebounceTimer.current);
    spDebounceTimer.current = setTimeout(async () => {
      try {
        await writePoint(spInOrd, next);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    }, debounceMs);
  }

  function chooseMode(next: ModeOption) {
    setMode(next);
    setError(null);
    lastModeEditAt.current = Date.now();

    if (modeDebounceTimer.current) clearTimeout(modeDebounceTimer.current);
    modeDebounceTimer.current = setTimeout(async () => {
      try {
        await writePoint(ModeInOrd, next);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    }, debounceMs);
  }

  function chooseFanMode(next: FanOption) {
    setFanMode(next);
    setError(null);
    lastFanEditAt.current = Date.now();

    if (fanDebounceTimer.current) clearTimeout(fanDebounceTimer.current);
    fanDebounceTimer.current = setTimeout(async () => {
      try {
        await writePoint(FanModeInOrd, next);
        setError(null);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    }, debounceMs);
  }

  useEffect(() => {
    return () => {
      if (spDebounceTimer.current) clearTimeout(spDebounceTimer.current);
      if (modeDebounceTimer.current) clearTimeout(modeDebounceTimer.current);
      if (fanDebounceTimer.current) clearTimeout(fanDebounceTimer.current);
    };
  }, []);

const glowClass =
  status === "Heating"
    ? "ring-2 ring-red-500/70 glow-pulse-red"
    : status === "Cooling"
      ? "ring-2 ring-blue-500/70 glow-pulse-blue"
      : status &&
          (status === "Dry" ||
            status === "Fan" ||
            status === "Satisfied" ||
            status === "Off")
        ? "ring-2 ring-zinc-500/50 glow-pulse-gray"
        : "";

  return (
    <div
      className={`w-[260px] rounded-2xl bg-zinc-900 text-zinc-100 p-5 shadow-lg ${glowClass}`}
    >
      <div className="text-xs tracking-widest text-zinc-400">
        {title.toUpperCase()}
      </div>

      <div className="mt-3 flex items-start justify-between">
        <div className="text-5xl font-semibold leading-none">
          {uiSetpoint.toFixed(1)}°
        </div>

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
        TempOutOrd={TempOutOrd}
        RHOutOrd={RHOutOrd}
        DewpointOutOrd={DewpointOut}
        spOutOrd={spOutOrd}
        ModeOutOrd={ModeOutOrd}
        FanModeOutOrd={FanModeOutOrd}
        StatusOutOrd={StatusOutOrd}
        pollMs={pollMs}
        onRemoteSetpoint={handleRemoteSetpoint}
        onRemoteMode={handleRemoteMode}
        onRemoteFanMode={handleRemoteFanMode}
        onRemoteStatus={handleRemoteStatus}
      />

      <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Mode Control
        </h3>
        <div className="mt-2 flex gap-1">
          {MODE_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => chooseMode(m)}
              className={`flex-1 rounded-md border px-1 py-1.5 text-xs font-medium transition-colors ${
                mode === m
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:active:bg-zinc-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Fan Mode Control
        </h3>
        <div className="mt-2 flex gap-1">
          {FAN_OPTIONS.map((fm) => (
            <button
              key={fm}
              onClick={() => chooseFanMode(fm)}
              className={`flex-1 rounded-md border px-1 py-1.5 text-xs font-medium transition-colors ${
                fanmode === fm
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:active:bg-zinc-700"
              }`}
            >
              {fm}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 text-xs">
        {error ? <div className="mt-1 text-red-400">{error}</div> : null}
      </div>
    </div>
  );
}
