"use client";

import * as React from "react";
import { useAuth } from "./providers";

import { SidebarShell } from "@/components/SidebarShell";
import type { Site as SidebarSite } from "@/components/Sidebar";

import ResponsiveThermostatView from "@/components/ResponsiveThermostatView";
import TestNiagaraCard from "@/components/TestNiagaraCard";
import ZoneCard from "@/components/ZoneCard";

type SiteConfigDoc = {
  slug: string;
  name: string;
  folders?: Array<{
    id: string;
    name: string;
    tstats?: Array<{
      id: string;
      name: string;
      points: {
        spIn: string;
        spOut: string;
        modeIn: string;
        modeOut: string;
        fanModeIn: string;
        fanModeOut: string;
        tempOut: string;
        rhOut: string;
        dewpointOut: string;
        statusOut: string;
      };
    }>;
  }>;
};

const FAKE_ZONES = [
  { title: "Basement", unit: "HP-1", setpoint: 72, zoneTemp: "71°F", humidity: "45%", unitStatus: "Running", supply: "85°F" },
  { title: "Gym", unit: "HP-2", setpoint: 68, zoneTemp: "67°F", humidity: "40%", unitStatus: "Running", supply: "82°F" },
  { title: "Sitting Room / Kitchen", unit: "HP-3", setpoint: 70, zoneTemp: "69°F", humidity: "42%", unitStatus: "Running", supply: "84°F" },
  { title: "Family Room / Entrance", unit: "HP-4", setpoint: 71, zoneTemp: "70°F", humidity: "44%", unitStatus: "Running", supply: "83°F" },
  { title: "Andrew's Office", unit: "HP-5", setpoint: 73, zoneTemp: "72°F", humidity: "43%", unitStatus: "Running", supply: "86°F" },
];

async function fetchJson(url: string) {
  const r = await fetch(url, { cache: "no-store", credentials: "include" });
  const ct = r.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await r.json() : await r.text();

  if (!r.ok) {
    const msg =
      typeof data === "object" && data && "error" in data
        ? (data as any).error
        : typeof data === "object" && data && "detail" in data
        ? (data as any).detail
        : String(data);

    throw new Error(msg || `Request failed: ${url}`);
  }

  return data;
}

export default function Page() {
  const { state, logout, login, refresh } = useAuth();

  const sitesForSidebar: SidebarSite[] = React.useMemo(() => {
    if (state.status !== "authed") return [];
    return (state.sites ?? []).map((s) => ({ id: s.slug, name: s.name }));
  }, [state]);

  const [selectedSiteId, setSelectedSiteId] = React.useState<string>("");

  React.useEffect(() => {
    if (!selectedSiteId && sitesForSidebar.length > 0) {
      setSelectedSiteId(sitesForSidebar[0].id);
    }
  }, [selectedSiteId, sitesForSidebar]);

  const [selectedConfig, setSelectedConfig] = React.useState<SiteConfigDoc | null>(null);
  const [loadingCfg, setLoadingCfg] = React.useState(false);
  const [cfgError, setCfgError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (state.status !== "authed") return;
    if (!selectedSiteId) return;

    let alive = true;

    (async () => {
      try {
        setLoadingCfg(true);
        setCfgError(null);

        const cfg = (await fetchJson(`/api/sites/${encodeURIComponent(selectedSiteId)}/config`)) as SiteConfigDoc;

        if (!alive) return;
        setSelectedConfig(cfg);
      } catch (e: any) {
        if (!alive) return;
        setCfgError(e?.message ?? String(e));
        setSelectedConfig(null);
      } finally {
        if (alive) setLoadingCfg(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [state.status, selectedSiteId]);

  const realTstats = React.useMemo(() => {
    if (!selectedConfig?.folders) return [];
    return selectedConfig.folders.flatMap((f) => f.tstats ?? []);
  }, [selectedConfig]);

  if (state.status === "loading") return <div className="p-8">Checking session…</div>;

  if (state.status === "logged_out") {
    return (
      <div className="p-8 space-y-4">
        <div className="text-xl font-semibold">You’re logged out</div>
        <button onClick={login} className="rounded-md bg-black px-4 py-2 text-white">
          Login
        </button>
      </div>
    );
  }

  if (state.status === "forbidden") {
    return (
      <div className="p-8 space-y-4">
        <div className="text-xl font-semibold">Access denied</div>
        <div className="opacity-70">{state.message}</div>
        <div className="flex gap-2">
          <button onClick={logout} className="rounded-md bg-black px-4 py-2 text-white">
            Logout
          </button>
          <button onClick={refresh} className="rounded-md border px-4 py-2">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const initialId = sitesForSidebar[0]?.id ?? "site";

  return (
    <SidebarShell
      sites={sitesForSidebar}
      initialSelectedSiteId={initialId}
      selectedSiteId={selectedSiteId || initialId}
      onSelectSite={(id) => setSelectedSiteId(id)}
      onLogout={logout}
    >
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm opacity-70">Signed in as</div>
            <div className="truncate font-medium">{state.email}</div>
          </div>
        </div>

        <div className="h-[calc(100svh-56px)] md:h-[calc(100svh-64px)] overflow-hidden px-4 py-4">
          {loadingCfg ? (
            <div className="flex h-full items-center justify-center opacity-70">Loading site config…</div>
          ) : cfgError ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-red-500">
                Error: {cfgError}
                <div className="mt-2 text-sm opacity-70">
                  Make sure this works in browser:
                  <span className="ml-2 font-mono">/api/sites/{selectedSiteId}/config</span>
                </div>
              </div>
            </div>
          ) : !selectedConfig ? (
            <div className="flex h-full items-center justify-center opacity-70">No config loaded.</div>
          ) : (
            <ResponsiveThermostatView>
              {realTstats.map((t) => (
                <div key={`real-wrap-${selectedConfig.slug}-${t.id}`} className="flex justify-center">
                  <TestNiagaraCard
                    key={`real-${selectedConfig.slug}-${t.id}`}
                    siteSlug={selectedConfig.slug}
                    title={t.name}
                    spInOrd={t.points.spIn}
                    spOutOrd={t.points.spOut}
                    ModeInOrd={t.points.modeIn}
                    ModeOutOrd={t.points.modeOut}
                    FanModeInOrd={t.points.fanModeIn}
                    FanModeOutOrd={t.points.fanModeOut}
                    TempOutOrd={t.points.tempOut}
                    RHOutOrd={t.points.rhOut}
                    DewpointOut={t.points.dewpointOut}
                    StatusOutOrd={t.points.statusOut}
                  />
                </div>
              ))}

              {FAKE_ZONES.map((z) => (
                <div key={`fake-wrap-${selectedConfig.slug}-${z.unit}-${z.title}`} className="flex justify-center">
                  <ZoneCard
                    key={`fake-${selectedConfig.slug}-${z.unit}-${z.title}`}
                    title={z.title}
                    unit={z.unit}
                    setpoint={z.setpoint}
                    zoneTemp={z.zoneTemp}
                    humidity={z.humidity}
                    unitStatus={z.unitStatus}
                    supply={z.supply}
                  />
                </div>
              ))}
            </ResponsiveThermostatView>
          )}
        </div>
      </div>
    </SidebarShell>
  );
}