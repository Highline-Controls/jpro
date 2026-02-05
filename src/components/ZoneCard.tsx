"use client";

import { useState } from "react";

interface ZoneCardProps {
  title: string;
  unit: string;
  setpoint: number;
  zoneTemp: string;
  humidity: string;
  unitStatus: string;
  supply: string;
}

export default function ZoneCard({
  title,
  unit,
  setpoint,
  zoneTemp,
  humidity,
  unitStatus,
  supply,
}: ZoneCardProps) {
  const [temperature, setTemperature] = useState(setpoint);

  return (
    <div className="flex w-48 flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {title}
      </h2>
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{unit}</p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-4xl font-light text-zinc-900 dark:text-zinc-100">
          {temperature}°
        </span>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setTemperature((t) => t + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-lg text-zinc-600 transition-colors hover:bg-zinc-100 active:bg-zinc-200 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:active:bg-zinc-700"
          >
            +
          </button>
          <button
            onClick={() => setTemperature((t) => t - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-lg text-zinc-600 transition-colors hover:bg-zinc-100 active:bg-zinc-200 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:active:bg-zinc-700"
          >
            -
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400 dark:text-zinc-500">Zone Temp</span>
          <span className="text-zinc-700 dark:text-zinc-300">{zoneTemp}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400 dark:text-zinc-500">Humidity</span>
          <span className="text-zinc-700 dark:text-zinc-300">{humidity}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400 dark:text-zinc-500">Unit Status</span>
          <span className="text-green-600 dark:text-green-400">
            {unitStatus}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-zinc-400 dark:text-zinc-500">Supply</span>
          <span className="text-zinc-700 dark:text-zinc-300">{supply}</span>
        </div>
      </div>
    </div>
  );
}
