import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollText,
  Filter,
  RotateCcw,
  Eye,
  ShieldCheck,
  Calendar,
  Layers,
  Building2
} from "lucide-react";
import { AuditAPI, DepartmentsAPI } from "../../api";
import { useToast } from "../../context/ToastContext";
import { Modal } from "../../components/common/Modal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";

export function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Filters
  const [actionFilter, setActionFilter] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Inspect Modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [inspectOpen, setInspectOpen] = useState(false);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (actionFilter) params.action = actionFilter;
      if (targetTypeFilter) params.targetType = targetTypeFilter;
      if (deptFilter) params.department = deptFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const [auditData, deptData] = await Promise.all([
        AuditAPI.list(params),
        DepartmentsAPI.list()
      ]);

      setLogs(auditData.logs || []);
      setDepartments(deptData.departments || []);
    } catch (err) {
      showToast(err.message || "Failed to query audit trail", "error");
    } finally {
      setLoading(false);
    }
  }, [actionFilter, targetTypeFilter, deptFilter, startDate, endDate, showToast]);

  useEffect(() => {
    loadLogs();
    const handleRefresh = () => loadLogs();
    window.addEventListener("citysync:refresh-data", handleRefresh);
    return () => window.removeEventListener("citysync:refresh-data", handleRefresh);
  }, [loadLogs]);

  const clearFilters = () => {
    setActionFilter("");
    setTargetTypeFilter("");
    setDeptFilter("");
    setStartDate("");
    setEndDate("");
  };

  const getActionColor = (action) => {
    if (action.includes("CREATE")) return "success";
    if (action.includes("APPROVE")) return "success";
    if (action.includes("REJECT") || action.includes("DEACTIVATE")) return "danger";
    if (action.includes("RETURN")) return "info";
    return "warning";
  };

  return (
    <div className="page audit-page">
      <div className="page-header-row">
        <div>
          <h3 className="section-title">Municipal Immutable Audit Trail</h3>
          <p className="section-hint">
            Statutory governance log recording all resource creations, requisitions, and approvals
          </p>
        </div>
      </div>

      <div className="audit-filter-panel">
        <div className="filter-grid">
          <div className="filter-item">
            <label>Action Type</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="select-input"
            >
              <option value="">All Actions</option>
              <option value="RESOURCE_CREATED">RESOURCE_CREATED</option>
              <option value="RESOURCE_UPDATED">RESOURCE_UPDATED</option>
              <option value="RESOURCE_DEACTIVATED">RESOURCE_DEACTIVATED</option>
              <option value="REQUEST_SUBMITTED">REQUEST_SUBMITTED</option>
              <option value="REQUEST_APPROVED">REQUEST_APPROVED</option>
              <option value="REQUEST_REJECTED">REQUEST_REJECTED</option>
              <option value="RESOURCE_RETURNED">RESOURCE_RETURNED</option>
              <option value="REQUEST_CANCELLED">REQUEST_CANCELLED</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Target Entity</label>
            <select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              className="select-input"
            >
              <option value="">All Target Types</option>
              <option value="Resource">Resource</option>
              <option value="ResourceRequest">Resource Request</option>
              <option value="Department">Department</option>
              <option value="User">User</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="select-input"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>From Date</label>
            <input
              type="date"
              className="select-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="filter-item">
            <label>To Date</label>
            <input
              type="date"
              className="select-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-actions-row">
          <button className="btn btn-primary btn-sm" onClick={loadLogs}>
            <Filter size={14} />
            <span>Apply Filters</span>
          </button>
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
          <span className="results-count">
            Found <strong>{logs.length}</strong> matching entries
          </span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving cryptographic audit events..." />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No audit entries found"
          message="No recorded actions match the active query parameters."
        />
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Description</th>
                <th>Performed By</th>
                <th>Target Type</th>
                <th className="text-right">Inspection</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const color = getActionColor(log.action);
                const userName = log.performedBy?.name || "System Admin";
                const userEmail = log.performedBy?.email || "";

                return (
                  <tr key={log._id}>
                    <td className="whitespace-nowrap">
                      <span className="audit-time">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className={`audit-badge badge-${color}`}>{log.action}</span>
                    </td>
                    <td>
                      <span className="audit-desc-cell">{log.description}</span>
                    </td>
                    <td>
                      <div className="audit-user-cell">
                        <span className="audit-user-name">{userName}</span>
                        {userEmail && <span className="audit-user-email">{userEmail}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="target-tag">{log.targetType}</span>
                    </td>
                    <td className="text-right">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setSelectedLog(log);
                          setInspectOpen(true);
                        }}
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Inspect State Diff Modal */}
      <Modal
        isOpen={inspectOpen}
        onClose={() => setInspectOpen(false)}
        title="Audit Event Deep Inspection"
        size="lg"
      >
        {selectedLog && (
          <div className="modal-body inspect-modal-body">
            <div className="inspect-grid">
              <div>
                <strong>Event ID:</strong> <code>{selectedLog._id}</code>
              </div>
              <div>
                <strong>Action:</strong> <code>{selectedLog.action}</code>
              </div>
              <div>
                <strong>Target Type:</strong> {selectedLog.targetType}
              </div>
              <div>
                <strong>Target ID:</strong> <code>{selectedLog.targetId}</code>
              </div>
              <div>
                <strong>Performed By:</strong> {selectedLog.performedBy?.name} (
                {selectedLog.performedBy?.email})
              </div>
              <div>
                <strong>Timestamp:</strong> {new Date(selectedLog.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="inspect-desc-box">
              <strong>Description:</strong> {selectedLog.description}
            </div>

            <div className="state-diff-container">
              <div className="state-diff-col">
                <h5>Previous State</h5>
                <pre className="json-block">
                  {selectedLog.previousState
                    ? JSON.stringify(selectedLog.previousState, null, 2)
                    : "// Initial creation — No previous state"}
                </pre>
              </div>

              <div className="state-diff-col">
                <h5>New / Updated State</h5>
                <pre className="json-block">
                  {selectedLog.newState
                    ? JSON.stringify(selectedLog.newState, null, 2)
                    : "// Unmodified or state not captured"}
                </pre>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setInspectOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
