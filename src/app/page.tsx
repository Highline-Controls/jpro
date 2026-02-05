import ZoneCard from "@/components/ZoneCard";

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

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-8 dark:bg-black">
      <div className="flex flex-wrap justify-center gap-4">
        {zones.map((zone) => (
          <ZoneCard key={zone.unit} {...zone} />
        ))}
      </div>
    </div>
  );
}
