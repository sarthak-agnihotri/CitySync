import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  Landmark,
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Bell,
  Building2,
  Users,
  ScrollText,
  LogOut,
  X,
  ExternalLink
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function Sidebar({ unreadCount = 0, isOpen, onClose }) {
  const { user, logout, isRole } = useAuth();

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const departmentName =
    user?.department && typeof user.department === "object"
      ? user.department.name
      : user?.department || "General Municipal Services";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 w-64 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col z-50 transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-decoration-none focus:outline-none"
            onClick={handleNavClick}
          >
            <div className="w-8 h-8 rounded-md bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
              <Landmark className="w-4 h-4 text-emerald-100" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                CitySync
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Coordination Cell
              </span>
            </div>
          </Link>

          {isOpen && (
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-surface-secondary)] cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Portal Navigation">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] hover:text-[var(--text-primary)]"
              }`
            }
            onClick={handleNavClick}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Overview & Metrics</span>
          </NavLink>

          <NavLink
            to="/resources"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] hover:text-[var(--text-primary)]"
              }`
            }
            onClick={handleNavClick}
          >
            <Boxes className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Equipment Directory</span>
          </NavLink>

          <NavLink
            to="/requests"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] hover:text-[var(--text-primary)]"
              }`
            }
            onClick={handleNavClick}
          >
            <ClipboardList className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Requisitions</span>
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] hover:text-[var(--text-primary)]"
              }`
            }
            onClick={handleNavClick}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Alerts & Notices</span>
            </div>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                {unreadCount}
              </span>
            )}
          </NavLink>



          <NavLink
            to="/projects"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon">📁</span>
            <span className="nav-label">Projects</span>
          </NavLink>

          <NavLink
            to="/conflicts"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon">⚠️</span>
            <span className="nav-label">Conflicts</span>
          </NavLink>

          {/* City Admin Only Section */}
          {isRole("city_admin") && (
            <>
              <div className="pt-4 pb-1 px-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Statutory Administration
                </span>
              </div>

              <NavLink
                to="/departments"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] hover:text-[var(--text-primary)]"
                  }`
                }
                onClick={handleNavClick}
              >
                <Building2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Line Departments</span>
              </NavLink>

              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] hover:text-[var(--text-primary)]"
                  }`
                }
                onClick={handleNavClick}
              >
                <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Officers & Roles</span>
              </NavLink>

              <NavLink
                to="/audit"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] hover:text-[var(--text-primary)]"
                  }`
                }
                onClick={handleNavClick}
              >
                <ScrollText className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Audit Logs</span>
              </NavLink>
            </>
          )}

          {/* Quick link back to landing */}
          <div className="pt-4 pb-1 px-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-[11px] font-medium text-[var(--text-muted)] hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              onClick={handleNavClick}
            >
              <span>View Public Landing Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer with Officer Profile */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[var(--text-primary)] truncate" title={user?.name}>
                {user?.name || "Municipal Officer"}
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold capitalize truncate">
                {user?.role ? user.role.replace(/_/g, " ") : "officer"}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] truncate" title={departmentName}>
                {departmentName}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-md border border-[var(--border-strong)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
