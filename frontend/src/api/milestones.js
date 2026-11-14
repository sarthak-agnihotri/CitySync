
import { apiFetch } from "./client";

export const MilestonesAPI = {
  // Get all milestones of a project
  getByProject: (projectId) =>
    apiFetch(`/milestones/project/${projectId}`),

  // Create milestone
  create: (projectId, data) =>
    apiFetch(`/milestones/project/${projectId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Update milestone
  update: (id, data) =>
    apiFetch(`/milestones/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Delete milestone
  delete: (id) =>
    apiFetch(`/milestones/${id}`, {
      method: "DELETE",
    }),
};
