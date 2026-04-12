/**
 * Skeleton loading primitives. Subtle pulse animation on warm stone background.
 * Match the dimensions of real content so layout doesn't shift on load.
 */

function Bone({ className }: { className: string }) {
  return (
    <div
      className={`bg-stone-200/50 rounded-sm animate-pulse ${className}`}
    />
  );
}

export function SkeletonLine({ width = "w-48", height = "h-3.5" }: { width?: string; height?: string }) {
  return <Bone className={`${width} ${height}`} />;
}

export function SkeletonSparkline() {
  return <Bone className="w-full h-[18px] mt-1" />;
}

/** Skeleton for the conditions bar above the map */
export function SkeletonConditions() {
  return (
    <div className="grid grid-cols-4 gap-x-3 text-center mb-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="space-y-1.5 flex flex-col items-center">
          <Bone className="w-8 h-2.5" />
          <Bone className="w-10 h-4" />
          <Bone className="w-12 h-2.5" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton for a tide station card */
export function SkeletonTideStation() {
  return (
    <div className="flex-shrink-0 min-w-[110px] px-2 py-1.5 space-y-1.5">
      <Bone className="w-16 h-2.5" />
      <Bone className="w-full h-[24px]" />
      <Bone className="w-12 h-3.5" />
      <Bone className="w-20 h-2.5" />
    </div>
  );
}

/** Skeleton for a river card */
export function SkeletonRiverCard() {
  return (
    <div className="py-2 border-b border-stone-100 space-y-1.5">
      <Bone className="w-24 h-2.5" />
      <Bone className="w-20 h-3.5" />
      <Bone className="w-full h-[18px]" />
    </div>
  );
}

/** Skeleton for a bird sighting entry */
export function SkeletonBirdEntry() {
  return (
    <div className="flex items-start gap-3 py-3 border-l-2 border-stone-200 pl-3">
      <div className="space-y-1.5">
        <Bone className="w-32 h-3" />
        <Bone className="w-44 h-3" />
        <Bone className="w-24 h-2.5" />
      </div>
    </div>
  );
}

/** Skeleton for a pollinator species entry */
export function SkeletonSpeciesEntry() {
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-stone-100">
      <div className="flex items-start gap-3">
        <Bone className="w-[56px] h-[56px]" />
        <div className="space-y-1.5">
          <Bone className="w-28 h-3" />
          <Bone className="w-36 h-3" />
        </div>
      </div>
      <Bone className="w-14 h-3.5" />
    </div>
  );
}
