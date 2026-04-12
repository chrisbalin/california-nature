"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";

/** Observation dots to show on the map when hovering a species */
export interface FocusedSpecies {
  label: string;
  color: string; // e.g. "#f43f5e" rose-500 or "#8b5cf6" violet-500
  observations: { lat: number; lng: number }[];
}

interface HighlightState {
  hoveredStation: string | null;
  setHoveredStation: (id: string | null) => void;
  proximityStations: Set<string>;
  isHighlighted: (name: string) => boolean;
  highlightLevel: (name: string) => "hover" | "proximity" | null;
  /** Observation dots to show on the map (pollinators, plants, or birds) */
  focusedSpecies: FocusedSpecies | null;
  setFocusedSpecies: (species: FocusedSpecies | null) => void;
}

const HighlightContext = createContext<HighlightState>({
  hoveredStation: null,
  setHoveredStation: () => {},
  proximityStations: new Set(),
  isHighlighted: () => false,
  highlightLevel: () => null,
  focusedSpecies: null,
  setFocusedSpecies: () => {},
});

export function HighlightProvider({ children }: { children: ReactNode }) {
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);
  const [proximityStations, setProximityStations] = useState<Set<string>>(new Set());
  const [focusedSpecies, setFocusedSpecies] = useState<FocusedSpecies | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const trackedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const next = new Set(trackedRef.current);
        let changed = false;
        for (const entry of entries) {
          const name = (entry.target as HTMLElement).dataset.station;
          if (!name) continue;
          if (entry.isIntersecting) {
            if (!next.has(name)) { next.add(name); changed = true; }
          } else {
            if (next.has(name)) { next.delete(name); changed = true; }
          }
        }
        if (changed) {
          trackedRef.current = next;
          setProximityStations(new Set(next));
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    const els = document.querySelectorAll("[data-station]");
    els.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const els = document.querySelectorAll("[data-station]");
      els.forEach((el) => observerRef.current?.observe(el));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const isHighlighted = useCallback(
    (name: string) => hoveredStation === name || proximityStations.has(name),
    [hoveredStation, proximityStations]
  );

  const highlightLevel = useCallback(
    (name: string): "hover" | "proximity" | null => {
      if (hoveredStation === name) return "hover";
      if (proximityStations.has(name)) return "proximity";
      return null;
    },
    [hoveredStation, proximityStations]
  );

  return (
    <HighlightContext.Provider
      value={{
        hoveredStation, setHoveredStation,
        proximityStations, isHighlighted, highlightLevel,
        focusedSpecies, setFocusedSpecies,
      }}
    >
      {children}
    </HighlightContext.Provider>
  );
}

export function useHighlight() {
  return useContext(HighlightContext);
}
