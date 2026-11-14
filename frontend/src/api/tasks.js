
import { apiFetch } from "./client";

export const TasksAPI = {
  // Get tasks under a milestone
  getByMilestone: (milestoneId) =>
    apiFetch(`/tasks/milestone/${milestoneId}`),

  // Get logged-in officer's assigned tasks
  getMyTasks: () =>
    apiFetch("/tasks/my"),

  // Create and assign a task
  create: (milestoneId, data) =>
    apiFetch(`/tasks/milestone/${milestoneId}`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // Update task details or status
  update: (taskId, data) =>
    apiFetch(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(data)
    }),

  // Delete task
  delete: (taskId) =>
    apiFetch(`/tasks/${taskId}`, {
      method: "DELETE"
    })
};
