import { Button } from "@/components/ui/button";
import { Activity, Heart, Target, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  const features = [
    {
      icon: Activity,
      label: "Track Daily Metrics",
      desc: "Steps, sleep, calories, water intake",
    },
    {
      icon: Target,
      label: "Set Health Goals",
      desc: "Personalized targets that adapt to you",
    },
    {
      icon: TrendingUp,
      label: "Visualize Progress",
      desc: "Beautiful charts of your wellness journey",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-teal flex-col justify-between p-12"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.42 0.1 215), oklch(0.36 0.11 220))",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-2xl font-bold tracking-tight">
            VitaFlow
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Your Health Journey
              <br />
              Starts Here
            </h1>
            <p className="mt-4 text-white/75 text-lg leading-relaxed">
              Track every step, every sip, every night of rest. VitaFlow gives
              you the clarity to live your healthiest life.
            </p>
          </div>

          <div className="space-y-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">{feature.label}</p>
                  <p className="text-white/65 text-sm mt-0.5">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className="text-white/50 text-sm">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="underline text-white/70"
          >
            caffeine.ai
          </a>
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "oklch(0.48 0.09 215)" }}
            >
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              VitaFlow
            </span>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back
          </h2>
          <p className="text-muted-foreground mb-10">
            Sign in to continue your health journey
          </p>

          <div className="space-y-4">
            <Button
              data-ocid="login.primary_button"
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              size="lg"
              className="w-full text-base font-semibold h-12"
              style={{ background: "oklch(0.48 0.09 215)", color: "white" }}
            >
              {isLoggingIn
                ? "Connecting..."
                : isInitializing
                  ? "Loading..."
                  : "Sign in with Internet Identity"}
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Secure, decentralized authentication via the{" "}
            <span className="font-medium text-foreground">
              Internet Computer
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
