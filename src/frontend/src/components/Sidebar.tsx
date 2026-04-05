import {
  Dumbbell,
  Footprints,
  History,
  LayoutDashboard,
  Settings,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const SIDEBAR_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "history", label: "History", icon: History },
  { id: "goals", label: "Goals", icon: Target },
  { id: "workouts", label: "Workouts", icon: Dumbbell },
  { id: "live-steps", label: "Live Steps", icon: Footprints },
  { id: "athlete-stories", label: "Athlete Stories", icon: Trophy },
  { id: "automation", label: "Automation", icon: Zap },
  { id: "promo-ad", label: "Promo Ad", icon: Sparkles },
];

const SIDEBAR_BOTTOM = [{ id: "settings", label: "Settings", icon: Settings }];

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const renderItem = (item: {
    id: string;
    label: string;
    icon: React.ElementType;
  }) => {
    const isActive = activePage === item.id;
    return (
      <button
        type="button"
        key={item.id}
        data-ocid={`sidebar.${item.id}.link`}
        onClick={() => onNavigate(item.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? "text-white shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        style={isActive ? { background: "oklch(0.48 0.09 215)" } : {}}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {item.label}
      </button>
    );
  };

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-60 bg-card border-r border-border flex flex-col py-6 px-3 z-40 overflow-y-auto">
      <nav className="flex-1 space-y-1" aria-label="Sidebar navigation">
        {SIDEBAR_ITEMS.map(renderItem)}
      </nav>

      <div className="pt-4 border-t border-border space-y-1">
        {SIDEBAR_BOTTOM.map(renderItem)}
      </div>
    </aside>
  );
}
