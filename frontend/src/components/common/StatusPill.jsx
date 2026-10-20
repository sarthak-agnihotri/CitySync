import React from "react";

export function StatusPill({ status, type = "status" }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase().replace(/\s+/g, "_");
  const formattedText = String(status).replace(/_/g, " ");

  return (
    <span className={`pill pill-${normalized}`} title={`${type}: ${formattedText}`}>
      {formattedText}
    </span>
  );
}
