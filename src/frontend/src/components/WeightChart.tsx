import type { Entry } from "../backend";

interface WeightChartProps {
  entries: Entry[];
}

export function WeightChart({ entries }: WeightChartProps) {
  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
        No data yet
      </div>
    );
  }

  const weights = entries.map((e) => e.weight).filter((w) => w > 0);
  if (weights.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
        No weight data
      </div>
    );
  }

  const min = Math.min(...weights) - 0.5;
  const max = Math.max(...weights) + 0.5;
  const range = max - min || 1;
  const W = 200;
  const H = 80;
  const PAD = 8;

  const points = weights.map((w, i) => ({
    x: PAD + (i / Math.max(weights.length - 1, 1)) * (W - PAD * 2),
    y: PAD + ((max - w) / range) * (H - PAD * 2),
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: 80 }}
      role="img"
      aria-label="Weight trend chart"
    >
      <defs>
        <linearGradient id="wt-grad" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="oklch(0.48 0.09 215)"
            stopOpacity="0.25"
          />
          <stop
            offset="100%"
            stopColor="oklch(0.48 0.09 215)"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#wt-grad)" />
      <path
        d={pathD}
        fill="none"
        stroke="oklch(0.48 0.09 215)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p) => (
        <circle
          key={`pt-${p.x}-${p.y}`}
          cx={p.x}
          cy={p.y}
          r="3"
          fill="oklch(0.48 0.09 215)"
        />
      ))}
    </svg>
  );
}
