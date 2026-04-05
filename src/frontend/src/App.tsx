import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { Header } from "./components/Header";
import { LoginPage } from "./components/LoginPage";
import { Sidebar } from "./components/Sidebar";
import { SettingsProvider } from "./contexts/SettingsContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { AthleteStories } from "./pages/AthleteStories";
import { Automation } from "./pages/Automation";
import { Dashboard } from "./pages/Dashboard";
import { Goals } from "./pages/Goals";
import { History } from "./pages/History";
import { LiveSteps } from "./pages/LiveSteps";
import { PromoAd } from "./pages/PromoAd";
import { Settings, getStoredTheme } from "./pages/Settings";
import { Workouts } from "./pages/Workouts";

// Apply stored theme on startup
(function initTheme() {
  const theme = getStoredTheme();
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "system") {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.classList.add("dark");
    }
  }
})();

type Page =
  | "dashboard"
  | "history"
  | "goals"
  | "workouts"
  | "live-steps"
  | "athlete-stories"
  | "automation"
  | "settings"
  | "promo-ad";

function AppLayout() {
  const [activePage, setActivePage] = useState<Page>("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "history":
        return <History />;
      case "goals":
        return <Goals />;
      case "workouts":
        return <Workouts />;
      case "live-steps":
        return <LiveSteps />;
      case "athlete-stories":
        return <AthleteStories />;
      case "automation":
        return <Automation />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        activePage={activePage}
        onNavigate={(p) => setActivePage(p as Page)}
      />
      <Sidebar
        activePage={activePage}
        onNavigate={(p) => setActivePage(p as Page)}
      />

      {/* Main content area */}
      <main className="ml-60 pt-16 min-h-screen">
        <div className="p-6 max-w-5xl">
          {renderPage()}

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              &copy; {new Date().getFullYear()}. Built with &#10084;&#65039;
              using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </footer>
        </div>
      </main>

      {/* Promo Ad overlay */}
      {activePage === "promo-ad" && (
        <PromoAd onClose={() => setActivePage("dashboard")} />
      )}
    </div>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <SettingsProvider>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "oklch(0.48 0.09 215)" }}
            >
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                role="img"
                aria-label="VitaFlow logo"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm">Loading VitaFlow...</p>
          </div>
        </div>
      </SettingsProvider>
    );
  }

  if (!identity) {
    return (
      <SettingsProvider>
        <LoginPage />
      </SettingsProvider>
    );
  }

  return (
    <SettingsProvider>
      <AppLayout />
      <Toaster richColors />
    </SettingsProvider>
  );
}
