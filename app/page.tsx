import Image from "next/image";
import { Dashboard } from "./components/dashboard";
import { CaliforniaMap } from "./components/california-map";
import { ConditionsBar } from "./components/conditions-bar";
import { HighlightProvider } from "@/lib/highlight-context";

export default function Home() {
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="max-w-7xl mx-auto px-4 pt-4 pb-10 md:px-8 md:pt-10 relative">
      {/* California poppy — state flower, fixed in bottom-left */}
      <div
        className="fixed bottom-0 left-8 pointer-events-none z-0 hidden xl:block"
        aria-hidden="true"
        style={{ opacity: 0.55, transform: "rotate(-6deg)" }}
      >
        <Image
          src="/illustrations/flowers/california-poppy.png"
          alt=""
          width={140}
          height={140}
          className="object-contain"
        />
      </div>
      <header className="mb-10 relative">
        <div
          className="absolute inset-x-[-24px] inset-y-[-12px] pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: "url(/textures/wash-amber.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.12,
          }}
        />
        <div className="relative flex items-start gap-4 -ml-2">
          {/* Yerba buena — Clinopodium douglasii, the plant SF was named after */}
          <Image
            src="/illustrations/flowers/yerba-buena.png"
            alt=""
            width={75}
            height={150}
            className="flex-shrink-0 object-contain illustration-diecut"
            style={{ opacity: 0.7 }}
            aria-hidden="true"
          />
          <div className="pt-1">
            <h1 className="text-sm uppercase tracking-[0.35em] text-stone-500">
              California Nature Dashboard
            </h1>
            <p className="mt-3 text-sm text-stone-400 italic">
              A living survey of the state&apos;s ecosystems
            </p>
            <time className="block mt-2 text-xs text-stone-400 font-mono tabular-nums">
              {today}
            </time>
          </div>
        </div>
      </header>

      <HighlightProvider>
        {/* Two-column layout: map (sticky) | data sections */}
        <div className="lg:flex lg:gap-10">
          {/* Left column — map, sticky on desktop */}
          <aside className="lg:w-[37%] lg:flex-shrink-0 mb-10 lg:mb-0">
            <div className="lg:sticky lg:top-8">
              <ConditionsBar />
              <CaliforniaMap />
            </div>
          </aside>

          {/* Right column — all data sections */}
          <div className="lg:flex-1 min-w-0">
            <Dashboard />
          </div>
        </div>
      </HighlightProvider>

      <footer className="mt-12 pt-6 text-center">
        <div className="mx-auto max-w-md border-t border-stone-200 pt-6" />
        <p className="text-xs text-stone-400">
          Data:{" "}
          <a href="https://tidesandcurrents.noaa.gov" className="underline decoration-stone-300 hover:text-stone-600">NOAA Tides &amp; Currents</a>
          {" · "}
          <a href="https://waterservices.usgs.gov" className="underline decoration-stone-300 hover:text-stone-600">USGS Water Services</a>
          {" · "}
          <a href="https://ebird.org" className="underline decoration-stone-300 hover:text-stone-600">eBird</a>
          {" · "}
          <a href="https://www.inaturalist.org" className="underline decoration-stone-300 hover:text-stone-600">iNaturalist</a>
          {" · "}
          <a href="https://open-meteo.com" className="underline decoration-stone-300 hover:text-stone-600">Open-Meteo</a>
        </p>
        <div className="mt-3 text-xs text-stone-400 space-y-0.5">
          <p>
            A field study by{" "}
            <a href="https://madeleineesmith.com" target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-stone-700 underline underline-offset-2">Madeleine Smith</a>
            {" "}and{" "}
            <a href="https://chrisbalin.com" target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-stone-700 underline underline-offset-2">Chris Balin</a>
          </p>
          <p>
            Illustrations generated with Midjourney · Built with Claude Code ·{" "}
            <a href="https://github.com/chrisbalin/california-nature" target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-stone-700 underline underline-offset-2">Source</a>
          </p>
        </div>
      </footer>
    </main>
  );
}
