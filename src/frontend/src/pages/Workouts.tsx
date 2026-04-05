import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Workout } from "../backend";
import {
  type PrefillData,
  WorkoutLogModal,
} from "../components/WorkoutLogModal";
import {
  getToday,
  useDeleteWorkout,
  useRecentWorkouts,
} from "../hooks/useQueries";
import { generateWorkoutSuggestions } from "../utils/aiEngine";

function formatDate(daysSinceEpoch: bigint): string {
  const diff = Number(getToday()) - Number(daysSinceEpoch);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  const date = new Date(Number(daysSinceEpoch) * 86400000);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function formatWorkoutSummary(workout: Workout): string {
  const CARDIO = [
    "Running",
    "Cycling",
    "Jump Rope",
    "Plank",
    "Battle Ropes",
    "Swimming",
  ];
  const isCardio = CARDIO.includes(workout.name);

  const parts: string[] = [];
  if (!isCardio && Number(workout.sets) > 0 && Number(workout.reps) > 0) {
    parts.push(`${workout.sets}\u00d7${workout.reps}`);
  }
  if (workout.weightKg > 0) {
    parts.push(`${workout.weightKg}kg`);
  }
  if (Number(workout.durationMinutes) > 0) {
    parts.push(`${workout.durationMinutes} min`);
  }
  return parts.join(" \u00b7 ");
}

interface WorkoutRowProps {
  workout: Workout;
  index: number;
  onDelete: (id: bigint) => void;
  isDeleting: boolean;
}

function WorkoutRow({ workout, index, onDelete, isDeleting }: WorkoutRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const summary = formatWorkoutSummary(workout);

  return (
    <>
      <div
        data-ocid={`workouts.item.${index}`}
        className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "oklch(0.92 0.04 215)" }}
        >
          <Dumbbell
            className="w-4 h-4"
            style={{ color: "oklch(0.48 0.09 215)" }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {workout.name}
          </p>
          {summary && (
            <p className="text-xs text-muted-foreground mt-0.5">{summary}</p>
          )}
          {workout.notes && (
            <p className="text-xs text-muted-foreground/70 mt-0.5 italic truncate">
              {workout.notes}
            </p>
          )}
        </div>
        <button
          type="button"
          data-ocid={`workouts.delete_button.${index}`}
          onClick={() => setConfirmOpen(true)}
          disabled={isDeleting}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
          aria-label={`Delete ${workout.name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent
          data-ocid="workouts.delete.dialog"
          className="rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{workout.name}</strong> from
              your log. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="workouts.delete.cancel_button"
              className="rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="workouts.delete.confirm_button"
              onClick={() => {
                onDelete(workout.id);
                setConfirmOpen(false);
              }}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function Workouts() {
  const [logOpen, setLogOpen] = useState(false);
  const [suggestionsExpanded, setSuggestionsExpanded] = useState(true);
  const [prefillData, setPrefillData] = useState<PrefillData | undefined>(
    undefined,
  );

  const { data: workouts = [], isLoading } = useRecentWorkouts(14);
  const { mutateAsync: deleteWorkout, isPending: isDeleting } =
    useDeleteWorkout();

  const suggestions = generateWorkoutSuggestions(workouts);

  const handleDelete = async (id: bigint) => {
    try {
      await deleteWorkout(id);
      toast.success("Workout deleted");
    } catch {
      toast.error("Failed to delete workout");
    }
  };

  const handleAddSuggestion = (suggestion: {
    name: string;
    sets: number;
    reps: number;
    weightKg: number;
    durationMinutes: number;
  }) => {
    setPrefillData(suggestion);
    setLogOpen(true);
  };

  // Group workouts by date (descending)
  const grouped = workouts.reduce(
    (acc, w) => {
      const key = w.date.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(w);
      return acc;
    },
    {} as Record<string, Workout[]>,
  );

  const sortedDates = Object.keys(grouped).sort((a, b) =>
    Number(BigInt(b) - BigInt(a)),
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Workouts</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Track your exercise sessions
            </p>
          </div>
          <Button
            data-ocid="workouts.log.primary_button"
            onClick={() => {
              setPrefillData(undefined);
              setLogOpen(true);
            }}
            className="flex items-center gap-2 rounded-full px-5"
            style={{ background: "oklch(0.48 0.09 215)", color: "white" }}
          >
            <Plus className="w-4 h-4" />
            Log Workout
          </Button>
        </div>

        {/* AI Suggestions Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-card rounded-2xl shadow-card overflow-hidden"
        >
          <button
            type="button"
            data-ocid="workouts.ai_suggestions.toggle"
            onClick={() => setSuggestionsExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "oklch(0.93 0.06 290)" }}
              >
                <Sparkles
                  className="w-3.5 h-3.5"
                  style={{ color: "oklch(0.55 0.2 290)" }}
                />
              </div>
              <span className="text-sm font-semibold text-foreground">
                AI Suggestions
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "oklch(0.93 0.06 290)",
                  color: "oklch(0.45 0.18 290)",
                }}
              >
                {suggestions.length}
              </span>
            </div>
            {suggestionsExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {suggestionsExpanded && (
            <div className="px-5 pb-5">
              {isLoading ? (
                <div
                  data-ocid="workouts.ai_suggestions.loading_state"
                  className="flex gap-3 overflow-x-auto pb-2"
                >
                  {["s1", "s2", "s3"].map((k) => (
                    <Skeleton
                      key={k}
                      className="h-32 w-48 flex-shrink-0 rounded-xl"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {suggestions.map((s, i) => (
                    <motion.div
                      key={s.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25, delay: i * 0.06 }}
                      data-ocid={`workouts.ai_suggestion.item.${i + 1}`}
                      className="flex-shrink-0 w-52 rounded-xl border border-border p-4 space-y-2 hover:border-primary/40 transition-colors"
                      style={{ background: "oklch(0.975 0.008 240)" }}
                    >
                      <p className="text-sm font-bold text-foreground">
                        {s.name}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {s.rationale}
                      </p>
                      <p
                        className="text-xs font-medium"
                        style={{ color: "oklch(0.48 0.09 215)" }}
                      >
                        {s.durationMinutes > 0
                          ? `${s.durationMinutes} min`
                          : `${s.sets}\u00d7${s.reps}${
                              s.weightKg > 0 ? ` @ ${s.weightKg}kg` : ""
                            }`}
                      </p>
                      <Button
                        data-ocid={`workouts.ai_suggestion.add_button.${i + 1}`}
                        size="sm"
                        className="w-full h-7 text-xs rounded-lg"
                        style={{
                          background: "oklch(0.48 0.09 215)",
                          color: "white",
                        }}
                        onClick={() => handleAddSuggestion(s)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add to Log
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div
            data-ocid="workouts.loading_state"
            className="bg-card rounded-2xl shadow-card p-6 space-y-4"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: stable positional array
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedDates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            data-ocid="workouts.empty_state"
            className="bg-card rounded-2xl shadow-card flex flex-col items-center justify-center py-20 text-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "oklch(0.92 0.04 215)" }}
            >
              <Dumbbell
                className="w-8 h-8"
                style={{ color: "oklch(0.48 0.09 215)" }}
              />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No workouts logged yet
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-6">
              Start tracking your exercise sessions to see your progress over
              time.
            </p>
            <Button
              data-ocid="workouts.empty_state.primary_button"
              onClick={() => {
                setPrefillData(undefined);
                setLogOpen(true);
              }}
              className="rounded-full px-6"
              style={{ background: "oklch(0.48 0.09 215)", color: "white" }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Your First Workout
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {sortedDates.map((dateKey, di) => (
              <motion.div
                key={dateKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: di * 0.05 }}
                className="bg-card rounded-2xl shadow-card overflow-hidden"
              >
                <div
                  className="px-5 py-3.5 border-b border-border/60 flex items-center justify-between"
                  style={{ background: "oklch(0.97 0.015 215)" }}
                >
                  <h2 className="text-sm font-semibold text-foreground">
                    {formatDate(BigInt(dateKey))}
                  </h2>
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{
                      background: "oklch(0.92 0.04 215)",
                      color: "oklch(0.42 0.09 215)",
                    }}
                  >
                    {grouped[dateKey].length}{" "}
                    {grouped[dateKey].length === 1 ? "exercise" : "exercises"}
                  </span>
                </div>
                <div className="divide-y divide-border/40">
                  {grouped[dateKey].map((workout, wi) => (
                    <WorkoutRow
                      key={workout.id.toString()}
                      workout={workout}
                      index={di * 10 + wi + 1}
                      onDelete={handleDelete}
                      isDeleting={isDeleting}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <WorkoutLogModal
        open={logOpen}
        onOpenChange={(open) => {
          setLogOpen(open);
          if (!open) setPrefillData(undefined);
        }}
        prefillData={prefillData}
      />
    </>
  );
}
