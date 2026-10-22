import { apiFetch } from "./client";

export const ConflictsAPI = {
  getAll: () =>
    apiFetch("/conflicts"),

  getById: (id) =>
    apiFetch(`/conflicts/${id}`),

  checkDraft: (data) =>
    apiFetch("/conflicts/check", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  resolve: (id, data = {}) =>
    apiFetch(`/conflicts/${id}/resolve`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};