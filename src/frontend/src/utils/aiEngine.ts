import type { Entry, Goals, Workout } from "../backend";

export interface WorkoutSuggestion {
  name: string;
  sets: number;
  reps: number;
  weightKg: number;
  durationMinutes: number;
  rationale: string;
}

export interface HealthInsight {
  category: "steps" | "sleep" | "water" | "calories" | "mood" | "general";
  message: string;
  type: "tip" | "praise" | "warning";
}

type MuscleGroup =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "arms"
  | "core"
  | "cardio";

const MUSCLE_GROUPS: Record<string, MuscleGroup> = {
  "Bench Press": "chest",
  Dips: "chest",
  "Push-up": "chest",
  "Pull-up": "back",
  Deadlift: "back",
  "Barbell Row": "back",
  "Cable Row": "back",
  Squat: "legs",
  Lunges: "legs",
  "Romanian Deadlift": "legs",
  "Hip Thrust": "legs",
  "Box Jump": "legs",
  "Overhead Press": "shoulders",
  "Lateral Raise": "shoulders",
  "Bicep Curl": "arms",
  "Tricep Extension": "arms",
  Plank: "core",
  Crunch: "core",
  "Russian Twist": "core",
  "Mountain Climbers": "core",
  Running: "cardio",
  Cycling: "cardio",
  "Jump Rope": "cardio",
  Swimming: "cardio",
  "Battle Ropes": "cardio",
};

const BEGINNER_EXERCISE_PER_GROUP: Record<MuscleGroup, string> = {
  chest: "Bench Press",
  back: "Barbell Row",
  legs: "Squat",
  shoulders: "Overhead Press",
  arms: "Bicep Curl",
  core: "Plank",
  cardio: "Running",
};

const DEFAULT_SETS_REPS: Record<
  MuscleGroup,
  { sets: number; reps: number; weightKg: number; durationMinutes: number }
> = {
  chest: { sets: 3, reps: 10, weightKg: 40, durationMinutes: 0 },
  back: { sets: 3, reps: 10, weightKg: 50, durationMinutes: 0 },
  legs: { sets: 3, reps: 10, weightKg: 60, durationMinutes: 0 },
  shoulders: { sets: 3, reps: 12, weightKg: 30, durationMinutes: 0 },
  arms: { sets: 3, reps: 12, weightKg: 15, durationMinutes: 0 },
  core: { sets: 3, reps: 20, weightKg: 0, durationMinutes: 10 },
  cardio: { sets: 1, reps: 0, weightKg: 0, durationMinutes: 30 },
};

function roundToHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

export function generateWorkoutSuggestions(
  recentWorkouts: Workout[],
): WorkoutSuggestion[] {
  const sevenDaysAgo = BigInt(Math.floor(Date.now() / 86400000)) - BigInt(7);
  const recent = recentWorkouts.filter((w) => w.date >= sevenDaysAgo);

  const workedGroups = new Set<MuscleGroup>();
  const lastByExercise = new Map<string, Workout>();

  for (const w of recent) {
    const group = MUSCLE_GROUPS[w.name];
    if (group) workedGroups.add(group);
    const existing = lastByExercise.get(w.name);
    if (!existing || w.date > existing.date) {
      lastByExercise.set(w.name, w);
    }
  }

  const suggestions: WorkoutSuggestion[] = [];

  // Progressive overload for exercises done recently
  for (const [name, workout] of lastByExercise) {
    if (suggestions.length >= 3) break;
    const group = MUSCLE_GROUPS[name];
    if (!group) continue;
    const defaults = DEFAULT_SETS_REPS[group];
    const newWeight =
      workout.weightKg > 0
        ? roundToHalf(workout.weightKg * 1.05)
        : defaults.weightKg;
    const newReps =
      Number(workout.reps) > 0 ? Number(workout.reps) + 1 : defaults.reps;

    suggestions.push({
      name,
      sets: Number(workout.sets) || defaults.sets,
      reps: newReps,
      weightKg: newWeight,
      durationMinutes:
        Number(workout.durationMinutes) || defaults.durationMinutes,
      rationale:
        workout.weightKg > 0
          ? `Progressive overload: +5% weight from ${workout.weightKg}kg`
          : "Add 1 rep to build endurance",
    });
  }

  // Suggest unworked muscle groups
  const allGroups: MuscleGroup[] = [
    "chest",
    "back",
    "legs",
    "shoulders",
    "arms",
    "core",
    "cardio",
  ];
  for (const group of allGroups) {
    if (suggestions.length >= 5) break;
    if (!workedGroups.has(group)) {
      const exerciseName = BEGINNER_EXERCISE_PER_GROUP[group];
      const defaults = DEFAULT_SETS_REPS[group];
      suggestions.push({
        name: exerciseName,
        sets: defaults.sets,
        reps: defaults.reps,
        weightKg: defaults.weightKg,
        durationMinutes: defaults.durationMinutes,
        rationale: `${group.charAt(0).toUpperCase() + group.slice(1)} muscles not trained this week`,
      });
    }
  }

  return suggestions.slice(0, 5);
}

export function generateHealthInsights(
  entries: Entry[],
  goals: Goals,
): HealthInsight[] {
  const insights: HealthInsight[] = [];

  if (entries.length === 0) {
    insights.push({
      category: "general",
      message:
        "Start logging your health data to get personalized AI insights!",
      type: "tip",
    });
    return insights;
  }

  const targetSteps = Number(goals.targetSteps);
  const targetSleep = goals.targetSleepHours;
  const targetWater = Number(goals.targetWaterGlasses);

  const avgSteps =
    entries.reduce((s, e) => s + Number(e.steps), 0) / entries.length;
  const stepsDaysBelowTarget = entries.filter(
    (e) => Number(e.steps) < targetSteps,
  ).length;
  const sleepDaysBelowTarget = entries.filter(
    (e) => e.sleepHours < targetSleep,
  ).length;
  const waterDaysBelowTarget = entries.filter(
    (e) => Number(e.waterGlasses) < targetWater,
  ).length;

  // Steps insight
  if (avgSteps < targetSteps * 0.8) {
    insights.push({
      category: "steps",
      message: `Your average steps (${Math.round(avgSteps).toLocaleString()}) are below 80% of your goal. Try a 15-min walk after meals.`,
      type: "warning",
    });
  } else if (stepsDaysBelowTarget === 0) {
    insights.push({
      category: "steps",
      message:
        "Outstanding! You hit your step goal every day this week. Keep up the great work!",
      type: "praise",
    });
  } else {
    insights.push({
      category: "steps",
      message: `Good progress on steps! You hit your goal ${entries.length - stepsDaysBelowTarget} out of ${entries.length} days.`,
      type: "tip",
    });
  }

  // Sleep insight
  if (sleepDaysBelowTarget > entries.length / 2) {
    insights.push({
      category: "sleep",
      message:
        "You slept below your target more than half the days. Try a consistent bedtime routine and limit screen time before bed.",
      type: "tip",
    });
  }

  // Water insight
  if (waterDaysBelowTarget > entries.length / 2) {
    insights.push({
      category: "water",
      message:
        "Hydration is low this week. Keep a water bottle nearby and set reminders every 2 hours.",
      type: "tip",
    });
  }

  // Mood insight — check if mood is declining
  const moodValues = entries.map((e) => Number(e.mood)).filter((m) => m > 0);
  if (moodValues.length >= 4) {
    const midpoint = Math.floor(moodValues.length / 2);
    const firstHalfAvg =
      moodValues.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint;
    const secondHalfAvg =
      moodValues.slice(midpoint).reduce((a, b) => a + b, 0) /
      (moodValues.length - midpoint);
    if (secondHalfAvg < firstHalfAvg - 0.5) {
      insights.push({
        category: "mood",
        message:
          "Your mood has been trending down lately. Consider adding rest days, stretching, or time outdoors for recovery.",
        type: "tip",
      });
    } else if (secondHalfAvg >= firstHalfAvg) {
      insights.push({
        category: "mood",
        message:
          "Your mood is on the rise — your healthy habits are paying off!",
        type: "praise",
      });
    }
  }

  // General praise if all metrics on track
  if (
    insights.every((i) => i.type !== "warning") &&
    stepsDaysBelowTarget <= 1 &&
    sleepDaysBelowTarget <= 1 &&
    waterDaysBelowTarget <= 1
  ) {
    insights.push({
      category: "general",
      message:
        "All your health metrics are on track this week. You're crushing it — keep it up!",
      type: "praise",
    });
  }

  return insights.slice(0, 4);
}
