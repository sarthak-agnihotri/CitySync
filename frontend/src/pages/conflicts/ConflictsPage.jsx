import React, { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Building2,
  Calendar,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Check
} from "lucide-react";
import { ConflictsAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Modal } from "../../components/common/Modal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";

const typeLabels = {
  location_and_date_overlap: "Spatial & Timeline Overlap",
  date_overlap: "Schedule Clash",
  zone_overlap: "Zonal Proximity Clash",
};

export function ConflictsPage() {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { isRole } = useAuth();
  const { showToast } = useToast();

  const canResolve = isRole("city_admin") || isRole("department_head");

  const fetchConflicts = useCallback(async () => {
    setLoading(true);

    try {
      const result = await ConflictsAPI.getAll();
      setConflicts(result.conflicts || []);
    } catch (err) {
      showToast(err.message || "Could not load conflicts", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchConflicts();
    const handleRefresh = () => fetchConflicts();
    window.addEventListener("citysync:refresh-data", handleRefresh);
    return () => window.removeEventListener("citysync:refresh-data", handleRefresh);
  }, [fetchConflicts]);

  const visibleConflicts = conflicts.filter((conflict) => {
    if (filter === "active") {
      return ["detected", "under_review"].includes(conflict.status);
    }

    if (filter === "resolved") {
      return ["resolved", "ignored"].includes(conflict.status);
    }

    return true;
  });

  const handleResolve = async (event) => {
    event.preventDefault();

    if (!selected) return;

    setSaving(true);

    try {
      await ConflictsAPI.resolve(selected._id, {
        status: "resolved",
        resolutionNotes: notes.trim() || "Reviewed and coordinated between line departments.",
      });

      showToast("Civil conflict marked resolved & logged to audit trail", "success");
      setSelected(null);
      setNotes("");
      await fetchConflicts();
    } catch (err) {
      showToast(err.message || "Could not resolve conflict", "error");
    } finally {
      setSaving(false);
    }
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "badge-danger";
      case "high":
        return "badge-danger";
      case "medium":
        return "badge-warning";
      case "low":
      default:
        return "badge-info";
    }
  };

  return (
    <div className="page conflicts-page">
      <div className="page-header-row">
        <div>
          <h3 className="section-title">Dig-Later Infrastructure Conflict Registry</h3>
          <p className="section-hint">
            Automated spatial proximity and schedule clash detection across municipal agencies
          </p>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={fetchConflicts} disabled={loading}>
          <RotateCcw size={14} className={loading ? "spinning" : ""} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      <div className="page-actions">
        <div className="flex items-center gap-2">
          {[
            ["active", "Active Clashes"],
            ["all", "All Recorded Conflicts"],
            ["resolved", "Resolved & Coordinated"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`btn btn-sm ${
                filter === value ? "btn-primary" : "btn-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <span className="results-count">
          Showing <strong>{visibleConflicts.length}</strong> recorded clash(es)
        </span>
      </div>

      {loading ? (
        <LoadingSpinner text="Analyzing spatial coordinates and work schedules..." />
      ) : visibleConflicts.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title={
            filter === "active"
              ? "Zero Active Clashes Detected"
              : "No conflicts recorded in this view"
          }
          message={
            filter === "active"
              ? "All registered civil works are currently temporally and spatially deconflicted under Dig-Later policy."
              : "Adjust your filter tab to view archived or resolved inter-departmental conflicts."
          }
        />
      ) : (
        <div className="card-list">
          {visibleConflicts.map((conflict) => {
            const isResolved = ["resolved", "ignored"].includes(conflict.status);

            return (
              <div key={conflict._id} className="surface-card p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[280px]">
                    <div className="flex items-center gap-2">
                      <span className={`audit-badge ${getSeverityBadgeClass(conflict.severity)}`}>
                        {conflict.severity?.toUpperCase()} SEVERITY
                      </span>
                      <span className="target-tag font-semibold">
                        {typeLabels[conflict.conflictType] || conflict.conflictType}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                        isResolved
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
                      }`}>
                        {conflict.status?.replace(/_/g, " ")}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[var(--text-primary)] m-0 flex items-center gap-2">
                      <span>{conflict.projectA?.title || "Corridor Project A"}</span>
                      <ArrowRight size={15} className="text-[var(--text-muted)] shrink-0" />
                      <span>{conflict.projectB?.title || "Corridor Project B"}</span>
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building2 size={13} />
                        <strong>Agencies Involved:</strong>{" "}
                        {(conflict.departmentsInvolved || [])
                          .map((d) => (typeof d === "object" ? d.name : d))
                          .join(", ") || "Multiple Line Departments"}
                      </span>
                      {conflict.distanceMeters != null && (
                        <>
                          <span className="dot-sep">•</span>
                          <span className="flex items-center gap-1 font-semibold text-rose-700 dark:text-rose-400">
                            <MapPin size={13} />
                            Separation: {Math.round(conflict.distanceMeters)} meters
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {canResolve && !isResolved && (
                    <button
                      className="btn btn-primary btn-sm shrink-0"
                      onClick={() => {
                        setSelected(conflict);
                        setNotes("");
                      }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Resolve & Coordinate</span>
                    </button>
                  )}
                </div>

                {/* Conflict Details Comparison Box */}
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Project A Location & Timeline</span>
                    <span className="detail-val">
                      {conflict.projectA?.zone ? `${conflict.projectA.zone} — ` : ""}
                      {conflict.projectA?.address || "Address unavailable"}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
                      <Calendar size={12} />
                      {conflict.projectA?.startDate ? new Date(conflict.projectA.startDate).toLocaleDateString() : "—"}{" "}
                      to {conflict.projectA?.endDate ? new Date(conflict.projectA.endDate).toLocaleDateString() : "—"}
                    </span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Project B Location & Timeline</span>
                    <span className="detail-val">
                      {conflict.projectB?.zone ? `${conflict.projectB.zone} — ` : ""}
                      {conflict.projectB?.address || "Address unavailable"}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
                      <Calendar size={12} />
                      {conflict.projectB?.startDate ? new Date(conflict.projectB.startDate).toLocaleDateString() : "—"}{" "}
                      to {conflict.projectB?.endDate ? new Date(conflict.projectB.endDate).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>

                {conflict.resolutionNotes && (
                  <div className="review-box text-xs text-[var(--text-secondary)]">
                    <strong>Coordination Record:</strong> {conflict.resolutionNotes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resolution Coordination Modal */}
      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Inter-Agency Conflict Resolution Protocol"
        size="md"
      >
        {selected && (
          <form onSubmit={handleResolve} className="modal-body">
            <div className="confirm-text">
              Coordinating clash between <strong>{selected.projectA?.title}</strong> and{" "}
              <strong>{selected.projectB?.title}</strong>.
            </div>

            <div className="form-group">
              <label>Joint Department Coordination Agreement & Notes *</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Water Board agrees to complete underground main pipe trenching by 15th Nov, prior to PWD resurfacing on 20th Nov..."
                rows={4}
                required
              />
            </div>

            <p className="confirm-hint">
              Resolving this conflict formally confirms inter-departmental alignment under Dig-Later
              statutory rules and records the action into the municipal immutable audit trail.
            </p>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setSelected(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || !notes.trim()}
              >
                {saving ? "Logging Resolution..." : "Confirm Deconfliction"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
