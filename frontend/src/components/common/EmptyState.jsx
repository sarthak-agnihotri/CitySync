import React from "react";

export function EmptyState({ icon = "📦", title = "No data found", message, actionButton }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <h4 className="empty-title">{title}</h4>
      {message && <p className="empty-message">{message}</p>}
      {actionButton && <div className="empty-action">{actionButton}</div>}
    </div>
  );
}
