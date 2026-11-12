import React from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export function LanguageToggle({ className = "" }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-semibold ${className}`}
      role="group"
      aria-label="Language selection"
    >
      <Globe className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`cursor-pointer px-1 rounded transition-colors ${
          language === "en"
            ? "text-emerald-800 dark:text-emerald-300 font-bold underline underline-offset-2"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        }`}
      >
        EN
      </button>
      <span className="text-[var(--border-strong)]">/</span>
      <button
        type="button"
        onClick={() => setLanguage("hi")}
        aria-pressed={language === "hi"}
        className={`cursor-pointer px-1 rounded transition-colors ${
          language === "hi"
            ? "text-emerald-800 dark:text-emerald-300 font-bold underline underline-offset-2"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
}

