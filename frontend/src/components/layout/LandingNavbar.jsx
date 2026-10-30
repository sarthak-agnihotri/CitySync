import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Landmark, Menu, X, ArrowRight, UserCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../common/ThemeToggle";

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <Link
            to="/"
            className="flex items-center gap-3 text-decoration-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md"
            aria-label="CitySync Home"
          >
            <div className="w-10 h-10 rounded-md bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
              <Landmark className="w-5 h-5 text-emerald-100" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                CitySync
              </span>
              <span className="text-[11px] font-medium text-[var(--text-muted)] -mt-1 tracking-wide">
                Urban Coordination Portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            <Link
              to="/"
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              Overview
            </Link>
            <a
              href="#services"
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              Key Services
            </a>
            <a
              href="#framework"
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              Dig-Later Policy
            </a>
            <a
              href="#departments"
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              Agencies
            </a>
            <a
              href="#faq"
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="btn btn-primary text-xs py-1.5 px-3.5 shadow-xs"
              >
                <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Go to Portal ({user?.name ? user.name.split(" ")[0] : "Officer"})</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn btn-secondary text-xs py-1.5 px-3"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary text-xs py-1.5 px-3 shadow-xs"
                >
                  Register Officer
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle compact={true} />
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 pt-3 pb-5 space-y-3">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
            >
              Overview
            </Link>
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
            >
              Key Services
            </a>
            <a
              href="#framework"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
            >
              Dig-Later Policy
            </a>
            <a
              href="#departments"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
            >
              Participating Agencies
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
            >
              FAQ
            </a>
          </nav>

          <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/dashboard");
                }}
                className="btn btn-primary w-full text-xs justify-center"
              >
                Open Officer Portal
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary w-full text-xs justify-center"
                >
                  Official Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary w-full text-xs justify-center"
                >
                  Register Officer Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
