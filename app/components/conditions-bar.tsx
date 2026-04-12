"use client";

import useSWR from "swr";
import { formatTemp } from "@/lib/format";
import { SkeletonConditions } from "./skeleton";
import type { WeatherResponse } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ConditionsBar() {
  const { data } = useSWR<WeatherResponse>(
    "/api/weather",
    fetcher,
    { refreshInterval: 1800000 }
  );

  if (!data) return <SkeletonConditions />;

  return (
    <div className="grid grid-cols-4 gap-x-3 text-center mb-4">
      {data.cities.map((city) => (
        <div key={city.city}>
          <div className="text-xs text-stone-500">{city.city}</div>
          <div className="font-mono tabular-nums text-sm text-stone-700">
            {formatTemp(city.temperature)}
          </div>
          <div className="text-xs text-stone-400">{city.condition.toLowerCase()}</div>
        </div>
      ))}
    </div>
  );
}
