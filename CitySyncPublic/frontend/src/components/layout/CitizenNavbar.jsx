
import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Landmark,
  Menu,
  X,
  LogOut,
  AlertTriangle,
  Search,
  FileText,
  MapPin,
  Bell,
  Settings,
  CheckCheck,
  ChevronDown,
} from "lucide-react";
import { useCitizenAuth } from "../../context/CitizenAuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { ThemeToggle } from "../common/ThemeToggle";
import { NotificationAPI } from "../../api/client";

const desktopLinkClass = ({ isActive }) =>
  `relative flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
    isActive
      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
      : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] hover:text-emerald-700 dark:hover:text-emerald-400"
  }`;

const mobileLinkClass = ({ isActive }) =>
  `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
    isActive
      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
      : "text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
  }`;

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
    setMobileMenuOpen(false);
    logout();
    navigate("/");
  };

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    try {
      const res = await NotificationAPI.list();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (error) {
      console.error("Unable to fetch notifications:", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await NotificationAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("Unable to mark notifications as read:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await NotificationAPI.markAsRead(notification._id);

        setUnreadCount((count) => Math.max(0, count - 1));

        setNotifications((prev) =>
          prev.map((item) =>
            item._id === notification._id
              ? { ...item, read: true }
              : item
          )
        );
      }

      setShowNotifDropdown(false);
      setMobileMenuOpen(false);

      if (notification.ticketId) {
        navigate(
          `/track?ticket=${encodeURIComponent(notification.ticketId)}`
        );
      }
    } catch (error) {
      console.error("Unable to open notification:", error);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[76px] items-center justify-between gap-3">

          {/* BRAND */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            aria-label="CitySync Citizen Portal Home"
            className="group flex min-w-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-lg shadow-emerald-900/20 transition-transform duration-200 group-hover:scale-105">
              <Landmark className="h-6 w-6" strokeWidth={2.2} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-[var(--text-primary)] sm:text-xl">
                  CitySync
                </span>
                <span className="text-lg font-black tracking-tight text-emerald-700 dark:text-emerald-400 sm:text-xl">
                  Public
                </span>
              </div>

              <p className="mt-0.5 text-[10px] font-semibold tracking-[0.13em] text-[var(--text-muted)] sm:text-[11px]">
                {t("nav.portalSub")}
              </p>
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Main Navigation"
          >
            <NavLink to="/" end className={desktopLinkClass}>
              {t("nav.home")}
            </NavLink>

            <NavLink to="/map" className={desktopLinkClass}>
              <MapPin className="h-4 w-4" />
              {t("nav.map")}
            </NavLink>

            <NavLink to="/report" className={desktopLinkClass}>
              <AlertTriangle className="h-4 w-4" />
              {t("nav.report")}
            </NavLink>

            <NavLink to="/track" className={desktopLinkClass}>
              <Search className="h-4 w-4" />
              {t("nav.track")}
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/my-complaints" className={desktopLinkClass}>
                <FileText className="h-4 w-4" />
                {t("nav.myHistory")}
              </NavLink>
            )}
          </nav>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">

            {/* THEME */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <div className="sm:hidden">
              <ThemeToggle compact={true} />
            </div>

            {/* NOTIFICATIONS */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifDropdown((prev) => !prev)}
                  aria-label="Notifications"
                  aria-expanded={showNotifDropdown}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                >
                  <Bell className="h-5 w-5" />

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-[var(--bg-surface)] bg-rose-600 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 top-[calc(100%+12px)] z-[60] w-[min(340px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]/60 px-4 py-4">
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">
                          {isHindi ? "नागरिक सूचनाएं" : "Citizen Alerts"}
                        </h3>
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                          {unreadCount} {isHindi ? "अपठित" : "unread notifications"}
                        </p>
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                        >
                          <CheckCheck className="h-4 w-4" />
                          {isHindi ? "सभी पढ़ें" : "Mark all read"}
                        </button>
                      )}
                    </div>

                    <div className="max-h-[340px] overflow-y-auto divide-y divide-[var(--border-subtle)]">
                      {notifications.length === 0 ? (
                        <div className="px-5 py-10 text-center">
                          <Bell className="mx-auto mb-3 h-8 w-8 text-[var(--text-muted)]" />
                          <p className="text-sm font-semibold text-[var(--text-secondary)]">
                            {isHindi ? "कोई नई सूचना नहीं है" : "No notifications yet"}
                          </p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            type="button"
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full px-4 py-3 text-left transition-colors hover:bg-[var(--bg-surface-secondary)] ${
                              !notification.read
                                ? "bg-emerald-50/60 dark:bg-emerald-950/20"
                                : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="line-clamp-1 text-sm font-bold text-[var(--text-primary)]">
                                  {notification.title}
                                </p>
                                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                                  {notification.message}
                                </p>
                                <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>

                              {!notification.read && (
                                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-600" />
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DESKTOP ACCOUNT ACTIONS */}
            <div className="hidden items-center gap-2 border-l border-[var(--border-subtle)] pl-3 sm:flex">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex max-w-[150px] items-center gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-[var(--bg-surface-secondary)]"
                    title="Citizen Profile"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 text-sm font-bold text-white">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
                    </span>

                    <span className="max-w-[90px] truncate text-sm font-semibold text-[var(--text-primary)]">
                      {user?.name}
                    </span>
                    <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    title={t("nav.signOut")}
                    aria-label={t("nav.signOut")}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-xl px-4 py-2.5 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface-secondary)] hover:text-[var(--text-primary)]"
                  >
                    {t("nav.signIn")}
                  </Link>

                  <Link
                    to="/register"
                    className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-900/15 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {t("nav.register")}
                  </Link>
                </>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION */}
      {mobileMenuOpen && (
        <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl lg:hidden">
          <div className="mx-auto max-w-[1440px] space-y-4 px-4 py-5 sm:px-6">

            {/* MOBILE USER INFO */}
            {isAuthenticated && (
              <Link
                to="/profile"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-4"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 text-base font-bold text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                    {user?.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {isHindi ? "नागरिक प्रोफ़ाइल" : "Citizen Profile"}
                  </p>
                </div>

                <Settings className="h-5 w-5 text-emerald-600" />
              </Link>
            )}

            {/* MOBILE LINKS */}
            <nav className="space-y-1.5" aria-label="Mobile Navigation">
              <NavLink to="/" end onClick={closeMobileMenu} className={mobileLinkClass}>
                <Landmark className="h-5 w-5" />
                {t("nav.home")}
              </NavLink>

              <NavLink to="/map" onClick={closeMobileMenu} className={mobileLinkClass}>
                <MapPin className="h-5 w-5" />
                {t("nav.map")}
              </NavLink>

              <NavLink to="/report" onClick={closeMobileMenu} className={mobileLinkClass}>
                <AlertTriangle className="h-5 w-5" />
                {t("nav.report")}
              </NavLink>

              <NavLink to="/track" onClick={closeMobileMenu} className={mobileLinkClass}>
                <Search className="h-5 w-5" />
                {t("nav.track")}
              </NavLink>

              {isAuthenticated && (
                <NavLink
                  to="/my-complaints"
                  onClick={closeMobileMenu}
                  className={mobileLinkClass}
                >
                  <FileText className="h-5 w-5" />
                  {t("nav.myHistory")}
                </NavLink>
              )}
            </nav>

            {/* MOBILE ACCOUNT ACTIONS */}
            <div className="space-y-2 border-t border-[var(--border-subtle)] pt-4">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400"
                >
                  <LogOut className="h-4 w-4" />
                  {t("nav.signOut")}
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center rounded-xl border border-[var(--border-subtle)] px-4 py-3 text-sm font-bold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-secondary)]"
                  >
                    {t("nav.signIn")}
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-3 text-sm font-bold text-white shadow-md"
                  >
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


export function CitizenFooter() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-5 py-8 sm:py-10 md:flex-row">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-lg shadow-emerald-900/15">
              <Landmark className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-extrabold tracking-tight text-[var(--text-primary)]">
                CitySync Public
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {t("footer.org")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-[var(--text-secondary)]">
            <span>{t("footer.mechanism")}</span>
            <span className="hidden h-1 w-1 rounded-full bg-emerald-500 sm:block" />
            <span>{t("footer.control")}</span>
            <span className="hidden h-1 w-1 rounded-full bg-emerald-500 sm:block" />
            <span>{t("footer.emergency")}</span>
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)] py-4 text-center text-xs text-[var(--text-muted)]">
          CitySync Citizen Portal
        </div>
      </div>
    </footer>
  );
}

