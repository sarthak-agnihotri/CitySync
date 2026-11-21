import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  MapPin,
  User,
  Calendar,
  ClipboardList,
  UserCheck,
  Play,
  CheckCircle2,
  Eye,
  RefreshCw
} from "lucide-react";

import {
  GrievancesAPI,
  DepartmentsAPI,
  UsersAPI
} from "../../api";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Modal } from "../../components/common/Modal";
import { StatusPill } from "../../components/common/StatusPill";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";

const getId = (value) => {
  if (!value) return "";
  return String(typeof value === "object" ? value._id || value.id || "" : value);
};

const formatDate = (value) => {
  if (!value) return "Not available";
  return new Date(value).toLocaleString();
};

export function GrievancesPage() {
  const { user, isRole } = useAuth();
  const { showToast } = useToast();

  const userDepartmentId = getId(user?.department);

  const isAdmin = isRole("city_admin");
  const isDepartmentHead = isRole("department_head");
  const isOfficer = isRole("officer");

  const [grievances, setGrievances] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [officers, setOfficers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [departmentId, setDepartmentId] = useState("");
  const [officerId, setOfficerId] = useState("");
  const [loadingOfficers, setLoadingOfficers] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [resolutionNotes, setResolutionNotes] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Load grievances and departments
  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const grievanceRequest = GrievancesAPI.list();

      const requests = [grievanceRequest];

      if (isAdmin || isDepartmentHead) {
        requests.push(DepartmentsAPI.list());
      }

      const results = await Promise.all(requests);

      setGrievances(results[0].grievances || []);

      if (results[1]) {
        setDepartments(results[1].departments || []);
      }
    } catch (error) {
      showToast(error.message || "Failed to load grievances", "error");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isDepartmentHead, showToast]);

  useEffect(() => {
    loadData();

    const handleRefresh = () => loadData();

    window.addEventListener("citysync:refresh-data", handleRefresh);

    return () => {
      window.removeEventListener("citysync:refresh-data", handleRefresh);
    };
  }, [loadData]);

  // Load officers when a department is selected
  const loadOfficers = async (id) => {
    setOfficerId("");
    setOfficers([]);

    if (!id) return;

    setLoadingOfficers(true);

    try {
      const data = await UsersAPI.getDepartmentOfficers(id);
      setOfficers(data.officers || []);
    } catch (error) {
      showToast(error.message || "Failed to load officers", "error");
    } finally {
      setLoadingOfficers(false);
    }
  };

  // Open assignment modal
  const openAssignModal = async (grievance) => {
    const existingDepartmentId = getId(grievance.assignedDepartmentId);
    const initialDepartmentId = isDepartmentHead
      ? userDepartmentId
      : existingDepartmentId;

    setSelectedGrievance(grievance);
    setDepartmentId(initialDepartmentId);
    setOfficerId("");
    setOfficers([]);
    setAssignOpen(true);

    if (initialDepartmentId) {
      await loadOfficers(initialDepartmentId);
    }
  };

  // Assign grievance to officer
  const handleAssign = async (e) => {
    e.preventDefault();

    if (!selectedGrievance || !departmentId || !officerId) {
      showToast("Please select a department and officer", "warning");
      return;
    }

    setAssigning(true);

    try {
      await GrievancesAPI.assign(
        selectedGrievance._id,
        departmentId,
        officerId
      );

      showToast("Grievance assigned successfully", "success");
      setAssignOpen(false);
      setSelectedGrievance(null);

      await loadData();
    } catch (error) {
      showToast(error.message || "Failed to assign grievance", "error");
    } finally {
      setAssigning(false);
    }
  };

  // Officer starts working on a grievance
  const handleStartWork = async (grievanceId) => {
    setUpdatingId(grievanceId);

    try {
      await GrievancesAPI.update(grievanceId, {
        status: "in_progress"
      });

      showToast("Grievance marked as in progress", "success");
      await loadData();
    } catch (error) {
      showToast(error.message || "Failed to update grievance", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Resolve grievance
  const handleResolve = async (e) => {
    e.preventDefault();

    if (!selectedGrievance || !resolutionNotes.trim()) {
      showToast("Please enter resolution notes", "warning");
      return;
    }

    setUpdatingId(selectedGrievance._id);

    try {
      await GrievancesAPI.update(selectedGrievance._id, {
        status: "resolved",
        resolutionNotes: resolutionNotes.trim()
      });

      showToast("Grievance resolved successfully", "success");
      setDetailOpen(false);
      setSelectedGrievance(null);
      setSelectedDetail(null);
      setResolutionNotes("");

      await loadData();
    } catch (error) {
      showToast(error.message || "Failed to resolve grievance", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Search and status filters
  const filteredGrievances = grievances.filter((grievance) => {
    const query = search.toLowerCase();

    const searchableText = [
      grievance.ticketId,
      grievance.title,
      grievance.description,
      grievance.category,
      grievance.zone,
      grievance.citizenName,
      grievance.assignedDepartment,
      grievance.assignedTo?.name
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(query);

    const matchesStatus = statusFilter
      ? grievance.status === statusFilter
      : true;

    return matchesSearch && matchesStatus;
  });

  // Open grievance details
  const openDetails = (grievance) => {
    setSelectedDetail(grievance);
    setSelectedGrievance(grievance);
    setResolutionNotes("");
    setDetailOpen(true);
  };

  return (
    <div className="page grievances-page">
      <div className="page-header-row">
        <div>
          <h3 className="section-title">Citizen Grievances</h3>
          <p className="section-hint">
            Review citizen complaints, assign officers and monitor resolution progress.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search and filters */}
      <div className="page-actions">
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              pointerEvents: "none"
            }}
          />

          <input
            type="text"
            className="search-input"
            style={{ paddingLeft: 36, width: "100%" }}
            placeholder="Search ticket, citizen, category or zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="select-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="assigned_to_dept">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="reopened">Reopened</option>
          <option value="rejected">Rejected</option>
        </select>

        <span className="results-count">
          Showing <strong>{filteredGrievances.length}</strong> of{" "}
          {grievances.length} grievances
        </span>
      </div>

      {/* Grievance list */}
      {loading ? (
        <LoadingSpinner text="Loading citizen grievances..." />
      ) : filteredGrievances.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No grievances found"
          message={
            search || statusFilter
              ? "No grievances match the selected filters."
              : "There are no grievances available for your account."
          }
        />
      ) : (
        <div className="card-list">
          {filteredGrievances.map((grievance) => {
            const isAssignedOfficer =
              isOfficer &&
              getId(grievance.assignedTo) === getId(user?._id || user?.id);

            const canAssign = isAdmin || isDepartmentHead;

            const canUpdate =
              isAdmin || isAssignedOfficer;

            const departmentName =
              grievance.assignedDepartmentId?.name ||
              grievance.assignedDepartment ||
              "City Admin Review";

            return (
              <div key={grievance._id} className="req-card-expanded">
                <div className="req-header-row">
                  <div className="req-title-meta">
                    <span className="req-asset-icon">
                      <ClipboardList size={20} />
                    </span>

                    <div>
                      <h4 className="req-asset-name">
                        {grievance.title || "Citizen Grievance"}
                      </h4>

                      <span className="req-requester-info">
                        Ticket: <strong>{grievance.ticketId}</strong>
                        {" "}�{" "}
                        {grievance.category?.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  <div className="req-status-badges">
                    <StatusPill
                      status={grievance.priority || "medium"}
                      type="priority"
                    />
                    <StatusPill status={grievance.status} />
                  </div>
                </div>

                <div className="req-body-content">
                  <p className="req-purpose-text">
                    {grievance.description || "No description provided."}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1.5">
                      <User size={14} />
                      {grievance.citizenName || "Citizen"}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {grievance.zone || "Zone not specified"}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(grievance.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="req-notes-text mt-3">
                    <strong>Department:</strong> {departmentName}
                  </p>

                  {grievance.assignedTo && (
                    <p className="req-notes-text">
                      <strong>Assigned Officer:</strong>{" "}
                      {grievance.assignedTo.name || "Officer"}
                    </p>
                  )}

                  {grievance.resolutionNotes && (
                    <p className="req-notes-text">
                      <strong>Resolution:</strong> {grievance.resolutionNotes}
                    </p>
                  )}
                </div>

                <div className="req-footer-row">
                  <span className="text-xs text-[var(--text-muted)]">
                    Updated: {formatDate(grievance.updatedAt)}
                  </span>

                  <div className="req-action-buttons">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => openDetails(grievance)}
                    >
                      <Eye size={14} />
                      <span>Details</span>
                    </button>

                    {/* City Admin and Department Head assignment */}
                    {canAssign &&
                      grievance.status !== "resolved" &&
                      grievance.status !== "rejected" && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => openAssignModal(grievance)}
                        >
                          <UserCheck size={14} />
                          <span>Assign Officer</span>
                        </button>
                      )}

                    {/* Assigned Officer starts work */}
                    {isAssignedOfficer &&
                      grievance.status === "assigned_to_dept" && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleStartWork(grievance._id)}
                          disabled={updatingId === grievance._id}
                        >
                          <Play size={14} />
                          <span>
                            {updatingId === grievance._id
                              ? "Updating..."
                              : "Start Work"}
                          </span>
                        </button>
                      )}

                    {/* Assigned Officer or Admin resolves grievance */}
                    {canUpdate &&
                      grievance.status === "in_progress" && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => openDetails(grievance)}
                        >
                          <CheckCircle2 size={14} />
                          <span>Resolve</span>
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Officer Modal */}
      <Modal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign Grievance to Officer"
        size="md"
      >
        <form onSubmit={handleAssign} className="modal-body">
          <p className="confirm-text">
            Assign ticket{" "}
            <strong>{selectedGrievance?.ticketId}</strong> to an officer.
          </p>

          <div className="form-group">
            <label>Department *</label>

            {isDepartmentHead ? (
              <input
                value={user?.departmentName || user?.department?.name || "Your Department"}
                disabled
              />
            ) : (
              <select
                required
                value={departmentId}
                onChange={(e) => {
                  const value = e.target.value;
                  setDepartmentId(value);
                  loadOfficers(value);
                }}
              >
                <option value="">Select department...</option>

                {departments.map((department) => (
                  <option key={department._id} value={department._id}>
                    {department.name} ({department.code})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label>Officer *</label>

            <select
              required
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              disabled={!departmentId || loadingOfficers}
            >
              <option value="">
                {loadingOfficers
                  ? "Loading officers..."
                  : "Select officer..."}
              </option>

              {officers.map((officer) => (
                <option key={officer._id} value={officer._id}>
                  {officer.name} ({officer.email})
                </option>
              ))}
            </select>

            {!loadingOfficers &&
              departmentId &&
              officers.length === 0 && (
                <p className="text-xs text-rose-500 mt-1">
                  No officers are registered in this department.
                </p>
              )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setAssignOpen(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={assigning || !officerId}
            >
              {assigning ? "Assigning..." : "Confirm Assignment"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Grievance Details and Resolution Modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Grievance Details"
      >
        {selectedDetail && (
          <div className="modal-body detail-view">
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Ticket ID:</span>
                <span className="detail-val">
                  {selectedDetail.ticketId}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <StatusPill status={selectedDetail.status} />
              </div>

              <div className="detail-item">
                <span className="detail-label">Category:</span>
                <span className="detail-val">
                  {selectedDetail.category?.replace(/_/g, " ")}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Priority:</span>
                <StatusPill
                  status={selectedDetail.priority}
                  type="priority"
                />
              </div>

              <div className="detail-item">
                <span className="detail-label">Citizen:</span>
                <span className="detail-val">
                  {selectedDetail.citizenName || "Citizen"}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-val">
                  {selectedDetail.citizenPhone || "Not provided"}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-val">
                  {selectedDetail.citizenEmail || "Not provided"}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Zone:</span>
                <span className="detail-val">
                  {selectedDetail.zone || "Not specified"}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Department:</span>
                <span className="detail-val">
                  {selectedDetail.assignedDepartmentId?.name ||
                    selectedDetail.assignedDepartment ||
                    "City Admin Review"}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Assigned Officer:</span>
                <span className="detail-val">
                  {selectedDetail.assignedTo?.name || "Not assigned"}
                </span>
              </div>
            </div>

            <div className="detail-section">
              <span className="detail-label">Description:</span>
              <p className="detail-paragraph">
                {selectedDetail.description || "No description provided."}
              </p>
            </div>
            {/* Citizen Uploaded Images */}
            <div className="detail-section">
              <span className="detail-label">Citizen Uploaded Photos:</span>

              {selectedDetail.images && selectedDetail.images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  {selectedDetail.images.map((image, index) => (
                    <a
                      key={`${image.url}-${index}`}
                      href={image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={image.url}
                        alt={image.originalName || `Grievance photo ${index + 1}`}
                        className="w-full h-56 object-cover rounded-lg border border-[var(--border-subtle)]"
                      />

                      <p className="text-xs mt-2 text-[var(--text-muted)]">
                        {image.originalName || `Photo ${index + 1}`}
                      </p>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="detail-paragraph">
                  No photos uploaded by the citizen.
                </p>
              )}
            </div>
            {selectedDetail.landmark && (
              <div className="detail-section">
                <span className="detail-label">Landmark:</span>
                <p className="detail-paragraph">
                  {selectedDetail.landmark}
                </p>
              </div>
            )}

            {selectedDetail.resolutionNotes && (
              <div className="detail-section">
                <span className="detail-label">Resolution Notes:</span>
                <p className="detail-paragraph">
                  {selectedDetail.resolutionNotes}
                </p>
              </div>
            )}

            {/* Resolution form for assigned Officer or City Admin */}
            {(isAdmin ||
              (isOfficer &&
                getId(selectedDetail.assignedTo) ===
                getId(user?._id || user?.id))) &&
              selectedDetail.status === "in_progress" && (
                <form onSubmit={handleResolve}>
                  <div className="form-group">
                    <label>Resolution Notes *</label>

                    <textarea
                      rows={3}
                      required
                      placeholder="Describe the work completed to resolve this complaint..."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                    />
                  </div>

                  <div className="modal-footer">
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={
                        updatingId === selectedDetail._id ||
                        !resolutionNotes.trim()
                      }
                    >
                      {updatingId === selectedDetail._id
                        ? "Resolving..."
                        : "Mark as Resolved"}
                    </button>
                  </div>
                </form>
              )}

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setDetailOpen(false)}
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
