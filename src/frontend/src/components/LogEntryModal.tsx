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
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Entry, Goals } from "../backend";
import { getToday, useCreateEntry } from "../hooks/useQueries";

interface LogEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingEntry: Entry | null;
  goals: Goals;
}

const MOOD_OPTIONS = [
  { value: 1, emoji: "😞", label: "Very Low" },
  { value: 2, emoji: "😐", label: "Low" },
  { value: 3, emoji: "🙂", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
];

export function LogEntryModal({
  open,
  onOpenChange,
  existingEntry,
  goals,
}: LogEntryModalProps) {
  const createEntry = useCreateEntry();

  const [steps, setSteps] = useState("");
  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState("");
  const [calories, setCalories] = useState("");
  const [weight, setWeight] = useState("");
  const [mood, setMood] = useState(3);

  // biome-ignore lint/correctness/useExhaustiveDependencies: open is intentional to reset form
  useEffect(() => {
    if (existingEntry) {
      setSteps(Number(existingEntry.steps).toString());
      setWater(Number(existingEntry.waterGlasses));
      setSleep(existingEntry.sleepHours.toString());
      setCalories(Number(existingEntry.calories).toString());
      setWeight(existingEntry.weight.toString());
      setMood(Number(existingEntry.mood));
    } else {
      setSteps("");
      setWater(0);
      setSleep("");
      setCalories("");
      setWeight(goals.targetWeight.toString());
      setMood(3);
    }
  }, [existingEntry, goals, open]);

  const handleSubmit = async () => {
    try {
      await createEntry.mutateAsync({
        date: getToday(),
        steps: BigInt(Math.round(Number(steps) || 0)),
        waterGlasses: BigInt(Math.round(water)),
        sleepHours: Number(sleep) || 0,
        calories: BigInt(Math.round(Number(calories) || 0)),
        weight: Number(weight) || 0,
        mood: BigInt(mood),
      });
      toast.success("Health entry saved!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to save entry. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ocid="log_entry.dialog" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log Today&apos;s Health</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Steps */}
          <div className="space-y-1.5">
            <Label htmlFor="steps">Steps</Label>
            <Input
              id="steps"
              data-ocid="log_entry.steps.input"
              type="number"
              placeholder={`Goal: ${Number(goals.targetSteps).toLocaleString()}`}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
            />
          </div>

          {/* Water */}
          <div className="space-y-2">
            <Label>
              Water Intake: {water} / {Number(goals.targetWaterGlasses)} glasses
            </Label>
            <Slider
              data-ocid="log_entry.water.input"
              min={0}
              max={12}
              step={1}
              value={[water]}
              onValueChange={([v]) => setWater(v)}
              className="w-full"
            />
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: 8 }).map((_, i) => (
                <button
                  type="button"
                  key={`water-${i + 1}`}
                  onClick={() => setWater(i + 1)}
                  className={`w-8 h-8 rounded-full text-lg transition-all ${
                    i < water ? "opacity-100 scale-110" : "opacity-30"
                  }`}
                  title={`${i + 1} glass${i + 1 !== 1 ? "es" : ""}`}
                >
                  💧
                </button>
              ))}
            </div>
          </div>

          {/* Sleep */}
          <div className="space-y-1.5">
            <Label htmlFor="sleep">Sleep Hours</Label>
            <Input
              id="sleep"
              data-ocid="log_entry.sleep.input"
              type="number"
              step="0.5"
              placeholder={`Goal: ${goals.targetSleepHours}h`}
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
            />
          </div>

          {/* Calories */}
          <div className="space-y-1.5">
            <Label htmlFor="calories">Calories</Label>
            <Input
              id="calories"
              data-ocid="log_entry.calories.input"
              type="number"
              placeholder={`Goal: ${Number(goals.targetCalories).toLocaleString()}`}
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              data-ocid="log_entry.weight.input"
              type="number"
              step="0.1"
              placeholder={`Target: ${goals.targetWeight}kg`}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          {/* Mood */}
          <div className="space-y-2">
            <Label>Mood</Label>
            <div className="flex gap-2" data-ocid="log_entry.mood.select">
              {MOOD_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setMood(option.value)}
                  className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                    mood === option.value
                      ? "border-teal bg-teal/10"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  style={
                    mood === option.value
                      ? {
                          borderColor: "oklch(0.48 0.09 215)",
                          background: "oklch(0.92 0.04 215)",
                        }
                      : undefined
                  }
                  title={option.label}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            data-ocid="log_entry.cancel_button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            data-ocid="log_entry.submit_button"
            onClick={handleSubmit}
            disabled={createEntry.isPending}
            style={{ background: "oklch(0.48 0.09 215)", color: "white" }}
          >
            {createEntry.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {createEntry.isPending ? "Saving..." : "Save Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
