"use client";

import useSWR from "swr";
import { Sparkline } from "./sparkline";
import { SectionHeader } from "./section-header";
import { formatTideHeight, formatTideTime } from "@/lib/format";
import { useHighlight } from "@/lib/highlight-context";
import { SkeletonTideStation } from "./skeleton";
import type { TidesResponse, TidePrediction } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getNextHiLo(hiLo: TidePrediction[]): TidePrediction | null {
  const now = new Date();
  for (const p of hiLo) {
    const eventTime = new Date(p.t.replace(" ", "T"));
    if (eventTime > now) return p;
  }
  return hiLo[hiLo.length - 1] ?? null;
}

function getCurrentHeight(predictions: TidePrediction[]): string | null {
  const now = new Date();
  let closest = predictions[0];
  let closestDiff = Infinity;
  for (const p of predictions) {
    const diff = Math.abs(new Date(p.t.replace(" ", "T")).getTime() - now.getTime());
    if (diff < closestDiff) { closestDiff = diff; closest = p; }
  }
  return closest ? formatTideHeight(closest.v) : null;
}

export function TideStrip() {
  const { hoveredStation, setHoveredStation } = useHighlight();
  const { data, error, isLoading } = useSWR<TidesResponse>(
    "/api/tides",
    fetcher,
    { refreshInterval: 360000 }
  );

  if (error) {
    return (
      <section>
        <SectionHeader>Coastal Tides</SectionHeader>
        <p className="text-sm text-stone-400 mt-3">Unable to load tide data.</p>
      </section>
    );
  }

  if (isLoading || !data) {
    return (
      <section>
        <SectionHeader>Coastal Tides</SectionHeader>
        <div className="mt-4 flex gap-6 overflow-x-auto pb-2">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonTideStation key={i} />)}
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader>Coastal Tides</SectionHeader>
      <div
        className="mt-4 flex gap-6 overflow-x-auto pb-2 pl-2 scroll-smooth"
        style={{
          maskImage: "linear-gradient(to right, black 88%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, black 88%, transparent 100%)",
        }}
      >
        {data.stations.map((station) => {
          const values = station.predictions.map((p) => parseFloat(p.v));
          const next = getNextHiLo(station.hiLo);
          const currentH = getCurrentHeight(station.predictions);
          const isHighlighted = hoveredStation === station.name;

          return (
            <div
              key={station.stationId}
              data-station={station.name}
              className={`flex-shrink-0 min-w-[110px] px-2 py-1.5 -mx-2 -my-1.5 rounded-sm transition-colors duration-150 ${
                isHighlighted ? "bg-white/60" : ""
              }`}
              onMouseEnter={() => setHoveredStation(station.name)}
              onMouseLeave={() => setHoveredStation(null)}
            >
              <div className="text-xs text-stone-500 uppercase tracking-[0.15em]">
                {station.name}
              </div>
              {values.length >= 2 ? (
                <>
                  <div className="mt-1.5 mx-[-2px]">
                    <Sparkline
                      data={values}
                      width={114}
                      height={24}
                      strokeColor="#0284c7"
                      showEndDot
                    />
                  </div>
                  {currentH && (
                    <div className="font-mono tabular-nums text-sm font-semibold text-stone-800 mt-1">
                      {currentH}
                    </div>
                  )}
                  {next && (
                    <div className="text-xs text-stone-400">
                      {next.type === "H" ? "High" : "Low"} {formatTideHeight(next.v)} at {formatTideTime(next.t)}
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-1.5 text-xs text-stone-400 italic">
                  No data
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
