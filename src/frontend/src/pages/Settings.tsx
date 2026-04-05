import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Check,
  Globe,
  Loader2,
  LogOut,
  Moon,
  Palette,
  Sun,
  SunMoon,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSettings } from "../contexts/SettingsContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveProfile, useUserProfile } from "../hooks/useQueries";

type Theme = "light" | "dark" | "system";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    if (prefersDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }
  localStorage.setItem("vitaflow-theme", theme);
}

export function getStoredTheme(): Theme {
  return (localStorage.getItem("vitaflow-theme") as Theme) || "system";
}

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Espa\u00f1ol" },
  { value: "fr", label: "Fran\u00e7ais" },
  { value: "de", label: "Deutsch" },
  { value: "hi", label: "\u0939\u093f\u0928\u094d\u0926\u0940" },
  { value: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" },
];

export function Settings() {
  const { clear } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const saveProfile = useSaveProfile();
  const {
    language,
    setLanguage,
    weightUnit,
    setWeightUnit,
    distanceUnit,
    setDistanceUnit,
  } = useSettings();

  const [name, setName] = useState("");
  const [nameSaved, setNameSaved] = useState(false);
  const [theme, setTheme] = useState<Theme>(getStoredTheme);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem("vitaflow-notifications") !== "disabled";
  });

  // Sync profile name into form
  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile?.name]);

  const handleSaveName = async () => {
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to save profile.");
    }
  };

  const handleThemeChange = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (enabled) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error(
          "Notification permission denied. Enable it in your browser settings.",
        );
        return;
      }
      localStorage.setItem("vitaflow-notifications", "enabled");
      toast.success("Notifications enabled!");
    } else {
      localStorage.setItem("vitaflow-notifications", "disabled");
      toast.success("Notifications disabled.");
    }
    setNotificationsEnabled(enabled);
  };

  const initials = (profile?.name || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const THEME_OPTIONS: { id: Theme; label: string; icon: React.ReactNode }[] = [
    { id: "light", label: "Light", icon: <Sun className="w-4 h-4" /> },
    { id: "dark", label: "Dark", icon: <Moon className="w-4 h-4" /> },
    {
      id: "system",
      label: "System",
      icon: <SunMoon className="w-4 h-4" />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 max-w-2xl"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage your profile, appearance, and preferences
        </p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-card rounded-2xl p-6 shadow-card space-y-4"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.93 0.04 215)" }}
          >
            <User
              className="w-4 h-4"
              style={{ color: "oklch(0.48 0.09 215)" }}
            />
          </div>
          <h2 className="text-base font-semibold text-foreground">Profile</h2>
        </div>
        <Separator />
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14">
            <AvatarFallback
              className="text-lg font-bold text-white"
              style={{ background: "oklch(0.48 0.09 215)" }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <Label htmlFor="settings-name" className="text-sm font-medium">
              Display Name
            </Label>
            <div className="flex gap-2">
              <Input
                id="settings-name"
                data-ocid="settings.name.input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                placeholder="Your name"
                className="flex-1"
              />
              <Button
                data-ocid="settings.save_name.button"
                onClick={handleSaveName}
                disabled={saveProfile.isPending}
                style={{
                  background: nameSaved
                    ? "oklch(0.7 0.18 155)"
                    : "oklch(0.48 0.09 215)",
                  color: "white",
                  transition: "background 0.3s",
                }}
              >
                {saveProfile.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : nameSaved ? (
                  <Check className="w-4 h-4" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Appearance Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-card rounded-2xl p-6 shadow-card space-y-4"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.93 0.07 65)" }}
          >
            <Palette
              className="w-4 h-4"
              style={{ color: "oklch(0.72 0.18 65)" }}
            />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Appearance
          </h2>
        </div>
        <Separator />
        <div>
          <Label className="text-sm font-medium">Theme</Label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">
            Choose how VitaFlow looks on your device
          </p>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map((opt) => {
              const isActive = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  data-ocid={`settings.theme.${opt.id}.button`}
                  onClick={() => handleThemeChange(opt.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    isActive
                      ? "border-primary shadow-sm"
                      : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                  }`}
                  style={
                    isActive ? { borderColor: "oklch(0.48 0.09 215)" } : {}
                  }
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: isActive
                        ? "oklch(0.93 0.04 215)"
                        : "oklch(0.945 0.005 240)",
                      color: isActive
                        ? "oklch(0.48 0.09 215)"
                        : "oklch(0.52 0.015 240)",
                    }}
                  >
                    {opt.icon}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: isActive
                        ? "oklch(0.48 0.09 215)"
                        : "oklch(0.52 0.015 240)",
                    }}
                  >
                    {opt.label}
                  </span>
                  {isActive && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "oklch(0.48 0.09 215)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Language & Units Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.13 }}
        className="bg-card rounded-2xl p-6 shadow-card space-y-4"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.93 0.06 155)" }}
          >
            <Globe
              className="w-4 h-4"
              style={{ color: "oklch(0.55 0.18 155)" }}
            />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Language &amp; Units
          </h2>
        </div>
        <Separator />

        {/* Language */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Language</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose your preferred language
            </p>
          </div>
          <Select value={language} onValueChange={(val) => setLanguage(val)}>
            <SelectTrigger
              data-ocid="settings.language.select"
              className="w-40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Weight Unit */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Weight Unit</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              kg or lbs for weight measurements
            </p>
          </div>
          <div className="flex rounded-xl overflow-hidden border border-border">
            {(["kg", "lbs"] as const).map((unit) => {
              const isActive = weightUnit === unit;
              return (
                <button
                  key={unit}
                  type="button"
                  data-ocid={`settings.weight_unit.${unit}.toggle`}
                  onClick={() => setWeightUnit(unit)}
                  className="px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    background: isActive
                      ? "oklch(0.48 0.09 215)"
                      : "transparent",
                    color: isActive ? "white" : "oklch(0.52 0.015 240)",
                  }}
                >
                  {unit}
                </button>
              );
            })}
          </div>
        </div>

        {/* Distance Unit */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Distance Unit</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              km or miles for distance measurements
            </p>
          </div>
          <div className="flex rounded-xl overflow-hidden border border-border">
            {(["km", "miles"] as const).map((unit) => {
              const isActive = distanceUnit === unit;
              return (
                <button
                  key={unit}
                  type="button"
                  data-ocid={`settings.distance_unit.${unit}.toggle`}
                  onClick={() => setDistanceUnit(unit)}
                  className="px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    background: isActive
                      ? "oklch(0.48 0.09 215)"
                      : "transparent",
                    color: isActive ? "white" : "oklch(0.52 0.015 240)",
                  }}
                >
                  {unit}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-card rounded-2xl p-6 shadow-card space-y-4"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.93 0.06 290)" }}
          >
            <Bell
              className="w-4 h-4"
              style={{ color: "oklch(0.55 0.2 290)" }}
            />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Notifications
          </h2>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Push Notifications
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Receive reminders for your daily health goals
            </p>
          </div>
          <Switch
            data-ocid="settings.notifications.toggle"
            checked={notificationsEnabled}
            onCheckedChange={handleNotificationsToggle}
          />
        </div>
      </motion.div>

      {/* Account Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-card rounded-2xl p-6 shadow-card space-y-4"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.95 0.03 27)" }}
          >
            <LogOut
              className="w-4 h-4"
              style={{ color: "oklch(0.577 0.245 27)" }}
            />
          </div>
          <h2 className="text-base font-semibold text-foreground">Account</h2>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Sign Out</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sign out of your Internet Identity account
            </p>
          </div>
          <Button
            data-ocid="settings.signout.button"
            variant="outline"
            onClick={clear}
            className="text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
