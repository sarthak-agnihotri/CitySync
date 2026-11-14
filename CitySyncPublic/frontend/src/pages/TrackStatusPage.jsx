import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import { GrievanceAPI } from "../api/client";
import { useLanguage } from "../context/LanguageContext";

export function TrackStatusPage() {
  const [searchParams] = useSearchParams();
  const [ticketQuery, setTicketQuery] = useState(searchParams.get("ticket") || "");
  const [loading, setLoading] = useState(false);
  const [grievance, setGrievance] = useState(null);
  const [error, setError] = useState("");
  const { t, isHindi } = useLanguage();

  const STATUS_STEPS = [
    { key: "submitted", label: t("track.statusSteps.submitted") },
    { key: "assigned_to_dept", label: t("track.statusSteps.assigned_to_dept") },
    { key: "in_progress", label: t("track.statusSteps.in_progress") },
    { key: "resolved", label: t("track.statusSteps.resolved") }
  ];

  const fetchTicket = async (ticket) => {
    if (!ticket.trim()) return;
    setLoading(true);
    setError("");
    setGrievance(null);
    try {
      const res = await GrievanceAPI.track(ticket.trim());
      setGrievance(res.grievance);
    } catch (err) {
      setError(err.message || (isHindi ? "इस टिकट संख्या से कोई शिकायत नहीं मिली" : "No complaint found with this ticket number"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get("ticket");
    if (q) {
      fetchTicket(q);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTicket(ticketQuery);
  };

  const getStepIndex = (status) => {
    if (status === "resolved") return 3;
    if (status === "in_progress") return 2;
    if (status === "assigned_to_dept" || status === "under_review") return 1;
    return 0;
  };

  const getStatusDisplay = (status) => {
    if (status === "resolved") return isHindi ? "समाधान पूर्ण" : "Resolved";
    if (status === "in_progress") return isHindi ? "कार्य प्रगति पर" : "In Progress";
    if (status === "assigned_to_dept" || status === "under_review") return isHindi ? "आवंटित" : "Assigned";
    return isHindi ? "पंजीकृत" : "Registered";
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-[var(--text-primary)]">
          {t("track.pageTitle")}
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {t("track.pageSubtitle")}
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-6 flex max-w-md mx-auto gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={t("track.searchPlaceholder")}
              value={ticketQuery}
              onChange={(e) => setTicketQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-xs"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold text-xs cursor-pointer shadow-sm shrink-0"
          >
            {loading ? t("track.searching") : t("track.searchBtn")}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {grievance && (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-md overflow-hidden">
          {/* Header Card */}
          <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]/30">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {t("track.ticketLabel")}
                </span>
                <div className="text-xl font-black font-mono text-emerald-800 dark:text-emerald-400">
                  {grievance.ticketId}
                </div>
              </div>
              <span
                className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full border ${
                  grievance.status === "resolved"
                    ? "bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800"
                    : grievance.status === "in_progress"
                    ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                    : "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                {getStatusDisplay(grievance.status)}
              </span>
            </div>

            <h2 className="text-base font-bold text-[var(--text-primary)] mt-3">
              {grievance.title}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {grievance.description}
            </p>
          </div>

          {/* Stepper Timeline */}
          <div className="p-6 border-b border-[var(--border-subtle)]">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-[var(--border-subtle)] z-0" />
              {STATUS_STEPS.map((step, idx) => {
                const currentIdx = getStepIndex(grievance.status);
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10 bg-[var(--bg-surface)] px-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                        isPassed
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-subtle)]"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] mt-1.5 font-bold ${
                        isCurrent
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grievance Metadata Grid */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--text-muted)]">{t("track.deptAssigned")}:</span>
                <p className="font-bold text-[var(--text-primary)]">{grievance.assignedDepartment}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--text-muted)]">{t("track.zone")}:</span>
                <p className="font-bold text-[var(--text-primary)]">
                  {grievance.zone} {grievance.landmark ? `(${grievance.landmark})` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--text-muted)]">{t("track.lodgedOn")}:</span>
                <p className="font-bold text-[var(--text-primary)]">
                  {new Date(grievance.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--text-muted)]">{t("report.complainantInfo")}:</span>
                <p className="font-bold text-[var(--text-primary)]">{grievance.citizenName}</p>
              </div>
            </div>
          </div>

          {/* Resolution Notes (if available) */}
          {grievance.resolutionNotes && (
            <div className="p-6 bg-teal-50/50 dark:bg-teal-950/20 border-t border-[var(--border-subtle)]">
              <h4 className="text-xs font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider mb-1">
                {t("track.remarks")}
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">
                {grievance.resolutionNotes}
              </p>
              {grievance.resolvedAt && (
                <span className="text-[10px] text-[var(--text-muted)] block mt-1">
                  {isHindi ? "समाधान तिथि" : "Closed on"}: {new Date(grievance.resolvedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          {/* Uploaded Photos Section */}
          {grievance.images && grievance.images.length > 0 && (
            <div className="p-6 border-t border-[var(--border-subtle)]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                {t("track.evidence")} ({grievance.images.length})
              </h4>
              <div className="flex flex-wrap gap-3">
                {grievance.images.map((img, i) => (
                  <a
                    key={i}
                    href={img.url.startsWith("http") ? img.url : `http://127.0.0.1:5001${img.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-28 h-28 rounded-xl overflow-hidden border border-[var(--border-subtle)] hover:opacity-90 shadow-xs"
                  >
                    <img
                      src={img.url.startsWith("http") ? img.url : `http://127.0.0.1:5001${img.url}`}
                      alt="Complaint photo"
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
