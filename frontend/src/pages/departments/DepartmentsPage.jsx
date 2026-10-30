import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Plus,
  Search,
  Mail,
  MapPin,
  Edit3,
  PowerOff,
  AlertTriangle
} from "lucide-react";
import { DepartmentsAPI } from "../../api";
import { useToast } from "../../context/ToastContext";
import { Modal } from "../../components/common/Modal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";

export function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { showToast } = useToast();

  // Create Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    code: "",
    description: "",
    contactEmail: "",
    location: ""
  });
  const [creating, setCreating] = useState(false);

  // Edit Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [editForm, setEditForm] = useState({
    description: "",
    contactEmail: "",
    location: ""
  });
  const [updating, setUpdating] = useState(false);

  // Deactivate Modal State
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivatingDept, setDeactivatingDept] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await DepartmentsAPI.list();
      setDepartments(data.departments || []);
    } catch (err) {
      showToast(err.message || "Failed to load departments", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDepartments();
    const handleRefresh = () => fetchDepartments();
    window.addEventListener("citysync:refresh-data", handleRefresh);
    return () => window.removeEventListener("citysync:refresh-data", handleRefresh);
  }, [fetchDepartments]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await DepartmentsAPI.create({
        name: createForm.name.trim(),
        code: createForm.code.trim().toUpperCase(),
        description: createForm.description.trim(),
        contactEmail: createForm.contactEmail.trim(),
        location: createForm.location.trim()
      });
      showToast("Department registered successfully", "success");
      setCreateOpen(false);
      setCreateForm({ name: "", code: "", description: "", contactEmail: "", location: "" });
      fetchDepartments();
    } catch (err) {
      showToast(err.message || "Could not create department", "error");
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (dept) => {
    setSelectedDept(dept);
    setEditForm({
      description: dept.description || "",
      contactEmail: dept.contactEmail || "",
      location: dept.location || ""
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDept) return;
    setUpdating(true);
    try {
      await DepartmentsAPI.update(selectedDept._id, editForm);
      showToast("Department details updated", "success");
      setEditOpen(false);
      fetchDepartments();
    } catch (err) {
      showToast(err.message || "Update failed", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivatingDept) return;
    setDeactivating(true);
    try {
      await DepartmentsAPI.deactivate(deactivatingDept._id);
      showToast(`Department "${deactivatingDept.name}" deactivated`, "success");
      setDeactivateOpen(false);
      fetchDepartments();
    } catch (err) {
      showToast(err.message || "Deactivation failed", "error");
    } finally {
      setDeactivating(false);
    }
  };

  const filtered = departments.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      (d.location && d.location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page departments-page">
      <div className="page-header-row">
        <div>
          <h3 className="section-title">City Line Departments & Authorities</h3>
          <p className="section-hint">
            Authorized municipal agencies participating in infrastructure coordination
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} />
          <span>Add New Department</span>
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
            placeholder="Search by name, code or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="results-count">
          Showing <strong>{filtered.length}</strong> of {departments.length} departments
        </span>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving registered departments..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments found"
          message={
            search
              ? "No departments match your search criteria."
              : "No municipal departments have been registered yet."
          }
          actionButton={
            !search && (
              <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
                <Plus size={15} />
                <span>Add Department</span>
              </button>
            )
          }
        />
      ) : (
        <div className="departments-grid">
          {filtered.map((dept) => (
            <div key={dept._id} className="dept-card">
              <div className="dept-card-top">
                <div className="dept-code-badge">{dept.code}</div>
                <div className="dept-status-indicator">
                  <span className="status-dot-active" /> Active
                </div>
              </div>
              <h4 className="dept-name">{dept.name}</h4>
              <p className="dept-desc">
                {dept.description || "No description provided."}
              </p>
              <div className="dept-meta">
                <div className="dept-meta-item">
                  <span className="meta-label flex items-center gap-1">
                    <MapPin size={13} />
                    <span>Location:</span>
                  </span>
                  <span className="meta-val">{dept.location || "Central HQ"}</span>
                </div>
                {dept.contactEmail && (
                  <div className="dept-meta-item">
                    <span className="meta-label flex items-center gap-1">
                      <Mail size={13} />
                      <span>Contact:</span>
                    </span>
                    <span className="meta-val">{dept.contactEmail}</span>
                  </div>
                )}
              </div>
              <div className="dept-card-actions">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => openEditModal(dept)}
                >
                  <Edit3 size={13} />
                  <span>Edit Details</span>
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    setDeactivatingDept(dept);
                    setDeactivateOpen(true);
                  }}
                >
                  <PowerOff size={13} />
                  <span>Deactivate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Department Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Register New City Department"
      >
        <form onSubmit={handleCreateSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Department Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Water Supply & Sewerage Board"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Agency Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. BWSSB"
                value={createForm.code}
                onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Official Contact Email</label>
              <input
                type="email"
                placeholder="e.g. waterboard@citysync.gov"
                value={createForm.contactEmail}
                onChange={(e) => setCreateForm({ ...createForm, contactEmail: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Zonal / Office Location</label>
              <input
                type="text"
                placeholder="e.g. Sector 4 Municipal Complex"
                value={createForm.location}
                onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Mandate & Description</label>
            <textarea
              rows={3}
              placeholder="Underground potable pipelines, storm sewer mains, drainage networks..."
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? "Registering..." : "Create Department"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Department Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Update Department — ${selectedDept?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Official Contact Email</label>
              <input
                type="email"
                value={editForm.contactEmail}
                onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Office Location</label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={3}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updating}>
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Department Confirmation Modal */}
      <Modal
        isOpen={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        title="Confirm Department Deactivation"
        size="sm"
      >
        <div className="modal-body">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-danger flex-shrink-0" />
            <div>
              <p className="confirm-text">
                Are you sure you want to deactivate <strong>{deactivatingDept?.name}</strong>?
              </p>
              <p className="confirm-hint">
                The department will be soft-deactivated and hidden from active assignment, but historical
                records and audit logs will remain intact.
              </p>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setDeactivateOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeactivateConfirm}
              disabled={deactivating}
            >
              {deactivating ? "Deactivating..." : "Deactivate Department"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
