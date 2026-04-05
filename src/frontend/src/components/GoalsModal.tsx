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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Goals } from "../backend";
import { useSettings } from "../contexts/SettingsContext";
import { DEFAULT_GOALS, useCreateGoals } from "../hooks/useQueries";

interface GoalsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGoals: Goals;
}

export function GoalsModal({
  open,
  onOpenChange,
  currentGoals,
}: GoalsModalProps) {
  const createGoals = useCreateGoals();
  const { weightUnit } = useSettings();

  const [targetSteps, setTargetSteps] = useState("");
  const [targetWater, setTargetWater] = useState("");
  const [targetSleep, setTargetSleep] = useState("");
  const [targetCalories, setTargetCalories] = useState("");
  const [targetWeight, setTargetWeight] = useState("");

  const goals = currentGoals || DEFAULT_GOALS;

  // biome-ignore lint/correctness/useExhaustiveDependencies: open is intentional to reset form
  useEffect(() => {
    setTargetSteps(Number(goals.targetSteps).toString());
    setTargetWater(Number(goals.targetWaterGlasses).toString());
    setTargetSleep(goals.targetSleepHours.toString());
    setTargetCalories(Number(goals.targetCalories).toString());
    // Display weight in selected unit
    const displayWeight =
      weightUnit === "lbs"
        ? (goals.targetWeight * 2.2046).toFixed(1)
        : goals.targetWeight.toString();
    setTargetWeight(displayWeight);
  }, [goals, open, weightUnit]);

  const handleSubmit = async () => {
    try {
      let targetWeightKg = Number(targetWeight) || 70;
      if (weightUnit === "lbs") {
        targetWeightKg = targetWeightKg / 2.2046;
      }
      await createGoals.mutateAsync({
        targetSteps: BigInt(Math.round(Number(targetSteps) || 20000)),
        targetWaterGlasses: BigInt(Math.round(Number(targetWater) || 8)),
        targetSleepHours: Number(targetSleep) || 8,
        targetCalories: BigInt(Math.round(Number(targetCalories) || 2000)),
        targetWeight: targetWeightKg,
      });
      toast.success("Goals updated!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to save goals. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-ocid="goals.dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Health Goals</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="g-steps">Daily Steps Target</Label>
            <Input
              id="g-steps"
              data-ocid="goals.steps.input"
              type="number"
              value={targetSteps}
              onChange={(e) => setTargetSteps(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="g-water">Daily Water Glasses</Label>
            <Input
              id="g-water"
              data-ocid="goals.water.input"
              type="number"
              value={targetWater}
              onChange={(e) => setTargetWater(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="g-sleep">Sleep Hours Target</Label>
            <Input
              id="g-sleep"
              data-ocid="goals.sleep.input"
              type="number"
              step="0.5"
              value={targetSleep}
              onChange={(e) => setTargetSleep(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="g-calories">Daily Calories Target</Label>
            <Input
              id="g-calories"
              data-ocid="goals.calories.input"
              type="number"
              value={targetCalories}
              onChange={(e) => setTargetCalories(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="g-weight">Target Weight ({weightUnit})</Label>
            <Input
              id="g-weight"
              data-ocid="goals.weight.input"
              type="number"
              step="0.1"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            data-ocid="goals.cancel_button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            data-ocid="goals.submit_button"
            onClick={handleSubmit}
            disabled={createGoals.isPending}
            style={{ background: "oklch(0.48 0.09 215)", color: "white" }}
          >
            {createGoals.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {createGoals.isPending ? "Saving..." : "Save Goals"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
