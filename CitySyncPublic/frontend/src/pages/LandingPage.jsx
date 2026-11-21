
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  PhoneCall,
  Camera,
  ArrowRight,
  TrendingUp,
  MapPin,
  Map as MapIcon,
  ThumbsUp,
  ArrowUpRight,
  Activity,
  FileText
} from "lucide-react";
import { GrievanceAPI } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import { useCitizenAuth } from "../context/CitizenAuthContext";

export function LandingPage() {
  const { t } = useLanguage();
  const { citizen } = useCitizenAuth();

  const [stats, setStats] = useState({
    totalReported: 3,
    resolvedIssues: 1,
    activeInvestigations: 2
  });
  const [recent, setRecent] = useState([]);
  const [trackQuery, setTrackQuery] = useState("");
  const [upvoting, setUpvoting] = useState({});
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

  const handleUpvote = async (ticketId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!citizen) {
      navigate("/login?required=true");
      return;
    }

    setUpvoting((prev) => ({ ...prev, [ticketId]: true }));

    try {
      const res = await GrievanceAPI.upvote(ticketId);
      setRecent((prev) =>
        prev.map((item) =>
          item.ticketId === ticketId
            ? { ...item, upvotes: res.upvotes, hasUpvoted: true }
            : item
        )
      );
    } catch (err) {
      console.error("Upvote error", err);
    } finally {
      setUpvoting((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  const metrics = [
    {
      label: t("metrics.total"),
      value: stats.totalReported,
      icon: FileText,
      color: "blue",
      note: "Public reports"
    },
    {
      label: t("metrics.active"),
      value: stats.activeInvestigations,
      icon: Activity,
      color: "amber",
      note: "Under investigation"
    },
    {
      label: t("metrics.resolved"),
      value: stats.resolvedIssues,
      icon: CheckCircle2,
      color: "emerald",
      note: "Successfully resolved"
    }
  ];

  const steps = [
    {
      number: "01",
      icon: Camera,
      title: t("hiw.s1.title"),
      desc: t("hiw.s1.desc"),
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40"
    },
    {
      number: "02",
      icon: ShieldCheck,
      title: t("hiw.s2.title"),
      desc: t("hiw.s2.desc"),
      color: "text-violet-600 bg-violet-50 dark:bg-violet-950/40"
    },
    {
      number: "03",
      icon: Clock,
      title: t("hiw.s3.title"),
      desc: t("hiw.s3.desc"),
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40"
    },
    {
      number: "04",
      icon: CheckCircle2,
      title: t("hiw.s4.title"),
      desc: t("hiw.s4.desc"),
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
    }
  ];

  return (
    <div className="pb-16 overflow-hidden">

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.25),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(14,165,233,0.16),_transparent_45%)]" />

        <div className="absolute -right-24 top-10 -z-10 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-12 top-24 -z-10 h-56 w-56 rounded-full border border-white/10" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-24 sm:pb-32">
          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-semibold tracking-wide text-emerald-300 mb-7">
              <ShieldCheck className="w-4 h-4" />
              {t("hero.badge")}
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight">
              {t("hero.title")}
              <span className="block mt-3 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                {t("hero.highlight")}
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-sm sm:text-base leading-8 text-slate-300">
              {t("hero.subtitle")}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/report"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-4 text-sm shadow-lg shadow-emerald-950/30 transition-all hover:-translate-y-0.5"
              >
                <Camera className="w-5 h-5" />
                {t("hero.reportBtn")}
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <Link
                to="/track"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold px-6 py-4 text-sm transition-all"
              >
                {t("hero.knowMoreBtn")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Transparent complaint tracking
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Government-connected platform
              </span>
            </div>
          </div>
        </div>

        {/* QUICK TRACK PANEL */}
        <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10 -mb-1">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-7 shadow-xl text-[var(--text-primary)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Track your request
                </p>
                <h2 className="text-xl sm:text-2xl font-extrabold mt-1">
                  Check complaint status
                </h2>
              </div>
              <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Search className="w-6 h-6" />
              </div>
            </div>

            <form
              onSubmit={handleQuickTrack}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex items-center flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                <Search className="w-5 h-5 ml-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder={t("hero.trackPlaceholder")}
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  className="w-full bg-transparent px-4 py-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 px-7 py-4 text-sm font-bold text-white transition-colors"
              >
                {t("hero.trackBtn")}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
              City at a glance
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-2">
              {t("metrics.total")}
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Live public grievance overview
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            const colors = {
              blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
              amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
              emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
            };

            return (
              <div
                key={metric.label}
                className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[metric.color]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-[var(--text-muted)] opacity-60" />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {metric.label}
                </p>
                <div className="flex items-end justify-between mt-1">
                  <h3 className="text-4xl font-black tracking-tight text-[var(--text-primary)]">
                    {metric.value}
                  </h3>
                  <span className="text-[10px] text-[var(--text-muted)] pb-1">
                    {metric.note}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-20">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            Simple and transparent
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {t("hiw.title")}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
            {t("hiw.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 hover:shadow-lg transition-all duration-300 group"
              >
                <span className="absolute right-5 top-3 text-5xl font-black text-slate-200/60 dark:text-white/5">
                  {step.number}
                </span>

                <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center ${step.color}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <h3 className="relative mt-6 text-base font-extrabold text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="relative mt-2 text-xs leading-6 text-[var(--text-secondary)]">
                  {step.desc}
                </p>

                <div className="mt-6 h-1 w-10 rounded-full bg-emerald-500 group-hover:w-16 transition-all duration-300" />
              </div>
            );
          })}
        </div>
      </section>

      {/* CIVIC MAP */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-7 sm:p-12 text-white">
          <div className="absolute -right-10 -bottom-28 w-80 h-80 rounded-full border border-emerald-400/20" />
          <div className="absolute -right-1 -bottom-20 w-64 h-64 rounded-full border border-emerald-400/20" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300">
                <MapIcon className="w-4 h-4" />
                {t("map.badge")}
              </span>

              <h2 className="mt-5 text-2xl sm:text-3xl font-black leading-tight">
                {t("map.bannerTitle")}
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                {t("map.bannerDesc")}
              </p>
            </div>

            <Link
              to="/map"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-6 py-4 text-sm font-bold text-slate-950 transition-all shrink-0"
            >
              <MapIcon className="w-5 h-5" />
              {t("map.bannerBtn")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* RECENT GRIEVANCES */}
      {recent.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                Community updates
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                {t("recent.title")}
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {t("recent.subtitle")}
              </p>
            </div>

            <Link
              to="/track"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:gap-3 transition-all"
            >
              {t("recent.trackAny")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {recent.slice(0, 3).map((item) => (
              <article
                key={item._id}
                className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-[10px] font-bold font-mono text-emerald-800 dark:text-emerald-300">
                    {item.ticketId}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide ${
                      item.status === "resolved" || item.status === "completed"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : item.status === "in_progress"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                        : item.status === "reopened"
                        ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {item.status.replace(/_/g, " ")}
                  </span>
                </div>

                <Link
                  to={`/track?ticket=${item.ticketId}`}
                  className="block text-base font-extrabold text-[var(--text-primary)] hover:text-emerald-600 transition-colors line-clamp-2"
                >
                  {item.title}
                </Link>

                <p className="mt-3 text-xs leading-6 text-[var(--text-secondary)] line-clamp-3">
                  {item.description}
                </p>

                <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {item.zone}
                    </span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4">
                    <button
                      type="button"
                      onClick={(e) => handleUpvote(item.ticketId, e)}
                      disabled={upvoting[item.ticketId]}
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 disabled:opacity-50 transition-colors"
                      title="I am also facing this issue"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>+1 Facing This</span>
                      <span>({item.upvotes || 0})</span>
                    </button>

                    <Link
                      to={`/track?ticket=${item.ticketId}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--text-secondary)] hover:text-emerald-600 transition-colors"
                    >
                      View
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* EMERGENCY HELPLINE */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-16">
        <div className="rounded-2xl border border-emerald-800/40 bg-gradient-to-r from-emerald-950 to-slate-900 p-6 sm:p-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center text-emerald-300 shrink-0">
                <PhoneCall className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-extrabold">
                  {t("emergency.title")}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-emerald-100/70">
                  {t("emergency.desc")}
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-2xl sm:text-3xl font-black tracking-wider font-mono">
                1800-120-CITY
              </p>
              <p className="mt-1 text-xs text-emerald-200/70">
                {t("emergency.tollFree")}
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}


