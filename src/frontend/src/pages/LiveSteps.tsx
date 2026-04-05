import { Button } from "@/components/ui/button";
import {
  Activity,
  Flame,
  Footprints,
  MapPin,
  Play,
  RotateCcw,
  Square,
  Timer,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  DEFAULT_GOALS,
  getToday,
  useCreateEntry,
  useGoals,
  useTodayEntry,
} from "../hooks/useQueries";

type PermissionState = "unknown" | "granted" | "denied" | "unsupported";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Circular progress ring */
function StepRing({
  steps,
  goal,
  isRunning,
}: {
  steps: number;
  goal: number;
  isRunning: boolean;
}) {
  const radius = 90;
  const stroke = 10;
  const normalised = Math.min(steps / Math.max(goal, 1), 1);
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - normalised);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 220, height: 220 }}
    >
      <svg
        width="220"
        height="220"
        aria-hidden="true"
        className="absolute top-0 left-0"
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="oklch(0.92 0.04 215)"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke={
            normalised >= 1 ? "oklch(0.55 0.18 155)" : "oklch(0.48 0.09 215)"
          }
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.4s ease, stroke 0.4s ease",
          }}
        />
      </svg>

      {/* Pulse ring when running */}
      {isRunning && (
        <span
          className="absolute rounded-full animate-ping"
          style={{
            inset: "10px",
            background: "oklch(0.48 0.09 215 / 0.12)",
            animationDuration: "1.5s",
          }}
        />
      )}

      {/* Inner content */}
      <div className="relative flex flex-col items-center justify-center">
        <motion.span
          key={steps}
          initial={{ scale: 1.15, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="text-5xl font-bold leading-none"
          style={{
            color: isRunning ? "oklch(0.35 0.1 215)" : "oklch(0.35 0.06 215)",
          }}
        >
          {steps.toLocaleString()}
        </motion.span>
        <span
          className="text-sm font-semibold mt-1"
          style={{ color: "oklch(0.55 0.08 215)" }}
        >
          steps
        </span>
        <span
          className="text-xs mt-0.5"
          style={{ color: "oklch(0.65 0.05 215)" }}
        >
          Goal: {goal.toLocaleString()}
        </span>
        {normalised >= 1 && (
          <span
            className="text-xs font-semibold mt-1"
            style={{ color: "oklch(0.45 0.18 155)" }}
          >
            🎉 Goal reached!
          </span>
        )}
      </div>
    </div>
  );
}

export function LiveSteps() {
  const [isRunning, setIsRunning] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [permissionState, setPermissionState] =
    useState<PermissionState>("unknown");
  const [simulatedMode, setSimulatedMode] = useState(false);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [activityStatus, setActivityStatus] = useState<
    "idle" | "active" | "fast"
  >("idle");
  const [stepsPerMinute, setStepsPerMinute] = useState(0);

  // Improved pedometer state
  const accelBufferRef = useRef<number[]>([]);
  const lastStepTimeRef = useRef(0);
  const stepTimestampsRef = useRef<number[]>([]);
  const lastPeakRef = useRef<"high" | "low" | "none">("none");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spmTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const motionHandlerRef = useRef<((e: DeviceMotionEvent) => void) | null>(
    null,
  );
  const autoSimRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const zeroStepCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: todayEntry } = useTodayEntry();
  const { data: goals = DEFAULT_GOALS } = useGoals();
  const createEntry = useCreateEntry();

  const stepGoal = Number(goals.targetSteps ?? BigInt(20000));

  // Derived stats
  const strideLength = 0.762; // metres
  const distanceKm = ((stepCount * strideLength) / 1000).toFixed(2);
  const caloriesBurned = Math.round(stepCount * 0.04);
  const avgPace =
    elapsedSeconds >= 5 ? Math.round(stepCount / (elapsedSeconds / 60)) : 0;

  // Detect device support on mount
  useEffect(() => {
    if (typeof DeviceMotionEvent === "undefined") {
      setPermissionState("unsupported");
      setSimulatedMode(true);
      return;
    }
    // @ts-expect-error iOS 13+ API
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      setPermissionState("unknown");
    } else {
      setPermissionState("granted");
    }
  }, []);

  /**
   * Improved step detection:
   * 1. Low-pass smooth the magnitude with an exponential moving average
   * 2. Detect peak then valley with threshold
   * 3. Enforce a minimum step interval of 250ms (max ~4 steps/s)
   */
  const smoothRef = useRef(9.8); // start near gravity
  const ALPHA = 0.1; // smoothing factor
  const STEP_THRESHOLD = 10.5;
  const MIN_STEP_INTERVAL_MS = 250;

  const handleDeviceMotion = useCallback(
    (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const x = acc.x ?? 0;
      const y = acc.y ?? 0;
      const z = acc.z ?? 0;
      const raw = Math.sqrt(x * x + y * y + z * z);

      // Exponential moving average
      smoothRef.current = ALPHA * raw + (1 - ALPHA) * smoothRef.current;
      const smoothed = smoothRef.current;

      // Buffer last 3 values for peak detection
      accelBufferRef.current.push(smoothed);
      if (accelBufferRef.current.length > 3) accelBufferRef.current.shift();
      if (accelBufferRef.current.length < 3) return;

      const [prev2, prev1, curr] = accelBufferRef.current;
      const now = Date.now();

      // Detect local peak above threshold
      if (
        prev1 > prev2 &&
        prev1 > curr &&
        prev1 > STEP_THRESHOLD &&
        lastPeakRef.current !== "high"
      ) {
        lastPeakRef.current = "high";
      }

      // Detect valley after peak -> count step
      if (
        prev1 < prev2 &&
        prev1 < curr &&
        lastPeakRef.current === "high" &&
        now - lastStepTimeRef.current > MIN_STEP_INTERVAL_MS
      ) {
        lastPeakRef.current = "low";
        lastStepTimeRef.current = now;
        stepTimestampsRef.current.push(now);
        setStepCount((prev) => prev + 1);
      }

      // Reset peak state after valley
      if (lastPeakRef.current === "low" && smoothed > STEP_THRESHOLD) {
        lastPeakRef.current = "none";
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const requestiOSPermission = async () => {
    try {
      // @ts-expect-error iOS 13+ API
      const result = await DeviceMotionEvent.requestPermission();
      if (result === "granted") {
        setPermissionState("granted");
      } else {
        setPermissionState("denied");
      }
    } catch {
      setPermissionState("denied");
    }
  };

  const startTracking = useCallback(() => {
    setIsRunning(true);
    setActivityStatus("idle");

    // Timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // SPM calculator every 5s
    spmTimerRef.current = setInterval(() => {
      const cutoff = Date.now() - 10_000;
      const recent = stepTimestampsRef.current.filter((t) => t > cutoff);
      stepTimestampsRef.current = recent;
      const spm = Math.round((recent.length / 10) * 60);
      setStepsPerMinute(spm);
      if (spm === 0) setActivityStatus("idle");
      else if (spm < 100) setActivityStatus("active");
      else setActivityStatus("fast");
    }, 5000);

    // Attach motion
    if (permissionState === "granted" && !simulatedMode) {
      motionHandlerRef.current = handleDeviceMotion;
      window.addEventListener("devicemotion", handleDeviceMotion);

      zeroStepCheckRef.current = setTimeout(() => {
        setStepCount((prev) => {
          if (prev === 0) setSimulatedMode(true);
          return prev;
        });
      }, 3000);
    } else {
      setSimulatedMode(true);
    }
  }, [permissionState, simulatedMode, handleDeviceMotion]);

  const pauseTracking = useCallback(() => {
    setIsRunning(false);
    setActivityStatus("idle");

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (spmTimerRef.current) {
      clearInterval(spmTimerRef.current);
      spmTimerRef.current = null;
    }
    if (motionHandlerRef.current) {
      window.removeEventListener("devicemotion", motionHandlerRef.current);
      motionHandlerRef.current = null;
    }
    if (zeroStepCheckRef.current) {
      clearTimeout(zeroStepCheckRef.current);
      zeroStepCheckRef.current = null;
    }
    if (autoSimRef.current) {
      clearInterval(autoSimRef.current);
      autoSimRef.current = null;
    }
    setAutoSimulate(false);
  }, []);

  const resetTracking = useCallback(() => {
    pauseTracking();
    setStepCount(0);
    setElapsedSeconds(0);
    setStepsPerMinute(0);
    stepTimestampsRef.current = [];
    accelBufferRef.current = [];
    smoothRef.current = 9.8;
    lastPeakRef.current = "none";
    lastStepTimeRef.current = 0;
    setSimulatedMode(permissionState === "unsupported");
  }, [pauseTracking, permissionState]);

  // Auto-simulate
  useEffect(() => {
    if (autoSimulate && isRunning) {
      autoSimRef.current = setInterval(() => {
        const now = Date.now();
        stepTimestampsRef.current.push(now);
        setStepCount((prev) => prev + 1);
      }, 600);
    } else {
      if (autoSimRef.current) {
        clearInterval(autoSimRef.current);
        autoSimRef.current = null;
      }
    }
    return () => {
      if (autoSimRef.current) {
        clearInterval(autoSimRef.current);
        autoSimRef.current = null;
      }
    };
  }, [autoSimulate, isRunning]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (spmTimerRef.current) clearInterval(spmTimerRef.current);
      if (motionHandlerRef.current)
        window.removeEventListener("devicemotion", motionHandlerRef.current);
      if (autoSimRef.current) clearInterval(autoSimRef.current);
      if (zeroStepCheckRef.current) clearTimeout(zeroStepCheckRef.current);
    };
  }, []);

  const saveToLog = async () => {
    const today = getToday();
    const existingSteps = todayEntry ? Number(todayEntry.steps) : 0;
    const newSteps = BigInt(existingSteps + stepCount);

    const entry = todayEntry
      ? { ...todayEntry, date: today, steps: newSteps }
      : {
          date: today,
          steps: newSteps,
          waterGlasses: BigInt(0),
          sleepHours: 0,
          calories: BigInt(0),
          weight: goals.targetWeight,
          mood: BigInt(0),
        };

    try {
      await createEntry.mutateAsync(entry);
      toast.success(
        `Added ${stepCount.toLocaleString()} steps to today's log!`,
      );
    } catch {
      toast.error("Failed to save steps. Please try again.");
    }
  };

  const activityLabel = { idle: "Idle", active: "Walking", fast: "Running" }[
    activityStatus
  ];
  const activityColor = {
    idle: "oklch(0.65 0.05 215)",
    active: "oklch(0.48 0.18 155)",
    fast: "oklch(0.55 0.2 65)",
  }[activityStatus];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(0.93 0.06 215)" }}
          >
            <Footprints
              className="w-5 h-5"
              style={{ color: "oklch(0.48 0.09 215)" }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Live Pedometer
            </h1>
            <p className="text-muted-foreground text-sm">
              Real-time step tracking using your device&apos;s motion sensor
            </p>
          </div>
        </div>
      </motion.div>

      {/* iOS Permission */}
      {permissionState === "unknown" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          data-ocid="live_steps.permission.card"
          className="bg-card rounded-2xl p-8 shadow-card text-center"
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "oklch(0.93 0.06 215)" }}
          >
            <Footprints
              className="w-10 h-10"
              style={{ color: "oklch(0.48 0.09 215)" }}
            />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Motion Sensor Access
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            VitaFlow needs access to your device motion sensor to detect steps
            accurately.
          </p>
          <Button
            data-ocid="live_steps.permission.primary_button"
            onClick={requestiOSPermission}
            className="rounded-full px-10 h-11"
            style={{ background: "oklch(0.48 0.09 215)", color: "white" }}
          >
            Allow Motion Access
          </Button>
        </motion.div>
      )}

      {/* Denied */}
      {permissionState === "denied" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          data-ocid="live_steps.denied.error_state"
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{
            background: "oklch(0.97 0.02 25)",
            border: "1px solid oklch(0.88 0.06 25)",
          }}
        >
          <span className="text-lg">⚠️</span>
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "oklch(0.45 0.15 25)" }}
            >
              Permission Denied
            </p>
            <p className="text-xs text-muted-foreground">
              Motion sensor denied — using Simulated Mode below.
            </p>
          </div>
        </motion.div>
      )}

      {/* Simulated mode banner */}
      {simulatedMode && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          data-ocid="live_steps.simulated.card"
          className="rounded-2xl p-3 flex items-center gap-3"
          style={{
            background: "oklch(0.95 0.04 215)",
            border: "1px solid oklch(0.88 0.06 215)",
          }}
        >
          <Activity
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "oklch(0.48 0.09 215)" }}
          />
          <p className="text-xs" style={{ color: "oklch(0.38 0.1 215)" }}>
            <strong>Simulated Mode</strong> — use the manual controls below, or
            open on a mobile device for real step detection.
          </p>
        </motion.div>
      )}

      {/* Main pedometer card */}
      {(permissionState === "granted" ||
        permissionState === "unsupported" ||
        permissionState === "denied") && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-card rounded-2xl p-6 shadow-card flex flex-col items-center"
        >
          {/* Activity status badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full mb-5 text-xs font-semibold"
            style={{
              background: `${activityColor}18`,
              color: activityColor,
              border: `1px solid ${activityColor}40`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: activityColor,
                boxShadow: isRunning ? `0 0 6px ${activityColor}` : "none",
                animation:
                  isRunning && activityStatus !== "idle"
                    ? "pulse 1s ease-in-out infinite"
                    : "none",
              }}
            />
            {activityLabel}
            {isRunning && stepsPerMinute > 0 && (
              <span className="ml-1 font-normal opacity-75">
                {stepsPerMinute} spm
              </span>
            )}
          </div>

          {/* Ring counter */}
          <StepRing steps={stepCount} goal={stepGoal} isRunning={isRunning} />

          {/* Timer */}
          <div className="flex items-center gap-2 mt-4 mb-5">
            <Timer className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground font-mono text-sm">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 w-full mb-6">
            <div
              data-ocid="live_steps.distance.card"
              className="rounded-xl p-3 text-center"
              style={{ background: "oklch(0.94 0.06 155)" }}
            >
              <MapPin
                className="w-4 h-4 mx-auto mb-1"
                style={{ color: "oklch(0.45 0.18 155)" }}
              />
              <p
                className="text-lg font-bold"
                style={{ color: "oklch(0.3 0.12 155)" }}
              >
                {distanceKm}
              </p>
              <p className="text-xs" style={{ color: "oklch(0.45 0.1 155)" }}>
                km
              </p>
            </div>
            <div
              data-ocid="live_steps.calories.card"
              className="rounded-xl p-3 text-center"
              style={{ background: "oklch(0.94 0.07 65)" }}
            >
              <Flame
                className="w-4 h-4 mx-auto mb-1"
                style={{ color: "oklch(0.55 0.18 65)" }}
              />
              <p
                className="text-lg font-bold"
                style={{ color: "oklch(0.35 0.12 65)" }}
              >
                {caloriesBurned}
              </p>
              <p className="text-xs" style={{ color: "oklch(0.5 0.1 65)" }}>
                kcal
              </p>
            </div>
            <div
              data-ocid="live_steps.pace.card"
              className="rounded-xl p-3 text-center"
              style={{ background: "oklch(0.93 0.06 290)" }}
            >
              <Footprints
                className="w-4 h-4 mx-auto mb-1"
                style={{ color: "oklch(0.45 0.18 290)" }}
              />
              <p
                className="text-lg font-bold"
                style={{ color: "oklch(0.3 0.12 290)" }}
              >
                {avgPace > 0 ? avgPace : "--"}
              </p>
              <p className="text-xs" style={{ color: "oklch(0.45 0.1 290)" }}>
                spm avg
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {!isRunning ? (
              <Button
                data-ocid="live_steps.start.primary_button"
                onClick={startTracking}
                className="flex items-center gap-2 rounded-full px-10 h-12 text-base font-semibold"
                style={{ background: "oklch(0.48 0.09 215)", color: "white" }}
              >
                <Play className="w-5 h-5" />
                Start
              </Button>
            ) : (
              <Button
                data-ocid="live_steps.pause.primary_button"
                onClick={pauseTracking}
                className="flex items-center gap-2 rounded-full px-10 h-12 text-base font-semibold"
                style={{ background: "oklch(0.48 0.09 215)", color: "white" }}
              >
                <Square className="w-5 h-5" />
                Pause
              </Button>
            )}
            <Button
              data-ocid="live_steps.reset.secondary_button"
              variant="outline"
              onClick={resetTracking}
              className="flex items-center gap-2 rounded-full px-7 h-12"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </motion.div>
      )}

      {/* Simulated controls */}
      {simulatedMode && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-card rounded-2xl p-5 shadow-card"
        >
          <h3 className="font-semibold text-foreground mb-1">
            Manual Step Controls
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Tap to simulate steps on desktop/unsupported devices
          </p>
          <div className="flex items-center gap-3 flex-wrap mb-4">
            {([1, 5, 10, 50] as const).map((n) => (
              <Button
                key={n}
                data-ocid={`live_steps.add${n}.secondary_button`}
                variant="outline"
                className="rounded-full font-semibold"
                onClick={() => {
                  const now = Date.now();
                  for (let i = 0; i < n; i++)
                    stepTimestampsRef.current.push(now);
                  setStepCount((prev) => prev + n);
                }}
              >
                +{n} step{n > 1 ? "s" : ""}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="live_steps.auto_simulate.toggle"
              onClick={() => setAutoSimulate((prev) => !prev)}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              style={{
                background: autoSimulate
                  ? "oklch(0.48 0.09 215)"
                  : "oklch(0.85 0.02 215)",
              }}
              aria-pressed={autoSimulate}
            >
              <span
                className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
                style={{
                  transform: autoSimulate
                    ? "translateX(20px)"
                    : "translateX(0px)",
                }}
              />
            </button>
            <span className="text-sm text-foreground">
              Auto-walk
              <span className="ml-1.5 text-xs text-muted-foreground">
                (1 step / 600ms)
              </span>
            </span>
          </div>
        </motion.div>
      )}

      {/* Save to log */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-card rounded-2xl p-5 shadow-card"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">
              Save to Today&apos;s Log
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add these {stepCount.toLocaleString()} steps to your daily
              tracking
            </p>
          </div>
          {stepCount > 0 && (
            <div className="text-right">
              <p
                className="text-xl font-bold"
                style={{ color: "oklch(0.48 0.09 215)" }}
              >
                {stepCount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">steps</p>
            </div>
          )}
        </div>
        <Button
          data-ocid="live_steps.save.primary_button"
          onClick={saveToLog}
          disabled={stepCount === 0 || createEntry.isPending}
          className="w-full rounded-xl h-11 font-semibold text-white"
          style={{
            background:
              stepCount === 0 ? "oklch(0.75 0.08 155)" : "oklch(0.55 0.18 155)",
          }}
        >
          {createEntry.isPending
            ? "Saving..."
            : stepCount === 0
              ? "No steps to save"
              : `Save ${stepCount.toLocaleString()} Steps`}
        </Button>
      </motion.div>
    </div>
  );
}
