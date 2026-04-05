import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { GoalsModal } from "../components/GoalsModal";
import { useSettings } from "../contexts/SettingsContext";
import { DEFAULT_GOALS, useGoals, useTodayEntry } from "../hooks/useQueries";

export function Goals() {
  const [goalsOpen, setGoalsOpen] = useState(false);
  const { data: goals = DEFAULT_GOALS, isLoading } = useGoals();
  const { data: todayEntry } = useTodayEntry();
  const { weightUnit } = useSettings();

  const steps = todayEntry ? Number(todayEntry.steps) : 0;
  const water = todayEntry ? Number(todayEntry.waterGlasses) : 0;
  const sleep = todayEntry ? todayEntry.sleepHours : 0;
  const calories = todayEntry ? Number(todayEntry.calories) : 0;
  const weightKg = todayEntry ? todayEntry.weight : 0;

  // Convert weight for display
  const weight = weightUnit === "lbs" ? weightKg * 2.2046 : weightKg;
  const targetWeightDisplay =
    weightUnit === "lbs" ? goals.targetWeight * 2.2046 : goals.targetWeight;
  const weightUnitLabel = weightUnit;

  const GOAL_ITEMS = [
    {
      icon: "\uD83C\uDFC3",
      label: "Daily Steps",
      unit: "steps",
      current: steps,
      target: Number(goals.targetSteps),
      color: "oklch(0.7 0.18 155)",
      bg: "oklch(0.93 0.06 155)",
      description: "Walk or run your way to better health",
    },
    {
      icon: "\uD83D\uDCA7",
      label: "Water Intake",
      unit: "glasses",
      current: water,
      target: Number(goals.targetWaterGlasses),
      color: "oklch(0.55 0.18 240)",
      bg: "oklch(0.93 0.07 240)",
      description: "Stay hydrated throughout the day",
    },
    {
      icon: "\uD83D\uDE34",
      label: "Sleep Duration",
      unit: "hours",
      current: sleep,
      target: goals.targetSleepHours,
      color: "oklch(0.55 0.2 290)",
      bg: "oklch(0.93 0.06 290)",
      description: "Quality rest for recovery and focus",
      decimal: true,
    },
    {
      icon: "\uD83D\uDD25",
      label: "Daily Calories",
      unit: "cal",
      current: calories,
      target: Number(goals.targetCalories),
      color: "oklch(0.72 0.18 65)",
      bg: "oklch(0.94 0.07 65)",
      description: "Fuel your body with the right amount",
    },
    {
      icon: "\u2696\uFE0F",
      label: "Target Weight",
      unit: weightUnitLabel,
      current: weight,
      target: targetWeightDisplay,
      color: "oklch(0.48 0.09 215)",
      bg: "oklch(0.92 0.04 215)",
      description: "Maintain a healthy weight over time",
      decimal: true,
      noProgress: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Health Goals</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Track your progress towards your targets
          </p>
        </div>
        <Button
          data-ocid="goals_page.edit.primary_button"
          onClick={() => setGoalsOpen(true)}
          className="flex items-center gap-2"
          style={{ background: "oklch(0.48 0.09 215)", color: "white" }}
        >
          <Settings className="w-4 h-4" />
          Edit Goals
        </Button>
      </div>

      {isLoading ? (
        <div
          data-ocid="goals_page.loading_state"
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: stable positional array
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {GOAL_ITEMS.map((goal, i) => {
            const pct = goal.noProgress
              ? null
              : goal.target > 0
                ? Math.min(Math.round((goal.current / goal.target) * 100), 100)
                : 0;
            const isAchieved = pct !== null && pct >= 100;

            return (
              <motion.div
                key={goal.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                data-ocid={`goals_page.item.${i + 1}`}
                className="bg-card rounded-2xl p-6 shadow-card"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: goal.bg }}
                  >
                    {goal.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">
                        {goal.label}
                      </h3>
                      {isAchieved && (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: "oklch(0.93 0.06 155)",
                            color: "oklch(0.4 0.15 155)",
                          }}
                        >
                          ✓ Achieved!
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {goal.description}
                    </p>

                    <div className="mt-4">
                      <div className="flex items-end justify-between mb-1.5">
                        <span className="text-2xl font-bold text-foreground">
                          {goal.decimal
                            ? goal.current.toFixed(1)
                            : goal.current.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /{" "}
                          {goal.decimal
                            ? goal.target.toFixed(1)
                            : Number(goal.target).toLocaleString()}{" "}
                          {goal.unit}
                        </span>
                      </div>

                      {pct !== null && (
                        <>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                background: goal.color,
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            {pct}% of daily goal
                          </p>
                        </>
                      )}

                      {goal.noProgress && (
                        <div className="mt-2">
                          <div
                            className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full"
                            style={{
                              background: goal.bg,
                              color:
                                weight > 0 &&
                                Math.abs(weight - goal.target) <= 1
                                  ? "oklch(0.4 0.15 155)"
                                  : "oklch(0.35 0.08 215)",
                            }}
                          >
                            {weight > 0 && Math.abs(weight - goal.target) <= 1
                              ? "✓ On track"
                              : weight > goal.target
                                ? `${(weight - goal.target).toFixed(1)}${weightUnitLabel} to lose`
                                : weight > 0
                                  ? `${(goal.target - weight).toFixed(1)}${weightUnitLabel} to gain`
                                  : "Log your weight"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <GoalsModal
        open={goalsOpen}
        onOpenChange={setGoalsOpen}
        currentGoals={goals}
      />
    </motion.div>
  );
}
