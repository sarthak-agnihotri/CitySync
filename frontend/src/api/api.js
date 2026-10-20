// Centralized API barrel re-exporting modules
export { API_BASE, getToken, setToken, removeToken, getStoredUser, setStoredUser, apiFetch } from "./client";
export { AuthAPI as Auth } from "./auth";
export { DepartmentsAPI as Departments } from "./departments";
export { UsersAPI as Users } from "./users";
export { ResourcesAPI as Resources } from "./resources";
export { RequestsAPI as Requests } from "./requests";
export { NotificationsAPI as Notifications } from "./notifications";
export { AuditAPI as Audit } from "./audit";

// ─── MEMBER 3: PROJECTS API ───────────────────────────────────────────────────
export const Projects = {
  list: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    );
    const qs = new URLSearchParams(cleanParams).toString();
    return (window.__citysync_apiFetch || (async (path, opt) => {
      const { apiFetch } = await import("./client");
      return apiFetch(path, opt);
    }))(`/projects${qs ? `?${qs}` : ""}`);
  },
  get: (id) => (window.__citysync_apiFetch || (async (path, opt) => {
    const { apiFetch } = await import("./client");
    return apiFetch(path, opt);
  }))(`/projects/${id}`),
  create: (data) => (window.__citysync_apiFetch || (async (path, opt) => {
    const { apiFetch } = await import("./client");
    return apiFetch(path, opt);
  }))("/projects", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => (window.__citysync_apiFetch || (async (path, opt) => {
    const { apiFetch } = await import("./client");
    return apiFetch(path, opt);
  }))(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => (window.__citysync_apiFetch || (async (path, opt) => {
    const { apiFetch } = await import("./client");
    return apiFetch(path, opt);
  }))(`/projects/${id}`, { method: "DELETE" }),
  timeline: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return (window.__citysync_apiFetch || (async (path, opt) => {
      const { apiFetch } = await import("./client");
      return apiFetch(path, opt);
    }))(`/projects/schedule/timeline${qs ? `?${qs}` : ""}`);
  },
  calendar: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return (window.__citysync_apiFetch || (async (path, opt) => {
      const { apiFetch } = await import("./client");
      return apiFetch(path, opt);
    }))(`/projects/schedule/calendar${qs ? `?${qs}` : ""}`);
  }
};

// ─── MEMBER 3: CONFLICTS API ──────────────────────────────────────────────────
export const Conflicts = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return (window.__citysync_apiFetch || (async (path, opt) => {
      const { apiFetch } = await import("./client");
      return apiFetch(path, opt);
    }))(`/conflicts${qs ? `?${qs}` : ""}`);
  },
  get: (id) => (window.__citysync_apiFetch || (async (path, opt) => {
    const { apiFetch } = await import("./client");
    return apiFetch(path, opt);
  }))(`/conflicts/${id}`),
  checkDraft: (data) => (window.__citysync_apiFetch || (async (path, opt) => {
    const { apiFetch } = await import("./client");
    return apiFetch(path, opt);
  }))("/conflicts/check", { method: "POST", body: JSON.stringify(data) }),
  resolve: (id, data = {}) => (window.__citysync_apiFetch || (async (path, opt) => {
    const { apiFetch } = await import("./client");
    return apiFetch(path, opt);
  }))(`/conflicts/${id}/resolve`, { method: "PUT", body: JSON.stringify(data) })
};

export * from "./index";
