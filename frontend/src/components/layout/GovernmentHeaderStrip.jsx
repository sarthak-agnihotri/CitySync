import React from "react";
import { ShieldCheck, PhoneCall, Globe } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export function GovernmentHeaderStrip() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="gov-strip py-1 px-4 sm:px-6 lg:px-8 border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" aria-hidden="true" />
          <span className="tracking-wide truncate">
            {t("gov.title")}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 text-neutral-200">
            <PhoneCall className="w-3 h-3 text-emerald-300" aria-hidden="true" />
            <span>{t("gov.controlRoom")}</span>
          </div>

          <div
            className="flex items-center gap-1 text-neutral-200 border-l border-emerald-700/50 pl-3"
            role="group"
            aria-label="Language selection"
          >
            <Globe className="w-3 h-3 text-emerald-300 shrink-0" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
              className={`cursor-pointer px-1 rounded transition-colors ${
                language === "en"
                  ? "font-bold text-white underline underline-offset-2"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              English
            </button>
            <span className="text-emerald-400/70">/</span>
            <button
              type="button"
              onClick={() => setLanguage("hi")}
              aria-pressed={language === "hi"}
              className={`cursor-pointer px-1 rounded transition-colors ${
                language === "hi"
                  ? "font-bold text-white underline underline-offset-2"
                  : "text-neutral-300 hover:text-white"
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
