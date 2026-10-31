import React from "react";
import { Inbox } from "lucide-react";

export function EmptyState({ icon, title = "No records found", message, actionButton }) {
  const renderIcon = () => {
    if (!icon) {
      return <Inbox className="w-6 h-6" aria-hidden="true" />;
    }
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "$$typeof" in icon)) {
      const IconComponent = icon;
      return <IconComponent className="w-6 h-6" aria-hidden="true" />;
    }
    return icon;
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-12 h-12 rounded-full bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] mb-3">
        {renderIcon()}
      </div>
      <h4 className="text-sm font-bold text-[var(--text-primary)]">{title}</h4>
      {message && (
        <p className="text-xs text-[var(--text-muted)] max-w-sm mt-1 leading-relaxed">
          {message}
        </p>
      )}
      {actionButton && <div className="mt-4">{actionButton}</div>}
    </div>
  );
}
