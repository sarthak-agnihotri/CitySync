import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";

import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ResourcesPage } from "./pages/resources/ResourcesPage";
import { RequestsPage } from "./pages/requests/RequestsPage";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";
import { DepartmentsPage } from "./pages/departments/DepartmentsPage";
import { UsersPage } from "./pages/users/UsersPage";
import { AuditPage } from "./pages/audit/AuditPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />

              {/* City Admin Only Routes */}
              <Route
                path="departments"
                element={
                  <ProtectedRoute allowedRoles={["city_admin"]}>
                    <DepartmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={["city_admin"]}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="audit"
                element={
                  <ProtectedRoute allowedRoles={["city_admin"]}>
                    <AuditPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 Route */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
