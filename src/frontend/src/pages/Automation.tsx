import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  BellOff,
  BellRing,
  Calendar,
  CheckCircle2,
  Flame,
  Plus,
  SendHorizonal,
  Sparkles,
  Trash2,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Entry } from "../backend";
import { LogEntryModal } from "../components/LogEntryModal";
import {
  DEFAULT_GOALS,
  getToday,
  useGoals,
  useRecentEntries,
  useRecentWorkouts,
  useTodayEntry,
} from "../hooks/useQueries";
import {
  cancelAll,
  getPermission,
  requestPermission,
  scheduleReminders,
} from "../utils/notificationScheduler";
import type {
  Reminder,
  ReminderCategory,
} from "../utils/notificationScheduler";

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: {
  value: ReminderCategory;
  label: string;
  emoji: string;
}[] = [
  { value: "steps", label: "Steps", emoji: "🏃" },
  { value: "water", label: "Water", emoji: "💧" },
  { value: "sleep", label: "Sleep", emoji: "😴" },
  { value: "calories", label: "Calories", emoji: "🔥" },
  { value: "workout", label: "Workout", emoji: "💪" },
  { value: "mood", label: "Mood", emoji: "😊" },
];

const STORAGE_KEY = "vitaflow_reminders";

function generateId(): string {
  return `r_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function loadReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Reminder[]) : defaultReminders();
  } catch {
    return defaultReminders();
  }
}

function defaultReminders(): Reminder[] {
  return [
    {
      id: generateId(),
      label: "Log morning steps",
      time: "09:00",
      enabled: true,
      category: "steps",
    },
    {
      id: generateId(),
      label: "Drink a glass of water",
      time: "12:00",
      enabled: true,
      category: "water",
    },
    {
      id: generateId(),
      label: "Log dinner calories",
      time: "19:30",
      enabled: false,
      category: "calories",
    },
    {
      id: generateId(),
      label: "Check sleep goal",
      time: "22:00",
      enabled: true,
      category: "sleep",
    },
  ];
}

function saveReminders(reminders: Reminder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

// ─── Panel 1: Daily Reminders ────────────────────────────────────────────────

function DailyRemindersPanel() {
  const [reminders, setReminders] = useState<Reminder[]>(loadReminders);
  const [newLabel, setNewLabel] = useState("");
  const [newTime, setNewTime] = useState("08:00");
  const [newCategory, setNewCategory] = useState<ReminderCategory>("water");
  const [permissionStatus, setPermissionStatus] = useState<
    NotificationPermission | "unsupported"
  >(getPermission);
  const [testSent, setTestSent] = useState(false);

  // Start scheduler on mount if permission already granted; cancel on unmount
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only effect
  useEffect(() => {
    if (permissionStatus === "granted") {
      scheduleReminders(reminders);
    }
    return () => cancelAll();
  }, []);

  const update = (next: Reminder[]) => {
    setReminders(next);
    saveReminders(next);
    if (permissionStatus === "granted") {
      scheduleReminders(next);
    }
  };

  const toggleReminder = (id: string) => {
    update(
      reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
  };

  const deleteReminder = (id: string) => {
    update(reminders.filter((r) => r.id !== id));
  };

  const addReminder = () => {
    if (!newLabel.trim()) return;
    const next: Reminder[] = [
      ...reminders,
      {
        id: generateId(),
        label: newLabel.trim(),
        time: newTime,
        enabled: true,
        category: newCategory,
      },
    ];
    update(next);
    setNewLabel("");
    setNewTime("08:00");
    setNewCategory("water");
  };

  const handleEnableNotifications = async () => {
    const result = await requestPermission();
    setPermissionStatus(result);
    if (result === "granted") {
      scheduleReminders(reminders);
    }
  };

  const handleTestNotification = () => {
    if (permissionStatus !== "granted") return;
    try {
      new Notification("🔔 VitaFlow Test", {
        body: "Notifications are working! Your reminders will fire on time.",
        icon: "/favicon.ico",
        tag: "vitaflow_test",
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } catch {
      // ignore
    }
  };

  const getCategoryEmoji = (cat: ReminderCategory) =>
    CATEGORY_OPTIONS.find((c) => c.value === cat)?.emoji ?? "📋";

  const renderNotificationStatus = () => {
    if (permissionStatus === "granted") {
      return (
        <motion.div
          key="granted"
          data-ocid="automation.reminders.notification_status"
          initial={{ opacity: 0, scale: 0.88, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: -4 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex flex-wrap items-center gap-2 mt-1.5"
        >
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: "oklch(0.92 0.08 155)",
              color: "oklch(0.35 0.14 155)",
            }}
          >
            <BellRing className="w-3 h-3" />
            Notifications on
          </span>
          <motion.button
            type="button"
            data-ocid="automation.reminders.test_notification_button"
            onClick={handleTestNotification}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.14 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors"
            style={{
              borderColor: testSent
                ? "oklch(0.7 0.18 155)"
                : "oklch(0.78 0.12 215)",
              background: testSent
                ? "oklch(0.92 0.08 155)"
                : "oklch(0.97 0.02 215)",
              color: testSent ? "oklch(0.35 0.14 155)" : "oklch(0.48 0.09 215)",
            }}
          >
            {testSent ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                Sent!
              </>
            ) : (
              <>
                <SendHorizonal className="w-3 h-3" />
                Test
              </>
            )}
          </motion.button>
        </motion.div>
      );
    }

    if (permissionStatus === "denied") {
      return (
        <motion.div
          key="denied"
          data-ocid="automation.reminders.notification_status"
          initial={{ opacity: 0, scale: 0.88, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: -4 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="inline-flex items-center gap-2 mt-1.5 self-start"
        >
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: "oklch(0.93 0.07 25)",
              color: "oklch(0.42 0.15 25)",
            }}
          >
            <BellOff className="w-3 h-3" />
            Blocked
          </span>
          <span className="text-[10px] text-muted-foreground italic">
            Enable in browser settings
          </span>
        </motion.div>
      );
    }

    if (permissionStatus === "unsupported") {
      return (
        <motion.div
          key="unsupported"
          data-ocid="automation.reminders.notification_status"
          initial={{ opacity: 0, scale: 0.88, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: -4 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mt-1.5 self-start"
          style={{
            background: "oklch(0.94 0.04 240)",
            color: "oklch(0.52 0.04 240)",
          }}
        >
          <Bell className="w-3 h-3" />
          Not supported
        </motion.div>
      );
    }

    // "default" — enable button with hover lift
    return (
      <motion.div
        key="default"
        initial={{ opacity: 0, scale: 0.88, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: -4 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="mt-1.5 self-start"
      >
        <motion.div
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
        >
          <Button
            data-ocid="automation.reminders.enable_notifications_button"
            size="sm"
            variant="outline"
            onClick={handleEnableNotifications}
            className="h-7 px-3 text-xs gap-1.5 border transition-shadow"
            style={{
              borderColor: "oklch(0.78 0.14 65)",
              color: "oklch(0.48 0.14 65)",
              background: "oklch(0.98 0.02 65)",
            }}
          >
            <Bell className="w-3 h-3" />
            Enable Notifications
          </Button>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <Card className="rounded-2xl shadow-card border-0">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.92 0.05 50)" }}
          >
            <Bell
              className="w-4.5 h-4.5"
              style={{ color: "oklch(0.6 0.16 50)" }}
            />
          </div>
          {/* Title + notification status stacked vertically for breathing room */}
          <div className="flex flex-col flex-1 min-w-0">
            <CardTitle className="text-base font-semibold leading-snug">
              Daily Reminders
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Schedule health check-in reminders
            </p>
            <AnimatePresence mode="wait">
              {renderNotificationStatus()}
            </AnimatePresence>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-ocid="automation.reminders.empty_state"
            className="text-center py-6"
          >
            <p className="text-muted-foreground text-sm">
              No reminders set. Add one below.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {reminders.map((r, i) => (
                <motion.div
                  key={r.id}
                  data-ocid={`automation.reminders.item.${i + 1}`}
                  layout
                  initial={{ opacity: 0, x: -12, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    x: 12,
                    scale: 0.96,
                    transition: { duration: 0.18 },
                  }}
                  transition={{
                    duration: 0.25,
                    delay: i * 0.04,
                    ease: "easeOut",
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <span className="text-lg flex-shrink-0">
                    {getCategoryEmoji(r.category)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{
                        color: r.enabled
                          ? "oklch(0.175 0.02 250)"
                          : "oklch(0.62 0.01 240)",
                        transition: "color 0.2s",
                      }}
                    >
                      {r.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{r.time}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[10px] hidden sm:flex flex-shrink-0 capitalize"
                  >
                    {r.category}
                  </Badge>
                  <Switch
                    data-ocid={`automation.reminders.switch.${i + 1}`}
                    checked={r.enabled}
                    onCheckedChange={() => toggleReminder(r.id)}
                    aria-label={`Toggle ${r.label}`}
                  />
                  <motion.button
                    type="button"
                    data-ocid={`automation.reminders.delete_button.${i + 1}`}
                    onClick={() => deleteReminder(r.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.12 }}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    aria-label={`Delete reminder: ${r.label}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Add reminder form */}
        <motion.div
          whileHover={{
            y: -2,
            boxShadow: "0 6px 24px oklch(0.48 0.09 215 / 0.10)",
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="rounded-xl p-3 space-y-3 border border-dashed border-border"
          style={{ background: "oklch(0.97 0.01 215)" }}
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            New Reminder
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="reminder-label" className="text-xs">
                Label
              </Label>
              <Input
                id="reminder-label"
                data-ocid="automation.reminders.label.input"
                placeholder="e.g. Log water intake"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addReminder()}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="reminder-time" className="text-xs">
                Time
              </Label>
              <Input
                id="reminder-time"
                data-ocid="automation.reminders.time.input"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="reminder-category" className="text-xs">
              Category
            </Label>
            <Select
              value={newCategory}
              onValueChange={(v) => setNewCategory(v as ReminderCategory)}
            >
              <SelectTrigger
                id="reminder-category"
                data-ocid="automation.reminders.category.select"
                className="h-8 text-sm"
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.emoji} {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            data-ocid="automation.reminders.add_button"
            size="sm"
            onClick={addReminder}
            disabled={!newLabel.trim()}
            className="w-full h-8 text-xs gap-1.5 transition-opacity"
            style={{ background: "oklch(0.48 0.09 215)", color: "white" }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Reminder
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}

// ─── Panel 2: Smart Auto-fill Suggestions ───────────────────────────────────

function AutoFillSuggestionsPanel() {
  const { data: recentEntries = [], isLoading: entriesLoading } =
    useRecentEntries(7);
  const { data: todayEntry, isLoading: todayLoading } = useTodayEntry();
  const { data: goals = DEFAULT_GOALS, isLoading: goalsLoading } = useGoals();

  const [logOpen, setLogOpen] = useState(false);
  const [prefillEntry, setPrefillEntry] = useState<Entry | null>(null);

  const isLoading = entriesLoading || todayLoading || goalsLoading;

  const avgSteps =
    recentEntries.length > 0
      ? Math.round(
          recentEntries.reduce((s, e) => s + Number(e.steps), 0) /
            recentEntries.length,
        )
      : 0;
  const avgWater =
    recentEntries.length > 0
      ? Math.round(
          recentEntries.reduce((s, e) => s + Number(e.waterGlasses), 0) /
            recentEntries.length,
        )
      : 0;
  const avgSleep =
    recentEntries.length > 0
      ? Math.round(
          (recentEntries.reduce((s, e) => s + e.sleepHours, 0) /
            recentEntries.length) *
            10,
        ) / 10
      : 0;
  const avgCalories =
    recentEntries.length > 0
      ? Math.round(
          recentEntries.reduce((s, e) => s + Number(e.calories), 0) /
            recentEntries.length,
        )
      : 0;

  const todaySteps = todayEntry ? Number(todayEntry.steps) : 0;
  const todayWater = todayEntry ? Number(todayEntry.waterGlasses) : 0;
  const todaySleep = todayEntry ? todayEntry.sleepHours : 0;
  const todayCalories = todayEntry ? Number(todayEntry.calories) : 0;

  const buildFillEntry = (
    overrides: Partial<{
      steps: number;
      waterGlasses: number;
      sleepHours: number;
      calories: number;
    }>,
  ): Entry => ({
    date: getToday(),
    steps: BigInt(overrides.steps ?? todaySteps),
    waterGlasses: BigInt(overrides.waterGlasses ?? todayWater),
    sleepHours: overrides.sleepHours ?? todaySleep,
    calories: BigInt(overrides.calories ?? todayCalories),
    weight: todayEntry?.weight ?? 0,
    mood: todayEntry?.mood ?? BigInt(3),
  });

  const suggestions: {
    key: string;
    icon: string;
    label: string;
    value: string;
    fill: Entry;
  }[] = [];

  if (avgSteps > 0 && todaySteps === 0) {
    suggestions.push({
      key: "steps",
      icon: "🏃",
      label: "steps",
      value: `${avgSteps.toLocaleString()} steps`,
      fill: buildFillEntry({ steps: avgSteps }),
    });
  }
  if (avgWater > 0 && todayWater === 0) {
    suggestions.push({
      key: "water",
      icon: "💧",
      label: "water glasses",
      value: `${avgWater} glasses`,
      fill: buildFillEntry({ waterGlasses: avgWater }),
    });
  }
  if (avgSleep > 0 && todaySleep === 0) {
    suggestions.push({
      key: "sleep",
      icon: "😴",
      label: "sleep hours",
      value: `${avgSleep}h sleep`,
      fill: buildFillEntry({ sleepHours: avgSleep }),
    });
  }
  if (avgCalories > 0 && todayCalories === 0) {
    suggestions.push({
      key: "calories",
      icon: "🔥",
      label: "calories",
      value: `${avgCalories.toLocaleString()} cal`,
      fill: buildFillEntry({ calories: avgCalories }),
    });
  }

  const handleApply = (fill: Entry) => {
    setPrefillEntry(fill);
    setLogOpen(true);
  };

  return (
    <>
      <Card className="rounded-2xl shadow-card border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "oklch(0.93 0.06 290)" }}
            >
              <Sparkles
                className="w-4.5 h-4.5"
                style={{ color: "oklch(0.55 0.2 290)" }}
              />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Smart Auto-fill
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Apply your 7-day averages to today
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div
              data-ocid="automation.autofill.loading_state"
              className="space-y-3"
            >
              {["a", "b", "c"].map((k) => (
                <div key={k} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div
              data-ocid="automation.autofill.empty_state"
              className="text-center py-8"
            >
              <CheckCircle2
                className="w-10 h-10 mx-auto mb-3"
                style={{ color: "oklch(0.55 0.18 155)" }}
              />
              <p className="text-sm font-medium text-foreground">
                All caught up!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {recentEntries.length === 0
                  ? "Log some entries first to generate suggestions."
                  : "Today's metrics are already logged."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {suggestions.map((s, i) => (
                <div
                  key={s.key}
                  data-ocid={`automation.autofill.item.${i + 1}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/50"
                  style={{ background: "oklch(0.97 0.015 215)" }}
                >
                  <span className="text-2xl flex-shrink-0">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Your average {s.label} is{" "}
                      <span
                        className="font-bold"
                        style={{ color: "oklch(0.48 0.09 215)" }}
                      >
                        {s.value}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Apply to today's log?
                    </p>
                  </div>
                  <Button
                    data-ocid={`automation.autofill.apply_button.${i + 1}`}
                    size="sm"
                    onClick={() => handleApply(s.fill)}
                    className="h-8 px-3 text-xs flex-shrink-0"
                    style={{
                      background: "oklch(0.48 0.09 215)",
                      color: "white",
                    }}
                  >
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <LogEntryModal
        open={logOpen}
        onOpenChange={setLogOpen}
        existingEntry={prefillEntry}
        goals={goals}
      />
    </>
  );
}

// ─── Panel 3: Goal Streaks ───────────────────────────────────────────────────

function GoalStreaksPanel() {
  const { data: recentEntries = [], isLoading: entriesLoading } =
    useRecentEntries(30);
  const { data: goals = DEFAULT_GOALS, isLoading: goalsLoading } = useGoals();

  const isLoading = entriesLoading || goalsLoading;

  // Build a map from date string -> entry for O(1) lookup
  const entryMap = new Map<string, Entry>();
  for (const e of recentEntries) {
    entryMap.set(e.date.toString(), e);
  }

  const computeStreak = (metFn: (e: Entry) => boolean): number => {
    let streak = 0;
    let day = getToday();
    while (true) {
      const entry = entryMap.get(day.toString());
      if (!entry || !metFn(entry)) break;
      streak++;
      day = day - 1n;
    }
    return streak;
  };

  const streaks = [
    {
      key: "steps",
      emoji: "🏃",
      label: "Steps",
      streak: computeStreak(
        (e) => Number(e.steps) >= Number(goals.targetSteps),
      ),
      color: "oklch(0.7 0.18 155)",
      bg: "oklch(0.93 0.06 155)",
    },
    {
      key: "water",
      emoji: "💧",
      label: "Water",
      streak: computeStreak(
        (e) => Number(e.waterGlasses) >= Number(goals.targetWaterGlasses),
      ),
      color: "oklch(0.55 0.18 240)",
      bg: "oklch(0.93 0.07 240)",
    },
    {
      key: "sleep",
      emoji: "😴",
      label: "Sleep",
      streak: computeStreak((e) => e.sleepHours >= goals.targetSleepHours),
      color: "oklch(0.55 0.2 290)",
      bg: "oklch(0.93 0.06 290)",
    },
    {
      key: "calories",
      emoji: "🔥",
      label: "Calories",
      streak: computeStreak(
        (e) =>
          Number(e.calories) > 0 &&
          Number(e.calories) <= Number(goals.targetCalories),
      ),
      color: "oklch(0.72 0.18 65)",
      bg: "oklch(0.94 0.07 65)",
    },
  ];

  return (
    <Card className="rounded-2xl shadow-card border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.94 0.07 65)" }}
          >
            <Trophy
              className="w-4.5 h-4.5"
              style={{ color: "oklch(0.6 0.18 65)" }}
            />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              Goal Streaks
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Consecutive days meeting your goals
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div
            data-ocid="automation.streaks.loading_state"
            className="grid grid-cols-2 gap-3"
          >
            {["a", "b", "c", "d"].map((k) => (
              <Skeleton key={k} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {streaks.map((s, i) => (
              <div
                key={s.key}
                data-ocid={`automation.streaks.item.${i + 1}`}
                className="rounded-xl p-4 flex flex-col items-center text-center gap-1"
                style={{ background: s.bg }}
              >
                <span className="text-2xl">{s.emoji}</span>
                <div className="flex items-center gap-1">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: s.color }}
                  >
                    {s.streak}
                  </span>
                  {s.streak >= 3 && (
                    <Flame
                      className="w-4 h-4"
                      style={{ color: "oklch(0.65 0.2 35)" }}
                    />
                  )}
                </div>
                <p className="text-xs font-semibold text-foreground">
                  {s.label}
                </p>
                {s.streak === 0 ? (
                  <p className="text-[10px] text-muted-foreground">
                    Start your streak today!
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground">
                    {s.streak === 1 ? "day" : "days"} in a row
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Panel 4: Workout Consistency ───────────────────────────────────────────

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function WorkoutConsistencyPanel() {
  const { data: workouts = [], isLoading } = useRecentWorkouts(28);

  // Build a set of workout days (date values as strings)
  const workoutDaySet = new Set<string>();
  const nameCounts = new Map<string, number>();
  for (const w of workouts) {
    workoutDaySet.add(w.date.toString());
    nameCounts.set(w.name, (nameCounts.get(w.name) ?? 0) + 1);
  }

  // Find most logged exercise
  let mostLogged = "—";
  let maxCount = 0;
  nameCounts.forEach((count, name) => {
    if (count > maxCount) {
      maxCount = count;
      mostLogged = name;
    }
  });

  // Build grid: 4 weeks x 7 days, starting from Monday of week containing (TODAY - 27)
  const todayNum = Number(getToday());
  const todayDow = (todayNum + 3) % 7; // 0=Mon, 6=Sun
  const gridStart = todayNum - todayDow - 21; // Monday 4 weeks ago

  const grid: { dayNum: number; isFuture: boolean; hasWorkout: boolean }[][] =
    [];
  for (let week = 0; week < 4; week++) {
    const row: { dayNum: number; isFuture: boolean; hasWorkout: boolean }[] =
      [];
    for (let dow = 0; dow < 7; dow++) {
      const dayNum = gridStart + week * 7 + dow;
      row.push({
        dayNum,
        isFuture: dayNum > todayNum,
        hasWorkout: workoutDaySet.has(dayNum.toString()),
      });
    }
    grid.push(row);
  }

  const totalWorkouts = workoutDaySet.size;
  const avgPerWeek = Math.round((totalWorkouts / 4) * 10) / 10;

  return (
    <Card className="rounded-2xl shadow-card border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "oklch(0.92 0.04 215)" }}
          >
            <Calendar
              className="w-4.5 h-4.5"
              style={{ color: "oklch(0.48 0.09 215)" }}
            />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              Workout Consistency
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Last 4 weeks</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div
            data-ocid="automation.consistency.loading_state"
            className="space-y-2"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total workouts", value: totalWorkouts.toString() },
                { label: "Most logged", value: mostLogged },
                { label: "Avg / week", value: `${avgPerWeek}` },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  data-ocid={`automation.consistency.item.${i + 1}`}
                  className="rounded-xl p-3 text-center"
                  style={{ background: "oklch(0.95 0.03 215)" }}
                >
                  <p
                    className="text-lg font-bold"
                    style={{ color: "oklch(0.48 0.09 215)" }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="space-y-1.5">
              {/* Day labels */}
              <div className="grid grid-cols-7 gap-1">
                {DAY_LABELS.map((d) => (
                  <p
                    key={d}
                    className="text-[10px] text-muted-foreground text-center font-medium"
                  >
                    {d}
                  </p>
                ))}
              </div>
              {/* Week rows */}
              {grid.map((week, wi) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: stable positional grid
                <div key={wi} className="grid grid-cols-7 gap-1">
                  {week.map((cell) => (
                    <div
                      key={cell.dayNum}
                      title={
                        cell.isFuture
                          ? "Future"
                          : cell.hasWorkout
                            ? "Workout logged"
                            : "No workout"
                      }
                      className="aspect-square rounded-md transition-colors"
                      style={{
                        background: cell.isFuture
                          ? "oklch(0.93 0.005 240)"
                          : cell.hasWorkout
                            ? "oklch(0.48 0.09 215)"
                            : cell.dayNum === todayNum
                              ? "oklch(0.88 0.04 215)"
                              : "oklch(0.92 0.008 240)",
                      }}
                    />
                  ))}
                </div>
              ))}
              {/* Legend */}
              <div className="flex items-center gap-3 justify-end pt-1">
                <div className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: "oklch(0.48 0.09 215)" }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Workout
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: "oklch(0.92 0.008 240)" }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Rest
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function Automation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: "oklch(0.48 0.09 215)" }}
        >
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Automation</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Smart reminders, auto-fill suggestions, and habit tracking
          </p>
        </div>
        <div className="ml-auto">
          <Badge
            className="gap-1.5 text-xs"
            style={{
              background: "oklch(0.92 0.04 215)",
              color: "oklch(0.42 0.09 215)",
            }}
          >
            <TrendingUp className="w-3 h-3" />
            Insights Active
          </Badge>
        </div>
      </div>

      {/* Grid of panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <DailyRemindersPanel />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <AutoFillSuggestionsPanel />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <GoalStreaksPanel />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <WorkoutConsistencyPanel />
        </motion.div>
      </div>
    </motion.div>
  );
}
