"use client";

import useSWR from "swr";
import { Sparkline, sparklineLabelPadding } from "./sparkline";
import { SectionHeader } from "./section-header";
import { formatNumber } from "@/lib/format";
import type { MigrationResponse } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function MigrationPulse() {
  const { data, error, isLoading } = useSWR<MigrationResponse>(
    "/api/migration",
    fetcher,
    { refreshInterval: 21600000 } // 6 hours
  );

  if (error) {
    return (
      <section>
        <SectionHeader>Migration Pulse</SectionHeader>
        <p className="text-sm text-stone-400 mt-3">Unable to load migration data.</p>
      </section>
    );
  }

  if (isLoading || !data) {
    return (
      <section>
        <SectionHeader>Migration Pulse</SectionHeader>
        <p className="text-sm text-stone-400 mt-3">Loading migration data...</p>
      </section>
    );
  }

  if (data.error || data.stats.length === 0) {
    return (
      <section>
        <SectionHeader>Migration Pulse</SectionHeader>
        <p className="text-sm text-stone-400 mt-3">
          {data.error ?? "No migration data available."}
        </p>
      </section>
    );
  }

  const speciesCounts = data.stats.map((d) => d.numSpecies).filter((n) => n > 0);
  const todaySpecies = data.today?.numSpecies ?? 0;
  const todayChecklists = data.today?.numChecklists ?? 0;
  const todayObservers = data.today?.numContributors ?? 0;

  // Trend: compare today to 7-day avg
  const diff = todaySpecies - data.avg7d;
  const trendText =
    diff > 10
      ? "spring migration is accelerating"
      : diff > 0
        ? "species diversity is rising"
        : diff < -10
          ? "diversity is tapering"
          : "holding steady";

  // Date range labels
  const firstDate = data.stats[0]?.date ?? "";
  const lastDate = data.stats[data.stats.length - 1]?.date ?? "";
  const fmtShort = (d: string) => {
    const dt = new Date(d + "T12:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <section>
      <SectionHeader>Migration Pulse</SectionHeader>
      <div className="mt-3">
        <p className="text-sm text-stone-700">
          <span className="font-mono tabular-nums font-semibold text-stone-800 text-base">
            {formatNumber(todaySpecies)}
          </span>{" "}
          species reported across California today — {trendText}
        </p>

        {speciesCounts.length >= 2 && (
          <div className="mt-3">
            <Sparkline
              data={speciesCounts}
              width={400}
              height={28}
              strokeColor="#44403c"
              strokeWidth={1.5}
              showEndDot
              fluid
            />
            <div className="flex justify-between mt-0.5" style={{ paddingLeft: sparklineLabelPadding(400, true), paddingRight: sparklineLabelPadding(400, true) }}>
              <span className="text-[10px] text-stone-400">{fmtShort(firstDate)}</span>
              <span className="text-[10px] text-stone-400">{fmtShort(lastDate)}</span>
            </div>
          </div>
        )}

        <p className="mt-2 text-xs text-stone-400">
          <span className="font-mono tabular-nums">{formatNumber(todayChecklists)}</span> checklists
          <span className="text-stone-300"> · </span>
          <span className="font-mono tabular-nums">{formatNumber(todayObservers)}</span> observers active
          <span className="text-stone-300"> · </span>
          7-day avg: <span className="font-mono tabular-nums">{formatNumber(data.avg7d)}</span> species
        </p>
      </div>
    </section>
  );
}
