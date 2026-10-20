import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ResourcesAPI, DepartmentsAPI } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Modal } from "../../components/common/Modal";
import { StatusPill } from "../../components/common/StatusPill";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";

export function ResourcesPage() {
  const { isRole, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Add Resource Modal
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    category: "equipment",
    description: "",
    quantity: 1,
    unit: "units",
    ownerDepartment: "",
    location: "",
    tags: ""
  });
  const [adding, setAdding] = useState(false);

  // Edit Resource Modal
  const [editOpen, setEditOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "equipment",
    description: "",
    quantity: 1,
    unit: "units",
    ownerDepartment: "",
    location: "",
    tags: ""
  });
  const [updating, setUpdating] = useState(false);

  // Deactivate Modal
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivatingResource, setDeactivatingResource] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resData, deptData] = await Promise.all([
        ResourcesAPI.list(),
        DepartmentsAPI.list()
      ]);
      setResources(resData.resources || []);
      const activeDepts = deptData.departments || [];
      setDepartments(activeDepts);

      // Preselect user's department for add modal if available
      if (user?.department && typeof user.department === "object" && user.department._id) {
        setAddForm((prev) => ({ ...prev, ownerDepartment: user.department._id }));
      } else if (activeDepts.length > 0) {
        setAddForm((prev) => ({ ...prev, ownerDepartment: activeDepts[0]._id }));
      }
    } catch (err) {
      showToast(err.message || "Failed to load resources", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, user]);

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener("citysync:refresh-data", handleRefresh);
    return () => window.removeEventListener("citysync:refresh-data", handleRefresh);
  }, [loadData]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const tagsArray = addForm.tags
        ? addForm.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      await ResourcesAPI.create({
        name: addForm.name.trim(),
        category: addForm.category,
        description: addForm.description.trim(),
        quantity: Number(addForm.quantity),
        unit: addForm.unit.trim() || "units",
        ownerDepartment: addForm.ownerDepartment,
        location: addForm.location.trim(),
        tags: tagsArray
      });

      showToast("Resource registered to pool", "success");
      setAddOpen(false);
      setAddForm({
        name: "",
        category: "equipment",
        description: "",
        quantity: 1,
        unit: "units",
        ownerDepartment: departments[0]?._id || "",
        location: "",
        tags: ""
      });
      loadData();
    } catch (err) {
      showToast(err.message || "Failed to add resource", "error");
    } finally {
      setAdding(false);
    }
  };

  const openEditModal = (res) => {
    setSelectedResource(res);
    const deptId =
      res.ownerDepartment && typeof res.ownerDepartment === "object"
        ? res.ownerDepartment._id
        : res.ownerDepartment || "";

    setEditForm({
      name: res.name || "",
      category: res.category || "equipment",
      description: res.description || "",
      quantity: res.quantity || 1,
      unit: res.unit || "units",
      ownerDepartment: deptId,
      location: res.location || "",
      tags: Array.isArray(res.tags) ? res.tags.join(", ") : ""
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResource) return;
    setUpdating(true);
    try {
      const tagsArray = editForm.tags
        ? editForm.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      await ResourcesAPI.update(selectedResource._id, {
        name: editForm.name.trim(),
        category: editForm.category,
        description: editForm.description.trim(),
        quantity: Number(editForm.quantity),
        unit: editForm.unit.trim() || "units",
        ownerDepartment: editForm.ownerDepartment,
        location: editForm.location.trim(),
        tags: tagsArray
      });

      showToast("Resource details updated", "success");
      setEditOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || "Failed to update resource", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivatingResource) return;
    setDeactivating(true);
    try {
      await ResourcesAPI.deactivate(deactivatingResource._id);
      showToast(`Resource "${deactivatingResource.name}" deactivated`, "success");
      setDeactivateOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || "Failed to deactivate resource", "error");
    } finally {
      setDeactivating(false);
    }
  };

  const canManage = isRole("city_admin", "department_head");

  const filteredResources = resources.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      r.name.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.location && r.location.toLowerCase().includes(q)) ||
      (r.ownerDepartment?.name && r.ownerDepartment.name.toLowerCase().includes(q));

    const matchesCategory = categoryFilter ? r.category === categoryFilter : true;
    const matchesStatus = statusFilter ? r.status === statusFilter : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="page resources-page">
      <div className="page-header-row">
        <div>
          <h3 className="section-title">Inter-Departmental Shared Resource Pool</h3>
          <p className="section-hint">
            Searchable inventory of municipal heavy equipment, specialized vehicles, and machinery
          </p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
            + Add New Resource
          </button>
        )}
      </div>

      <div className="page-actions">
        <input
          type="text"
          className="search-input"
          placeholder="Search by equipment name, location, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="select-input"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="equipment">Heavy Equipment</option>
          <option value="vehicle">Specialized Vehicles</option>
          <option value="facility">Facility & Yards</option>
          <option value="personnel">Specialist Personnel</option>
          <option value="other">Other Assets</option>
        </select>

        <select
          className="select-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Availability Statuses</option>
          <option value="available">Available (100% Free)</option>
          <option value="partially_available">Partially Available</option>
          <option value="unavailable">Unavailable (Fully Deployed)</option>
          <option value="maintenance">Under Maintenance</option>
        </select>

        <span className="results-count">
          Showing <strong>{filteredResources.length}</strong> of {resources.length} resources
        </span>
      </div>

      {loading ? (
        <LoadingSpinner text="Querying equipment registry..." />
      ) : filteredResources.length === 0 ? (
        <EmptyState
          icon="🚜"
          title="No resources found"
          message={
            search || categoryFilter || statusFilter
              ? "No equipment matches the selected filters."
              : "No shared resources have been registered yet."
          }
          actionButton={
            canManage &&
            !search && (
              <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
                Add First Resource
              </button>
            )
          }
        />
      ) : (
        <div className="resources-grid">
          {filteredResources.map((res) => {
            const avail = res.availableQuantity ?? res.quantity;
            const total = res.quantity || 1;
            const pct = Math.round((avail / total) * 100);
            const progressType = pct > 50 ? "high" : pct > 20 ? "mid" : "low";

            const deptName =
              res.ownerDepartment && typeof res.ownerDepartment === "object"
                ? res.ownerDepartment.name
                : "Municipal Depot";

            return (
              <div key={res._id} className="resource-card">
                <div className="resource-card-top">
                  <div>
                    <h4 className="resource-name">{res.name}</h4>
                    <span className="resource-dept-label">{deptName}</span>
                  </div>
                  <span className="resource-cat">{res.category}</span>
                </div>

                <p className="resource-desc">
                  {res.description || "Heavy-duty municipal equipment for civil works."}
                </p>

                <div className="resource-meta-details">
                  <div className="meta-line">
                    <span className="meta-label">Location:</span>
                    <span className="meta-val">{res.location || "Central Yard"}</span>
                  </div>
                  <div className="meta-line">
                    <span className="meta-label">Status:</span>
                    <StatusPill status={res.status} />
                  </div>
                </div>

                {/* Availability Stock Bar */}
                <div className="resource-progress">
                  <div className="progress-label">
                    <span>Pool Availability</span>
                    <strong>
                      {avail} / {total} {res.unit || "units"} ({pct}%)
                    </strong>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${progressType}`}
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>

                {res.tags && res.tags.length > 0 && (
                  <div className="tags-row">
                    {res.tags.map((t, idx) => (
                      <span key={idx} className="tag-chip">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="resource-actions">
                  <button
                    className="btn btn-primary btn-sm btn-flex"
                    disabled={avail <= 0}
                    onClick={() => navigate(`/requests?resourceId=${res._id}`)}
                  >
                    {avail > 0 ? "Request Resource" : "Out of Stock"}
                  </button>

                  {canManage && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => openEditModal(res)}
                      title="Edit Resource"
                    >
                      Edit
                    </button>
                  )}

                  {isRole("city_admin") && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        setDeactivatingResource(res);
                        setDeactivateOpen(true);
                      }}
                      title="Deactivate Resource"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Resource Modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Shared Resource to Pool"
      >
        <form onSubmit={handleAddSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Resource / Equipment Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Caterpillar Hydraulic Excavator 320D"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                required
                value={addForm.category}
                onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
              >
                <option value="equipment">Equipment (Heavy Machinery)</option>
                <option value="vehicle">Specialized Vehicle</option>
                <option value="facility">Facility / Work Yard</option>
                <option value="personnel">Specialist Personnel</option>
                <option value="other">Other Asset</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Total Pool Quantity *</label>
              <input
                type="number"
                min="1"
                required
                value={addForm.quantity}
                onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Unit Label</label>
              <input
                type="text"
                placeholder="e.g. machines, trucks, units"
                value={addForm.unit}
                onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Owner Department *</label>
              <select
                required
                value={addForm.ownerDepartment}
                onChange={(e) => setAddForm({ ...addForm, ownerDepartment: e.target.value })}
              >
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Physical Storage Location</label>
              <input
                type="text"
                placeholder="e.g. Sector 9 Mechanical Yard"
                value={addForm.location}
                onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tags (Comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. trenching, asphalt, heavy, storm-drain"
              value={addForm.tags}
              onChange={(e) => setAddForm({ ...addForm, tags: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Technical Description & Capabilities</label>
            <textarea
              rows={2}
              placeholder="Operational capacity, operating requirements, hydraulic specs..."
              value={addForm.description}
              onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={adding}>
              {adding ? "Registering..." : "Add to Pool"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Resource Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Update Resource — ${selectedResource?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Resource Name *</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                required
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              >
                <option value="equipment">Equipment</option>
                <option value="vehicle">Vehicle</option>
                <option value="facility">Facility</option>
                <option value="personnel">Personnel</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Total Quantity *</label>
              <input
                type="number"
                min="1"
                required
                value={editForm.quantity}
                onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input
                type="text"
                value={editForm.unit}
                onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Owner Department *</label>
              <select
                required
                value={editForm.ownerDepartment}
                onChange={(e) => setEditForm({ ...editForm, ownerDepartment: e.target.value })}
              >
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <input
              type="text"
              value={editForm.tags}
              onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={2}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updating}>
              {updating ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Resource Modal */}
      <Modal
        isOpen={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        title="Confirm Resource Deactivation"
        size="sm"
      >
        <div className="modal-body">
          <p className="confirm-text">
            Are you sure you want to deactivate <strong>{deactivatingResource?.name}</strong>?
          </p>
          <p className="confirm-hint">
            The resource will be marked inactive and removed from public booking. Existing requests
            and historical records remain intact.
          </p>
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
              {deactivating ? "Deactivating..." : "Deactivate Resource"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
