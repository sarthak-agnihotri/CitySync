import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { NotificationsAPI } from "../../api";

const PAGE_TITLES = {
  "/": "Overview & Analytics",
  "/resources": "Resource & Equipment Inventory",
  "/requests": "Requisitions & Requests",
  "/notifications": "Alerts & Notifications",
  "/departments": "Department Management",
  "/users": "User Directory & Role Assignment",
  "/audit": "Citywide Audit Trail"
};

export function DashboardLayout() {
  const location = useLocation();
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
    // Refresh count on window focus
    const onFocus = () => fetchUnreadCount();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchUnreadCount, location.pathname]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUnreadCount();
    // Emit global refresh event so active page can re-fetch
    window.dispatchEvent(new CustomEvent("citysync:refresh-data"));
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const currentTitle = PAGE_TITLES[location.pathname] || "CitySync";

  return (
    <div className="dashboard">
      <Sidebar
        unreadCount={unreadCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="main-content">
        <TopBar
          title={currentTitle}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          unreadCount={unreadCount}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <div className="page-content">
          <Outlet context={{ refreshUnreadCount: fetchUnreadCount }} />
        </div>
      </main>
    </div>
  );
}
