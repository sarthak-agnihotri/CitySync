import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { NotificationsAPI } from "../../api";
import { useLanguage } from "../../context/LanguageContext";

const PAGE_TITLE_KEYS = {
  "/dashboard": "pageTitle.dashboard",
  "/projects": "pageTitle.projects",
  "/conflicts": "pageTitle.conflicts",
  "/resources": "pageTitle.resources",
  "/requests": "pageTitle.requests",
  "/notifications": "pageTitle.notifications",
  "/departments": "pageTitle.departments",
  "/users": "pageTitle.users",
  "/audit": "pageTitle.audit"
};

export function DashboardLayout() {
  const location = useLocation();
  const { t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await NotificationsAPI.list(true);
      if (data && Array.isArray(data.notifications)) {
        setUnreadCount(data.notifications.length);
      }
    } catch {
      // Ignored for unauthenticated or network glitches
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const onFocus = () => fetchUnreadCount();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchUnreadCount, location.pathname]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUnreadCount();
    window.dispatchEvent(new CustomEvent("citysync:refresh-data"));
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const titleKey = PAGE_TITLE_KEYS[location.pathname];
  const currentTitle = titleKey ? t(titleKey) : "CitySync Portal";

  return (
    <div className="min-h-screen flex bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      <Sidebar
        unreadCount={unreadCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <TopBar
          title={currentTitle}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          unreadCount={unreadCount}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="p-4 sm:p-8 flex-1">
          <Outlet context={{ refreshUnreadCount: fetchUnreadCount }} />
        </main>
      </div>
    </div>
  );
}
