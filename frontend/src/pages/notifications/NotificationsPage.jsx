import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { NotificationsAPI } from "../../api";
import { useToast } from "../../context/ToastContext";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";

export function NotificationsPage() {
  const { refreshUnreadCount } = useOutletContext() || {};
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { showToast } = useToast();

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await NotificationsAPI.list(unreadOnly);
      setNotifications(data.notifications || []);
      if (refreshUnreadCount) refreshUnreadCount();
    } catch (err) {
      showToast(err.message || "Failed to load notifications", "error");
    } finally {
      setLoading(false);
    }
  }, [unreadOnly, refreshUnreadCount, showToast]);

  useEffect(() => {
    loadNotifications();
    const handleRefresh = () => loadNotifications();
    window.addEventListener("citysync:refresh-data", handleRefresh);
    return () => window.removeEventListener("citysync:refresh-data", handleRefresh);
  }, [loadNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await NotificationsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      if (refreshUnreadCount) refreshUnreadCount();
    } catch (err) {
      showToast(err.message || "Failed to update notification", "error");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationsAPI.markAllRead();
      showToast("All notifications marked as read", "success");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (refreshUnreadCount) refreshUnreadCount();
    } catch (err) {
      showToast(err.message || "Failed to mark all as read", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await NotificationsAPI.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      showToast("Notification deleted", "info");
      if (refreshUnreadCount) refreshUnreadCount();
    } catch (err) {
      showToast(err.message || "Failed to delete notification", "error");
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "request_submitted":
        return "📋";
      case "request_approved":
        return "✅";
      case "request_rejected":
        return "❌";
      case "resource_returned":
        return "📦";
      case "resource_conflict":
        return "⚠️";
      case "inventory_low":
        return "📉";
      case "deadline_reminder":
        return "⏰";
      case "request_cancelled":
        return "🚫";
      default:
        return "🔔";
    }
  };

  return (
    <div className="page notifications-page">
      <div className="page-header-row">
        <div>
          <h3 className="section-title">Inter-Agency Notification Center</h3>
          <p className="section-hint">
            Real-time automated alerts on bookings, clash warnings, and administrative actions
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
            Mark All as Read
          </button>
        )}
      </div>

      <div className="page-actions">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
          />
          <span>Show unread alerts only</span>
        </label>

        <span className="results-count">
          <strong>{notifications.filter((n) => !n.isRead).length}</strong> unread of{" "}
          {notifications.length} total notifications
        </span>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching official notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No notifications"
          message={
            unreadOnly
              ? "You have caught up with all active alerts!"
              : "No notifications have been received yet."
          }
        />
      ) : (
        <div className="card-list">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`notif-card ${!notif.isRead ? "unread" : ""}`}
            >
              <div className="notif-icon">{getNotifIcon(notif.type)}</div>
              <div className="notif-body">
                <div className="notif-title-row">
                  <h4 className="notif-title">{notif.title}</h4>
                  <span className="notif-time">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="notif-msg">{notif.message}</p>
                <span className="notif-type-tag">
                  Type: {notif.type?.replace(/_/g, " ")}
                </span>
              </div>
              <div className="notif-actions">
                {!notif.isRead && (
                  <button
                    className="icon-btn-sm"
                    title="Mark as read"
                    onClick={() => handleMarkRead(notif._id)}
                  >
                    ✓
                  </button>
                )}
                <button
                  className="icon-btn-sm delete-btn"
                  title="Dismiss notification"
                  onClick={() => handleDelete(notif._id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
