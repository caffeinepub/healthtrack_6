import type { Entry } from "../backend";

const MOOD_CONFIG: Record<
  number,
  { emoji: string; label: string; color: string }
> = {
  1: { emoji: "😞", label: "Very Low", color: "oklch(0.6 0.18 25)" },
  2: { emoji: "😐", label: "Low", color: "oklch(0.72 0.18 65)" },
  3: { emoji: "🙂", label: "Okay", color: "oklch(0.55 0.18 240)" },
  4: { emoji: "😊", label: "Good", color: "oklch(0.48 0.09 215)" },
  5: { emoji: "😄", label: "Great", color: "oklch(0.7 0.18 155)" },
};

interface MoodChartProps {
  entries: Entry[];
}

export function MoodChart({ entries }: MoodChartProps) {
  const recent = entries.slice(-7);

  if (recent.length === 0) {
    return (
      <div className="flex items-center justify-center h-16 text-muted-foreground text-sm">
        No mood data yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Mood pills timeline */}
      <div className="flex gap-2 flex-wrap">
        {recent.map((entry, i) => {
          const moodVal = Number(entry.mood);
          const cfg = MOOD_CONFIG[moodVal] || MOOD_CONFIG[3];
          return (
            <div
              key={entry.date.toString()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-medium"
              style={{ background: cfg.color }}
              title={`Day ${i + 1}: ${cfg.label}`}
            >
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* Average mood */}
      {recent.length > 0 &&
        (() => {
          const avgMood =
            recent.reduce((acc, e) => acc + Number(e.mood), 0) / recent.length;
          const avgConfig = MOOD_CONFIG[Math.round(avgMood)] || MOOD_CONFIG[3];
          return (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Average:</span>
              <span className="font-semibold text-foreground">
                {avgConfig.emoji} {avgConfig.label}
              </span>
            </div>
          );
        })()}
    </div>
  );
}
