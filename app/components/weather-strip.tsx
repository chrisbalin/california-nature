"use client";

import useSWR from "swr";
import { SectionHeader } from "./section-header";
import { formatTemp } from "@/lib/format";
import type { WeatherResponse } from "@/lib/types";
import { WEATHER_CITIES } from "@/lib/stations";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function WeatherStrip() {
  const { data, error, isLoading } = useSWR<WeatherResponse>(
    "/api/weather",
    fetcher,
    { refreshInterval: 1800000 }
  );

  if (error) {
    return (
      <section>
        <SectionHeader>Conditions</SectionHeader>
        <p className="text-sm text-stone-400 mt-3">Unable to load weather.</p>
      </section>
    );
  }

  if (isLoading || !data) {
    return (
      <section>
        <SectionHeader>Conditions</SectionHeader>
        <p className="text-sm text-stone-400 mt-3">Loading conditions...</p>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader>Conditions</SectionHeader>
      <div className="mt-3 space-y-1">
        {data.cities.map((city, i) => {
          const precip = city.weeklyPrecipIn;
          const precipStr = precip > 0
            ? `${precip < 0.1 ? "<0.1" : precip.toFixed(1)}\u2033 this week`
            : "0.0\u2033 this week";

          return (
            <p key={city.city} className="text-sm text-stone-600">
              {WEATHER_CITIES[i]?.fullName ?? city.city}, {city.condition.toLowerCase()},{" "}
              <span className="font-mono tabular-nums font-semibold text-stone-800">
                {formatTemp(city.temperature)}
              </span>
              <span className="text-stone-300"> · </span>
              <span className="text-xs text-stone-400 font-mono tabular-nums">
                {precipStr}
              </span>
            </p>
          );
        })}
      </div>
    </section>
  );
}
