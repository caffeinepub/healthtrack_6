interface MiniBarChartProps {
  values: number[];
  color: string;
  height?: number;
}

export function MiniBarChart({
  values,
  color,
  height = 32,
}: MiniBarChartProps) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {values.map((v, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: stable positional chart bars
          key={`bar-${i}`}
          className="flex-1 rounded-sm transition-all"
          style={{
            height: `${(v / max) * 100}%`,
            minHeight: 2,
            background: color,
            opacity:
              i === values.length - 1 ? 1 : 0.5 + (i / values.length) * 0.4,
          }}
        />
      ))}
    </div>
  );
}
