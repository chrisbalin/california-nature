"use client";

import useSWR from "swr";
import { SectionHeader } from "./section-header";
import { formatNumber } from "@/lib/format";
import { useHighlight } from "@/lib/highlight-context";
import { SkeletonRiverCard } from "./skeleton";
import type { ReservoirsResponse } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/** Bar color based on percent full */
function barColor(pct: number): string {
  if (pct >= 80) return "#0284c7"; // sky-600, healthy
  if (pct >= 50) return "#0d9488"; // teal-600, adequate
  if (pct >= 30) return "#d97706"; // amber-600, watch
  return "#b91c1c"; // red-700, critical
}

export function ReservoirLevels() {
  const { hoveredStation, setHoveredStation } = useHighlight();
  const { data, error, isLoading } = useSWR<ReservoirsResponse>(
    "/api/reservoirs",
    fetcher,
    { refreshInterval: 3600000, errorRetryCount: 3, errorRetryInterval: 5000 }
  );

  if (error) {
    return (
      <section>
        <SectionHeader>Lakes &amp; Reservoirs</SectionHeader>
        <p className="text-sm text-stone-400 mt-3">Unable to load reservoir data.</p>
      </section>
    );
  }

  if (isLoading || !data) {
    return (
      <section>
        <SectionHeader>Lakes &amp; Reservoirs</SectionHeader>
        <p className="text-xs text-stone-400 mt-1">Current storage, acre-feet</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonRiverCard key={i} />)}
        </div>
      </section>
    );
  }

  if (data.reservoirs.length === 0) return null;

  // Sort by capacity (largest first)
  const sorted = [...data.reservoirs].sort((a, b) => b.storageCapacity - a.storageCapacity);

  return (
    <section>
      <SectionHeader>Reservoirs</SectionHeader>
      <p className="text-xs text-stone-400 mt-1">Current storage, acre-feet</p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((res) => {
          const isHighlighted = hoveredStation === res.name;
          const color = barColor(res.percentFull);

          return (
            <div
              key={res.id}
              data-station={res.name}
              className={`py-2.5 px-2 border-b border-stone-100 rounded-sm transition-colors duration-150 ${
                isHighlighted ? "bg-white/60" : ""
              }`}
              onMouseEnter={() => setHoveredStation(res.name)}
              onMouseLeave={() => setHoveredStation(null)}
            >
              <div className="text-xs text-stone-500 uppercase tracking-[0.15em]">
                {res.name}
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-sm font-semibold font-mono tabular-nums text-stone-800">
                  {res.percentFull}%
                </span>
                <span className="text-xs text-stone-400 font-mono tabular-nums">
                  {formatNumber(res.storageCurrent)} AF
                </span>
              </div>
              {/* Storage bar */}
              <div className="mt-1.5 h-1.5 w-full bg-stone-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${res.percentFull}%`,
                    backgroundColor: color,
                    opacity: 0.7,
                  }}
                />
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5 font-mono tabular-nums">
                of {formatNumber(res.storageCapacity)} AF capacity
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
