import React from "react";

export function StatCard({ icon, count, label, subtitle, color, onClick }) {
  return (
    <div
      className={`stat-card ${onClick ? "stat-card-clickable" : ""}`}
      onClick={onClick}
      style={color ? { "--accent-override": color } : {}}
      role={onClick ? "button" : "region"}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <span className="stat-num">{count !== undefined && count !== null ? count : "—"}</span>
        <span className="stat-label">{label}</span>
        {subtitle && <span className="stat-sub">{subtitle}</span>}
      </div>
    </div>
  );
}
