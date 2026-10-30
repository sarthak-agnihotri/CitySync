import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  Wrench,
  MapPin,
  Building2,
  Tag,
  Edit2,
  Trash2,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
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

      showToast("Resource registered to pool successfully", "success");
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
    <div className="space-y-6">
      {/* Page Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Inter-Departmental Shared Equipment Pool
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Searchable registry of heavy machinery, specialized vehicles, and excavation assets
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setAddOpen(true)}
            className="btn btn-primary text-xs py-2 px-3.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Equipment</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
          <input
            type="text"
            className="form-input pl-9 text-xs"
            placeholder="Search by machinery name, department, or depot location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select text-xs w-auto"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="equipment">Heavy Equipment</option>
          <option value="vehicle">Specialized Vehicles</option>
          <option value="facility">Yard / Facility</option>
          <option value="personnel">Specialist Personnel</option>
          <option value="other">Other Assets</option>
        </select>

        <select
          className="form-select text-xs w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Availability Statuses</option>
          <option value="available">Available</option>
          <option value="partially_available">Partially Available</option>
          <option value="unavailable">Unavailable (Deployed)</option>
          <option value="maintenance">Under Maintenance</option>
        </select>

        <span className="text-xs text-[var(--text-muted)] ml-auto">
          Showing <strong>{filteredResources.length}</strong> of {resources.length} items
        </span>
      </div>

      {/* Content Grid */}
      {loading ? (
        <LoadingSpinner text="Retrieving equipment pool records..." />
      ) : filteredResources.length === 0 ? (
        <EmptyState
          icon={<Wrench className="w-6 h-6" />}
          title="No resources found"
          message={
            search || categoryFilter || statusFilter
              ? "No equipment matches the active filters."
              : "No shared machinery assets have been registered yet."
          }
          actionButton={
            canManage &&
            !search && (
              <button
                className="btn btn-primary text-xs py-1.5 px-3"
                onClick={() => setAddOpen(true)}
              >
                Add First Resource
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const avail = res.availableQuantity ?? res.quantity;
            const total = res.quantity || 1;
            const pct = Math.round((avail / total) * 100);

            const deptName =
              res.ownerDepartment && typeof res.ownerDepartment === "object"
                ? res.ownerDepartment.name
                : "Municipal Depot";

            return (
              <div key={res._id} className="surface-card p-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">{res.name}</h4>
                      <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                        {deptName}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                      {res.category}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {res.description || "Heavy-duty civic machinery asset."}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)] flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {res.location || "Central Yard"}
                    </span>
                    <StatusPill status={res.status} />
                  </div>

                  {/* Stock Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[var(--text-muted)]">Stock Availability</span>
                      <strong className="text-[var(--text-primary)]">
                        {avail} / {total} {res.unit || "units"} ({pct}%)
                      </strong>
                    </div>
                    <div className="w-full bg-[var(--border-subtle)] rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct > 50
                            ? "bg-emerald-600 dark:bg-emerald-500"
                            : pct > 20
                            ? "bg-amber-600 dark:bg-amber-500"
                            : "bg-rose-600 dark:bg-rose-500"
                        }`}
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  {res.tags && res.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {res.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-muted)]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 mt-3 border-t border-[var(--border-subtle)] flex items-center gap-2">
                  <button
                    className="btn btn-primary text-xs py-1.5 flex-1 justify-center"
                    disabled={avail <= 0}
                    onClick={() => navigate(`/requests?resourceId=${res._id}`)}
                  >
                    {avail > 0 ? "Request Resource" : "Deployed"}
                  </button>

                  {canManage && (
                    <button
                      className="btn btn-secondary text-xs py-1.5 px-2.5"
                      onClick={() => openEditModal(res)}
                      title="Edit Resource"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isRole("city_admin") && (
                    <button
                      className="btn btn-secondary text-xs py-1.5 px-2.5 text-rose-600 hover:text-rose-700"
                      onClick={() => {
                        setDeactivatingResource(res);
                        setDeactivateOpen(true);
                      }}
                      title="Deactivate Resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
        title="Register Shared Machinery to Pool"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Equipment Name *
              </label>
              <input
                type="text"
                required
                className="form-input text-xs"
                placeholder="e.g. Caterpillar Hydraulic Excavator 320D"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Category *
              </label>
              <select
                required
                className="form-select text-xs"
                value={addForm.category}
                onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
              >
                <option value="equipment">Heavy Equipment</option>
                <option value="vehicle">Specialized Vehicle</option>
                <option value="facility">Yard / Facility</option>
                <option value="personnel">Specialist Personnel</option>
                <option value="other">Other Asset</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Pool Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                className="form-input text-xs"
                value={addForm.quantity}
                onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Unit Label
              </label>
              <input
                type="text"
                className="form-input text-xs"
                placeholder="e.g. machines, trucks"
                value={addForm.unit}
                onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Owner Department *
              </label>
              <select
                required
                className="form-select text-xs"
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
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Depot Location
              </label>
              <input
                type="text"
                className="form-input text-xs"
                placeholder="e.g. Sector 9 Mechanical Yard"
                value={addForm.location}
                onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
              Tags (Comma-separated)
            </label>
            <input
              type="text"
              className="form-input text-xs"
              placeholder="e.g. trenching, asphalt, heavy, storm-drain"
              value={addForm.tags}
              onChange={(e) => setAddForm({ ...addForm, tags: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
              Description & Specifications
            </label>
            <textarea
              rows={2}
              className="form-textarea text-xs"
              placeholder="Operational capacity, operating requirements, hydraulic specs..."
              value={addForm.description}
              onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end gap-2.5">
            <button
              type="button"
              className="btn btn-secondary text-xs"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary text-xs" disabled={adding}>
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
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Resource Name *
              </label>
              <input
                type="text"
                required
                className="form-input text-xs"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Category *
              </label>
              <select
                required
                className="form-select text-xs"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              >
                <option value="equipment">Heavy Equipment</option>
                <option value="vehicle">Specialized Vehicle</option>
                <option value="facility">Yard / Facility</option>
                <option value="personnel">Specialist Personnel</option>
                <option value="other">Other Asset</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Total Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                className="form-input text-xs"
                value={editForm.quantity}
                onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Unit
              </label>
              <input
                type="text"
                className="form-input text-xs"
                value={editForm.unit}
                onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Owner Department *
              </label>
              <select
                required
                className="form-select text-xs"
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
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
                Location
              </label>
              <input
                type="text"
                className="form-input text-xs"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
              Tags
            </label>
            <input
              type="text"
              className="form-input text-xs"
              value={editForm.tags}
              onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">
              Description
            </label>
            <textarea
              rows={2}
              className="form-textarea text-xs"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end gap-2.5">
            <button
              type="button"
              className="btn btn-secondary text-xs"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary text-xs" disabled={updating}>
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Modal */}
      <Modal
        isOpen={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        title="Confirm Resource Deactivation"
        size="sm"
      >
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Are you sure you want to deactivate{" "}
            <strong className="text-[var(--text-primary)]">{deactivatingResource?.name}</strong>?
            The resource will be removed from public booking while preserving all historical requisitions.
          </p>
          <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary text-xs"
              onClick={() => setDeactivateOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger text-xs"
              onClick={handleDeactivateConfirm}
              disabled={deactivating}
            >
              {deactivating ? "Deactivating..." : "Deactivate"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
