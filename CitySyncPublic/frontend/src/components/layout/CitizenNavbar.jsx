import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Landmark,
  Menu,
  X,
  ArrowRight,
  User,
  LogOut,
  ExternalLink,
  AlertTriangle,
  Search,
  FileText,
  MapPin,
  Bell,
  CheckCircle2,
  Settings
} from "lucide-react";
import { useCitizenAuth } from "../../context/CitizenAuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { ThemeToggle } from "../common/ThemeToggle";
import { NotificationAPI } from "../../api/client";

export function CitizenNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef(null);

  const { user, isAuthenticated, logout } = useCitizenAuth();
  const { t, isHindi } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await NotificationAPI.list();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await NotificationAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        await NotificationAPI.markAsRead(notif._id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
        );
      }
      setShowNotifDropdown(false);
      if (notif.ticketId) {
        navigate(`/track?ticket=${encodeURIComponent(notif.ticketId)}`);
      }
    } catch {}
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
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
          <nav className="hidden md:flex items-center gap-5" aria-label="Main Navigation">
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
              to="/map"
              className={({ isActive }) =>
                `flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-[var(--text-secondary)] hover:text-emerald-700 dark:hover:text-emerald-400"
                }`
              }
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t("nav.map")}</span>
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

            {/* In-Portal Notification Bell */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifDropdown((prev) => !prev)}
                  className="relative p-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-secondary)]/40">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {isHindi ? "नागरिक सूचनाएं" : "Citizen Alerts"}
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          {isHindi ? "सभी पढ़े हुए मार्क करें" : "Mark all as read"}
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-[var(--border-subtle)]">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                          {isHindi ? "कोई नई सूचना नहीं है" : "No notifications yet"}
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 text-xs hover:bg-[var(--bg-surface-secondary)] transition-colors cursor-pointer ${
                              !n.read ? "bg-emerald-50/40 dark:bg-emerald-950/20" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-[var(--text-primary)] line-clamp-1">
                                {n.title}
                              </span>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-[var(--text-muted)] block mt-1">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)]">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] hover:opacity-80 transition-opacity"
                  title="Citizen Profile"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
                  </div>
                  <span className="max-w-[110px] truncate">{user?.name}</span>
                </Link>
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
              to="/map"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)] flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{t("nav.map")}</span>
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
              <>
                <Link
                  to="/my-complaints"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
                >
                  {t("nav.myHistory")}
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)] flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-emerald-600" />
                  <span>{t("nav.profile")}</span>
                </Link>
              </>
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
