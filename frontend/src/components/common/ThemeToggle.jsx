import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle({ className = "", compact = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
        isDark
          ? "bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-700"
          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300"
      } ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 animate-in fade-in" aria-hidden="true" />
          {!compact && <span>Light</span>}
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-neutral-700 animate-in fade-in" aria-hidden="true" />
          {!compact && <span>Dark</span>}
        </>
      )}
    </button>
  );
}
