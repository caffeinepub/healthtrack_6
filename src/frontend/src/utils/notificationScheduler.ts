// ─── Notification Scheduler ────────────────────────────────────────────────
// Manages browser push notification scheduling using setInterval.
// Checks every minute whether the current HH:MM matches an enabled reminder.

export type ReminderCategory =
  | "steps"
  | "water"
  | "sleep"
  | "calories"
  | "workout"
  | "mood";

export interface Reminder {
  id: string;
  label: string;
  time: string; // "HH:MM" format
  enabled: boolean;
  category: ReminderCategory;
}

const CATEGORY_EMOJI: Record<ReminderCategory, string> = {
  steps: "🏃",
  water: "💧",
  sleep: "😴",
  calories: "🔥",
  workout: "💪",
  mood: "😊",
};

// Internal state
let intervalId: ReturnType<typeof setInterval> | null = null;
// Tracks the last minute each reminder was fired to prevent double-firing
const lastFiredMinute = new Map<string, string>();

function getCurrentHHMM(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function isSupported(): boolean {
  return typeof Notification !== "undefined";
}

/**
 * Returns the current Notification permission state, or 'unsupported' if
 * the Notification API is not available in this environment.
 */
export function getPermission(): NotificationPermission | "unsupported" {
  if (!isSupported()) return "unsupported";
  return Notification.permission;
}

/**
 * Requests notification permission from the browser.
 * Returns 'unsupported' if the API is unavailable.
 */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!isSupported()) return "denied";
  return Notification.requestPermission();
}

/**
 * Clears any existing scheduler interval.
 */
export function cancelAll(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  lastFiredMinute.clear();
}

/**
 * Schedules reminders by starting a 1-minute polling interval.
 * Each tick checks if the current HH:MM matches any enabled reminder,
 * and if so fires a browser notification (guarding against double-fire).
 */
export function scheduleReminders(reminders: Reminder[]): void {
  // Always cancel existing scheduler before starting a new one
  cancelAll();

  if (!isSupported() || Notification.permission !== "granted") return;
  if (reminders.length === 0) return;

  const check = () => {
    const currentTime = getCurrentHHMM();
    for (const reminder of reminders) {
      if (!reminder.enabled) continue;
      if (reminder.time !== currentTime) continue;

      // Prevent double-firing in the same minute
      const alreadyFired = lastFiredMinute.get(reminder.id);
      if (alreadyFired === currentTime) continue;

      lastFiredMinute.set(reminder.id, currentTime);

      const emoji = CATEGORY_EMOJI[reminder.category] ?? "📋";
      try {
        new Notification(`${emoji} VitaFlow Reminder`, {
          body: `Time to: ${reminder.label}`,
          icon: "/favicon.ico",
          tag: `vitaflow_reminder_${reminder.id}`,
        });
      } catch {
        // Notification may fail silently in some environments; ignore.
      }
    }
  };

  // Run once immediately in case we're exactly at a scheduled minute
  check();

  // Then poll every 60 seconds
  intervalId = setInterval(check, 60_000);
}
