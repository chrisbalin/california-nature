/**
 * Species metadata and illustration file mappings.
 * Illustration paths point to public/illustrations/.
 * Components render nothing if no illustration is mapped for a species.
 */

export interface SpeciesEntry {
  commonName: string;
  scientificName: string;
  illustration?: string;
}

// ── Birds ──

export const BIRD_ILLUSTRATIONS: Record<string, SpeciesEntry> = {
  baleag: {
    commonName: "Bald Eagle",
    scientificName: "Haliaeetus leucocephalus",
    illustration: "/illustrations/birds/bald-eagle.png",
  },
  rethaw: {
    commonName: "Red-tailed Hawk",
    scientificName: "Buteo jamaicensis",
    illustration: "/illustrations/birds/red-tailed-hawk.png",
  },
  snoplo: {
    commonName: "Snowy Plover",
    scientificName: "Charadrius nivosus",
    illustration: "/illustrations/birds/snowy-plover.png",
  },
  rufhum: {
    commonName: "Rufous Hummingbird",
    scientificName: "Selasphorus rufus",
    illustration: "/illustrations/birds/rufous-hummingbird.png",
  },
};

const BIRD_BY_NAME: Record<string, string> = {
  "bald eagle": "/illustrations/birds/bald-eagle.png",
  "red-tailed hawk": "/illustrations/birds/red-tailed-hawk.png",
  "snowy plover": "/illustrations/birds/snowy-plover.png",
  "rufous hummingbird": "/illustrations/birds/rufous-hummingbird.png",
};

export function findBirdIllustration(speciesCode: string, comName: string): string | undefined {
  const byCode = BIRD_ILLUSTRATIONS[speciesCode];
  if (byCode?.illustration) return byCode.illustration;
  return BIRD_BY_NAME[comName.toLowerCase()];
}

// ── Bees ──

export const BEE_ILLUSTRATIONS: Record<string, SpeciesEntry> = {
  "Western Honey Bee": {
    commonName: "Western Honey Bee",
    scientificName: "Apis mellifera",
    illustration: "/illustrations/bees/western-honey-bee.png",
  },
  "Valley Carpenter Bee": {
    commonName: "Valley Carpenter Bee",
    scientificName: "Xylocopa sonorina",
    illustration: "/illustrations/bees/valley-carpenter-bee.png",
  },
  "Yellow-faced Bumble Bee": {
    commonName: "Yellow-faced Bumble Bee",
    scientificName: "Bombus vosnesenskii",
    illustration: "/illustrations/bees/yellow-faced-bumble-bee-v2.png",
  },
};

// ── Butterflies ──

export const BUTTERFLY_ILLUSTRATIONS: Record<string, SpeciesEntry> = {
  Monarch: {
    commonName: "Monarch",
    scientificName: "Danaus plexippus",
    illustration: "/illustrations/butterflies/monarch.png",
  },
  "Painted Lady": {
    commonName: "Painted Lady",
    scientificName: "Vanessa cardui",
    illustration: "/illustrations/butterflies/painted-lady.png",
  },
  "Western Tiger Swallowtail": {
    commonName: "Western Tiger Swallowtail",
    scientificName: "Papilio rutulus",
    illustration: "/illustrations/butterflies/western-tiger-swallowtail.png",
  },
  "Pipevine Swallowtail": {
    commonName: "Pipevine Swallowtail",
    scientificName: "Battus philenor",
    illustration: "/illustrations/butterflies/pipevine-swallowtail.png",
  },
  "Gray Buckeye": {
    commonName: "Gray Buckeye",
    scientificName: "Junonia grisea",
    illustration: "/illustrations/butterflies/gray-buckeye.png",
  },
};

// ── Flowers ──

export const FLOWER_ILLUSTRATIONS: Record<string, SpeciesEntry> = {
  "California Poppy": {
    commonName: "California Poppy",
    scientificName: "Eschscholzia californica",
    illustration: "/illustrations/flowers/california-poppy.png",
  },
  Lupine: {
    commonName: "Lupine",
    scientificName: "Lupinus sp.",
    illustration: "/illustrations/flowers/lupine.png",
  },
  "orange bush monkeyflower": {
    commonName: "Orange Bush Monkeyflower",
    scientificName: "Diplacus aurantiacus",
    illustration: "/illustrations/flowers/orange-bush-monkeyflower.png",
  },
  "White Globe Lily": {
    commonName: "White Globe Lily",
    scientificName: "Calochortus albus",
    illustration: "/illustrations/flowers/white-globe-lily.png",
  },
};

/**
 * Look up an illustration path for a species by common name.
 */
export function findIllustration(
  commonName: string,
  catalogs: Record<string, SpeciesEntry>[]
): string | undefined {
  const lower = commonName.toLowerCase();
  for (const catalog of catalogs) {
    for (const [key, entry] of Object.entries(catalog)) {
      if (lower.includes(key.toLowerCase())) {
        return entry.illustration;
      }
    }
  }
  return undefined;
}

/**
 * Look up a full SpeciesEntry by common name.
 */
export function findSpeciesEntry(
  commonName: string,
  catalogs: Record<string, SpeciesEntry>[]
): SpeciesEntry | undefined {
  const lower = commonName.toLowerCase();
  for (const catalog of catalogs) {
    for (const [key, entry] of Object.entries(catalog)) {
      if (lower.includes(key.toLowerCase())) {
        return entry;
      }
    }
  }
  return undefined;
}
