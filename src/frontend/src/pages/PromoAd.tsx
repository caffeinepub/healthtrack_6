import { Bike, Dumbbell, Flame, RotateCcw, X, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface PromoAdProps {
  onClose: () => void;
}

const RING_CIRCUMFERENCE = 283;

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }
    let startTime: number | null = null;
    let frame: number;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);
  return count;
}

// Scene 1: Hero
function SceneHero() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 text-center px-8 scene-content">
      <div
        className="w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.55 0.1 215), oklch(0.42 0.12 215))",
          boxShadow: "0 0 60px oklch(0.55 0.1 215 / 0.5)",
        }}
      >
        <svg
          className="w-16 h-16"
          viewBox="0 0 24 24"
          fill="white"
          role="img"
          aria-label="VitaFlow heart logo"
        >
          <title>VitaFlow Heart</title>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
      <div>
        <h1
          className="text-7xl font-bold tracking-tight mb-3"
          style={{
            background: "linear-gradient(135deg, #ffffff, oklch(0.8 0.08 215))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          VitaFlow
        </h1>
        <p
          className="text-2xl font-light tracking-[0.3em] uppercase"
          style={{ color: "oklch(0.75 0.07 215)" }}
        >
          Track. Move. Thrive.
        </p>
      </div>
    </div>
  );
}

// Scene 2: Steps
function SceneSteps({ active }: { active: boolean }) {
  const steps = useCountUp(12847, 2000, active);
  const [ringProgress, setRingProgress] = useState(0);

  useEffect(() => {
    if (!active) {
      setRingProgress(0);
      return;
    }
    const timeout = setTimeout(() => setRingProgress(RING_CIRCUMFERENCE), 100);
    return () => clearTimeout(timeout);
  }, [active]);

  return (
    <div className="flex flex-col items-center justify-center gap-10 text-center px-8 scene-content">
      <div className="relative w-52 h-52">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 100 100"
          aria-label="Step progress ring"
          role="img"
        >
          <title>Step Progress</title>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="oklch(0.3 0.05 215)"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="oklch(0.55 0.1 215)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${RING_CIRCUMFERENCE}`}
            strokeDashoffset={`${RING_CIRCUMFERENCE - ringProgress}`}
            style={{ transition: "stroke-dashoffset 2s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">
            {steps.toLocaleString()}
          </span>
          <span className="text-sm" style={{ color: "oklch(0.75 0.07 215)" }}>
            steps today
          </span>
        </div>
      </div>
      <div>
        <p className="text-4xl font-bold text-white mb-2">Every step counts</p>
        <p
          className="text-lg font-light"
          style={{ color: "oklch(0.7 0.06 215)" }}
        >
          64% of your 20,000 step goal
        </p>
      </div>
    </div>
  );
}

// Scene 3: Sleep & Water
function SceneSleepWater() {
  return (
    <div className="flex flex-col items-center justify-center gap-10 text-center px-8 scene-content">
      <p className="text-4xl font-bold text-white">Rest &amp; Recover</p>
      <div className="flex gap-6 w-full max-w-md">
        {/* Sleep card */}
        <div
          className="flex-1 rounded-2xl p-6 flex flex-col items-center gap-4 slide-from-left"
          style={{
            background: "oklch(0.2 0.06 250 / 0.8)",
            border: "1px solid oklch(0.4 0.08 250 / 0.4)",
          }}
        >
          <div className="text-4xl" role="img" aria-label="moon">
            🌙
          </div>
          <div>
            <p className="text-3xl font-bold text-white">8h 12m</p>
            <p
              className="text-sm mt-1"
              style={{ color: "oklch(0.7 0.06 250)" }}
            >
              Sleep last night
            </p>
          </div>
        </div>
        {/* Water card */}
        <div
          className="flex-1 rounded-2xl p-6 flex flex-col items-center gap-4 slide-from-right"
          style={{
            background: "oklch(0.2 0.06 215 / 0.8)",
            border: "1px solid oklch(0.4 0.08 215 / 0.4)",
          }}
        >
          <div className="text-4xl" role="img" aria-label="water drop">
            💧
          </div>
          <div>
            <p className="text-3xl font-bold text-white">2.4L</p>
            <p
              className="text-sm mt-1"
              style={{ color: "oklch(0.7 0.06 215)" }}
            >
              Water intake
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Scene 4: Workouts
function SceneWorkouts() {
  const icons = [
    { Icon: Dumbbell, label: "Strength", delay: 0 },
    { Icon: Bike, label: "Cycling", delay: 100 },
    { Icon: Flame, label: "HIIT", delay: 200 },
    { Icon: Zap, label: "Power", delay: 300 },
  ];
  return (
    <div className="flex flex-col items-center justify-center gap-10 text-center px-8 scene-content">
      <p className="text-4xl font-bold text-white">Train Smarter</p>
      <div className="grid grid-cols-4 gap-4">
        {icons.map(({ Icon, label, delay }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-3"
            style={{ animationDelay: `${delay}ms` }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center workout-bounce"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.35 0.08 215), oklch(0.25 0.06 215))",
                border: "1px solid oklch(0.5 0.1 215 / 0.5)",
                animationDelay: `${delay}ms`,
              }}
            >
              <Icon
                className="w-9 h-9"
                style={{ color: "oklch(0.75 0.1 215)" }}
              />
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: "oklch(0.75 0.07 215)" }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      <p
        className="text-lg font-light"
        style={{ color: "oklch(0.7 0.06 215)" }}
      >
        40+ exercises tracked automatically
      </p>
    </div>
  );
}

// Scene 5: Automation & Streaks
function SceneAutomation({ active }: { active: boolean }) {
  const streak = useCountUp(14, 1500, active);
  const [bellRing, setBellRing] = useState(false);

  useEffect(() => {
    if (!active) {
      setBellRing(false);
      return;
    }
    const t1 = setTimeout(() => setBellRing(true), 600);
    const t2 = setTimeout(() => setBellRing(false), 1400);
    const t3 = setTimeout(() => setBellRing(true), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [active]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 text-center px-8 scene-content">
      <div className="flex items-center gap-10">
        {/* Streak */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-6xl" role="img" aria-label="fire">
            🔥
          </div>
          <span className="text-6xl font-bold text-white">{streak}</span>
          <span
            className="text-sm font-medium tracking-wide uppercase"
            style={{ color: "oklch(0.7 0.1 40)" }}
          >
            Day Streak
          </span>
        </div>
        {/* Divider */}
        <div
          className="h-24 w-px"
          style={{ background: "oklch(0.4 0.05 215)" }}
        />
        {/* Bell */}
        <div className="flex flex-col items-center gap-3">
          <div
            className={`text-6xl transition-transform duration-150 ${bellRing ? "bell-ring" : ""}`}
            role="img"
            aria-label="bell"
          >
            🔔
          </div>
          <span
            className="text-sm font-medium tracking-wide uppercase"
            style={{ color: "oklch(0.75 0.07 215)" }}
          >
            Smart Reminders
          </span>
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-white mb-2">Stay Consistent.</p>
        <p
          className="text-3xl font-bold mb-2"
          style={{ color: "oklch(0.75 0.1 215)" }}
        >
          Build Habits.
        </p>
        <p
          className="text-base font-light"
          style={{ color: "oklch(0.65 0.06 215)" }}
        >
          Automated reminders that work around your schedule
        </p>
      </div>
    </div>
  );
}

// Scene 6: CTA
function SceneCTA() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 text-center px-8 scene-content">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-2"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.55 0.1 215), oklch(0.42 0.12 215))",
          boxShadow: "0 0 40px oklch(0.55 0.1 215 / 0.4)",
        }}
      >
        <svg
          className="w-10 h-10"
          viewBox="0 0 24 24"
          fill="white"
          role="img"
          aria-label="VitaFlow logo"
        >
          <title>VitaFlow Logo</title>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
      <div>
        <h2
          className="text-5xl font-bold mb-3"
          style={{
            background: "linear-gradient(135deg, #ffffff, oklch(0.8 0.08 215))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Start Your Health Journey
        </h2>
        <p
          className="text-xl font-light"
          style={{ color: "oklch(0.72 0.06 215)" }}
        >
          Join thousands achieving their goals
        </p>
      </div>
      <button
        type="button"
        data-ocid="promo.cta.button"
        className="mt-2 px-10 py-4 text-lg font-semibold rounded-2xl text-white transition-transform hover:scale-105 active:scale-95"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.55 0.1 215), oklch(0.42 0.12 215))",
          animation: "ctaPulse 2s infinite",
        }}
      >
        Get Started
      </button>
      <p className="text-sm mt-4" style={{ color: "oklch(0.5 0.05 215)" }}>
        VitaFlow &mdash; Your personal health companion
      </p>
    </div>
  );
}

const SCENES = [
  { id: "hero", label: "Brand" },
  { id: "steps", label: "Steps" },
  { id: "sleep", label: "Sleep & Water" },
  { id: "workouts", label: "Workouts" },
  { id: "automation", label: "Automation" },
  { id: "cta", label: "CTA" },
];

export function PromoAd({ onClose }: PromoAdProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [visible, setVisible] = useState(true);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressKey = useRef(0);

  const goToScene = (index: number) => {
    setVisible(false);
    setTimeout(() => {
      setCurrentScene(index);
      setFinished(false);
      setVisible(true);
      progressKey.current += 1;
    }, 300);
  };

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentScene((prev) => {
        if (prev >= SCENES.length - 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setFinished(true);
          return prev;
        }
        setVisible(false);
        setTimeout(() => {
          setVisible(true);
          progressKey.current += 1;
        }, 300);
        return prev + 1;
      });
    }, 3000);
  }, []);

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startInterval]);

  const handleDotClick = (index: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setFinished(false);
    goToScene(index);
    setTimeout(() => startInterval(), 300);
  };

  const handleReplay = () => {
    setFinished(false);
    goToScene(0);
    setTimeout(() => startInterval(), 300);
  };

  const renderScene = () => {
    switch (currentScene) {
      case 0:
        return <SceneHero />;
      case 1:
        return <SceneSteps active={visible} />;
      case 2:
        return <SceneSleepWater />;
      case 3:
        return <SceneWorkouts />;
      case 4:
        return <SceneAutomation active={visible} />;
      case 5:
        return <SceneCTA />;
      default:
        return <SceneHero />;
    }
  };

  return (
    <>
      <style>{`
        @keyframes sceneEnter {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
        .scene-content {
          animation: sceneEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes progressBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        .progress-bar-fill {
          animation: progressBar 3s linear forwards;
        }
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 0 0 0 oklch(0.55 0.1 215 / 0.5); }
          50%       { box-shadow: 0 0 0 16px transparent; }
        }
        @keyframes workoutBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        .workout-bounce {
          animation: workoutBounce 1.8s ease-in-out infinite;
        }
        @keyframes bellRing {
          0%, 100% { transform: rotate(0deg); }
          20%       { transform: rotate(15deg); }
          40%       { transform: rotate(-12deg); }
          60%       { transform: rotate(10deg); }
          80%       { transform: rotate(-8deg); }
        }
        .bell-ring {
          animation: bellRing 0.7s ease-in-out;
        }
        @keyframes slideFromLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideFromRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .slide-from-left {
          animation: slideFromLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: 0.1s;
        }
        .slide-from-right {
          animation: slideFromRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: 0.2s;
        }
      `}</style>

      <section
        className="fixed inset-0 z-50 flex flex-col overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.15 0.05 215) 0%, oklch(0.10 0.03 215) 50%, oklch(0.08 0.02 215) 100%)",
        }}
        aria-label="VitaFlow promotional presentation"
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.25 0.08 215 / 0.3) 0%, transparent 60%)",
          }}
        />

        {/* Close button */}
        <button
          type="button"
          data-ocid="promo.close_button"
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{
            background: "oklch(0.25 0.05 215 / 0.8)",
            border: "1px solid oklch(0.4 0.08 215 / 0.4)",
            color: "oklch(0.8 0.06 215)",
          }}
          aria-label="Close promo"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scene label (top left) */}
        <div
          className="absolute top-5 left-6 z-10 text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ color: "oklch(0.55 0.08 215)" }}
        >
          {SCENES[currentScene]?.label}
        </div>

        {/* Scene content */}
        <div className="flex-1 flex items-center justify-center relative">
          <div
            key={currentScene}
            className="w-full flex items-center justify-center"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "scale(1)" : "scale(0.95)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            {renderScene()}
          </div>

          {/* Replay overlay */}
          {finished && (
            <button
              type="button"
              data-ocid="promo.replay.button"
              onClick={handleReplay}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              style={{
                background: "oklch(0.08 0.02 215 / 0.7)",
                backdropFilter: "blur(8px)",
              }}
              aria-label="Replay promo"
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "oklch(0.25 0.06 215)",
                  border: "2px solid oklch(0.55 0.1 215 / 0.6)",
                }}
              >
                <RotateCcw
                  className="w-8 h-8"
                  style={{ color: "oklch(0.75 0.1 215)" }}
                />
              </div>
              <span className="text-lg font-semibold text-white">Replay</span>
            </button>
          )}
        </div>

        {/* Bottom controls */}
        <div className="relative pb-6">
          {/* Scene dots */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {SCENES.map((scene, i) => (
              <button
                key={scene.id}
                type="button"
                data-ocid="promo.scene.tab"
                onClick={() => handleDotClick(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === currentScene ? "28px" : "10px",
                  height: "10px",
                  background:
                    i === currentScene
                      ? "oklch(0.65 0.1 215)"
                      : "oklch(0.35 0.05 215)",
                }}
                aria-label={`Go to scene ${i + 1}: ${scene.label}`}
                aria-current={i === currentScene ? "true" : undefined}
              />
            ))}
          </div>

          {/* Scene counter */}
          <div
            className="absolute right-6 bottom-8 text-sm font-medium tabular-nums"
            style={{ color: "oklch(0.55 0.07 215)" }}
          >
            {currentScene + 1} / {SCENES.length}
          </div>

          {/* Progress bar */}
          {!finished && (
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{ height: "3px", background: "oklch(0.2 0.04 215)" }}
            >
              <div
                key={`progress-${currentScene}-${progressKey.current}`}
                className="progress-bar-fill h-full"
                style={{ background: "oklch(0.55 0.1 215)" }}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
