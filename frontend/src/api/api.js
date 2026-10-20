// ── API base URL — change this if your backend runs on a different port
const API_BASE = "http://localhost:5000/api";

// ── Helper: get stored token
const getToken = () => localStorage.getItem("cs_token");

// ── Core fetch wrapper
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.status = res.status;
    throw err;
  }
  return data;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const Auth = {
  login: (email, password) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => apiFetch("/auth/me")
};

// ─── RESOURCES ────────────────────────────────────────────────────────────────
const Resources = {
  list: (params = {}) => apiFetch("/resources?" + new URLSearchParams(params)),
  get: (id) => apiFetch(`/resources/${id}`),
  create: (data) => apiFetch("/resources", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/resources/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deactivate: (id) => apiFetch(`/resources/${id}/deactivate`, { method: "PATCH" })
};

// ─── REQUESTS ─────────────────────────────────────────────────────────────────
const Requests = {
  list: (params = {}) => apiFetch("/requests?" + new URLSearchParams(params)),
  get: (id) => apiFetch(`/requests/${id}`),
  submit: (data) => apiFetch("/requests", { method: "POST", body: JSON.stringify(data) }),
  approve: (id) => apiFetch(`/requests/${id}/approve`, { method: "PATCH" }),
  reject: (id, reason) =>
    apiFetch(`/requests/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ rejectionReason: reason })
    }),
  return: (id) => apiFetch(`/requests/${id}/return`, { method: "PATCH" }),
  cancel: (id) => apiFetch(`/requests/${id}/cancel`, { method: "PATCH" })
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
const Notifications = {
  list: (unreadOnly = false) =>
    apiFetch("/notifications" + (unreadOnly ? "?unreadOnly=true" : "")),
  markRead: (id) => apiFetch(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => apiFetch("/notifications/read-all", { method: "PATCH" }),
  delete: (id) => apiFetch(`/notifications/${id}`, { method: "DELETE" })
};

// ─── DEPARTMENTS ──────────────────────────────────────────────────────────────
const Departments = {
  list: () => apiFetch("/departments"),
  get: (id) => apiFetch(`/departments/${id}`)
};

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
const Projects = {
  list: (params = {}) => apiFetch("/projects?" + new URLSearchParams(params)),
  get: (id) => apiFetch(`/projects/${id}`),
  create: (data) => apiFetch("/projects", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/projects/${id}`, { method: "DELETE" }),
  timeline: (params = {}) => apiFetch("/projects/schedule/timeline?" + new URLSearchParams(params)),
  calendar: (params = {}) => apiFetch("/projects/schedule/calendar?" + new URLSearchParams(params))
};

// ─── CONFLICTS ────────────────────────────────────────────────────────────────
const Conflicts = {
  list: (params = {}) => apiFetch("/conflicts?" + new URLSearchParams(params)),
  get: (id) => apiFetch(`/conflicts/${id}`),
  checkDraft: (data) => apiFetch("/conflicts/check", { method: "POST", body: JSON.stringify(data) }),
  resolve: (id, data) => apiFetch(`/conflicts/${id}/resolve`, { method: "PUT", body: JSON.stringify(data) })
};

// ─── AUDIT ────────────────────────────────────────────────────────────────────
const Audit = {
  list: (params = {}) => apiFetch("/audit?" + new URLSearchParams(params))
};
