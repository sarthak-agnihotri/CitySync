import React, { useCallback, useEffect, useState } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  Building2,
  Calendar,
  MapPin,
  AlertTriangle,
  Layers,
  IndianRupee,
  ShieldAlert,
  Pencil,
  Ban
} from "lucide-react";
import { ProjectsAPI, DepartmentsAPI } from "../../api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { Modal } from "../../components/common/Modal";
import { StatusPill } from "../../components/common/StatusPill";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";

const initialForm = {
  title: "",
  description: "",
  department: "",
  category: "roadwork",
  zone: "",
  address: "",
  latitude: "",
  longitude: "",
  startDate: "",
  endDate: "",
  estimatedBudget: "",
  priority: "medium",
};

const categories = [
  ["roadwork", "Roadwork & Paving"],
  ["water_sewage", "Water & Sewage Mains"],
  ["electricity", "Power & Electrical Grid"],
  ["telecom", "Telecom & Fiber Conduit"],
  ["metro_transit", "Metro Transit & Rail"],
  ["other", "General Civil Works"],
];

export function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [form, setForm] = useState(initialForm);
  const { showToast } = useToast();
  const { user, isRole } = useAuth();

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent && !hasLoadedOnce) {
      setLoading(true);
    }
    try {
      const [projectData, departmentData] = await Promise.all([
        ProjectsAPI.getAll(),
        DepartmentsAPI.list(),
      ]);

      setProjects(projectData.projects || []);
      setDepartments(departmentData.departments || []);
      setHasLoadedOnce(true);
    } catch (err) {
      showToast(err.message || "Could not load projects", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, hasLoadedOnce]);

  useEffect(() => {
    fetchData(hasLoadedOnce);
    const handleRefresh = () => fetchData(false);
    window.addEventListener("citysync:refresh-data", handleRefresh);
    return () => window.removeEventListener("citysync:refresh-data", handleRefresh);
  }, [fetchData, hasLoadedOnce]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleNewProject = () => {
    setEditingProject(null);
    setForm(initialForm);
    setFormOpen(true);
  };
  const handleEditClick = (project) => {
    setEditingProject(project);

    setForm({
      title: project.title || "",
      description: project.description || "",
      department: project.department?._id || project.department || "",
      category: project.category || "other",
      zone: project.zone || "",
      address: project.address || "",
      latitude: project.coordinates?.latitude ?? "",
      longitude: project.coordinates?.longitude ?? "",
      startDate: project.startDate
        ? new Date(project.startDate).toISOString().split("T")[0]
        : "",
      endDate: project.endDate
        ? new Date(project.endDate).toISOString().split("T")[0]
        : "",
      estimatedBudget: project.estimatedBudget ?? "",
      priority: project.priority || "medium",
    });

    setFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (new Date(form.startDate) >= new Date(form.endDate)) {
      showToast("End date must be strictly after the start date", "error");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        department: form.department,
        category: form.category,
        zone: form.zone.trim(),
        address: form.address.trim(),
        coordinates: {
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        },
        startDate: form.startDate,
        endDate: form.endDate,
        estimatedBudget: Number(form.estimatedBudget || 0),
        priority: form.priority,
      };

      const wasEditing = Boolean(editingProject);

      const result = wasEditing
        ? await ProjectsAPI.update(editingProject._id, payload)
        : await ProjectsAPI.create(payload);

      const conflictCount = result.conflictsDetected || 0;

      showToast(
        conflictCount > 0
          ? `${wasEditing ? "Project updated!" : "Project registered!"} ${conflictCount} potential spatial/timeline conflict(s) detected.`
          : wasEditing
            ? "Project updated successfully."
            : "Project registered successfully. Zero conflicts detected.",
        conflictCount > 0 ? "warning" : "success"
      );

      setForm(initialForm);
      setEditingProject(null);
      setFormOpen(false);
      await fetchData();
    } catch (err) {
      showToast(
        err.message || (editingProject ? "Could not update project" : "Could not create project"),
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelProject = async (project) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel "${project.title}"?`
    );

    if (!confirmed) return;

    try {
      await ProjectsAPI.delete(project._id);
      showToast("Project cancelled successfully.", "success");
      await fetchData();
    } catch (err) {
      showToast(err.message || "Could not cancel project", "error");
    }
  };

  const filteredProjects = projects.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      (p.zone && p.zone.toLowerCase().includes(q)) ||
      (p.address && p.address.toLowerCase().includes(q)) ||
      (p.department?.name && p.department.name.toLowerCase().includes(q));

    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page projects-page">
      <div className="page-header-row">
        <div>
          <h3 className="section-title">Municipal Infrastructure Projects</h3>
          <p className="section-hint">
            Statutory registry of cross-department civil works with automated conflict detection
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleNewProject}>
          <Plus size={16} />
          <span>New Infrastructure Project</span>
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
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            className="search-input"
            style={{ paddingLeft: 36, width: "100%" }}
            placeholder="Search projects by title, zone, corridor, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="select-input"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Civil Categories</option>
          {categories.map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>

        <span className="results-count">
          Showing <strong>{filteredProjects.length}</strong> of {projects.length} projects
        </span>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving civil project registry..." />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No civil projects found"
          message={
            search || categoryFilter
              ? "No infrastructure projects match your active search filters."
              : "No municipal projects have been registered in the system yet."
          }
          actionButton={
            !search &&
            !categoryFilter && (
              <button className="btn btn-primary" onClick={handleNewProject}>
                <Plus size={15} />
                <span>Register First Project</span>
              </button>
            )
          }
        />
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project & Corridor</th>
                <th>Executing Line Department</th>
                <th>Category</th>
                <th>Scheduled Timeline</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project._id}>
                  <td>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-[var(--text-primary)]">
                        {project.title}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                        <MapPin size={13} className="text-emerald-700 dark:text-emerald-400 shrink-0" />
                        <span>
                          {project.zone ? `${project.zone} — ` : ""}
                          {project.address || "Location on corridor"}
                        </span>
                      </div>
                      {project.estimatedBudget ? (
                        <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                          <IndianRupee size={11} />
                          <span>Budget: ₹{Number(project.estimatedBudget).toLocaleString()}</span>
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
                      <Building2 size={14} className="text-[var(--text-muted)]" />
                      <span>{project.department?.name || "Unassigned Agency"}</span>
                    </div>
                  </td>
                  <td>
                    <span className="target-tag capitalize">
                      {project.category?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] whitespace-nowrap">
                      <Calendar size={13} />
                      <span>
                        {new Date(project.startDate).toLocaleDateString()} –{" "}
                        {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <StatusPill status={project.priority || "medium"} type="priority" />
                  </td>
                  <td>
                    <StatusPill status={project.status || "proposed"} />
                  </td>
                  <td>
                    {(
                      isRole("city_admin") ||
                      (isRole("department_head") && !user?.department) ||
                      (
                        isRole("officer", "department_head") &&
                        String(user?.department?._id || user?.department) ===
                        String(project.department?._id || project.department)
                      )
                    ) && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => handleEditClick(project)}
                            title="Edit Project"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => handleCancelProject(project)}
                            title="Cancel Project"
                          >
                            <Ban size={15} />
                            Cancel
                          </button>
                        </div>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingProject(null);
          setForm(initialForm);
        }}
        title={editingProject ? "Edit Infrastructure Project" : "Register New Infrastructure Project"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Project Title *</label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Ring Road Main Water Conduit Trenching & Relaying"
              value={form.title}
              onChange={updateField}
            />
          </div>

          <div className="form-group">
            <label>Scope of Works / Description</label>
            <textarea
              name="description"
              rows={2}
              placeholder="Underground utility installation, trenching dimensions, traffic diversion schedule..."
              value={form.description}
              onChange={updateField}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Executing Department *</label>
              <select
                name="department"
                required
                value={form.department}
                onChange={updateField}
                disabled={
                  Boolean(editingProject) &&
                  (
                    isRole("officer") ||
                    (isRole("department_head") && Boolean(user?.department))
                  )
                }
              >
                <option value="">Choose municipal department...</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Civil Category *</label>
              <select
                name="category"
                required
                value={form.category}
                onChange={updateField}
              >
                {categories.map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Zone / Ward Area *</label>
              <input
                type="text"
                name="zone"
                required
                placeholder="e.g. Zone 4 (North Corridor)"
                value={form.zone}
                onChange={updateField}
              />
            </div>

            <div className="form-group">
              <label>Full Site / Corridor Address *</label>
              <input
                type="text"
                name="address"
                required
                placeholder="e.g. Outer Ring Road, KM 14 to 18"
                value={form.address}
                onChange={updateField}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Corridor Latitude (-90 to 90) *</label>
              <input
                type="number"
                name="latitude"
                step="any"
                min="-90"
                max="90"
                required
                placeholder="e.g. 12.9716"
                value={form.latitude}
                onChange={updateField}
              />
            </div>

            <div className="form-group">
              <label>Corridor Longitude (-180 to 180) *</label>
              <input
                type="number"
                name="longitude"
                step="any"
                min="-180"
                max="180"
                required
                placeholder="e.g. 77.5946"
                value={form.longitude}
                onChange={updateField}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Commencement Date *</label>
              <input
                type="date"
                name="startDate"
                required
                value={form.startDate}
                onChange={updateField}
              />
            </div>

            <div className="form-group">
              <label>Completion Date *</label>
              <input
                type="date"
                name="endDate"
                required
                value={form.endDate}
                onChange={updateField}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Estimated Civil Budget (₹)</label>
              <input
                type="number"
                name="estimatedBudget"
                min="0"
                placeholder="e.g. 2500000"
                value={form.estimatedBudget}
                onChange={updateField}
              />
            </div>

            <div className="form-group">
              <label>Priority Level *</label>
              <select
                name="priority"
                required
                value={form.priority}
                onChange={updateField}
              >
                <option value="low">Low (Routine maintenance)</option>
                <option value="medium">Medium (Standard capital works)</option>
                <option value="high">High (High-density arterial)</option>
                <option value="critical">Critical (Emergency main restoration)</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setFormOpen(false);
                setEditingProject(null);
                setForm(initialForm);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || departments.length === 0}
            >
              {saving
                ? editingProject
                  ? "Updating Project..."
                  : "Registering & Checking Clashes..."
                : editingProject
                  ? "Update Project"
                  : "Register Infrastructure Project"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
