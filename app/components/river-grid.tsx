"use client";

import { useState } from "react";
import useSWR from "swr";
import { Sparkline } from "./sparkline";
import { SectionHeader } from "./section-header";
import { formatFlow, cToF } from "@/lib/format";
import { useHighlight } from "@/lib/highlight-context";
import { SkeletonRiverCard } from "./skeleton";
import type { RiversResponse } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/** Map water temperature to ecological health color and tooltip */
function tempHealth(tempF: number): { color: string; tooltip: string } {
  if (tempF < 56) {
    return {
      color: "#0369a1", // sky-700
      tooltip: "Cold-water habitat — ideal for salmon, steelhead, and native trout",
    };
  }
  if (tempF < 64) {
    return {
      color: "#0d9488", // teal-600
      tooltip: "Adequate range for most native California fish species",
    };
  }
  if (tempF < 68) {
    return {
      color: "#d97706", // amber-600
      tooltip: "Warm — stress range for salmon and steelhead, approaching limits for Delta Smelt",
    };
  }
  return {
    color: "#b91c1c", // red-700
    tooltip: "Critical — lethal for salmonids, most native cold-water species at risk",
  };
}

function TempAnnotation({ tempC }: { tempC: number }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const tempF = cToF(tempC);
  const { color, tooltip } = tempHealth(tempF);

  return (
    <span
      className="relative inline-block cursor-default"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className="text-xs font-mono tabular-nums"
        style={{ color }}
      >
        {Math.round(tempF)}°F
      </span>
      {showTooltip && (
        <span className="absolute bottom-full right-0 mb-1.5 w-56 bg-white/95 border border-stone-200 px-3 py-2 z-30 pointer-events-none">
          <span className="block font-mono tabular-nums text-sm font-semibold" style={{ color }}>
            {Math.round(tempF)}°F
          </span>
          <span className="block text-xs text-stone-500 leading-relaxed mt-0.5">
            {tooltip}
          </span>
        </span>
      )}
    </span>
  );
}

export function RiverGrid() {
  const { hoveredStation, setHoveredStation } = useHighlight();
  const { data, error, isLoading } = useSWR<RiversResponse>(
    "/api/rivers",
    fetcher,
    { refreshInterval: 900000 }
  );

  if (error) {
    return (
      <section>
        <SectionHeader>Rivers</SectionHeader>
        <p className="text-sm text-stone-400 mt-3">Unable to load river data.</p>
      </section>
    );
  }

  if (isLoading || !data) {
    return (
      <section>
        <SectionHeader>Rivers</SectionHeader>
        <p className="text-xs text-stone-400 mt-1">Current flow, cubic feet per second · 7-day trend</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <SkeletonRiverCard key={i} />)}
        </div>
      </section>
    );
  }

  const sorted = [...data.sites]
    .filter((s) => s.currentFlow !== null && s.discharge.length > 0)
    .sort((a, b) => (b.currentFlow ?? 0) - (a.currentFlow ?? 0));

  const allValues = sorted.flatMap((s) =>
    s.discharge.map((r) => parseFloat(r.value))
  );
  const globalMax = allValues.length > 0 ? Math.max(...allValues) : 1;

  return (
    <section>
      <SectionHeader>Rivers</SectionHeader>
      <p className="text-xs text-stone-400 mt-1">Current flow, cubic feet per second · 7-day trend</p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((site) => {
          const values = site.discharge.map((r) => parseFloat(r.value));
          const step = Math.max(1, Math.floor(values.length / 100));
          const sampled = values.filter((_, i) => i % step === 0);
          const isHighlighted = hoveredStation === site.name;

          const sparkColor = "#0284c7";

          return (
            <div
              key={site.siteId}
              data-station={site.name}
              className={`py-2.5 px-2 border-b border-stone-100 rounded-sm transition-colors duration-150 ${
                isHighlighted ? "bg-white/60" : ""
              }`}
              onMouseEnter={() => setHoveredStation(site.name)}
              onMouseLeave={() => setHoveredStation(null)}
            >
              <div className="text-xs text-stone-500 uppercase tracking-[0.15em]">
                {site.name}
              </div>
              <div className="text-sm font-mono tabular-nums">
                <span className="font-semibold text-stone-800">
                  {site.currentFlow !== null
                    ? formatFlow(site.currentFlow)
                    : "\u2014"}
                </span>
                {site.waterTempC !== null && (
                  <>
                    <span className="text-stone-300"> · </span>
                    <TempAnnotation tempC={site.waterTempC} />
                  </>
                )}
              </div>
              {sampled.length >= 2 && (
                <div className="mt-1.5">
                  <Sparkline
                    data={sampled}
                    width={200}
                    height={20}
                    strokeColor={sparkColor}
                    showEndDot
                    yMin={0}
                    yMax={globalMax}
                    fluid
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
