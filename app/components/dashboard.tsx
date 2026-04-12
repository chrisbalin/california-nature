"use client";

import Image from "next/image";
import { TideStrip } from "./tide-strip";
import { RiverGrid } from "./river-grid";
import { BirdSightings } from "./bird-sightings";
import { EcologicalConnections } from "./ecological-connections";
import { MonarchMigration } from "./monarch-migration";
import { Cetaceans } from "./cetaceans";
import { ReservoirLevels } from "./reservoir-levels";
import { PollinatorPlate } from "./pollinator-plate";
import { SectionWash } from "./section-wash";

function SectionIllustration({
  src,
  size,
  opacity,
  rotate,
  className,
}: {
  src: string;
  size: number;
  opacity: number;
  rotate: number;
  className: string;
}) {
  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className={`absolute pointer-events-none object-contain illustration-diecut ${className}`}
      style={{ opacity, transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    />
  );
}

export function Dashboard() {
  return (
    <div className="space-y-10">
      {/* 1. Ecological Connections — key insights first */}
      <SectionWash texture="/textures/wash-ochre.png" opacity={0.10}>
        <div className="relative">
          <SectionIllustration
            src="/illustrations/birds/snowy-plover.png"
            size={90}
            opacity={0.5}
            rotate={-5}
            className="hidden lg:block -right-2 -top-1"
          />
          <EcologicalConnections />
        </div>
      </SectionWash>

      {/* 2. Coastal Tides */}
      <SectionWash texture="/textures/wash-blue.png" opacity={0.18}>
        <TideStrip />
      </SectionWash>

      {/* 3. Rivers */}
      <SectionWash texture="/textures/wash-neutral.png" opacity={0.14}>
        <RiverGrid />
      </SectionWash>

      {/* 4. Reservoirs */}
      <SectionWash texture="/textures/wash-sky.png" opacity={0.12}>
        <ReservoirLevels />
      </SectionWash>

      {/* 5. Monarch Migration */}
      <SectionWash texture="/textures/wash-amber.png" opacity={0.10}>
        <MonarchMigration />
      </SectionWash>

      {/* 6. Cetaceans */}
      <SectionWash texture="/textures/wash-blue.png" opacity={0.10} rotate={180}>
        <div className="relative">
          <SectionIllustration
            src="/illustrations/cetaceans/humpback-whale.png"
            size={100}
            opacity={0.4}
            rotate={-5}
            className="hidden lg:block -right-2 -top-1"
          />
          <Cetaceans />
        </div>
      </SectionWash>

      {/* 7. Pollinators & Host Plants */}
      <SectionWash texture="/textures/wash-green.png" opacity={0.10}>
        <div className="relative">
          <SectionIllustration
            src="/illustrations/bees/bumblebee-decorative.png"
            size={80}
            opacity={0.45}
            rotate={12}
            className="hidden lg:block -right-2 -top-1"
          />
          <SectionIllustration
            src="/illustrations/flowers/lupine.png"
            size={100}
            opacity={0.45}
            rotate={8}
            className="hidden lg:block right-2 bottom-[25%]"
          />
          <PollinatorPlate />
        </div>
      </SectionWash>

      {/* 6. Birds */}
      <SectionWash texture="/textures/wash-rose.png" opacity={0.12}>
        <div className="relative">
          <SectionIllustration
            src="/illustrations/birds/rufous-hummingbird.png"
            size={85}
            opacity={0.45}
            rotate={-8}
            className="hidden lg:block -right-2 top-6"
          />
          <BirdSightings />
        </div>
      </SectionWash>
    </div>
  );
}
