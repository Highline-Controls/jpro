"use client";

import { useState } from "react";

export default function ZoneCard() {
  const [temperature, setTemperature] = useState(72);

  return (
    <div className="flex w-48 flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Basement
      </h2>
      <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">HP-1</p>

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

      {/* Space for additional metrics */}
      <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          No additional metrics
        </p>
      </div>
    </div>
  );
}
