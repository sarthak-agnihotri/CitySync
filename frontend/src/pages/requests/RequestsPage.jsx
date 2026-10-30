import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Ban,
  Calendar,
  Building2,
  User,
  Boxes,
  Eye,
  AlertCircle
} from "lucide-react";
import { RequestsAPI, ResourcesAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Modal } from "../../components/common/Modal";
import { StatusPill } from "../../components/common/StatusPill";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";

export function RequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isRole } = useAuth();
  const { showToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // New Request Modal
  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    resourceId: "",
    quantityRequested: 1,
    purpose: "",
    startDate: "",
    endDate: "",
    priority: "medium",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // Reject Modal
  const [rejectOpen, setRejectOpen] = useState(false);
  const [selectedReqForReject, setSelectedReqForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  // Detail Modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReqDetail, setSelectedReqDetail] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqData, resData] = await Promise.all([
        RequestsAPI.list(),
        ResourcesAPI.list()
      ]);
      setRequests(reqData.requests || []);
      const activeRes = resData.resources || [];
      setResources(activeRes);

      // Check URL search param for pre-selection
      const paramResourceId = searchParams.get("resourceId");
      if (paramResourceId) {
        setNewForm((prev) => ({
          ...prev,
          resourceId: paramResourceId
        }));
        setNewOpen(true);
        // Clear search param so opening doesn't trigger on future refreshes
        setSearchParams({});
      }
    } catch (err) {
      showToast(err.message || "Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  }, [searchParams, setSearchParams, showToast]);

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener("citysync:refresh-data", handleRefresh);
    return () => window.removeEventListener("citysync:refresh-data", handleRefresh);
  }, [loadData]);

  const handleNewSubmit = async (e) => {
    e.preventDefault();
    if (!newForm.resourceId) {
      showToast("Please select a resource from the pool", "warning");
      return;
    }

    if (new Date(newForm.endDate) < new Date(newForm.startDate)) {
      showToast("End date cannot be earlier than start date", "warning");
      return;
    }

    setSubmitting(true);
    try {
      await RequestsAPI.submit({
        resourceId: newForm.resourceId,
        quantityRequested: Number(newForm.quantityRequested),
        purpose: newForm.purpose.trim(),
        startDate: newForm.startDate,
        endDate: newForm.endDate,
        priority: newForm.priority,
        notes: newForm.notes.trim()
      });

      showToast("Requisition submitted successfully", "success");
      setNewOpen(false);
      setNewForm({
        resourceId: "",
        quantityRequested: 1,
        purpose: "",
        startDate: "",
        endDate: "",
        priority: "medium",
        notes: ""
      });
      loadData();
    } catch (err) {
      showToast(err.message || "Failed to submit request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (reqId) => {
    try {
      await RequestsAPI.approve(reqId);
      showToast("Request approved & inventory allocated", "success");
      loadData();
    } catch (err) {
      showToast(err.message || "Approval failed", "error");
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedReqForReject) return;
    setRejecting(true);
    try {
      await RequestsAPI.reject(selectedReqForReject._id, rejectionReason.trim());
      showToast("Request marked rejected", "info");
      setRejectOpen(false);
      setRejectionReason("");
      loadData();
    } catch (err) {
      showToast(err.message || "Rejection failed", "error");
    } finally {
      setRejecting(false);
    }
  };

  const handleReturn = async (reqId) => {
    try {
      await RequestsAPI.returnResource(reqId);
      showToast("Resource returned & inventory restocked", "success");
      loadData();
    } catch (err) {
      showToast(err.message || "Return action failed", "error");
    }
  };

  const handleCancel = async (reqId) => {
    try {
      await RequestsAPI.cancel(reqId);
      showToast("Request cancelled", "info");
      loadData();
    } catch (err) {
      showToast(err.message || "Cancellation failed", "error");
    }
  };

  const canApproveReject = isRole("city_admin", "department_head");

  const filteredRequests = requests.filter((r) => {
    const q = search.toLowerCase();
    const resName = r.resource?.name || "";
    const purpose = r.purpose || "";
    const requester = r.requestedBy?.name || "";

    const matchesSearch =
      resName.toLowerCase().includes(q) ||
      purpose.toLowerCase().includes(q) ||
      requester.toLowerCase().includes(q);

    const matchesStatus = statusFilter ? r.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const selectedResourceMeta = resources.find((r) => r._id === newForm.resourceId);

  return (
    <div className="page requests-page">
      <div className="page-header-row">
        <div>
          <h3 className="section-title">Equipment Requisitions & Approvals</h3>
          <p className="section-hint">
            Cross-department equipment transfers, booking lifecycle, and return logging
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setNewOpen(true)}>
          <Plus size={16} />
          <span>New Resource Request</span>
        </button>
      </div>

      <div className="page-actions">
        <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
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
            placeholder="Search by equipment, purpose, officer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="select-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Request Statuses</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved & Active</option>
          <option value="rejected">Rejected</option>
          <option value="returned">Returned & Restocked</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <span className="results-count">
          Showing <strong>{filteredRequests.length}</strong> of {requests.length} requests
        </span>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving requisitions log..." />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No requests found"
          message={
            search || statusFilter
              ? "No requisitions match the selected filters."
              : "No inter-agency requests have been submitted yet."
          }
          actionButton={
            !search &&
            !statusFilter && (
              <button className="btn btn-primary" onClick={() => setNewOpen(true)}>
                <Plus size={15} />
                <span>Submit First Request</span>
              </button>
            )
          }
        />
      ) : (
        <div className="card-list">
          {filteredRequests.map((req) => {
            const resName = req.resource?.name || "Machinery Asset";
            const requesterName = req.requestedBy?.name || "Officer";
            const requesterDept = req.requestingDepartment?.name || "Municipal Agency";
            const isRequester =
              user?._id === req.requestedBy?._id || user?._id === req.requestedBy;

            return (
              <div key={req._id} className="req-card-expanded">
                <div className="req-header-row">
                  <div className="req-title-meta">
                    <span className="req-asset-icon">
                      <Boxes size={20} />
                    </span>
                    <div>
                      <h4 className="req-asset-name">{resName}</h4>
                      <span className="req-requester-info">
                        Requested by <strong>{requesterName}</strong> ({requesterDept})
                      </span>
                    </div>
                  </div>

                  <div className="req-status-badges">
                    <StatusPill status={req.priority} type="priority" />
                    <StatusPill status={req.status} />
                  </div>
                </div>

                <div className="req-body-content">
                  <p className="req-purpose-text">
                    <strong>Purpose:</strong> {req.purpose}
                  </p>
                  {req.rejectionReason && (
                    <div className="rejection-box">
                      <div className="flex items-center gap-1.5 font-semibold mb-1">
                        <AlertCircle size={14} />
                        <span>Rejection Reason:</span>
                      </div>
                      <p className="m-0">{req.rejectionReason}</p>
                    </div>
                  )}
                  {req.notes && (
                    <p className="req-notes-text">
                      <strong>Notes:</strong> {req.notes}
                    </p>
                  )}
                </div>

                <div className="req-footer-row">
                  <div className="req-date-range">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <strong>{new Date(req.startDate).toLocaleDateString()}</strong> to{" "}
                      <strong>{new Date(req.endDate).toLocaleDateString()}</strong>
                    </span>
                    <span className="dot-sep">•</span>
                    <span>
                      Qty: <strong>{req.quantityRequested}</strong> unit(s)
                    </span>
                  </div>

                  <div className="req-action-buttons">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setSelectedReqDetail(req);
                        setDetailOpen(true);
                      }}
                    >
                      <Eye size={14} />
                      <span>Details</span>
                    </button>

                    {/* Pending actions */}
                    {req.status === "pending" && canApproveReject && (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleApprove(req._id)}
                        >
                          <CheckCircle2 size={14} />
                          <span>Approve</span>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setSelectedReqForReject(req);
                            setRejectOpen(true);
                          }}
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {/* Cancel action for pending */}
                    {req.status === "pending" && (isRequester || isRole("city_admin")) && (
                      <button
                        className="btn btn-ghost btn-sm text-danger"
                        onClick={() => handleCancel(req._id)}
                      >
                        <Ban size={14} />
                        <span>Cancel</span>
                      </button>
                    )}

                    {/* Return action for approved */}
                    {req.status === "approved" && canApproveReject && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleReturn(req._id)}
                      >
                        <RotateCcw size={14} />
                        <span>Mark Returned</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Request Modal */}
      <Modal
        isOpen={newOpen}
        onClose={() => setNewOpen(false)}
        title="Submit Inter-Agency Resource Request"
      >
        <form onSubmit={handleNewSubmit} className="modal-body">
          <div className="form-group">
            <label>Select Machinery / Resource from Pool *</label>
            <select
              required
              value={newForm.resourceId}
              onChange={(e) => setNewForm({ ...newForm, resourceId: e.target.value })}
            >
              <option value="">Choose available resource...</option>
              {resources.map((r) => {
                const dept = r.ownerDepartment?.name || "Depot";
                return (
                  <option key={r._id} value={r._id}>
                    {r.name} — {r.availableQuantity} {r.unit || "units"} available ({dept})
                  </option>
                );
              })}
            </select>
          </div>

          {selectedResourceMeta && (
            <div className="selected-res-preview">
              <span className="preview-label">Category: {selectedResourceMeta.category}</span>
              <span className="preview-label">
                Available: {selectedResourceMeta.availableQuantity} of{" "}
                {selectedResourceMeta.quantity} {selectedResourceMeta.unit || "units"}
              </span>
              <span className="preview-label">
                Location: {selectedResourceMeta.location || "Central Yard"}
              </span>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Quantity Needed *</label>
              <input
                type="number"
                min="1"
                required
                value={newForm.quantityRequested}
                onChange={(e) =>
                  setNewForm({ ...newForm, quantityRequested: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Requisition Priority *</label>
              <select
                required
                value={newForm.priority}
                onChange={(e) => setNewForm({ ...newForm, priority: e.target.value })}
              >
                <option value="low">Low (Routine maintenance)</option>
                <option value="medium">Medium (Scheduled works)</option>
                <option value="high">High (Corridor bottleneck)</option>
                <option value="urgent">Urgent (Emergency main repair)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Deployment Start Date *</label>
              <input
                type="date"
                required
                value={newForm.startDate}
                onChange={(e) => setNewForm({ ...newForm, startDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Estimated Return Date *</label>
              <input
                type="date"
                required
                value={newForm.endDate}
                onChange={(e) => setNewForm({ ...newForm, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Purpose of Requisition *</label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Pipeline replacement at Sector 14 crossing prior to asphalt resurfacing..."
              value={newForm.purpose}
              onChange={(e) => setNewForm({ ...newForm, purpose: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Additional Notes / Site Access Requirements</label>
            <textarea
              rows={2}
              placeholder="Operator details, trailer transportation requirements..."
              value={newForm.notes}
              onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setNewOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Requisition"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject Resource Requisition"
        size="sm"
      >
        <div className="modal-body">
          <p className="confirm-text">
            Provide an official justification for rejecting request for{" "}
            <strong>{selectedReqForReject?.resource?.name}</strong>:
          </p>
          <div className="form-group">
            <label>Rejection Reason *</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Conflicting high-priority municipal work scheduled on the requested corridor..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setRejectOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleRejectConfirm}
              disabled={rejecting || !rejectionReason.trim()}
            >
              {rejecting ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Requisition Inspection Details"
      >
        {selectedReqDetail && (
          <div className="modal-body detail-view">
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Asset:</span>
                <span className="detail-val">{selectedReqDetail.resource?.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <StatusPill status={selectedReqDetail.status} />
              </div>
              <div className="detail-item">
                <span className="detail-label">Quantity:</span>
                <span className="detail-val">
                  {selectedReqDetail.quantityRequested} unit(s)
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Priority:</span>
                <StatusPill status={selectedReqDetail.priority} type="priority" />
              </div>
              <div className="detail-item">
                <span className="detail-label">Requester:</span>
                <span className="detail-val">
                  {selectedReqDetail.requestedBy?.name} ({selectedReqDetail.requestedBy?.email})
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Department:</span>
                <span className="detail-val">
                  {selectedReqDetail.requestingDepartment?.name}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Start Date:</span>
                <span className="detail-val">
                  {new Date(selectedReqDetail.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">End Date:</span>
                <span className="detail-val">
                  {new Date(selectedReqDetail.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="detail-section">
              <span className="detail-label">Purpose:</span>
              <p className="detail-paragraph">{selectedReqDetail.purpose}</p>
            </div>

            {selectedReqDetail.notes && (
              <div className="detail-section">
                <span className="detail-label">Notes:</span>
                <p className="detail-paragraph">{selectedReqDetail.notes}</p>
              </div>
            )}

            {selectedReqDetail.reviewedBy && (
              <div className="detail-section review-box">
                <span className="detail-label">Review Information:</span>
                <p className="detail-paragraph">
                  Reviewed by <strong>{selectedReqDetail.reviewedBy.name}</strong> on{" "}
                  {selectedReqDetail.reviewedAt
                    ? new Date(selectedReqDetail.reviewedAt).toLocaleString()
                    : "—"}
                </p>
                {selectedReqDetail.rejectionReason && (
                  <p className="text-danger m-0 mt-1">
                    <strong>Rejection reason:</strong> {selectedReqDetail.rejectionReason}
                  </p>
                )}
              </div>
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
