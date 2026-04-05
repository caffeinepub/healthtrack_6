import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "motion/react";
import { useRecentEntries } from "../hooks/useQueries";

const MOOD_EMOJI: Record<number, string> = {
  1: "😞",
  2: "😐",
  3: "🙂",
  4: "😊",
  5: "😄",
};

function daysSinceEpoch(n: bigint): string {
  const date = new Date(Number(n) * 86400000);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function History() {
  const { data: entries = [], isLoading } = useRecentEntries(14);

  const sorted = [...entries].sort((a, b) => Number(b.date) - Number(a.date));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Health History</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Your last 14 days of logged entries
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-card overflow-hidden">
        {isLoading ? (
          <div data-ocid="history.loading_state" className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: stable positional array
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div
            data-ocid="history.empty_state"
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No entries yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Start logging your daily health data to see your history here.
            </p>
          </div>
        ) : (
          <Table data-ocid="history.table">
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="pl-6">Date</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Water</TableHead>
                <TableHead>Sleep</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead className="pr-6">Mood</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((entry, i) => (
                <TableRow
                  key={entry.date.toString()}
                  data-ocid={`history.row.${i + 1}`}
                  className="border-b border-border/50 hover:bg-muted/30"
                >
                  <TableCell className="pl-6 font-medium text-foreground">
                    {daysSinceEpoch(entry.date)}
                  </TableCell>
                  <TableCell>{Number(entry.steps).toLocaleString()}</TableCell>
                  <TableCell>{Number(entry.waterGlasses)} 💧</TableCell>
                  <TableCell>
                    {entry.sleepHours > 0
                      ? `${entry.sleepHours.toFixed(1)}h`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {Number(entry.calories) > 0
                      ? `${Number(entry.calories).toLocaleString()} cal`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {entry.weight > 0 ? `${entry.weight.toFixed(1)} kg` : "—"}
                  </TableCell>
                  <TableCell className="pr-6">
                    {Number(entry.mood) > 0 ? (
                      <span className="text-lg">
                        {MOOD_EMOJI[Number(entry.mood)] || "—"}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </motion.div>
  );
}
