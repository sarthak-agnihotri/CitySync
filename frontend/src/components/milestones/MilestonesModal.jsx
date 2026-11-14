
import React, { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  Flag,
  RefreshCw,
  ClipboardList
} from "lucide-react";

import { MilestonesAPI } from "../../api";
import { Modal } from "../common/Modal";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import MilestoneTasks from "./MilestoneTasks";

const initialForm = {
  title: "",
  description: "",
  startDate: "",
  dueDate: "",
  priority: "medium"
};

const priorityStyles = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  critical: "bg-red-100 text-red-700"
};

const statusStyles = {
  pending: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  blocked: "bg-red-100 text-red-700"
};

const formatStatus = (status = "") =>
  status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (date) => {
  if (!date) return "Not set";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

export default function MilestonesModal({ project, onClose }) {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [form, setForm] = useState(initialForm);

  const canManage =
    user?.role === "city_admin" ||
    (user?.role === "department_head" &&
      (!user?.department ||
        String(user.department?._id || user.department) ===
        String(project.department?._id || project.department)));

  const projectLocked = ["completed", "cancelled"].includes(project.status);

  const fetchMilestones = useCallback(async () => {
    try {
      setLoading(true);

      const response = await MilestonesAPI.getByProject(project._id);
      const data = response?.data ?? response;

      setMilestones(Array.isArray(data) ? data : data?.milestones || []);
    } catch (error) {
      showToast(error.message || "Failed to load milestones", "error");
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  }, [project._id, showToast]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingMilestone(null);
    setFormOpen(false);
  };

  const handleEdit = (milestone) => {
    setEditingMilestone(milestone);

    setForm({
      title: milestone.title || "",
      description: milestone.description || "",
      startDate: milestone.startDate
        ? new Date(milestone.startDate).toISOString().slice(0, 10)
        : "",
      dueDate: milestone.dueDate
        ? new Date(milestone.dueDate).toISOString().slice(0, 10)
        : "",
      priority: milestone.priority || "medium"
    });

    setFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      showToast("Milestone title is required", "warning");
      return;
    }

    if (!form.startDate || !form.dueDate) {
      showToast("Please select both dates", "warning");
      return;
    }

    if (form.startDate >= form.dueDate) {
      showToast("Due date must be after start date", "warning");
      return;
    }

    if (project.startDate) {
      const projectStart = new Date(project.startDate)
        .toISOString()
        .slice(0, 10);

      if (form.startDate < projectStart) {
        showToast("Milestone cannot start before the project", "warning");
        return;
      }
    }

    if (project.endDate) {
      const projectEnd = new Date(project.endDate)
        .toISOString()
        .slice(0, 10);

      if (form.dueDate > projectEnd) {
        showToast("Milestone due date cannot exceed project end date", "warning");
        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        startDate: form.startDate,
        dueDate: form.dueDate,
        priority: form.priority
      };

      if (editingMilestone) {
        await MilestonesAPI.update(editingMilestone._id, payload);
        showToast("Milestone updated successfully", "success");
      } else {
        await MilestonesAPI.create(project._id, payload);
        showToast("Milestone created successfully", "success");
      }

      resetForm();
      await fetchMilestones();
    } catch (error) {
      showToast(error.message || "Failed to save milestone", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (milestone) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${milestone.title}"?`
    );

    if (!confirmed) return;

    try {
      await MilestonesAPI.delete(milestone._id);
      showToast("Milestone deleted successfully", "success");
      await fetchMilestones();
    } catch (error) {
      showToast(error.message || "Failed to delete milestone", "error");
    }
  };

  const projectStart = project.startDate
    ? new Date(project.startDate).toISOString().slice(0, 10)
    : undefined;

  const projectEnd = project.endDate
    ? new Date(project.endDate).toISOString().slice(0, 10)
    : undefined;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Milestones — ${project.title}`}
      size="lg"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">
              Track important execution stages of this city project.
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {milestones.length} milestone{milestones.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={fetchMilestones}
              disabled={loading}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>

            {canManage && !projectLocked && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setFormOpen(true);
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Milestone
              </button>
            )}
          </div>
        </div>

        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-4 space-y-4"
          >
            <h4 className="text-sm font-bold">
              {editingMilestone ? "Edit Milestone" : "Create Milestone"}
            </h4>

            <div>
              <label className="form-label">Milestone Title *</label>
              <input
                className="form-input"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                placeholder="e.g. Foundation Work Completed"
                required
                maxLength={150}
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe the expected milestone outcome..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Start Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.startDate}
                  min={projectStart}
                  max={projectEnd}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="form-label">Due Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.dueDate}
                  min={form.startDate || projectStart}
                  max={projectEnd}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingMilestone
                    ? "Update Milestone"
                    : "Create Milestone"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="py-10 text-center text-sm text-[var(--text-muted)]">
            Loading milestones...
          </div>
        ) : milestones.length === 0 ? (
          <div className="py-10 text-center rounded-xl border border-dashed border-[var(--border-subtle)]">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)]" />
            <p className="text-sm font-semibold">No milestones yet</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Add milestones to track this project's execution stages.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <div
                key={milestone._id}
                className="rounded-xl border border-[var(--border-subtle)] p-4 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold break-words">
                      {milestone.title}
                    </h4>

                    {milestone.description && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        {milestone.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-semibold ${priorityStyles[milestone.priority] || priorityStyles.medium
                        }`}
                    >
                      <Flag className="inline w-3 h-3 mr-1" />
                      {formatStatus(milestone.priority)}
                    </span>

                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-semibold ${statusStyles[milestone.status] || statusStyles.pending
                        }`}
                    >
                      {formatStatus(milestone.status)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Start: {formatDate(milestone.startDate)}
                  </span>

                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Due: {formatDate(milestone.dueDate)}
                  </span>
                </div>

                <div className="text-[11px] text-[var(--text-muted)]">
                  Department: {milestone.department?.name || "Project department"}
                  {milestone.createdBy?.name &&
                    ` • Created by ${milestone.createdBy.name}`}
                </div>
                <MilestoneTasks
                  milestone={milestone}
                  canManage={canManage}
                  projectLocked={projectLocked}
                />

                {canManage && !projectLocked && (
                  <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                    <button
                      type="button"
                      onClick={() => handleEdit(milestone)}
                      className="btn btn-secondary flex items-center gap-1"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(milestone)}
                      className="btn btn-danger flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
