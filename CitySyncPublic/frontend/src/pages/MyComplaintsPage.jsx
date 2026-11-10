import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, AlertCircle, Calendar, MapPin, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { GrievanceAPI } from "../api/client";
import { useCitizenAuth } from "../context/CitizenAuthContext";

export function MyComplaintsPage() {
  const { user } = useCitizenAuth();
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">
            My Registered Grievances
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Tracking tickets submitted from {user?.email}
          </p>
        </div>
        <Link
          to="/report"
          className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs text-center"
        >
          Report Another Issue
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-[var(--text-muted)]">
          Loading your complaint history...
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <FileText className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">No grievances submitted yet</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
            You haven't filed any municipal complaints from this account. Spot an issue in your ward?
          </p>
          <Link
            to="/report"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold text-xs"
          >
            File Your First Complaint
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((item) => (
            <div
              key={item._id}
              className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-500/40 transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
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
                  <span className="text-[11px] text-[var(--text-muted)]">
                    • {item.assignedDepartment}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{item.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)] pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {item.zone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Link
                to={`/track?ticket=${encodeURIComponent(item.ticketId)}`}
                className="px-4 py-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-secondary)] text-xs font-semibold text-[var(--text-primary)] flex items-center justify-center gap-1 shrink-0"
              >
                <span>View Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

