import React from "react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="auth-screen">
      <div className="auth-card text-center">
        <div className="brand-icon">🗺️</div>
        <h1 className="brand-name">404</h1>
        <p className="brand-sub" style={{ marginBottom: "24px" }}>
          The requested municipal page or asset does not exist.
        </p>
        <Link to="/" className="btn btn-primary btn-full">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
