
import React, { useCallback, useEffect, useState } from "react";
import {
  Plus,
  RefreshCw,
  Trash2,
  ClipboardCheck
} from "lucide-react";

import { TasksAPI, UsersAPI } from "../../api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

const initialForm = {
  title: "",
  description: "",
  assignedTo: "",
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
  status.replaceAll("_", " ").replace(/\b\w/g, (char) =>
    char.toUpperCase()
  );

const formatDate = (date) => {
  if (!date) return "Not set";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

export default function MilestoneTasks({
  milestone,
  canManage,
  projectLocked
}) {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const departmentId =
    milestone.department?._id || milestone.department;

  const milestoneCompleted = milestone.status === "completed";

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);

      const response = await TasksAPI.getByMilestone(milestone._id);
      const data = response?.data ?? response;

      setTasks(Array.isArray(data) ? data : data?.tasks || []);
    } catch (error) {
      showToast(error.message || "Failed to load tasks", "error");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [milestone._id, showToast]);

  const fetchOfficers = useCallback(async () => {
    if (!canManage || !departmentId) return;

    try {
      const response = await UsersAPI.getDepartmentOfficers(departmentId);
      const data = response?.data ?? response;

      setOfficers(Array.isArray(data) ? data : data?.officers || []);
    } catch (error) {
      showToast(error.message || "Failed to load officers", "error");
      setOfficers([]);
    }
  }, [canManage, departmentId, showToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchOfficers();
  }, [fetchOfficers]);

  const resetForm = () => {
    setForm(initialForm);
    setFormOpen(false);
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.assignedTo || !form.dueDate) {
      showToast("Please complete all required task fields", "warning");
      return;
    }

    try {
      setSaving(true);

      await TasksAPI.create(milestone._id, {
        title: form.title.trim(),
        description: form.description.trim(),
        assignedTo: form.assignedTo,
        dueDate: form.dueDate,
        priority: form.priority
      });

      showToast("Task assigned successfully", "success");
      resetForm();
      await fetchTasks();
    } catch (error) {
      showToast(error.message || "Failed to assign task", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task, status) => {
    try {
      await TasksAPI.update(task._id, { status });

      showToast("Task status updated", "success");
      await fetchTasks();
    } catch (error) {
      showToast(error.message || "Failed to update task status", "error");
    }
  };

  const handleDelete = async (task) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) return;

    try {
      await TasksAPI.delete(task._id);
      showToast("Task deleted successfully", "success");
      await fetchTasks();
    } catch (error) {
      showToast(error.message || "Failed to delete task", "error");
    }
  };

  const milestoneStart = milestone.startDate
    ? new Date(milestone.startDate).toISOString().slice(0, 10)
    : undefined;

  const milestoneEnd = milestone.dueDate
    ? new Date(milestone.dueDate).toISOString().slice(0, 10)
    : undefined;

  return (
    <div className="mt-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-[var(--text-secondary)]" />
          <h5 className="text-xs font-bold">Tasks</h5>
          <span className="text-[10px] text-[var(--text-muted)]">
            ({tasks.length})
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchTasks}
            disabled={loading}
            className="btn btn-secondary flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>

          {canManage && !projectLocked && !milestoneCompleted && (
            <button
              type="button"
              onClick={() => setFormOpen((previous) => !previous)}
              className="btn btn-primary flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Assign Task
            </button>
          )}
        </div>
      </div>

      {formOpen && (
        <form onSubmit={handleCreate} className="space-y-3 rounded-lg border border-[var(--border-subtle)] p-3">
          <div>
            <label className="form-label">Task Title *</label>
            <input
              className="form-input"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              placeholder="e.g. Inspect construction site"
              maxLength={150}
              required
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe the task..."
            />
          </div>

          <div>
            <label className="form-label">Assign to Officer *</label>
            <select
              className="form-select"
              value={form.assignedTo}
              onChange={(e) =>
                setForm({ ...form, assignedTo: e.target.value })
              }
              required
            >
              <option value="">Select an officer</option>
              {officers.map((officer) => (
                <option key={officer._id || officer.id} value={officer._id || officer.id}>
                  {officer.name} ({officer.email})
                </option>
              ))}
            </select>

            {officers.length === 0 && (
              <p className="text-xs text-[var(--text-muted)] mt-1">
                No officers found in this department.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Due Date *</label>
              <input
                type="date"
                className="form-input"
                value={form.dueDate}
                min={milestoneStart}
                max={milestoneEnd}
                onChange={(e) =>
                  setForm({ ...form, dueDate: e.target.value })
                }
                required
              />
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
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || officers.length === 0}
            >
              {saving ? "Assigning..." : "Assign Task"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-4 text-center text-xs text-[var(--text-muted)]">
          Loading tasks...
        </p>
      ) : tasks.length === 0 ? (
        <p className="py-4 text-center text-xs text-[var(--text-muted)]">
          No tasks assigned to this milestone yet.
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const assignedOfficerId =
              task.assignedTo?._id || task.assignedTo;

            const isAssignedOfficer =
              user?.role === "officer" &&
              String(assignedOfficerId) === String(user?._id || user?.id);

            return (
              <div
                key={task._id}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 space-y-2"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <h6 className="text-xs font-bold">{task.title}</h6>
                    {task.description && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <span className={`h-fit rounded-full px-2 py-1 text-[10px] font-semibold ${priorityStyles[task.priority] || priorityStyles.medium}`}>
                    {formatStatus(task.priority)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--text-secondary)]">
                  <span>
                    Assigned: {task.assignedTo?.name || "Officer"}
                  </span>
                  <span>
                    Due: {formatDate(task.dueDate)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-2">
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyles[task.status] || statusStyles.pending}`}>
                    {formatStatus(task.status)}
                  </span>

                  {((isAssignedOfficer && !projectLocked) ||
                    (canManage && !projectLocked)) && (
                    <select
                      className="form-select !w-auto !py-1 text-xs"
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task, e.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  )}

                  {canManage && !projectLocked && (
                    <button
                      type="button"
                      onClick={() => handleDelete(task)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
