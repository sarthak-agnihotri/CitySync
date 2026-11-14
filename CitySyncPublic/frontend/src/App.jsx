import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ToastProvider } from "./context/ToastContext";
import { CitizenAuthProvider, useCitizenAuth } from "./context/CitizenAuthContext";
import { GovernmentHeaderStrip } from "./components/layout/GovernmentHeaderStrip";
import { CitizenNavbar, CitizenFooter } from "./components/layout/CitizenNavbar";

import { LandingPage } from "./pages/LandingPage";
import { FileComplaintPage } from "./pages/FileComplaintPage";
import { TrackStatusPage } from "./pages/TrackStatusPage";
import { MyComplaintsPage } from "./pages/MyComplaintsPage";
import { CitizenLoginPage, CitizenRegisterPage } from "./pages/CitizenAuthPages";

function ProtectedCitizenRoute({ children }) {
  const { isAuthenticated, loading } = useCitizenAuth();
  const location = useLocation();

  if (loading) {
    return <div className="text-center py-20 text-xs text-[var(--text-muted)]">Verifying session...</div>;
  }
  if (!isAuthenticated) {
    const redirectTarget = location.pathname + location.search;
    return <Navigate to={`/register?redirect=${encodeURIComponent(redirectTarget || "/report")}`} replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <CitizenAuthProvider>
              <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
                {/* 1. Official Government Strip with English / हिन्दी toggle */}
                <GovernmentHeaderStrip />

                {/* 2. Main Navigation Bar matching CitySync portal */}
                <CitizenNavbar />

                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route
                      path="/report"
                      element={
                        <ProtectedCitizenRoute>
                          <FileComplaintPage />
                        </ProtectedCitizenRoute>
                      }
                    />
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
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
