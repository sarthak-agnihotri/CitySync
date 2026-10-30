import React from "react";
import { Landmark, ArrowUp, ShieldCheck, Mail, Phone, ExternalLink } from "lucide-react";

export function LandingFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[var(--bg-surface-secondary)] border-t border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors mt-auto">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Platform Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-emerald-800 text-white flex items-center justify-center font-bold">
                <Landmark className="w-4 h-4 text-emerald-100" aria-hidden="true" />
              </div>
              <span className="text-base font-bold text-[var(--text-primary)]">CitySync</span>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Digital Platform for Inter-Departmental Infrastructure Cooperation. Enforcing
              coordinated planning, shared equipment pools, and utility excavation moratoriums
              across municipal line departments.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>Statutory Civic Governance Layer</span>
            </div>
          </div>

          {/* Col 2: Participating Agencies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Line Agencies
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-[var(--text-primary)] transition-colors">
                Municipal Corporation (ULB / City Roads)
              </li>
              <li className="hover:text-[var(--text-primary)] transition-colors">
                Water Supply & Sewerage Board (BWSSB)
              </li>
              <li className="hover:text-[var(--text-primary)] transition-colors">
                Electricity Supply Undertaking (DISCOM)
              </li>
              <li className="hover:text-[var(--text-primary)] transition-colors">
                Public Works Department (PWD Arterial transit)
              </li>
              <li className="hover:text-[var(--text-primary)] transition-colors">
                Metro Rail Corporation & City Gas Utilities
              </li>
            </ul>
          </div>

          {/* Col 3: Policy & Statutory Framework */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Governance Framework
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="#framework"
                  className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                >
                  5-Step "Dig-Later" Moratorium
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                >
                  Heavy Equipment Requisition Pool
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                >
                  Statutory Coordination Cell (ICC)
                </a>
              </li>
              <li className="text-[var(--text-muted)]">
                Road Restoration & Penalty Fund
              </li>
            </ul>
          </div>

          {/* Col 4: Official Helpline & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Civic Operations
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 mt-0.5" />
                <span>Inter-Agency Desk: 1800-120-CITY</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 mt-0.5" />
                <span>coordination@citysync.gov.in</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] pt-2 leading-relaxed">
                Operating 24x7 for emergency main fractures and urgent arterial road approvals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Attribution Bar */}
      <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-4 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[var(--text-muted)]">
          <div className="text-center sm:text-left">
            <span>© 2026 CitySync — Urban Governance Capstone Project.</span>
            <span className="block sm:inline sm:ml-2">
              Designed according to Ministry of Urban Development & Smart Cities Mission guidelines.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px]">WCAG 2.2 AA Compliant</span>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-[var(--text-secondary)] hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer text-xs"
              aria-label="Back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
