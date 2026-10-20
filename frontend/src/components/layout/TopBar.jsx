import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function TopBar({ title, onRefresh, isRefreshing, unreadCount = 0, onToggleSidebar }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <button
          className="menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <div className="page-title-wrap">
          <h2 className="page-title">{title}</h2>
        </div>
      </div>

      <div className="top-bar-actions">
        {onRefresh && (
          <button
            className={`icon-btn ${isRefreshing ? "spinning" : ""}`}
            onClick={onRefresh}
            title="Refresh current data"
            disabled={isRefreshing}
            aria-label="Refresh data"
          >
            ↻
          </button>
        )}

        <button
          className="notif-bell-btn"
          onClick={() => navigate("/notifications")}
          title="Notifications"
          aria-label="View notifications"
        >
          <span className="bell-icon">🔔</span>
          {unreadCount > 0 && <span className="bell-dot" />}
        </button>

        <div className="user-top-chip" onClick={() => navigate("/notifications")}>
          <div className="avatar-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <span className="user-top-name">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
