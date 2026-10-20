import React from "react";

export function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="loading-container">
      <div className="spinner" aria-hidden="true"></div>
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
}
