import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSettings } from "../contexts/SettingsContext";
import { getToday, useLogWorkout } from "../hooks/useQueries";

const PRESET_EXERCISES = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Pull-up",
  "Push-up",
  "Overhead Press",
  "Barbell Row",
  "Lunges",
  "Plank",
  "Running",
  "Cycling",
  "Jump Rope",
  "Dips",
  "Tricep Extension",
  "Bicep Curl",
  "Lateral Raise",
  "Cable Row",
  "Hip Thrust",
  "Romanian Deadlift",
  "Box Jump",
  "Battle Ropes",
  "Swimming",
  "Yoga",
  "Pilates",
  "Crunch",
  "Russian Twist",
  "Mountain Climbers",
];

const CARDIO_EXERCISES = [
  "Running",
  "Cycling",
  "Jump Rope",
  "Plank",
  "Battle Ropes",
  "Swimming",
  "Yoga",
  "Pilates",
];
const BODYWEIGHT_EXERCISES = [
  "Pull-up",
  "Push-up",
  "Lunges",
  "Plank",
  "Dips",
  "Crunch",
  "Russian Twist",
  "Mountain Climbers",
  "Box Jump",
];

export interface PrefillData {
  name: string;
  sets: number;
  reps: number;
  weightKg: number;
  durationMinutes: number;
}

interface WorkoutLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date?: bigint;
  prefillData?: PrefillData;
}

export function WorkoutLogModal({
  open,
  onOpenChange,
  date,
  prefillData,
}: WorkoutLogModalProps) {
  const { weightUnit } = useSettings();
  const [exerciseName, setExerciseName] = useState("");
  const [showPresets, setShowPresets] = useState(false);
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [weightInput, setWeightInput] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [notes, setNotes] = useState("");

  const { mutateAsync: logWorkout, isPending } = useLogWorkout();

  // Pre-fill form when prefillData changes or modal opens
  useEffect(() => {
    if (open && prefillData) {
      setExerciseName(prefillData.name);
      setSets(String(prefillData.sets));
      setReps(String(prefillData.reps));
      // Display in current unit
      const displayWeight =
        weightUnit === "lbs"
          ? (prefillData.weightKg * 2.2046).toFixed(1)
          : String(prefillData.weightKg);
      setWeightInput(prefillData.weightKg > 0 ? displayWeight : "");
      setDurationMinutes(
        prefillData.durationMinutes > 0
          ? String(prefillData.durationMinutes)
          : "",
      );
    } else if (open && !prefillData) {
      setExerciseName("");
      setSets("3");
      setReps("10");
      setWeightInput("");
      setDurationMinutes("");
      setNotes("");
    }
  }, [open, prefillData, weightUnit]);

  const isCardio = CARDIO_EXERCISES.includes(exerciseName);
  const isBodyweight = BODYWEIGHT_EXERCISES.includes(exerciseName);
  const showReps = !isCardio;
  const showWeight = !isCardio && !isBodyweight;

  const handlePresetSelect = (name: string) => {
    setExerciseName(name);
    setShowPresets(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setExerciseName("");
    setSets("3");
    setReps("10");
    setWeightInput("");
    setDurationMinutes("");
    setNotes("");
    setShowPresets(false);
  };

  const handleSubmit = async () => {
    if (!exerciseName.trim()) {
      toast.error("Please enter an exercise name");
      return;
    }
    try {
      // Convert weight to kg for storage
      let weightKg = Number(weightInput) || 0;
      if (weightUnit === "lbs" && weightKg > 0) {
        weightKg = weightKg / 2.2046;
      }
      await logWorkout({
        date: date ?? getToday(),
        name: exerciseName.trim(),
        sets: BigInt(Number(sets) || 0),
        reps: BigInt(Number(reps) || 0),
        weightKg: showWeight ? weightKg : 0,
        durationMinutes: BigInt(Number(durationMinutes) || 0),
        notes: notes.trim(),
      });
      toast.success("Workout logged!");
      handleClose();
    } catch {
      toast.error("Failed to log workout. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        data-ocid="workout_log.dialog"
        className="sm:max-w-md rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Log Workout</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Exercise name */}
          <div className="space-y-1.5">
            <Label htmlFor="exercise-name">Exercise</Label>
            <div className="relative">
              <Input
                id="exercise-name"
                data-ocid="workout_log.input"
                placeholder="e.g. Bench Press"
                value={exerciseName}
                onChange={(e) => {
                  setExerciseName(e.target.value);
                  setShowPresets(false);
                }}
                onFocus={() => setShowPresets(true)}
                autoComplete="off"
                className="rounded-xl"
              />
              {showPresets && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden max-h-52 overflow-y-auto">
                  {PRESET_EXERCISES.filter(
                    (e) =>
                      exerciseName === "" ||
                      e.toLowerCase().includes(exerciseName.toLowerCase()),
                  ).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                      onMouseDown={() => handlePresetSelect(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Sets */}
            <div className="space-y-1.5">
              <Label htmlFor="sets">Sets</Label>
              <Input
                id="sets"
                data-ocid="workout_log.sets.input"
                type="number"
                min="1"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                className="rounded-xl"
              />
            </div>

            {/* Reps */}
            {showReps && (
              <div className="space-y-1.5">
                <Label htmlFor="reps">Reps</Label>
                <Input
                  id="reps"
                  data-ocid="workout_log.reps.input"
                  type="number"
                  min="1"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Weight */}
            {showWeight && (
              <div className="space-y-1.5">
                <Label htmlFor="weight">Weight ({weightUnit})</Label>
                <Input
                  id="weight"
                  data-ocid="workout_log.weight.input"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            )}

            {/* Duration */}
            <div className="space-y-1.5">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                data-ocid="workout_log.duration.input"
                type="number"
                min="0"
                placeholder="0"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              data-ocid="workout_log.textarea"
              placeholder="How did it feel?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="rounded-xl resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            data-ocid="workout_log.cancel_button"
            onClick={handleClose}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="workout_log.submit_button"
            disabled={isPending}
            onClick={handleSubmit}
            className="rounded-xl"
            style={{ background: "oklch(0.48 0.09 215)", color: "white" }}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Workout"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
