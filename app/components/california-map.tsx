"use client";

import { useRef, useState } from "react";
import useSWR from "swr";
import { TIDE_STATIONS, RIVER_SITES } from "@/lib/stations";
import { useHighlight } from "@/lib/highlight-context";
import { formatTideHeight, formatTideTime, formatNumber } from "@/lib/format";
import type { TidesResponse, TidePrediction, RiversResponse, MonarchResponse, CetaceansResponse } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ────────────────── Geo data ──────────────────

const CA_BOUNDARY: [number, number][] = [
  [-123.233256,42.006186],[-122.378853,42.011663],[-121.037003,41.995232],
  [-120.001861,41.995232],[-119.996384,40.264519],[-120.001861,38.999346],
  [-118.71478,38.101128],[-117.498899,37.21934],[-116.540435,36.501861],
  [-115.85034,35.970598],[-114.634459,35.00118],[-114.634459,34.87521],
  [-114.470151,34.710902],[-114.333228,34.448009],[-114.136058,34.305608],
  [-114.256551,34.174162],[-114.415382,34.108438],[-114.535874,33.933176],
  [-114.497536,33.697668],[-114.524921,33.54979],[-114.727567,33.40739],
  [-114.661844,33.034958],[-114.524921,33.029481],[-114.470151,32.843265],
  [-114.524921,32.755634],[-114.72209,32.717295],[-116.04751,32.624187],
  [-117.126467,32.536556],[-117.24696,32.668003],[-117.252437,32.876127],
  [-117.329114,33.122589],[-117.471515,33.297851],[-117.7837,33.538836],
  [-118.183517,33.763391],[-118.260194,33.703145],[-118.413548,33.741483],
  [-118.391641,33.840068],[-118.566903,34.042715],[-118.802411,33.998899],
  [-119.218659,34.146777],[-119.278905,34.26727],[-119.558229,34.415147],
  [-119.875891,34.40967],[-120.138784,34.475393],[-120.472878,34.448009],
  [-120.64814,34.579455],[-120.609801,34.858779],[-120.670048,34.902595],
  [-120.631709,35.099764],[-120.894602,35.247642],[-120.905556,35.450289],
  [-121.004141,35.461243],[-121.168449,35.636505],[-121.283465,35.674843],
  [-121.332757,35.784382],[-121.716143,36.195153],[-121.896882,36.315645],
  [-121.935221,36.638785],[-121.858544,36.6114],[-121.787344,36.803093],
  [-121.929744,36.978355],[-122.105006,36.956447],[-122.335038,37.115279],
  [-122.417192,37.241248],[-122.400761,37.361741],[-122.515777,37.520572],
  [-122.515777,37.783465],[-122.329561,37.783465],[-122.406238,38.15042],
  [-122.488392,38.112082],[-122.504823,37.931343],[-122.701993,37.893004],
  [-122.937501,38.029928],[-122.97584,38.265436],[-123.129194,38.451652],
  [-123.331841,38.566668],[-123.44138,38.698114],[-123.737134,38.95553],
  [-123.687842,39.032208],[-123.824765,39.366301],[-123.764519,39.552517],
  [-123.85215,39.831841],[-124.109566,40.105688],[-124.361506,40.259042],
  [-124.410798,40.439781],[-124.158859,40.877937],[-124.109566,41.025814],
  [-124.158859,41.14083],[-124.065751,41.442061],[-124.147905,41.715908],
  [-124.257444,41.781632],[-124.213628,42.000709],[-123.233256,42.006186],
];

// All 7 river paths — simplified geographic courses
const RIVER_PATHS: Record<string, [number, number][]> = {
  // Sacramento: headwaters near Shasta → Delta → Carquinez Strait
  "11377100": [
    [-122.38,40.59],[-122.37,40.43],[-122.19,40.29],[-122.24,40.08],
    [-122.21,39.76],[-122.10,39.52],[-121.96,39.29],[-121.85,39.13],
    [-121.74,38.97],[-121.60,38.75],[-121.52,38.58],[-121.50,38.42],
    [-121.52,38.28],[-121.62,38.05],[-121.80,38.04],[-122.00,38.04],[-122.20,38.06],
  ],
  // San Joaquin: Sierra headwaters → Delta → merges with Sacramento
  "11303500": [
    [-118.98,37.60],[-119.18,37.50],[-119.38,37.30],[-119.60,37.12],
    [-119.82,36.98],[-120.10,36.85],[-120.35,36.92],[-120.55,37.02],
    [-120.72,37.18],[-120.88,37.35],[-121.05,37.52],[-121.27,37.68],
    [-121.52,38.02],[-121.62,38.05],[-121.80,38.04],[-122.00,38.04],[-122.20,38.06],
  ],
  // American: Sierra foothills → Sacramento
  "11446500": [
    [-120.73,39.05],[-120.90,38.95],[-121.02,38.85],[-121.10,38.75],
    [-121.23,38.63],[-121.42,38.60],[-121.52,38.58],
  ],
  // Russian: inland Mendocino → Pacific at Jenner
  "11463000": [
    [-123.05,39.18],[-122.98,39.00],[-122.90,38.78],[-122.87,38.62],
    [-122.93,38.51],[-123.00,38.46],[-123.10,38.44],
  ],
  // Klamath: near OR border → Pacific coast
  "11523200": [
    [-121.80,42.00],[-122.30,41.85],[-122.70,41.70],[-123.10,41.50],
    [-123.53,41.30],[-123.80,41.40],[-124.03,41.52],
  ],
  // Kern: Sierra Nevada → Bakersfield area
  "11186000": [
    [-118.20,36.50],[-118.30,36.20],[-118.42,35.75],[-118.55,35.50],
    [-118.75,35.35],[-118.95,35.25],
  ],
  // Salinas: Paso Robles → Monterey Bay (flows north)
  "11158600": [
    [-120.60,35.60],[-120.80,35.85],[-121.00,36.05],[-121.20,36.25],
    [-121.40,36.45],[-121.52,36.56],[-121.70,36.70],[-121.80,36.75],
  ],
  // Eel: inland Mendocino/Humboldt → Pacific near Ferndale
  "11477000": [
    [-122.90,39.60],[-123.10,39.70],[-123.30,39.80],[-123.40,40.00],
    [-123.50,40.18],[-123.63,40.22],[-123.80,40.35],[-124.00,40.45],
    [-124.10,40.49],[-124.25,40.60],
  ],
  // Los Angeles: San Fernando Valley → Long Beach
  "11092450": [
    [-118.47,34.25],[-118.45,34.16],[-118.40,34.10],[-118.30,34.05],
    [-118.22,34.00],[-118.18,33.95],[-118.18,33.88],[-118.20,33.82],
    [-118.22,33.77],
  ],
  // Santa Ana: San Bernardino Mtns → coast near Huntington Beach
  "11074000": [
    [-117.10,34.11],[-117.30,34.07],[-117.45,34.00],[-117.65,33.88],
    [-117.80,33.83],[-117.90,33.77],[-117.95,33.70],[-117.97,33.64],
  ],
  // Santa Clara: near Castaic → Ventura coast
  "11109000": [
    [-118.60,34.50],[-118.65,34.43],[-118.74,34.40],[-118.85,34.38],
    [-118.95,34.35],[-119.05,34.32],[-119.18,34.28],[-119.28,34.27],
  ],
};

// ────────────────── Projection ──────────────────


const BOUNDS = { minLng: -124.55, maxLng: -113.9, minLat: 32.4, maxLat: 42.15 };
const PAD = { left: 78, right: 16, top: 16, bottom: 20 };
const SVG_W = 460;
const SVG_H = 540;

function project(lng: number, lat: number): [number, number] {
  const x = PAD.left + ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * (SVG_W - PAD.left - PAD.right);
  const y = PAD.top + ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * (SVG_H - PAD.top - PAD.bottom);
  return [x, y];
}

function toOutlinePath(coords: [number, number][]): string {
  return coords.map(([lng, lat], i) => {
    const [x, y] = project(lng, lat);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + " Z";
}

function toPolyline(coords: [number, number][]): string {
  return coords.map(([lng, lat], i) => {
    const [x, y] = project(lng, lat);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

// ────────────────── Scaling ──────────────────

function flowToStroke(cfs: number | null, maxCfs: number): number {
  if (cfs === null || cfs <= 0) return 0.8;
  const logMax = Math.log10(Math.max(maxCfs, 100));
  const t = Math.log10(Math.max(cfs, 1)) / logMax;
  return 0.8 + t * 3.2;
}

function flowToDotRadius(cfs: number | null, maxCfs: number): number {
  if (cfs === null || cfs <= 0) return 2;
  const logMax = Math.log10(Math.max(maxCfs, 100));
  const t = Math.log10(Math.max(cfs, 1)) / logMax;
  return 2 + t * 3;
}

function tideToDotRadius(height: number, minH: number, maxH: number): number {
  const t = (height - minH) / (maxH - minH || 1);
  return 4 + t * 5;
}

function flowColor(): string {
  return "#0284c7";
}

// ────────────────── Label positions (leader lines) ──────────────────

type Anchor = "start" | "end";
interface LabelSpec { lx: number; ly: number; anchor: Anchor }

const TIDE_LABELS: Record<string, LabelSpec> = {
  "Humboldt":      { lx:  14, ly: -10, anchor: "start" },   // RIGHT side — plenty of room inland
  "Pt Reyes":      { lx: -48, ly: -20, anchor: "end" },     // far left + up, clear of Bay cluster
  "San Francisco": { lx: -48, ly:  -4, anchor: "end" },     // far left, inline
  "Alameda":       { lx: -48, ly:  12, anchor: "end" },     // left + down, offshore
  "Monterey":      { lx: -44, ly:  -6, anchor: "end" },     // left, clear of Salinas
  "Santa Barbara": { lx: -20, ly:  10, anchor: "end" },     // down-right, closer to LA
  "Los Angeles":   { lx: -34, ly:  10, anchor: "end" },     // down-left
  "La Jolla":      { lx:  14, ly:   0, anchor: "start" },   // right
};

const RIVER_LABELS: Record<string, LabelSpec> = {
  "Sacramento River":  { lx:  16, ly:   6, anchor: "start" },   // pushed down, clear of border
  "San Joaquin River": { lx:  16, ly:  14, anchor: "start" },
  "Russian River":     { lx: -38, ly: -14, anchor: "end" },
  "Klamath River":     { lx:  16, ly:  -6, anchor: "start" },
  "Kern River":        { lx:  16, ly:   6, anchor: "start" },
  "American River":    { lx:  16, ly:  16, anchor: "start" },  // well below border
  "Salinas River":     { lx:  16, ly:  14, anchor: "start" },
  "Eel River":         { lx: -38, ly:   6, anchor: "end" },    // left, north coast
  "Los Angeles River": { lx:  16, ly:  -6, anchor: "start" },
  "Santa Ana River":   { lx:  16, ly:   8, anchor: "start" },
  "Santa Clara River": { lx: -34, ly:  -8, anchor: "end" },    // left, above SB
};

// ────────────────── Tooltip ──────────────────

interface TooltipData { name: string; line1: string; line2: string }

function getNextHiLo(hiLo: TidePrediction[]): TidePrediction | null {
  const now = new Date();
  for (const p of hiLo) {
    if (new Date(p.t.replace(" ", "T")) > now) return p;
  }
  return hiLo[hiLo.length - 1] ?? null;
}

// ────────────────── Component ──────────────────

export function CaliforniaMap() {
  const { hoveredStation, setHoveredStation, highlightLevel, focusedSpecies } = useHighlight();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);

  const { data: tidesData } = useSWR<TidesResponse>("/api/tides", fetcher, { refreshInterval: 360000 });
  const { data: riversData } = useSWR<RiversResponse>("/api/rivers", fetcher, { refreshInterval: 900000 });
  const { data: monarchData } = useSWR<MonarchResponse>("/api/monarchs", fetcher, { refreshInterval: 3600000 });
  const { data: cetaceanData } = useSWR<CetaceansResponse>("/api/cetaceans", fetcher, { refreshInterval: 3600000 });

  const outlinePath = toOutlinePath(CA_BOUNDARY);
  const maxCfs = riversData ? Math.max(...riversData.sites.map((s) => s.currentFlow ?? 0), 1) : 1;

  // River flow lookup
  const riverFlowMap = new Map<string, {
    currentFlow: number | null; avgFlow: number | null;
    color: string; stroke: number; trend: string;
  }>();
  if (riversData) {
    for (const site of riversData.sites) {
      const values = site.discharge.map((r) => parseFloat(r.value)).filter((v) => v >= 0);
      const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
      const color = flowColor();
      const stroke = flowToStroke(site.currentFlow, maxCfs);
      const trend = site.currentFlow !== null && avg !== null
        ? (site.currentFlow >= avg ? "above" : "below") : "—";
      riverFlowMap.set(site.siteId, { currentFlow: site.currentFlow, avgFlow: avg, color, stroke, trend });
    }
  }

  // Current tide heights
  const tideHeightMap = new Map<string, number>();
  let tideMinH = Infinity;
  let tideMaxH = -Infinity;
  if (tidesData) {
    const now = new Date();
    for (const station of tidesData.stations) {
      let closest = station.predictions[0];
      let closestDiff = Infinity;
      for (const p of station.predictions) {
        const diff = Math.abs(new Date(p.t.replace(" ", "T")).getTime() - now.getTime());
        if (diff < closestDiff) { closestDiff = diff; closest = p; }
      }
      if (closest) {
        const h = parseFloat(closest.v);
        tideHeightMap.set(station.stationId, h);
        if (h < tideMinH) tideMinH = h;
        if (h > tideMaxH) tideMaxH = h;
      }
    }
  }
  if (!isFinite(tideMinH)) { tideMinH = 0; tideMaxH = 2; }

  // ── Helpers ──

  function handleMouseMove(e: React.MouseEvent) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function showTideTooltip(name: string) {
    setHoveredStation(name);
    const station = tidesData?.stations.find((s) => s.name === name);
    if (!station) { setTooltipData({ name, line1: "—", line2: "" }); return; }
    const h = tideHeightMap.get(station.stationId);
    const next = getNextHiLo(station.hiLo);
    setTooltipData({
      name,
      line1: h !== undefined ? `${formatTideHeight(h.toString())} now` : "—",
      line2: next ? `Next ${next.type === "H" ? "high" : "low"} ${formatTideHeight(next.v)} at ${formatTideTime(next.t)}` : "",
    });
  }

  function showRiverTooltip(name: string) {
    setHoveredStation(name);
    const site = riversData?.sites.find((s) => s.name === name);
    if (!site) { setTooltipData({ name, line1: "—", line2: "" }); return; }
    const flow = riverFlowMap.get(site.siteId);
    setTooltipData({
      name,
      line1: site.currentFlow !== null ? `${formatNumber(Math.round(site.currentFlow))} cfs` : "No data",
      line2: flow?.trend === "above" ? "Above 7-day average" : flow?.trend === "below" ? "Below 7-day average" : "",
    });
  }

  function hideTooltip() { setHoveredStation(null); setTooltipData(null); }

  /** Opacity for a map element based on hover + scroll proximity */
  function stationOpacity(name: string, base: number): number {
    const level = highlightLevel(name);
    if (level === "hover") return Math.min(base + 0.35, 1);
    if (level === "proximity") return Math.min(base + 0.15, 0.85);
    return base;
  }

  return (
    <div ref={containerRef} className="w-full relative" onMouseMove={handleMouseMove}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-auto"
        aria-label="Map of California showing current tide heights and river discharge"
        role="img"
      >
        <defs>
          <style>{`
            @media (prefers-reduced-motion: no-preference) {
              .tide-pulse { animation: tide-breathe 5s ease-in-out infinite; }
              .river-flow { animation: river-dash 4s linear infinite; }
            }
            @keyframes tide-breathe {
              0%, 100% { transform: scale(1); opacity: 0.55; }
              50% { transform: scale(1.3); opacity: 0.8; }
            }
            @keyframes river-dash {
              to { stroke-dashoffset: -15; }
            }
          `}</style>
        </defs>

        {/* State outline */}
        <path
          d={outlinePath}
          fill="#f5f5f4" stroke="#44403c" strokeWidth="1.5"
          strokeLinejoin="round" strokeLinecap="round"
        />

        {/* All 7 river lines — flow-encoded width + color, dashed flow animation */}
        {RIVER_SITES.map((site) => {
          const coords = RIVER_PATHS[site.id];
          if (!coords) return null;
          const flow = riverFlowMap.get(site.id);
          if (flow?.currentFlow === null || flow?.currentFlow === undefined) return null;
          const stroke = flow?.stroke ?? 1;
          const color = flow?.color ?? "#0284c7";
          const level = highlightLevel(site.name);
          const isHovered = level === "hover";
          const opacity = stationOpacity(site.name, 0.5);

          const d = toPolyline(coords);
          return (
            <g key={site.id}>
              {/* Invisible wide hit area for easier hover targeting */}
              <path
                d={d}
                fill="none"
                stroke="transparent"
                strokeWidth={Math.max(stroke + 14, 16)}
                strokeLinecap="round" strokeLinejoin="round"
                onMouseEnter={() => showRiverTooltip(site.name)}
                onMouseLeave={hideTooltip}
                style={{ cursor: "default" }}
              />
              {/* Visible river line */}
              <path
                d={d}
                fill="none"
                stroke={isHovered ? "#0ea5e9" : color}
                strokeWidth={isHovered ? stroke + 1 : stroke}
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="10 5"
                opacity={opacity}
                className="river-flow transition-all duration-300"
                pointerEvents="none"
              />
            </g>
          );
        })}

        {/* Tide station dots — sized by water level, pulse animation */}
        {TIDE_STATIONS.map((s, i) => {
          const [x, y] = project(s.lng, s.lat);
          const h = tideHeightMap.get(s.id);
          const r = h !== undefined ? tideToDotRadius(h, tideMinH, tideMaxH) : 4;
          const level = highlightLevel(s.name);
          const isHovered = level === "hover";
          const opacity = stationOpacity(s.name, 0.55);
          const spec: [number, number, Anchor] = (() => {
            const l = TIDE_LABELS[s.name];
            return l ? [l.lx, l.ly, l.anchor] : [-30, 0, "end"];
          })();

          // Shorten leader line: pull endpoint 5px back toward the dot
          const lx = x + spec[0];
          const ly = y + spec[1];
          const dx = lx - x;
          const dy = ly - y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const gapX = (dx / len) * 5;
          const gapY = (dy / len) * 5;

          return (
            <g key={s.id}>
              {/* Leader line */}
              <line
                x1={x} y1={y} x2={lx - gapX} y2={ly - gapY}
                stroke="#a8a29e" strokeWidth="0.75"
                opacity={isHovered ? 0.8 : 0.35}
              />
              {/* Label */}
              <text
                x={lx} y={ly + 3}
                textAnchor={spec[2]}
                style={{ fontSize: "9px", fontFamily: "var(--font-crimson), serif" }}
                fill={isHovered ? "#292524" : "#78716c"}
                className="transition-colors duration-300"
              >{s.name}</text>
              {/* Highlight ring — visible on hover */}
              {isHovered && (
                <circle
                  cx={x} cy={y}
                  r={r + 5}
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="1.5"
                  opacity={0.5}
                />
              )}
              {/* Dot */}
              <circle
                cx={x} cy={y}
                r={isHovered ? r + 2 : r}
                fill={isHovered ? "#0ea5e9" : "#0284c7"}
                stroke="#fafaf9" strokeWidth="1"
                opacity={isHovered ? 0.95 : opacity}
                className={`${isHovered ? "" : "tide-pulse"} transition-all duration-300`}
                style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${i * 0.7}s` }}
                onMouseEnter={() => showTideTooltip(s.name)}
                onMouseLeave={hideTooltip}
                cursor="default"
              />
            </g>
          );
        })}

        {/* River gauge station labels (no dots — the river lines are the visual) */}
        {RIVER_SITES.map((s) => {
          const flow = riverFlowMap.get(s.id);
          if (flow?.currentFlow === null || flow?.currentFlow === undefined) return null;
          const [x, y] = project(s.lng, s.lat);
          const level = highlightLevel(s.name);
          const isHovered = level === "hover";
          const spec: [number, number, Anchor] = (() => {
            const l = RIVER_LABELS[s.name];
            return l ? [l.lx, l.ly, l.anchor] : [16, 0, "start"];
          })();

          const rlx = x + spec[0];
          const rly = y + spec[1];
          const rdx = rlx - x;
          const rdy = rly - y;
          const rlen = Math.sqrt(rdx * rdx + rdy * rdy) || 1;
          const rgX = (rdx / rlen) * 5;
          const rgY = (rdy / rlen) * 5;

          return (
            <g
              key={s.id}
              onMouseEnter={() => showRiverTooltip(s.name)}
              onMouseLeave={hideTooltip}
              cursor="default"
            >
              <line
                x1={x} y1={y} x2={rlx - rgX} y2={rly - rgY}
                stroke="#a8a29e" strokeWidth="0.75"
                opacity={isHovered ? 0.8 : 0.35}
              />
              <text
                x={rlx} y={rly + 3}
                textAnchor={spec[2]}
                style={{ fontSize: "9px", fontFamily: "var(--font-crimson), serif" }}
                fill={isHovered ? "#292524" : "#78716c"}
                className="transition-colors duration-300"
              >{s.name}</text>
            </g>
          );
        })}


        {/* Cetacean sightings — always visible along the coast, blue-gray */}
        {cetaceanData?.observations?.map((obs, i) => {
          const [cx, cy] = project(obs.lng, obs.lat);
          return (
            <circle
              key={`cetacean-${i}`}
              cx={cx} cy={cy} r={2.5}
              fill="#6b7280"
              opacity={0.45}
            />
          );
        })}

        {/* Monarch observations — current month, always visible as orange dots */}
        {monarchData?.monthlyCounts && !focusedSpecies && (() => {
          // Show current month's observations when not hovering a specific month
          const currentMonth = monarchData.monthlyCounts[monarchData.monthlyCounts.length - 1];
          const obs = currentMonth?.observations ?? [];
          if (obs.length === 0) return null;
          const clusters = new Map<string, { lat: number; lng: number; count: number }>();
          for (const o of obs) {
            const key = `${Math.round(o.lat * 2) / 2},${Math.round(o.lng * 2) / 2}`;
            const existing = clusters.get(key);
            if (existing) {
              existing.count++;
              existing.lat = (existing.lat * (existing.count - 1) + o.lat) / existing.count;
              existing.lng = (existing.lng * (existing.count - 1) + o.lng) / existing.count;
            } else {
              clusters.set(key, { lat: o.lat, lng: o.lng, count: 1 });
            }
          }
          return [...clusters.values()].map((c, i) => {
            const [cx, cy] = project(c.lng, c.lat);
            const r = Math.min(2 + Math.sqrt(c.count) * 0.8, 6);
            return (
              <circle
                key={`monarch-${i}`}
                cx={cx} cy={cy} r={r}
                fill="#fb923c"
                opacity={0.45}
              />
            );
          });
        })()}

        {/* Hover-reveal: observation dots for focused species (pollinators, plants, or birds) */}
        <g className="transition-opacity duration-300" style={{ opacity: focusedSpecies ? 1 : 0 }}>
          {focusedSpecies && focusedSpecies.observations.map((obs, i) => {
            const [ox, oy] = project(obs.lng, obs.lat);
            return (
              <circle
                key={i}
                cx={ox} cy={oy} r={3.5}
                fill={focusedSpecies.color}
                opacity={0.7}
              />
            );
          })}
        </g>

      </svg>

      {/* Tooltip */}
      {tooltipData && (
        <div
          className="absolute pointer-events-none z-30 bg-white/95 border border-stone-200 px-2.5 py-1.5 text-xs max-w-[200px]"
          style={{
            left: Math.min(mousePos.x + 12, (containerRef.current?.clientWidth ?? 300) - 180),
            top: mousePos.y - 10,
          }}
        >
          <div className="font-medium text-stone-800">{tooltipData.name}</div>
          <div className="font-mono tabular-nums text-stone-700">{tooltipData.line1}</div>
          {tooltipData.line2 && <div className="text-stone-400">{tooltipData.line2}</div>}
        </div>
      )}

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400 justify-center">
          <span className="flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <circle cx="5" cy="5" r="4" fill="#0284c7" opacity="0.6" />
            </svg>
            Tide height
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="18" height="6" viewBox="0 0 18 6" aria-hidden="true">
              <line x1="0" y1="3" x2="18" y2="3" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" strokeDasharray="4 2" />
            </svg>
            River flow
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <circle cx="5" cy="5" r="3.5" fill="#fb923c" opacity="0.5" />
            </svg>
            {(() => {
              if (focusedSpecies?.color === "#fb923c") {
                const monthOnly = focusedSpecies.label.split(" —")[0];
                return `Monarchs (${monthOnly})`;
              }
              if (monarchData?.monthlyCounts) {
                return `Monarchs (${monarchData.monthlyCounts[monarchData.monthlyCounts.length - 1]?.label})`;
              }
              return "Monarch sightings";
            })()}
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <circle cx="5" cy="5" r="3" fill="#6b7280" opacity="0.45" />
            </svg>
            Cetaceans
          </span>
      </div>
    </div>
  );
}
