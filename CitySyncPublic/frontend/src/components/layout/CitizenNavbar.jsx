import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Landmark, Menu, X, ArrowRight, User, LogOut, ExternalLink, AlertTriangle, Search, FileText } from "lucide-react";
import { useCitizenAuth } from "../../context/CitizenAuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { ThemeToggle } from "../common/ThemeToggle";

export function CitizenNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useCitizenAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity - Exact match with main portal */}
          <Link
            to="/"
            className="flex items-center gap-3 text-decoration-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md"
            aria-label="CitySync Public Home"
          >
            <div className="w-10 h-10 rounded-md bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
              <Landmark className="w-5 h-5 text-emerald-100" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                  CitySync <span className="text-emerald-700 dark:text-emerald-400">Public</span>
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Citizen Cell
                </span>
              </div>
              <span className="text-[11px] font-medium text-[var(--text-muted)] -mt-1 tracking-wide">
                {t("nav.portalSub")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-xs font-semibold transition-colors ${
                  isActive
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-[var(--text-secondary)] hover:text-emerald-700 dark:hover:text-emerald-400"
                }`
              }
            >
              {t("nav.home")}
            </NavLink>
            <NavLink
              to="/report"
              className={({ isActive }) =>
                `flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-[var(--text-secondary)] hover:text-emerald-700 dark:hover:text-emerald-400"
                }`
              }
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>{t("nav.report")}</span>
            </NavLink>
            <NavLink
              to="/track"
              className={({ isActive }) =>
                `flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-[var(--text-secondary)] hover:text-emerald-700 dark:hover:text-emerald-400"
                }`
              }
            >
              <Search className="w-3.5 h-3.5 text-sky-500" />
              <span>{t("nav.track")}</span>
            </NavLink>

            {isAuthenticated && (
              <NavLink
                to="/my-complaints"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-[var(--text-secondary)] hover:text-emerald-700 dark:hover:text-emerald-400"
                  }`
                }
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t("nav.myHistory")}</span>
              </NavLink>
            )}
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Theme Toggle matching main portal */}
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
                  <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary text-xs py-1.5 px-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  title={t("nav.signOut")}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn btn-secondary text-xs py-1.5 px-3"
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary text-xs py-1.5 px-3 shadow-xs"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}

            {/* Link to Municipal Staff Portal */}
            <a
              href="http://127.0.0.1:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)] transition-colors"
              title={t("nav.staffPortal")}
            >
              <span>{t("nav.staffPortal")}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle compact={true} />
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 pt-3 pb-5 space-y-3">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
            >
              {t("nav.home")}
            </Link>
            <Link
              to="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
            >
              {t("nav.report")}
            </Link>
            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
            >
              {t("nav.track")}
            </Link>
            {isAuthenticated && (
              <Link
                to="/my-complaints"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
              >
                {t("nav.myHistory")}
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="btn btn-secondary w-full text-xs justify-center"
              >
                {t("nav.signOut")}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary w-full text-xs justify-center"
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary w-full text-xs justify-center"
                >
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function CitizenFooter() {
  const { t } = useLanguage();
  return (
    <footer className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-8 text-xs text-[var(--text-muted)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span className="font-semibold text-[var(--text-secondary)]">{t("footer.org")}</span>
          <span>• {t("footer.mechanism")}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{t("footer.control")}</span>
          <span>•</span>
          <span>{t("footer.emergency")}</span>
        </div>
      </div>
    </footer>
  );
}
