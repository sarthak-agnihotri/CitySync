
import React, { useCallback, useEffect, useState } from "react";
import { ConflictsAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const statusLabels = {
  detected: "Detected",
  under_review: "Under Review",
  resolved: "Resolved",
  ignored: "Ignored",
};

const typeLabels = {
  location_and_date_overlap: "Location and date overlap",
  date_overlap: "Date overlap",
  zone_overlap: "Zone overlap",
};

export function ConflictsPage() {
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { user, isRole } = useAuth();
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
        resolutionNotes: notes.trim() || "Reviewed and resolved by the department team",
      });

      showToast("Conflict resolved successfully", "success");
      setSelected(null);
      setNotes("");
      await fetchConflicts();
    } catch (err) {
      showToast(err.message || "Could not resolve conflict", "error");
    } finally {
      setSaving(false);
    }
  };

  const cardStyle = {
    border: "1px solid #dbe2ea",
    borderRadius: "10px",
    padding: "18px",
    marginBottom: "16px",
  };

  const buttonStyle = {
    padding: "9px 14px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    cursor: "pointer",
    font: "inherit",
  };

  const severityColor = {
    low: "#64748b",
    medium: "#b45309",
    high: "#c2410c",
    critical: "#b91c1c",
  };

  return (
    <main style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      <header style={{ marginBottom: "24px" }}>
        <h1>Project Conflicts</h1>
        <p>
          Review overlapping project locations and schedules, then coordinate
          with the departments involved.
        </p>
      </header>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "22px",
        }}
      >
        {[
          ["active", "Active Conflicts"],
          ["all", "All Conflicts"],
          ["resolved", "Resolved / Ignored"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            style={{
              ...buttonStyle,
              background: filter === value ? "#1d4ed8" : "transparent",
              color: filter === value ? "#fff" : "inherit",
            }}
          >
            {label}
          </button>
        ))}

        <button
          onClick={fetchConflicts}
          style={{ ...buttonStyle, marginLeft: "auto" }}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {!loading && (
        <p>
          Showing <strong>{visibleConflicts.length}</strong> conflict(s)
        </p>
      )}

      {loading ? (
        <p>Loading conflicts...</p>
      ) : visibleConflicts.length === 0 ? (
        <div style={cardStyle}>
          <h3>No conflicts in this view</h3>
          <p>
            {filter === "active"
              ? "No active conflicts are currently recorded. Create another project with an overlapping schedule and location to test detection."
              : "Try another filter to view recorded conflicts."}
          </p>
        </div>
      ) : (
        visibleConflicts.map((conflict) => (
          <article key={conflict._id} style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3 style={{ marginTop: 0, marginBottom: "8px" }}>
                  {conflict.projectA?.title || "Project A"} ↔{" "}
                  {conflict.projectB?.title || "Project B"}
                </h3>
                <p style={{ margin: "4px 0" }}>
                  <strong>Type:</strong>{" "}
                  {typeLabels[conflict.conflictType] || conflict.conflictType}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong>Departments:</strong>{" "}
                  {(conflict.departmentsInvolved || [])
                    .map((department) =>
                      typeof department === "object"
                        ? department.name
                        : department
                    )
                    .join(", ") || "Not specified"}
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    color: severityColor[conflict.severity] || "inherit",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {conflict.severity || "Medium"} severity
                </div>
                <div style={{ marginTop: "6px" }}>
                  {statusLabels[conflict.status] || conflict.status}
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "12px",
                borderRadius: "6px",
                marginTop: "14px",
              }}
            >
              <p>
                <strong>Project A:</strong>{" "}
                {conflict.projectA?.zone || "Zone unavailable"} —{" "}
                {conflict.projectA?.address || "Address unavailable"}
              </p>
              <p>
                <strong>Project B:</strong>{" "}
                {conflict.projectB?.zone || "Zone unavailable"} —{" "}
                {conflict.projectB?.address || "Address unavailable"}
              </p>
              {conflict.distanceMeters != null && (
                <p>
                  <strong>Distance:</strong>{" "}
                  {Math.round(conflict.distanceMeters)} metres
                </p>
              )}
              {conflict.resolutionNotes && (
                <p>
                  <strong>Resolution notes:</strong> {conflict.resolutionNotes}
                </p>
              )}
            </div>

            {canResolve &&
              ["detected", "under_review"].includes(conflict.status) && (
                <button
                  style={{
                    ...buttonStyle,
                    background: "#15803d",
                    color: "#fff",
                    marginTop: "14px",
                  }}
                  onClick={() => {
                    setSelected(conflict);
                    setNotes("");
                  }}
                >
                  Resolve Conflict
                </button>
              )}
          </article>
        ))
      )}

      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px",
            zIndex: 1000,
          }}
        >
          <form
            onSubmit={handleResolve}
            style={{
              background: "white",
              color: "#111827",
              padding: "24px",
              borderRadius: "10px",
              width: "100%",
              maxWidth: "480px",
            }}
          >
            <h2>Resolve Conflict</h2>
            <p>
              {selected.projectA?.title || "Project A"} and{" "}
              {selected.projectB?.title || "Project B"}
            </p>

            <label style={{ display: "block", marginBottom: "16px" }}>
              Resolution notes
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Describe the agreed schedule or coordination plan..."
                rows={4}
                style={{
                  display: "block",
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px",
                  marginTop: "8px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  font: "inherit",
                }}
              />
            </label>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                style={buttonStyle}
                onClick={() => setSelected(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  ...buttonStyle,
                  background: "#15803d",
                  color: "#fff",
                }}
                disabled={saving}
              >
                {saving ? "Saving..." : "Confirm Resolution"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
