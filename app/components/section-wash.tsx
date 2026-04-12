/**
 * Wraps a section with a subtle watercolor wash background texture.
 * The wash is a positioned pseudo-element behind the content at very low opacity,
 * so it reads as paint bled into the paper — not a visible rectangle.
 */
export function SectionWash({
  texture,
  opacity = 0.06,
  rotate = 0,
  children,
}: {
  texture: string;
  opacity?: number;
  rotate?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div
        className="absolute inset-x-[-16px] inset-y-[-8px] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `url(${texture})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity,
          transform: rotate ? `rotate(${rotate}deg)` : undefined,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
