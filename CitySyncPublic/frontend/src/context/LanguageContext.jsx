import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { publicTranslations } from "../i18n/translations";

const LanguageContext = createContext(null);
const LANG_KEY = "citysync_public_lang";

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "en" || saved === "hi") return saved;
    } catch (e) {
      console.warn("Could not read language from localStorage:", e);
    }
    return "en";
  });

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(LANG_KEY, language);
    } catch (e) {
      console.warn("Could not persist language to localStorage:", e);
    }
  }, [language]);

  const setLanguage = useCallback((lang) => {
    if (lang === "en" || lang === "hi") {
      setLanguageState(lang);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === "en" ? "hi" : "en"));
  }, []);

  const t = useCallback(
    (key, fallback) => {
      const dict = publicTranslations[language] || publicTranslations.en;
      if (dict[key] !== undefined) return dict[key];
      if (publicTranslations.en[key] !== undefined) return publicTranslations.en[key];
      return fallback !== undefined ? fallback : key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        isHindi: language === "hi",
        setLanguage,
        toggleLanguage,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

