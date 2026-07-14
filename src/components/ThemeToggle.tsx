import React from "react";
import { Sun, Moon } from "lucide-react";
import type { Theme } from "../hooks/useTheme";

interface ThemeToggleProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function ThemeToggle({ theme, onToggleTheme }: ThemeToggleProps) {
  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      onClick={onToggleTheme}
      className="p-2 rounded-lg border border-warm-border text-charcoal-medium hover:text-charcoal-deep hover:bg-warm-soft transition-all focus-visible:outline-charcoal-deep"
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
    </button>
  );
}
