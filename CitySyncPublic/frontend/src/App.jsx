import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { CitizenAuthProvider, useCitizenAuth } from "./context/CitizenAuthContext";
import { CitizenNavbar, CitizenFooter } from "./components/layout/CitizenNavbar";

import { LandingPage } from "./pages/LandingPage";
import { FileComplaintPage } from "./pages/FileComplaintPage";
import { TrackStatusPage } from "./pages/TrackStatusPage";
import { MyComplaintsPage } from "./pages/MyComplaintsPage";
import { CitizenLoginPage, CitizenRegisterPage } from "./pages/CitizenAuthPages";

function ProtectedCitizenRoute({ children }) {
  const { isAuthenticated, loading } = useCitizenAuth();
  if (loading) {
    return <div className="text-center py-20 text-xs text-[var(--text-muted)]">Verifying session...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <CitizenAuthProvider>
            <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)]">
              <CitizenNavbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/report" element={<FileComplaintPage />} />
                  <Route path="/track" element={<TrackStatusPage />} />
                  <Route path="/login" element={<CitizenLoginPage />} />
                  <Route path="/register" element={<CitizenRegisterPage />} />
                  <Route
                    path="/my-complaints"
                    element={
                      <ProtectedCitizenRoute>
                        <MyComplaintsPage />
                      </ProtectedCitizenRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <CitizenFooter />
            </div>
          </CitizenAuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

