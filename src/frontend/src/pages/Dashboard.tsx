import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  ChevronRight,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  Lightbulb,
  Moon,
  MoreHorizontal,
  Plus,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { CircularProgress } from "../components/CircularProgress";
import { GoalsModal } from "../components/GoalsModal";
import { LogEntryModal } from "../components/LogEntryModal";
import { MiniBarChart } from "../components/MiniBarChart";
import { MoodChart } from "../components/MoodChart";
import { WeightChart } from "../components/WeightChart";
import { WorkoutLogModal } from "../components/WorkoutLogModal";
import {
  DEFAULT_GOALS,
  useGoals,
  useRecentEntries,
  useTodayEntry,
  useUserProfile,
  useWorkouts,
} from "../hooks/useQueries";
import { generateHealthInsights } from "../utils/aiEngine";
import type { HealthInsight } from "../utils/aiEngine";

const MOOD_LABEL: Record<number, string> = {
  1: "\uD83D\uDE1E Very Low",
  2: "\uD83D\uDE10 Low",
  3: "\uD83D\uDE42 Okay",
  4: "\uD83D\uDE0A Good",
  5: "\uD83D\uDE04 Great",
};

const COMMUNITY_REVIEWS = [
  {
    name: "Maya T.",
    rating: 5,
    quote: "VitaFlow completely transformed my fitness routine!",
    userType: "Marathon Runner",
  },
  {
    name: "Carlos R.",
    rating: 5,
    quote: "The AI workout suggestions are a game changer.",
    userType: "CrossFit Athlete",
  },
  {
    name: "Priya S.",
    rating: 4,
    quote: "Love the clean interface and holistic health view.",
    userType: "Fitness Enthusiast",
  },
];

function InsightIcon({ type }: { type: HealthInsight["type"] }) {
  if (type === "praise")
    return (
      <Star
        className="w-4 h-4 flex-shrink-0"
        style={{ color: "oklch(0.72 0.18 65)" }}
      />
    );
  if (type === "warning")
    return (
      <AlertTriangle
        className="w-4 h-4 flex-shrink-0"
        style={{ color: "oklch(0.6 0.18 25)" }}
      />
    );
  return (
    <Lightbulb
      className="w-4 h-4 flex-shrink-0"
      style={{ color: "oklch(0.55 0.18 240)" }}
    />
  );
}

function InsightBadge({ category }: { category: HealthInsight["category"] }) {
  const MAP: Record<
    HealthInsight["category"],
    { label: string; bg: string; color: string }
  > = {
    steps: {
      label: "Steps",
      bg: "oklch(0.93 0.06 155)",
      color: "oklch(0.45 0.15 155)",
    },
    sleep: {
      label: "Sleep",
      bg: "oklch(0.93 0.06 290)",
      color: "oklch(0.45 0.15 290)",
    },
    water: {
      label: "Water",
      bg: "oklch(0.93 0.07 240)",
      color: "oklch(0.45 0.15 240)",
    },
    calories: {
      label: "Calories",
      bg: "oklch(0.94 0.07 65)",
      color: "oklch(0.55 0.15 65)",
    },
    mood: {
      label: "Mood",
      bg: "oklch(0.95 0.04 27)",
      color: "oklch(0.55 0.15 27)",
    },
    general: {
      label: "General",
      bg: "oklch(0.93 0.04 215)",
      color: "oklch(0.45 0.1 215)",
    },
  };
  const style = MAP[category];
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}

export function Dashboard() {
  const [logOpen, setLogOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [workoutLogOpen, setWorkoutLogOpen] = useState(false);

  const { data: profile } = useUserProfile();
  const { data: todayEntry, isLoading: entryLoading } = useTodayEntry();
  const { data: goals = DEFAULT_GOALS, isLoading: goalsLoading } = useGoals();
  const { data: recentEntries = [] } = useRecentEntries(7);
  const { data: todayWorkouts = [], isLoading: workoutsLoading } =
    useWorkouts();

  const userName = profile?.name || "User";
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const steps = todayEntry ? Number(todayEntry.steps) : 0;
  const water = todayEntry ? Number(todayEntry.waterGlasses) : 0;
  const sleep = todayEntry ? todayEntry.sleepHours : 0;
  const calories = todayEntry ? Number(todayEntry.calories) : 0;
  const weight = todayEntry ? todayEntry.weight : 0;
  const mood = todayEntry ? Number(todayEntry.mood) : 0;

  const targetSteps = Number(goals.targetSteps);
  const targetWater = Number(goals.targetWaterGlasses);
  const targetSleep = goals.targetSleepHours;
  const targetCalories = Number(goals.targetCalories);

  const goalPcts = [
    targetSteps > 0 ? Math.min(steps / targetSteps, 1) : 0,
    targetWater > 0 ? Math.min(water / targetWater, 1) : 0,
    targetSleep > 0 ? Math.min(sleep / targetSleep, 1) : 0,
    targetCalories > 0 ? Math.min(calories / targetCalories, 1) : 0,
  ];
  const overallPct = Math.round(
    (goalPcts.reduce((a, b) => a + b, 0) / goalPcts.length) * 100,
  );

  const stepsHistory = recentEntries.map((e) => Number(e.steps));
  if (stepsHistory.length === 0)
    stepsHistory.push(...[6200, 8100, 7400, 9200, 8800, 10200, steps]);

  const isLoading = entryLoading || goalsLoading;

  const insights = generateHealthInsights(recentEntries, goals);

  return (
    <>
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome Back, {userName}!
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Your Daily Overview
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">{dateStr}</p>
            </div>
            <Button
              data-ocid="dashboard.log_today.primary_button"
              onClick={() => setLogOpen(true)}
              className="flex items-center gap-2 rounded-full px-5"
              style={{ background: "oklch(0.48 0.09 215)", color: "white" }}
            >
              <Plus className="w-4 h-4" />
              Log Today
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            data-ocid="dashboard.progress.card"
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.45 0.1 215), oklch(0.36 0.11 220))",
            }}
          >
            <div className="absolute top-4 right-4">
              <button
                type="button"
                className="text-white/60 hover:text-white p-1"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <p className="text-white/80 text-sm font-medium mb-4">
              Daily Progress Summary
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <CircularProgress
                  value={overallPct}
                  size={128}
                  strokeWidth={10}
                  label="Overall Goals"
                />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1 w-full">
                {/* Steps */}
                <div className="bg-white rounded-xl p-3 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ background: "oklch(0.94 0.06 155)" }}
                    >
                      <Footprints
                        className="w-3.5 h-3.5"
                        style={{ color: "oklch(0.55 0.18 155)" }}
                      />
                    </div>
                    <TrendingUp
                      className="w-3.5 h-3.5"
                      style={{ color: "oklch(0.55 0.18 155)" }}
                    />
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 mb-1" />
                  ) : (
                    <p className="text-xl font-bold text-foreground">
                      {steps.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    of {targetSteps.toLocaleString()}
                  </p>
                  <div className="mt-2">
                    <MiniBarChart
                      values={stepsHistory.slice(-5)}
                      color="oklch(0.7 0.18 155)"
                      height={24}
                    />
                  </div>
                </div>

                {/* Water */}
                <div className="bg-white rounded-xl p-3 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ background: "oklch(0.93 0.07 240)" }}
                    >
                      <Droplets
                        className="w-3.5 h-3.5"
                        style={{ color: "oklch(0.55 0.18 240)" }}
                      />
                    </div>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 mb-1" />
                  ) : (
                    <p className="text-xl font-bold text-foreground">
                      {water}/{targetWater}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">glasses today</p>
                  <div className="flex gap-0.5 mt-2 flex-wrap">
                    {Array.from({ length: Math.min(targetWater, 8) }).map(
                      (_, i) => (
                        <div
                          // biome-ignore lint/suspicious/noArrayIndexKey: stable positional array
                          key={i}
                          className="w-3 h-3 rounded-full"
                          style={{
                            background:
                              i < water
                                ? "oklch(0.55 0.18 240)"
                                : "oklch(0.9 0.01 240)",
                          }}
                        />
                      ),
                    )}
                  </div>
                </div>

                {/* Sleep */}
                <div className="bg-white rounded-xl p-3 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ background: "oklch(0.93 0.06 290)" }}
                    >
                      <Moon
                        className="w-3.5 h-3.5"
                        style={{ color: "oklch(0.55 0.2 290)" }}
                      />
                    </div>
                    {sleep >= targetSleep * 0.85 ? (
                      <span
                        className="text-[10px] font-medium rounded-full px-1.5 py-0.5"
                        style={{
                          background: "oklch(0.92 0.06 155)",
                          color: "oklch(0.45 0.15 155)",
                        }}
                      >
                        Good
                      </span>
                    ) : (
                      <span
                        className="text-[10px] font-medium rounded-full px-1.5 py-0.5"
                        style={{
                          background: "oklch(0.95 0.04 65)",
                          color: "oklch(0.55 0.15 65)",
                        }}
                      >
                        Low
                      </span>
                    )}
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 mb-1" />
                  ) : (
                    <p className="text-xl font-bold text-foreground">
                      {sleep > 0
                        ? `${Math.floor(sleep)}h ${Math.round((sleep % 1) * 60)}m`
                        : "\u2014"}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    of {targetSleep}h goal
                  </p>
                </div>

                {/* Calories */}
                <div className="bg-white rounded-xl p-3 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ background: "oklch(0.94 0.07 65)" }}
                    >
                      <Flame
                        className="w-3.5 h-3.5"
                        style={{ color: "oklch(0.6 0.18 65)" }}
                      />
                    </div>
                    {calories > 0 && calories <= targetCalories ? (
                      <TrendingDown
                        className="w-3.5 h-3.5"
                        style={{ color: "oklch(0.55 0.18 155)" }}
                      />
                    ) : null}
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 mb-1" />
                  ) : (
                    <p className="text-xl font-bold text-foreground">
                      {calories.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    of {targetCalories.toLocaleString()} cal
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              My Wellness Trends
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-card rounded-2xl p-5 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">
                    Weight Tracking
                  </h3>
                  <div className="text-right">
                    {weight > 0 && (
                      <p className="text-lg font-bold text-foreground">
                        {weight}kg
                      </p>
                    )}
                    {recentEntries.length >= 2 &&
                      (() => {
                        const prev =
                          recentEntries[recentEntries.length - 2]?.weight;
                        const diff = weight - (prev || weight);
                        if (diff === 0) return null;
                        return (
                          <p
                            className="text-xs"
                            style={{
                              color:
                                diff < 0
                                  ? "oklch(0.55 0.18 155)"
                                  : "oklch(0.6 0.18 25)",
                            }}
                          >
                            {diff > 0 ? "+" : ""}
                            {diff.toFixed(1)}kg
                          </p>
                        );
                      })()}
                  </div>
                </div>
                <WeightChart entries={recentEntries} />
              </div>

              <div className="bg-card rounded-2xl p-5 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">
                    Mood Tracker
                  </h3>
                  {mood > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {MOOD_LABEL[mood]}
                    </span>
                  )}
                </div>
                <MoodChart entries={recentEntries} />
                {recentEntries.length === 0 && (
                  <div
                    data-ocid="dashboard.mood.empty_state"
                    className="text-center py-4"
                  >
                    <p className="text-muted-foreground text-sm">
                      Start logging your mood to see trends
                    </p>
                    <Button
                      variant="link"
                      className="text-sm mt-1 h-auto p-0"
                      style={{ color: "oklch(0.48 0.09 215)" }}
                      onClick={() => setLogOpen(true)}
                    >
                      Log your first entry &rarr;
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* AI Health Insights */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28 }}
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">
              AI Health Insights
            </h2>
            <div
              data-ocid="dashboard.ai_insights.card"
              className="bg-card rounded-2xl p-5 shadow-card space-y-3"
            >
              {isLoading ? (
                <div
                  data-ocid="dashboard.ai_insights.loading_state"
                  className="space-y-3"
                >
                  {Array.from({ length: 3 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: stable positional array
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="w-6 h-6 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                insights.map((insight, i) => (
                  <motion.div
                    key={insight.category + insight.message}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.07 }}
                    data-ocid={`dashboard.ai_insight.item.${i + 1}`}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{
                      background:
                        insight.type === "warning"
                          ? "oklch(0.97 0.02 27)"
                          : insight.type === "praise"
                            ? "oklch(0.96 0.03 155)"
                            : "oklch(0.97 0.015 240)",
                    }}
                  >
                    <InsightIcon type={insight.type} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <InsightBadge category={insight.category} />
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {insight.message}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Right rail */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="hidden xl:flex flex-col gap-5 w-80 flex-shrink-0"
        >
          {/* Community Reviews */}
          <div className="bg-card rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                Community Reviews
              </h3>
            </div>

            <div className="space-y-3">
              {COMMUNITY_REVIEWS.map((review, i) => (
                <div
                  key={review.name}
                  data-ocid={`reviews.item.${i + 1}`}
                  className="p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {review.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {review.userType}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star
                          // biome-ignore lint/suspicious/noArrayIndexKey: stable positional
                          key={j}
                          className="w-3 h-3"
                          fill="oklch(0.72 0.18 65)"
                          style={{ color: "oklch(0.72 0.18 65)" }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                </div>
              ))}
            </div>

            <Button
              data-ocid="activity.add_feed.button"
              className="w-full mt-4 rounded-xl text-sm h-9"
              style={{ background: "oklch(0.48 0.09 215)", color: "white" }}
              onClick={() => setLogOpen(true)}
            >
              + Add Today&apos;s Log
            </Button>
          </div>

          {/* Today's Workouts card */}
          <div
            data-ocid="dashboard.workouts.card"
            className="bg-card rounded-2xl p-5 shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                Today&apos;s Workouts
              </h3>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "oklch(0.92 0.04 215)" }}
              >
                <Dumbbell
                  className="w-4 h-4"
                  style={{ color: "oklch(0.48 0.09 215)" }}
                />
              </div>
            </div>

            {workoutsLoading ? (
              <div
                data-ocid="dashboard.workouts.loading_state"
                className="space-y-2"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-foreground">
                  {todayWorkouts.length > 0
                    ? `${todayWorkouts.length} workout${
                        todayWorkouts.length === 1 ? "" : "s"
                      }`
                    : "No workouts yet"}
                </p>
                {todayWorkouts.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {todayWorkouts.slice(0, 3).map((w) => (
                      <p
                        key={w.id.toString()}
                        className="text-xs text-muted-foreground truncate"
                      >
                        &bull; {w.name}
                        {w.weightKg > 0 ? ` \u00b7 ${w.weightKg}kg` : ""}
                      </p>
                    ))}
                    {todayWorkouts.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{todayWorkouts.length - 3} more
                      </p>
                    )}
                  </div>
                )}
                {todayWorkouts.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Log a workout to get started
                  </p>
                )}
              </>
            )}

            <Button
              data-ocid="dashboard.workouts.primary_button"
              className="w-full mt-4 rounded-xl text-sm h-9 flex items-center gap-2"
              style={{ background: "oklch(0.48 0.09 215)", color: "white" }}
              onClick={() => setWorkoutLogOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Log Workout
            </Button>
          </div>

          <div className="bg-card rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">My Goals</h3>
              <button
                type="button"
                data-ocid="goals.open_modal_button"
                className="text-xs font-medium px-3 py-1 rounded-full transition-colors hover:opacity-80"
                style={{
                  background: "oklch(0.92 0.04 215)",
                  color: "oklch(0.42 0.09 215)",
                }}
                onClick={() => setGoalsOpen(true)}
              >
                Edit
              </button>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: "\uD83C\uDFC3",
                  label: "Daily Steps",
                  current: steps,
                  target: targetSteps,
                  color: "oklch(0.7 0.18 155)",
                  bg: "oklch(0.93 0.06 155)",
                },
                {
                  icon: "\uD83D\uDCA7",
                  label: "Water Intake",
                  current: water,
                  target: targetWater,
                  color: "oklch(0.55 0.18 240)",
                  bg: "oklch(0.93 0.07 240)",
                },
                {
                  icon: "\uD83D\uDE34",
                  label: "Sleep Hours",
                  current: sleep,
                  target: targetSleep,
                  color: "oklch(0.55 0.2 290)",
                  bg: "oklch(0.93 0.06 290)",
                },
                {
                  icon: "\uD83D\uDD25",
                  label: "Calories",
                  current: calories,
                  target: targetCalories,
                  color: "oklch(0.72 0.18 65)",
                  bg: "oklch(0.94 0.07 65)",
                },
              ].map((goal, i) => {
                const pct =
                  goal.target > 0
                    ? Math.min(
                        Math.round(
                          (Number(goal.current) / Number(goal.target)) * 100,
                        ),
                        100,
                      )
                    : 0;
                return (
                  <div key={goal.label} data-ocid={`goals.item.${i + 1}`}>
                    <div className="flex items-center gap-3 mb-1.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                        style={{ background: goal.bg }}
                      >
                        {goal.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">
                            {goal.label}
                          </p>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {typeof goal.current === "number" &&
                          goal.current % 1 !== 0
                            ? `${goal.current.toFixed(1)} / ${
                                typeof goal.target === "number"
                                  ? goal.target.toFixed(1)
                                  : goal.target
                              }`
                            : `${Number(goal.current).toLocaleString()} / ${Number(goal.target).toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: goal.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              data-ocid="goals.add.button"
              className="w-full mt-4 flex items-center justify-center gap-2 text-sm py-2 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
              onClick={() => setGoalsOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Update goals
            </button>
          </div>
        </motion.div>
      </div>

      <LogEntryModal
        open={logOpen}
        onOpenChange={setLogOpen}
        existingEntry={todayEntry ?? null}
        goals={goals}
      />
      <GoalsModal
        open={goalsOpen}
        onOpenChange={setGoalsOpen}
        currentGoals={goals}
      />
      <WorkoutLogModal open={workoutLogOpen} onOpenChange={setWorkoutLogOpen} />
    </>
  );
}
