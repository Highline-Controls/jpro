import TestNiagaraCard from "@/components/TestNiagaraCard";
import ZoneCard from "@/components/ZoneCard";
import ThermostatCarousel from "@/components/ThermostatCarousel";
import { SidebarShell } from "@/components/SidebarShell";
import { Site } from "@/components/Sidebar";
import { loadConfig } from "@/lib/config";
import NiagraCard from "@/components/NiagaraCard";
import NiagaraCard from "@/components/NiagaraCard";

export default function Home() {
  const cfg = loadConfig();

  const sites: Site[] = [
    { id: "s1", name: "Echo619" },
    { id: "s2", name: "Office" },
    { id: "s3", name: "Nate's House" },
  ];

  const zones = [
    {
      title: "Basement",
      unit: "HP-1",
      setpoint: 72,
      zoneTemp: "71°F",
      humidity: "45%",
      unitStatus: "Running",
      supply: "85°F",
    },
    {
      title: "West Master Bedroom",
      unit: "HP-6",
      setpoint: 70,
      zoneTemp: "69°F",
      humidity: "41%",
      unitStatus: "Running",
      supply: "83°F",
    },
    {
      title: "Living Room",
      unit: "RTU-2",
      setpoint: 74,
      zoneTemp: "73°F",
      humidity: "38%",
      unitStatus: "Idle",
      supply: "—",
    },
  ];

  return (
    <div className="bg-zinc-50 dark:bg-black h-[100svh] overflow-hidden">
      <SidebarShell sites={sites} initialSelectedSiteId={sites[0].id}>
        <div className="h-[calc(100svh-56px)] md:h-[calc(100svh-64px)] overflow-hidden px-4 py-4">
          
          <ThermostatCarousel>
            <div className="flex justify-center">
            <TestNiagaraCard
              title="Live: Office JACE Tstat"
              spInOrd={cfg.card1.SPIn}
              spOutOrd={cfg.card1.SPOut}
              ModeInOrd={cfg.card1.ModeIn}
              ModeOutOrd={cfg.card1.ModeOut}
              FanModeInOrd={cfg.card1.FanModeIn}
              FanModeOutOrd={cfg.card1.FanModeOut}
              TempOutOrd={cfg.card1.TempOut}
              RHOutOrd={cfg.card1.RHOut}
              DewpointOut={cfg.card1.DewpointOut}
              pollMs={2000}
            />
            </div>

            {/* <div className="flex justify-center">
            <NiagaraCard/>
            </div> */}
            {/* 3 placeholder ZoneCards */}

            
            {zones.map((z) => (
              <div className="flex justify-center">
              <ZoneCard
                key={`${z.unit}-${z.title}`}
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

            {/* 1 real Niagara card */}

          </ThermostatCarousel>
        </div>
      </SidebarShell>
    </div>
  );
}
