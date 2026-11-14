import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  PhoneCall,
  Camera,
  ArrowRight,
  TrendingUp,
  MapPin
} from "lucide-react";
import { GrievanceAPI } from "../api/client";
import { useLanguage } from "../context/LanguageContext";

export function LandingPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalReported: 3,
    resolvedIssues: 1,
    activeInvestigations: 2
  });
  const [recent, setRecent] = useState([]);
  const [trackQuery, setTrackQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    GrievanceAPI.getStats()
      .then((data) => {
        if (data.stats) setStats(data.stats);
        if (data.recentComplaints) setRecent(data.recentComplaints);
      })
      .catch(() => {});
  }, []);

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (trackQuery.trim()) {
      navigate(`/track?ticket=${encodeURIComponent(trackQuery.trim())}`);
    }
  };

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 border-b border-[var(--border-subtle)] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-page)] text-[var(--text-primary)]">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t("hero.badge")}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl text-[var(--text-primary)]">
            {t("hero.title")}
            <span className="block text-emerald-700 dark:text-emerald-400 font-serif font-bold italic mt-1">
              {t("hero.highlight")}
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            {t("hero.subtitle")}
          </p>

          {/* Quick Track Input Bar */}
          <div className="mt-8 w-full max-w-xl">
            <form
              onSubmit={handleQuickTrack}
              className="flex items-center bg-[var(--bg-surface)] rounded-xl p-1.5 shadow-md border border-[var(--border-subtle)]"
            >
              <div className="pl-3 text-[var(--text-muted)]">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder={t("hero.trackPlaceholder")}
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none bg-transparent font-medium"
              />
              <button
                type="submit"
                className="btn btn-primary px-5 py-2.5 text-xs shadow-xs shrink-0"
              >
                {t("hero.trackBtn")}
              </button>
            </form>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
            <Link
              to="/report"
              className="btn btn-primary py-2.5 px-6 shadow-md text-xs font-bold"
            >
              <Camera className="w-4 h-4" />
              <span>{t("hero.reportBtn")}</span>
            </Link>
            <Link
              to="/track"
              className="btn btn-secondary py-2.5 px-5 text-xs"
            >
              <span>{t("hero.knowMoreBtn")}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Metric Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="surface-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                {t("metrics.total")}
              </p>
              <h3 className="text-2xl font-black text-[var(--text-primary)]">
                {stats.totalReported}
              </h3>
            </div>
          </div>

          <div className="surface-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                {t("metrics.active")}
              </p>
              <h3 className="text-2xl font-black text-[var(--text-primary)]">
                {stats.activeInvestigations}
              </h3>
            </div>
          </div>

          <div className="surface-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200 dark:border-teal-800">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                {t("metrics.resolved")}
              </p>
              <h3 className="text-2xl font-black text-[var(--text-primary)]">
                {stats.resolvedIssues}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Stepper */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">{t("hiw.title")}</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {t("hiw.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="surface-card p-5 relative">
            <span className="text-3xl font-extrabold text-emerald-800/20 dark:text-emerald-400/20 absolute top-4 right-4">
              01
            </span>
            <div className="w-9 h-9 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-bold mb-3">
              <Camera className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">{t("hiw.s1.title")}</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              {t("hiw.s1.desc")}
            </p>
          </div>

          <div className="surface-card p-5 relative">
            <span className="text-3xl font-extrabold text-emerald-800/20 dark:text-emerald-400/20 absolute top-4 right-4">
              02
            </span>
            <div className="w-9 h-9 rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-400 flex items-center justify-center font-bold mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">{t("hiw.s2.title")}</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              {t("hiw.s2.desc")}
            </p>
          </div>

          <div className="surface-card p-5 relative">
            <span className="text-3xl font-extrabold text-emerald-800/20 dark:text-emerald-400/20 absolute top-4 right-4">
              03
            </span>
            <div className="w-9 h-9 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center font-bold mb-3">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">{t("hiw.s3.title")}</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              {t("hiw.s3.desc")}
            </p>
          </div>

          <div className="surface-card p-5 relative">
            <span className="text-3xl font-extrabold text-emerald-800/20 dark:text-emerald-400/20 absolute top-4 right-4">
              04
            </span>
            <div className="w-9 h-9 rounded-md bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-400 flex items-center justify-center font-bold mb-3">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">{t("hiw.s4.title")}</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              {t("hiw.s4.desc")}
            </p>
          </div>
        </div>
      </section>

      {/* Recent Public Grievance Feed */}
      {recent.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">{t("recent.title")}</h3>
              <p className="text-xs text-[var(--text-muted)]">{t("recent.subtitle")}</p>
            </div>
            <Link
              to="/track"
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              {t("recent.trackAny")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recent.slice(0, 3).map((item) => (
              <div
                key={item._id}
                className="surface-card p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {item.ticketId}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        item.status === "resolved"
                          ? "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300"
                          : item.status === "in_progress"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-2">{item.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {item.zone}
                  </span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Emergency Helpline Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 to-emerald-900 dark:from-neutral-900 dark:to-neutral-900 text-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-800/60 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-800 flex items-center justify-center text-emerald-200 shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t("emergency.title")}</h4>
              <p className="text-xs text-emerald-200/80">{t("emergency.desc")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-white font-mono tracking-wider">1800-120-CITY</span>
            <span className="text-xs text-emerald-300/80">{t("emergency.tollFree")}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
