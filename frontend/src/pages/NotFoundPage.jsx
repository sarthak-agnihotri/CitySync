import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { LanguageToggle } from "../components/common/LanguageToggle";

export function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="auth-screen">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="auth-card text-center">
        <div className="brand-icon">🗺️</div>
        <h1 className="brand-name">404</h1>
        <p className="brand-sub" style={{ marginBottom: "24px" }}>
          {t("notFound.title")}
        </p>
        <Link to="/" className="btn btn-primary btn-full">
          {t("notFound.return")}
        </Link>
      </div>
    </div>
  );
}
