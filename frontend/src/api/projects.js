import { apiFetch } from "./client";

export const ProjectsAPI = {
  getAll: (params = "") =>
    apiFetch(`/projects${params ? `?${params}` : ""}`),

  getById: (id) =>
    apiFetch(`/projects/${id}`),

  create: (data) =>
    apiFetch("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    apiFetch(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiFetch(`/projects/${id}`, {
      method: "DELETE",
    }),

  getTimeline: () =>
    apiFetch("/projects/schedule/timeline"),

  getCalendar: () =>
    apiFetch("/projects/schedule/calendar"),
};