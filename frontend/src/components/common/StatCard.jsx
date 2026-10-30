import React from "react";

export function StatCard({ icon, count, label, subtitle, onClick }) {
  return (
    <div
      className={`surface-card p-5 flex items-start gap-4 transition-all ${
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-[var(--border-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          : ""
      }`}
      onClick={onClick}
      role={onClick ? "button" : "region"}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="w-12 h-12 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-2xl font-extrabold text-[var(--text-primary)] leading-tight">
          {count !== undefined && count !== null ? count : "—"}
        </span>
        <span className="text-xs font-semibold text-[var(--text-secondary)] mt-0.5 truncate">
          {label}
        </span>
        {subtitle && (
          <span className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-1">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
