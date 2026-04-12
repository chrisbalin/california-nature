"use client";

import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import { SectionHeader } from "./section-header";
import { formatNumber } from "@/lib/format";
import { useHighlight } from "@/lib/highlight-context";
import { SkeletonLine } from "./skeleton";
import type { MonarchResponse, MonarchMonthCount } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function getStatusText(month: number): string {
  if (month >= 9 && month <= 10) return "monarchs are arriving at coastal overwintering sites";
  if (month === 11 || month <= 1) return "monarchs are overwintering along the California coast";
  if (month >= 2 && month <= 3) return "monarchs are dispersing northward from overwintering sites";
  return "monarchs are breeding and dispersing across California";
}

/** Interactive sparkline with per-month hover zones */
function MonarchSparkline({
  months,
  hoveredIndex,
  onHover,
  onLeave,
}: {
  months: MonarchMonthCount[];
  hoveredIndex: number | null;
  onHover: (index: number) => void;
  onLeave: () => void;
}) {
  const counts = months.map((m) => m.count);
  const max = Math.max(...counts, 1);
  const height = 44;
  const padX = 3;
  const padY = 2;
  const plotW = 100 - padX * 2; // percentage-based
  const plotH = height - padY * 2;
  const stepX = plotW / (counts.length - 1);

  const points = counts.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + plotH - (v / max) * plotH;
    return { x, y };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const lastPoint = points[points.length - 1];

  return (
    <div className="relative" style={{ height }}>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height }}
        aria-hidden="true"
      >
        <polyline
          points={polyline}
          fill="none"
          stroke="#fb923c"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* End dot — hides when hovering another month */}
      <div
        style={{
          position: "absolute",
          left: `${lastPoint.x}%`,
          top: lastPoint.y,
          width: 5,
          height: 5,
          borderRadius: "50%",
          backgroundColor: "#fb923c",
          transform: "translate(-50%, -50%)",
          opacity: hoveredIndex !== null ? 0 : 1,
          transition: "opacity 150ms ease",
        }}
      />
      {/* Hover indicator — always rendered, transitions position */}
      <div
        style={{
          position: "absolute",
          left: `${points[hoveredIndex ?? points.length - 1].x}%`,
          top: points[hoveredIndex ?? points.length - 1].y,
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: "#ea580c",
          border: "1.5px solid white",
          transform: "translate(-50%, -50%)",
          zIndex: 2,
          opacity: hoveredIndex !== null ? 1 : 0,
          transition: "left 200ms ease-out, top 200ms ease-out, opacity 150ms ease",
        }}
      />
      {/* Hover zones handled by parent container */}
      <div className="absolute inset-0 flex pointer-events-none">
        {months.map((_, i) => (
          <div key={i} className="flex-1" />
        ))}
      </div>
    </div>
  );
}

export function MonarchMigration() {
  const { setFocusedSpecies } = useHighlight();
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const { data, error, isLoading } = useSWR<MonarchResponse>(
    "/api/monarchs",
    fetcher,
    { refreshInterval: 3600000, errorRetryCount: 3, errorRetryInterval: 5000 }
  );

  function handleMonthHover(index: number) {
    setHoveredMonth(index);
    if (!data) return;
    const month = data.monthlyCounts[index];
    if (!month || month.observations.length === 0) return;
    setFocusedSpecies({
      label: `${month.label} — ${formatNumber(month.count)} obs`,
      color: "#fb923c",
      observations: month.observations,
    });
  }

  function handleMonthLeave() {
    setHoveredMonth(null);
    setFocusedSpecies(null);
  }

  if (error) {
    return (
      <section>
        <SectionHeader>Monarch Migration</SectionHeader>
        <p className="text-sm text-stone-400 mt-3">Unable to load monarch data.</p>
      </section>
    );
  }

  if (isLoading || !data) {
    return (
      <section>
        <SectionHeader>Monarch Migration</SectionHeader>
        <div className="mt-4 flex items-start gap-4">
          <div className="w-[60px] h-[60px] bg-stone-200/50 rounded-sm animate-pulse flex-shrink-0" />
          <div className="space-y-1.5">
            <SkeletonLine width="w-32" />
            <SkeletonLine width="w-24" />
          </div>
        </div>
        <div className="mt-5 w-full h-[44px] bg-stone-200/50 rounded-sm animate-pulse" />
      </section>
    );
  }

  const currentMonth = new Date().getMonth();
  const statusText = getStatusText(currentMonth);

  const weekDiff = data.thisWeekCount - data.lastYearSameWeekCount;
  const weekPct = data.lastYearSameWeekCount > 0
    ? Math.round((weekDiff / data.lastYearSameWeekCount) * 100)
    : null;

  const activeMonth = hoveredMonth !== null ? data.monthlyCounts[hoveredMonth] : null;

  return (
    <section>
      <SectionHeader>Monarch Migration</SectionHeader>

      <div className="mt-4 flex items-start gap-4">
        <Image
          src="/illustrations/butterflies/monarch.png"
          alt="Monarch butterfly"
          width={60}
          height={60}
          className="flex-shrink-0 object-contain illustration-diecut"
        />
        <div>
          <div className="text-sm italic text-stone-800">Danaus plexippus</div>
          <div className="text-sm text-stone-700">Western Monarch</div>
        </div>
      </div>

      {/* 12-month interactive sparkline + labels as one hover zone */}
      {data.monthlyCounts?.length >= 2 && (
        <div className="mt-5 relative" onMouseLeave={handleMonthLeave}>
          {/* Sparkline */}
          <MonarchSparkline
            months={data.monthlyCounts}
            hoveredIndex={hoveredMonth}
            onHover={handleMonthHover}
            onLeave={handleMonthLeave}
          />
          {/* Month labels — positioned at exact sparkline data point percentages */}
          <div className="relative mt-1 h-4">
            {data.monthlyCounts.map((m, i) => {
              const isActive = hoveredMonth === i;
              const isCurrent = i === data.monthlyCounts.length - 1;
              const padX = 3;
              const plotW = 100 - padX * 2;
              const stepX = plotW / (data.monthlyCounts.length - 1);
              const x = padX + i * stepX;
              return (
                <span
                  key={m.month}
                  className={`absolute text-[10px] -translate-x-1/2 ${
                    isActive
                      ? "text-orange-600 font-semibold"
                      : isCurrent
                        ? "text-stone-700 font-semibold"
                        : "text-stone-400"
                  }`}
                  style={{ left: `${x}%` }}
                >
                  {m.label}
                </span>
              );
            })}
          </div>
          {/* Full-height hover columns spanning sparkline + labels */}
          <div className="absolute inset-0 flex" style={{ zIndex: 3 }}>
            {data.monthlyCounts.map((_, i) => (
              <div
                key={i}
                className="flex-1 cursor-default"
                onMouseEnter={() => handleMonthHover(i)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Status text — fixed height to prevent layout shift */}
      <div className="mt-4 h-6 overflow-hidden">
        {activeMonth ? (
          <p className="text-sm text-stone-600">
            <span className="font-mono tabular-nums font-semibold text-orange-600">
              {formatNumber(activeMonth.count)}
            </span>{" "}
            observations in {activeMonth.label}
          </p>
        ) : (
          <p className="text-sm text-stone-600">
            <span className="font-mono tabular-nums font-semibold text-stone-800">
              {formatNumber(data.currentMonthCount ?? 0)}
            </span>{" "}
            observations this month — {statusText}
          </p>
        )}
      </div>

      {/* Year-over-year */}
      <p className="mt-1 text-xs text-stone-400">
        This week:{" "}
        <span className="font-mono tabular-nums text-stone-600">
          {formatNumber(data.thisWeekCount ?? 0)}
        </span>{" "}
        obs
        <span className="text-stone-300"> · </span>
        Same week last year:{" "}
        <span className="font-mono tabular-nums text-stone-600">
          {formatNumber(data.lastYearSameWeekCount ?? 0)}
        </span>{" "}
        obs
        {weekPct !== null && (
          <span className={weekDiff >= 0 ? "text-green-700" : "text-amber-600"}>
            {" "}({weekDiff >= 0 ? "+" : ""}{weekPct}%)
          </span>
        )}
      </p>
    </section>
  );
}
