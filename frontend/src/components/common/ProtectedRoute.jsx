import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-screen">
        <LoadingSpinner text="Authenticating session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
