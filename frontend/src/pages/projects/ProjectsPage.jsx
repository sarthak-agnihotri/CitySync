
import React, { useCallback, useEffect, useState } from "react";
import { ProjectsAPI, DepartmentsAPI } from "../../api";
import { useToast } from "../../context/ToastContext";

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
  ["roadwork", "Roadwork"],
  ["water_sewage", "Water and Sewage"],
  ["electricity", "Electricity"],
  ["telecom", "Telecom"],
  ["metro_transit", "Metro Transit"],
  ["other", "Other"],
];

const statusLabels = {
  proposed: "Proposed",
  approved: "Approved",
  in_progress: "In Progress",
  delayed: "Delayed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const { showToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [projectData, departmentData] = await Promise.all([
        ProjectsAPI.getAll(),
        DepartmentsAPI.list(),
      ]);

      setProjects(projectData.projects || []);
      setDepartments(departmentData.departments || []);
    } catch (err) {
      showToast(err.message || "Could not load projects", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (new Date(form.startDate) >= new Date(form.endDate)) {
      showToast("End date must be after start date", "error");
      return;
    }

    setSaving(true);

    try {
      const result = await ProjectsAPI.create({
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
      });

      const conflictCount = result.conflictsDetected || 0;

      showToast(
        conflictCount > 0
          ? `Project created. ${conflictCount} potential conflict(s) detected.`
          : "Project created successfully. No conflicts detected.",
        conflictCount > 0 ? "warning" : "success"
      );

      setForm(initialForm);
      setFormOpen(false);
      await fetchData();
    } catch (err) {
      showToast(err.message || "Could not create project", "error");
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "14px",
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    font: "inherit",
  };

  const buttonStyle = {
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    font: "inherit",
  };

  const renderInput = (label, name, type = "text", required = true) => (
    <label style={fieldStyle} key={name}>
      <span>{label}</span>
      <input
        style={inputStyle}
        name={name}
        type={type}
        value={form[name]}
        onChange={updateField}
        required={required}
        min={type === "number" ? (name === "latitude" ? -90 : name === "longitude" ? -180 : 0) : undefined}
        max={name === "latitude" ? 90 : name === "longitude" ? 180 : undefined}
        step={type === "number" ? "any" : undefined}
      />
    </label>
  );

  return (
    <main style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "6px" }}>City Projects</h1>
          <p>Plan projects across departments and identify possible conflicts.</p>
        </div>

        <button
          style={{ ...buttonStyle, background: "#2563eb", color: "white" }}
          onClick={() => setFormOpen((open) => !open)}
        >
          {formOpen ? "Close Form" : "+ Create Project"}
        </button>
      </header>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "20px",
            marginBottom: "24px",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
          }}
        >
          <h2>Create a Project</h2>

          {renderInput("Project title", "title")}
          {renderInput("Description", "description", "text", false)}

          <label style={fieldStyle}>
            <span>Department</span>
            <select
              style={inputStyle}
              name="department"
              value={form.department}
              onChange={updateField}
              required
            >
              <option value="">Select department</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name} ({department.code})
                </option>
              ))}
            </select>
            {departments.length === 0 && (
              <small>Create or activate a department before adding a project.</small>
            )}
          </label>

          <label style={fieldStyle}>
            <span>Category</span>
            <select
              style={inputStyle}
              name="category"
              value={form.category}
              onChange={updateField}
              required
            >
              {categories.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          {renderInput("Zone / area", "zone")}
          {renderInput("Full address", "address")}
          {renderInput("Latitude", "latitude", "number")}
          {renderInput("Longitude", "longitude", "number")}
          {renderInput("Start date", "startDate", "date")}
          {renderInput("End date", "endDate", "date")}
          {renderInput("Estimated budget (₹)", "estimatedBudget", "number", false)}

          <label style={fieldStyle}>
            <span>Priority</span>
            <select
              style={inputStyle}
              name="priority"
              value={form.priority}
              onChange={updateField}
            >
              {["low", "medium", "high", "critical"].map((priority) => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={saving || departments.length === 0}
            style={{
              ...buttonStyle,
              background: "#15803d",
              color: "white",
              opacity: saving || departments.length === 0 ? 0.6 : 1,
            }}
          >
            {saving ? "Creating..." : "Create Project"}
          </button>
        </form>
      )}

      <section>
        <h2>All Projects ({projects.length})</h2>

        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p>No projects found. Create your first project to get started.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #cbd5e1" }}>
                  {["Project", "Department", "Category", "Dates", "Status", "Priority"].map((heading) => (
                    <th key={heading} style={{ padding: "12px 8px" }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "12px 8px" }}>
                      <strong>{project.title}</strong>
                      <div>{project.zone}</div>
                      <small>{project.address}</small>
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      {project.department?.name || "Unknown"}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      {project.category?.replaceAll("_", " ")}
                    </td>
                    <td style={{ padding: "12px 8px", whiteSpace: "nowrap" }}>
                      {new Date(project.startDate).toLocaleDateString()} –{" "}
                      {new Date(project.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      {statusLabels[project.status] || project.status}
                    </td>
                    <td style={{ padding: "12px 8px" }}>{project.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
