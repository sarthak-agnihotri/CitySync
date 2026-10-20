import { apiFetch } from "./client";

export const ResourcesAPI = {
  list: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    );
    const qs = new URLSearchParams(cleanParams).toString();
    return apiFetch(`/resources${qs ? `?${qs}` : ""}`);
  },

  getById: (id) => apiFetch(`/resources/${id}`),

  create: (resourceData) =>
    apiFetch("/resources", {
      method: "POST",
      body: JSON.stringify(resourceData)
    }),

  update: (id, resourceData) =>
    apiFetch(`/resources/${id}`, {
      method: "PUT",
      body: JSON.stringify(resourceData)
    }),

  deactivate: (id) =>
    apiFetch(`/resources/${id}/deactivate`, {
      method: "PATCH"
    })
};
