import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function Sidebar({ unreadCount = 0, isOpen, onClose }) {
  const { user, logout, isRole } = useAuth();

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const departmentName =
    user?.department && typeof user.department === "object"
      ? user.department.name
      : user?.department || "Unassigned Dept";

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon-sm">🏙️</div>
          <div className="brand-text-col">
            <span className="brand-label">CitySync</span>
            <span className="brand-tag">Inter-Dept Platform</span>
          </div>
          {isOpen && (
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
              ✕
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Overview</span>
          </NavLink>

          <NavLink
            to="/resources"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-label">Resources</span>
          </NavLink>

          <NavLink
            to="/requests"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-label">Requests</span>
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={handleNavClick}
          >
            <span className="nav-icon">🔔</span>
            <span className="nav-label">Notifications</span>
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </NavLink>

          {/* City Admin Only Section */}
          {isRole("city_admin") && (
            <>
              <div className="sidebar-divider">
                <span>ADMINISTRATION</span>
              </div>

              <NavLink
                to="/departments"
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                onClick={handleNavClick}
              >
                <span className="nav-icon">🏛️</span>
                <span className="nav-label">Departments</span>
              </NavLink>

              <NavLink
                to="/users"
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                onClick={handleNavClick}
              >
                <span className="nav-icon">👥</span>
                <span className="nav-label">Users & Roles</span>
              </NavLink>

              <NavLink
                to="/audit"
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                onClick={handleNavClick}
              >
                <span className="nav-icon">📜</span>
                <span className="nav-label">Audit Logs</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="user-info">
              <span className="user-name" title={user?.name}>
                {user?.name || "Officer"}
              </span>
              <span className="user-role-badge">
                {user?.role ? user.role.replace(/_/g, " ") : "officer"}
              </span>
              <span className="user-dept" title={departmentName}>
                {departmentName}
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm btn-logout" onClick={logout}>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
