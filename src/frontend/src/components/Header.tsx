import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Bell, Heart, LogOut, Search, Settings, User } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserProfile } from "../hooks/useQueries";

interface HeaderProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const NAV_LINKS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "history", label: "History" },
  { id: "goals", label: "Goals" },
  { id: "automation", label: "Automation" },
];

export function Header({ activePage, onNavigate }: HeaderProps) {
  const { clear } = useInternetIdentity();
  const { data: profile } = useUserProfile();
  const userName = profile?.name || "User";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border flex items-center px-6 gap-6 shadow-xs">
      {/* Brand */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "oklch(0.48 0.09 215)" }}
        >
          <Heart className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-foreground">
          VitaFlow
        </span>
      </div>

      {/* Center nav */}
      <nav
        className="hidden md:flex items-center gap-1 flex-1 justify-center"
        aria-label="Main navigation"
      >
        {NAV_LINKS.map((link) => (
          <button
            type="button"
            key={link.id}
            data-ocid={`nav.${link.id}.link`}
            onClick={() => onNavigate(link.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors relative ${
              activePage === link.id
                ? "text-teal"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={
              activePage === link.id
                ? { color: "oklch(0.48 0.09 215)" }
                : undefined
            }
          >
            {link.label}
            {activePage === link.id && (
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-0.5 rounded-full"
                style={{ background: "oklch(0.48 0.09 215)" }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* Right cluster */}
      <div className="flex items-center gap-2 ml-auto">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="header.search_input"
            placeholder="Search..."
            className="pl-9 h-9 w-48 rounded-full bg-muted border-0 text-sm"
          />
        </div>

        <div className="relative">
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
            <Bell className="w-4 h-4" />
          </Button>
          <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] rounded-full bg-destructive text-destructive-foreground border-2 border-card">
            2
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 rounded-full"
          data-ocid="header.settings.button"
          onClick={() => onNavigate("settings")}
          style={
            activePage === "settings" ? { color: "oklch(0.48 0.09 215)" } : {}
          }
        >
          <Settings className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-ocid="header.user.button"
              className="flex items-center gap-2 rounded-full hover:bg-muted px-2 py-1 transition-colors"
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback
                  className="text-xs font-semibold text-white"
                  style={{ background: "oklch(0.48 0.09 215)" }}
                >
                  {initials || <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-foreground">
                {userName}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              data-ocid="header.logout.button"
              onClick={clear}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
