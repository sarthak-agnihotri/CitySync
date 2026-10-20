import { apiFetch } from "./client";

export const RequestsAPI = {
  list: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    );
    const qs = new URLSearchParams(cleanParams).toString();
    return apiFetch(`/requests${qs ? `?${qs}` : ""}`);
  },

  getById: (id) => apiFetch(`/requests/${id}`),

  submit: (requestData) =>
    apiFetch("/requests", {
      method: "POST",
      body: JSON.stringify(requestData)
    }),

  approve: (id) =>
    apiFetch(`/requests/${id}/approve`, {
      method: "PATCH"
    }),

  reject: (id, rejectionReason) =>
    apiFetch(`/requests/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ rejectionReason })
    }),

  returnResource: (id) =>
    apiFetch(`/requests/${id}/return`, {
      method: "PATCH"
    }),

  cancel: (id) =>
    apiFetch(`/requests/${id}/cancel`, {
      method: "PATCH"
    })
};
