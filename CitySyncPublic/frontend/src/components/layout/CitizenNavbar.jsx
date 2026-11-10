import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Landmark, AlertTriangle, Search, FileText, User, LogOut, Sun, Moon, ExternalLink } from "lucide-react";
import { useCitizenAuth } from "../../context/CitizenAuthContext";
import { useTheme } from "../../context/ThemeContext";

export function CitizenNavbar() {
  const { user, isAuthenticated, logout } = useCitizenAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 text-decoration-none">
          <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold shadow-sm">
            <Landmark className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[var(--text-primary)]">
                CitySync <span className="text-emerald-700 dark:text-emerald-400">Public</span>
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Citizen Portal
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-medium -mt-0.5">
              Municipal Grievance & Civic Redressal
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                isActive
                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/report"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                isActive
                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
              }`
            }
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Report Issue
          </NavLink>
          <NavLink
            to="/track"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                isActive
                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
              }`
            }
          >
            <Search className="w-3.5 h-3.5 text-sky-500" />
            Track Complaint
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/my-complaints"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  isActive
                    ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
                }`
              }
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              My History
            </NavLink>
          )}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] cursor-pointer"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)]">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)]"
              >
                Citizen Login
              </Link>
              <Link
                to="/report"
                className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
              >
                Report Now
              </Link>
            </div>
          )}

          {/* Link to Municipal Admin Portal */}
          <a
            href="http://127.0.0.1:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="Switch to CitySync Municipal Staff Portal"
          >
            <span>Staff Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </header>
  );
}

export function CitizenFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-8 text-xs text-[var(--text-muted)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-emerald-700" />
          <span className="font-semibold text-[var(--text-secondary)]">CitySync Public Grievance Authority</span>
          <span>• Dedicated Citizen Redressal Mechanism</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Toll-Free Control Room: 1800-CITY-SYNC</span>
          <span>•</span>
          <span>Emergency Coordination: 112</span>
        </div>
      </div>
    </footer>
  );
}

