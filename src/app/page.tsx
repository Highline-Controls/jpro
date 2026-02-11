import Image from "next/image";
import ZoneCard from "@/components/ZoneCard";
import TestNiagaraCard from "@/components/TestNiagaraCard";
import { loadConfig } from "@/lib/config";

const row1 = [
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
    title: "Gym",
    unit: "HP-2",
    setpoint: 68,
    zoneTemp: "67°F",
    humidity: "40%",
    unitStatus: "Running",
    supply: "82°F",
  },
  {
    title: "Sitting Room / Kitchen",
    unit: "HP-3",
    setpoint: 70,
    zoneTemp: "69°F",
    humidity: "42%",
    unitStatus: "Running",
    supply: "84°F",
  },
  {
    title: "Family Room / Entrance",
    unit: "HP-4",
    setpoint: 71,
    zoneTemp: "70°F",
    humidity: "44%",
    unitStatus: "Running",
    supply: "83°F",
  },
  {
    title: "Andrew's Office",
    unit: "HP-5",
    setpoint: 73,
    zoneTemp: "72°F",
    humidity: "43%",
    unitStatus: "Running",
    supply: "86°F",
  },
];

const row2 = [
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
    title: "Nanny Room West",
    unit: "HP-7",
    setpoint: 71,
    zoneTemp: "70°F",
    humidity: "43%",
    unitStatus: "Running",
    supply: "84°F",
  },
  {
    title: "Rachel's Office",
    unit: "HP-8",
    setpoint: 72,
    zoneTemp: "71°F",
    humidity: "44%",
    unitStatus: "Running",
    supply: "85°F",
  },
  {
    title: "Baby Room",
    unit: "HP-9",
    setpoint: 73,
    zoneTemp: "72°F",
    humidity: "46%",
    unitStatus: "Running",
    supply: "86°F",
  },
  {
    title: "Kid's Bedroom",
    unit: "HP-10",
    setpoint: 69,
    zoneTemp: "68°F",
    humidity: "42%",
    unitStatus: "Running",
    supply: "82°F",
  },
];

export default function Home() {

  const cfg = loadConfig();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="w-full bg-teal-500 px-6 py-4">
        <h1 className="text-2xl font-bold text-white">Tstats</h1>
      </div>
      <div className="flex items-start px-6 pt-4">
        <Image
          src="/JP certified Logo.png"
          alt="JP Certified Logo"
          width={360}
          height={360}
        />
        <div className="flex flex-1 justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Contact Us
            </h2>
            <p className="mt-2 text-zinc-700 dark:text-zinc-300">
              Phone: (202)-952-6182
            </p>
            <p className="text-zinc-700 dark:text-zinc-300">
              Email: SPOC@jpcertified.com
            </p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Local Weather
          </h2>
          <p className="mt-2 text-zinc-700 dark:text-zinc-300">Temp: 16 F</p>
          <p className="text-zinc-700 dark:text-zinc-300">Humidity: 35%</p>
          <p className="text-zinc-700 dark:text-zinc-300">Dew Point: -12 F</p>
        </div>
      </div>
      <div className="flex">
        <nav className="w-52 shrink-0 border-r border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Monaco14
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Active Alarms: 4
          </p>
          <ul className="mt-4 flex flex-col gap-1">
            {[
              "Tstats",
              "Tstats 2",
              "Radiant Tstats",
              "HP Overview",
              "Boilers",
              "Boiler Loops",
            ].map((item) => (
              <li key={item}>
                <button
                  className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                    item === "Tstats"
                      ? "bg-teal-500 text-white"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-1 flex-col gap-4 p-8">
          <div className="flex justify-center">
            <TestNiagaraCard
              title="Card 1 (Niagara Test)"
              setpointOrd={cfg.card1.setpoint}
              zoneTempOrd={cfg.card1.ZoneTemp}
              pollMs={2000}
              debounceMs={600}
            />
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {row1.map((zone) => (
              <ZoneCard key={zone.unit} {...zone} />
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {row2.map((zone) => (
              <ZoneCard key={zone.unit} {...zone} />
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <button className="w-1/4 rounded border border-zinc-300 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
              Page 2
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
