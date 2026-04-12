interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  showEndDot?: boolean;
  yMin?: number;
  yMax?: number;
  /** If true, SVG stretches to fill container width */
  fluid?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 80,
  height = 18,
  strokeColor = "currentColor",
  strokeWidth = 1.5,
  showEndDot = false,
  yMin: yMinProp,
  yMax: yMaxProp,
  fluid = false,
  className,
}: SparklineProps) {
  if (data.length < 2) return null;

  const yMin = yMinProp ?? Math.min(...data);
  const yMax = yMaxProp ?? Math.max(...data);
  const yRange = yMax - yMin || 1;

  const padY = strokeWidth;
  const padX = showEndDot ? 3 : strokeWidth;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;
  const stepX = plotW / (data.length - 1);

  const points = data.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + plotH - ((v - yMin) / yRange) * plotH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  // End dot position as percentage of viewBox for fluid mode
  const lastVal = data[data.length - 1];
  const lastXPct = ((padX + (data.length - 1) * stepX) / width) * 100;
  const lastYPct = ((padY + plotH - ((lastVal - yMin) / yRange) * plotH) / height) * 100;

  if (fluid) {
    return (
      <div className={`relative ${className ?? ""}`} style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{ width: "100%", height }}
          aria-hidden="true"
        >
          <polyline
            points={points.join(" ")}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {/* Dot rendered as HTML to avoid distortion from preserveAspectRatio="none" */}
        {showEndDot && (
          <div
            style={{
              position: "absolute",
              left: `${lastXPct}%`,
              top: `${lastYPct}%`,
              width: 5,
              height: 5,
              borderRadius: "50%",
              backgroundColor: strokeColor,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </div>
    );
  }

  const lastX = padX + (data.length - 1) * stepX;
  const lastY = padY + plotH - ((lastVal - yMin) / yRange) * plotH;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showEndDot && (
        <circle
          cx={lastX}
          cy={lastY}
          r={2.5}
          fill={strokeColor}
        />
      )}
    </svg>
  );
}

/** Label padding percentage to match sparkline internal padding */
export function sparklineLabelPadding(width: number, showEndDot: boolean): string {
  const padX = showEndDot ? 3 : 1.5;
  return `${(padX / width) * 100}%`;
}
