import { apiFetch } from "./client";

export const NotificationsAPI = {
  list: (unreadOnly = false) =>
    apiFetch(`/notifications${unreadOnly ? "?unreadOnly=true" : ""}`),

  markRead: (id) =>
    apiFetch(`/notifications/${id}/read`, {
      method: "PATCH"
    }),

  markAllRead: () =>
    apiFetch("/notifications/read-all", {
      method: "PATCH"
    }),

  delete: (id) =>
    apiFetch(`/notifications/${id}`, {
      method: "DELETE"
    })
};
