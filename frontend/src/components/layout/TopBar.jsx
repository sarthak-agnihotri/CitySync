import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, RefreshCw, Bell, Home, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../common/ThemeToggle";

export function TopBar({ title, onRefresh, isRefreshing, unreadCount = 0, onToggleSidebar }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-4 sm:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="md:hidden p-2 rounded-md border border-[var(--border-strong)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] cursor-pointer"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
              {title}
            </h1>
            <span className="hidden sm:block text-[11px] text-[var(--text-muted)] -mt-0.5">
              Municipal Infrastructure Operations Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Public Portal Link */}
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] transition-colors border border-[var(--border-subtle)]"
            title="View Public Portal Landing"
          >
            <Home className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Public Home</span>
          </Link>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Refresh Data Button */}
          {onRefresh && (
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              onClick={onRefresh}
              title="Refresh current data"
              disabled={isRefreshing}
              aria-label="Refresh data"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`}
                aria-hidden="true"
              />
            </button>
          )}

          {/* Notifications Bell */}
          <button
            type="button"
            className="relative inline-flex items-center justify-center p-2 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            onClick={() => navigate("/notifications")}
            title="Notifications"
            aria-label={`View notifications, ${unreadCount} unread`}
          >
            <Bell className="w-4 h-4" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-[var(--bg-surface)]" />
            )}
          </button>

          {/* Officer Chip */}
          <div
            onClick={() => navigate("/notifications")}
            className="hidden sm:flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)] cursor-pointer"
            title="Signed in officer"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-[var(--text-primary)] line-clamp-1 max-w-[120px]">
                {user?.name || "Officer"}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] capitalize">
                {user?.role?.replace(/_/g, " ") || "officer"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
