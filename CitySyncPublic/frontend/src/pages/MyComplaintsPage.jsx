import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Calendar,
  MapPin,
  ArrowRight,
  Clock,
  ThumbsUp,
  Star,
  RotateCcw
} from "lucide-react";
import { GrievanceAPI } from "../api/client";
import { useCitizenAuth } from "../context/CitizenAuthContext";
import { useLanguage } from "../context/LanguageContext";

export function MyComplaintsPage() {
  const { user } = useCitizenAuth();
  const { t, isHindi } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GrievanceAPI.getMyGrievances()
      .then((data) => {
        setComplaints(data.grievances || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getStatusLabel = (status) => {
    if (status === "resolved") return isHindi ? "समाधान पूर्ण" : "Resolved";
    if (status === "reopened") return isHindi ? "पुनः खोला गया" : "Reopened";
    if (status === "in_progress") return isHindi ? "कार्य प्रगति पर" : "In Progress";
    if (status === "assigned_to_dept" || status === "under_review") return isHindi ? "आवंटित" : "Assigned";
    return isHindi ? "पंजीकृत" : "Registered";
  };

  const getSlaBadge = (item) => {
    if (item.status === "resolved") {
      return (
        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {isHindi ? "समय पर पूर्ण" : "Resolved within SLA"}
        </span>
      );
    }
    const createdAtTime = new Date(item.createdAt).getTime();
    const slaHours = item.slaHours || 48;
    const deadlineTime = createdAtTime + slaHours * 60 * 60 * 1000;
    const diffHours = Math.round((deadlineTime - Date.now()) / (1000 * 60 * 60));

    if (diffHours < 0) {
      return (
        <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {isHindi ? `विलंबित (${Math.abs(diffHours)} घंटे)` : `Overdue (${Math.abs(diffHours)}h)`}
        </span>
      );
    }
    return (
      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {isHindi ? `शेष: ${diffHours} घंटे` : `${diffHours}h left`}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
            {t("myComplaints.title")}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            {t("myComplaints.sub")} {user?.email}
          </p>
        </div>
        <Link
          to="/report"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-900/15 text-center transition-all hover:-translate-y-0.5"
        >
          {t("myComplaints.reportAnother")}
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-24 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm text-sm font-medium text-[var(--text-muted)]">
          {t("myComplaints.loading")}
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-10 sm:p-16 text-center rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-5"><FileText className="w-9 h-9 text-emerald-700 dark:text-emerald-400" /></div>
          <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--text-primary)]">{t("myComplaints.emptyTitle")}</h3>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)] mt-2 max-w-md mx-auto">
            {t("myComplaints.emptySub")}
          </p>
          <Link
            to="/report"
            className="inline-flex items-center justify-center mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-900/15 transition-all hover:-translate-y-0.5"
          >
            {t("myComplaints.emptyBtn")}
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {complaints.map((item) => (
            <div
              key={item._id}
              className="p-6 sm:p-7 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300"
            >
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs sm:text-sm tracking-wide text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    {item.ticketId}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      item.status === "resolved"
                        ? "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300"
                        : item.status === "reopened"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                        : item.status === "in_progress"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {getStatusLabel(item.status)}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    • {item.assignedDepartment}
                  </span>

                  {/* SLA Tracker */}
                  <span className="ml-auto md:ml-2">
                    {getSlaBadge(item)}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--text-primary)]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-2">{item.description}</p>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--border-subtle)]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {item.zone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400">
                    <ThumbsUp className="w-3 h-3 text-emerald-600" />
                    {item.upvotes || 0} {isHindi ? "समर्थन" : "Upvotes"}
                  </span>
                  {item.satisfactionRating && (
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {item.satisfactionRating}/5
                    </span>
                  )}
                </div>
              </div>

              <Link
                to={`/track?ticket=${encodeURIComponent(item.ticketId)}`}
                className="px-5 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2 shrink-0 transition-all duration-200 hover:-translate-y-0.5"
              >
                <span>{t("myComplaints.viewStatus")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}




