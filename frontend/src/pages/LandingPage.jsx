import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Building2,
  Boxes,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HardHat,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  Award
} from "lucide-react";
import { GovernmentHeaderStrip } from "../components/layout/GovernmentHeaderStrip";
import { LandingNavbar } from "../components/layout/LandingNavbar";
import { LandingFooter } from "../components/layout/LandingFooter";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { ResourcesAPI, DepartmentsAPI, RequestsAPI } from "../api";
import { Camera, ExternalLink } from "lucide-react";

const CITIZEN_PORTAL_URL = "http://127.0.0.1:5174";

export function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Real backend statistics state
  const [liveStats, setLiveStats] = useState({
    resourcesCount: null,
    departmentsCount: null,
    requestsCount: null,
    availableUnits: null
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    async function fetchPortalMetrics() {
      setStatsLoading(true);
      try {
        const [resData, deptData, reqData] = await Promise.allSettled([
          ResourcesAPI.list(),
          DepartmentsAPI.list(),
          RequestsAPI.list()
        ]);

        const resources = resData.status === "fulfilled" && resData.value?.resources ? resData.value.resources : [];
        const departments = deptData.status === "fulfilled" && deptData.value?.departments ? deptData.value.departments : [];
        const requests = reqData.status === "fulfilled" && reqData.value?.requests ? reqData.value.requests : [];

        const totalAvailable = resources.reduce((acc, r) => acc + (r.availableQuantity || 0), 0);

        setLiveStats({
          resourcesCount: resources.length,
          departmentsCount: departments.length,
          requestsCount: requests.length,
          availableUnits: totalAvailable
        });
      } catch (err) {
        console.warn("Could not load public metrics:", err);
      } finally {
        setStatsLoading(false);
      }
    }

    fetchPortalMetrics();
  }, []);

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      {/* 1. Official Government Header Strip */}
      <GovernmentHeaderStrip />

      {/* 2. Main Navigation Bar */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 3. Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-[var(--border-subtle)] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-page)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 mb-6">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t("hero.badge")}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
                {t("hero.titleLine1")}
                <span className="block text-emerald-700 dark:text-emerald-400 font-serif font-bold italic mt-1">
                  {t("hero.titleLine2")}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-5 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
                {t("hero.subtitle")}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="btn btn-primary text-sm py-2.5 px-5 shadow-sm"
                  >
                    <span>{t("hero.openPortal")}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="btn btn-primary text-sm py-2.5 px-5 shadow-sm"
                    >
                      <span>{t("hero.portalSignIn")}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn-secondary text-sm py-2.5 px-5"
                    >
                      <span>{t("hero.registerAccount")}</span>
                    </Link>
                  </>
                )}

                <a
                  href="#services"
                  className="btn btn-ghost text-sm py-2.5 px-4 text-[var(--text-secondary)]"
                >
                  {t("hero.exploreServices")}
                </a>

                {/* Citizen Direct Complaint CTA */}
                <a
                  href={CITIZEN_PORTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary text-sm py-2.5 px-4 text-emerald-800 dark:text-emerald-300 border-emerald-600/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shadow-xs flex items-center gap-2 font-bold"
                  title="Direct link to Citizen Complaint Portal"
                >
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{t("hero.citizenCTA")}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>

              {/* Notice */}
              <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {t("hero.notice")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Real Metrics & Live Trust Indicators */}
        <section className="py-10 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
                <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                  {statsLoading ? "—" : liveStats.departmentsCount ?? "0"}
                </div>
                <div className="text-xs font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                  {t("metrics.departments")}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                  {statsLoading ? "—" : liveStats.resourcesCount ?? "0"}
                </div>
                <div className="text-xs font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                  {t("metrics.equipmentPool")}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
                <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                  {statsLoading ? "—" : liveStats.availableUnits ?? "0"}
                </div>
                <div className="text-xs font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                  {t("metrics.availableUnits")}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-400">
                  {statsLoading ? "—" : liveStats.requestsCount ?? "0"}
                </div>
                <div className="text-xs font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                  {t("metrics.requisitions")}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Key Services Section */}
        <section id="services" className="py-16 border-b border-[var(--border-subtle)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {t("services.eyebrow")}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
                {t("services.title")}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                {t("services.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="surface-card p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-4">
                    <Boxes className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {t("services.c1.title")}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    {t("services.c1.desc")}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
                  <Link
                    to={isAuthenticated ? "/resources" : "/login"}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>{t("services.c1.cta")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 2 */}
              <div className="surface-card p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center mb-4">
                    <ClipboardList className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {t("services.c2.title")}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    {t("services.c2.desc")}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
                  <Link
                    to={isAuthenticated ? "/requests" : "/login"}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>{t("services.c2.cta")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 3 */}
              <div className="surface-card p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[var(--text-primary)] flex items-center justify-center mb-4">
                    <Building2 className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {t("services.c3.title")}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    {t("services.c3.desc")}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
                  <a
                    href="#departments"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>{t("services.c3.cta")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Card 4 */}
              <div className="surface-card p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {t("services.c4.title")}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    {t("services.c4.desc")}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)] font-medium">
                    {t("services.c4.note")}
                  </span>
                </div>
              </div>

              {/* Card 5 */}
              <div className="surface-card p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-4">
                    <FileText className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {t("services.c5.title")}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    {t("services.c5.desc")}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
                  <Link
                    to={isAuthenticated ? "/audit" : "/login"}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>{t("services.c5.cta")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 6 */}
              <div className="surface-card p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center mb-4">
                    <HardHat className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {t("services.c6.title")}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    {t("services.c6.desc")}
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
                  <a
                    href="#framework"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>{t("services.c6.cta")}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. The 5-Part "Dig-Later" Policy Framework */}
        <section id="framework" className="py-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {t("framework.eyebrow")}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
                {t("framework.title")}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                {t("framework.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] flex flex-col">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">01</span>
                <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1">{t("framework.s1.title")}</h4>
                <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                  {t("framework.s1.desc")}
                </p>
              </div>

              <div className="p-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] flex flex-col">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">02</span>
                <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1">{t("framework.s2.title")}</h4>
                <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                  {t("framework.s2.desc")}
                </p>
              </div>

              <div className="p-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] flex flex-col">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">03</span>
                <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1">{t("framework.s3.title")}</h4>
                <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                  {t("framework.s3.desc")}
                </p>
              </div>

              <div className="p-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] flex flex-col">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">04</span>
                <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1">{t("framework.s4.title")}</h4>
                <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                  {t("framework.s4.desc")}
                </p>
              </div>

              <div className="p-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] flex flex-col">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">05</span>
                <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1">{t("framework.s5.title")}</h4>
                <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                  {t("framework.s5.desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Participating Agencies Directory */}
        <section id="departments" className="py-16 border-b border-[var(--border-subtle)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {t("agencies.eyebrow")}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
                {t("agencies.title")}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                {t("agencies.subtitle")}
              </p>
            </div>

            <div className="table-container">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>{t("agencies.col1")}</th>
                    <th>{t("agencies.col2")}</th>
                    <th>{t("agencies.col3")}</th>
                    <th>{t("agencies.col4")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold text-[var(--text-primary)]">
                      {t("agencies.r1.name")}
                    </td>
                    <td>{t("agencies.r1.mandate")}</td>
                    <td>{t("agencies.r1.assets")}</td>
                    <td>
                      <span className="status-pill pill-available">{t("agencies.status")}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-[var(--text-primary)]">
                      {t("agencies.r2.name")}
                    </td>
                    <td>{t("agencies.r2.mandate")}</td>
                    <td>{t("agencies.r2.assets")}</td>
                    <td>
                      <span className="status-pill pill-available">{t("agencies.status")}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-[var(--text-primary)]">
                      {t("agencies.r3.name")}
                    </td>
                    <td>{t("agencies.r3.mandate")}</td>
                    <td>{t("agencies.r3.assets")}</td>
                    <td>
                      <span className="status-pill pill-available">{t("agencies.status")}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-[var(--text-primary)]">
                      {t("agencies.r4.name")}
                    </td>
                    <td>{t("agencies.r4.mandate")}</td>
                    <td>{t("agencies.r4.assets")}</td>
                    <td>
                      <span className="status-pill pill-available">{t("agencies.status")}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-[var(--text-primary)]">
                      {t("agencies.r5.name")}
                    </td>
                    <td>{t("agencies.r5.mandate")}</td>
                    <td>{t("agencies.r5.assets")}</td>
                    <td>
                      <span className="status-pill pill-available">{t("agencies.status")}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-[var(--text-primary)]">
                      {t("agencies.r6.name")}
                    </td>
                    <td>{t("agencies.r6.mandate")}</td>
                    <td>{t("agencies.r6.assets")}</td>
                    <td>
                      <span className="status-pill pill-available">{t("agencies.status")}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 8. Frequently Asked Questions (FAQ) */}
        <section id="faq" className="py-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {t("faq.eyebrow")}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
                {t("faq.title")}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                {t("faq.subtitle")}
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[var(--border-subtle)] rounded-lg overflow-hidden bg-[var(--bg-surface-secondary)] transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full py-4 px-5 text-left flex items-center justify-between text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="flex items-center gap-2.5">
                        <HelpCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        {faq.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 9. Final Call to Action */}
        <section className="py-16 bg-gradient-to-r from-emerald-900 to-emerald-800 dark:from-neutral-900 dark:to-neutral-900 text-white border-b border-emerald-950 dark:border-neutral-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Award className="w-10 h-10 text-emerald-300 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t("cta.title")}
            </h2>
            <p className="mt-3 text-sm text-emerald-100 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
              {t("cta.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn bg-white text-emerald-900 hover:bg-neutral-100 text-xs py-2.5 px-6 font-bold shadow-md"
                >
                  {t("cta.enterPortal")}
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn bg-white text-emerald-900 hover:bg-neutral-100 text-xs py-2.5 px-6 font-bold shadow-md"
                  >
                    {t("cta.signIn")}
                  </Link>
                  <Link
                    to="/register"
                    className="btn bg-emerald-800/80 hover:bg-emerald-700 text-white border border-emerald-600 text-xs py-2.5 px-6 font-bold"
                  >
                    {t("cta.register")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* 10. Institutional Footer */}
      <LandingFooter />
    </div>
  );
}
