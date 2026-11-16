const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.replace(/\/$/, "");
  }
  return "/api/citizen";
};

export const API_BASE = getBaseUrl();

export const getToken = () => localStorage.getItem("csp_token");
export const setToken = (token) => localStorage.setItem("csp_token", token);
export const removeToken = () => {
  localStorage.removeItem("csp_token");
  localStorage.removeItem("csp_user");
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("csp_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => localStorage.setItem("csp_user", JSON.stringify(user));

export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  const headers = { ...options.headers };

  const token = getToken();
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If body is NOT FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export const CitizenAuthAPI = {
  register: (payload) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  login: (payload) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getMe: () => apiFetch("/auth/me"),
  updateProfile: (payload) =>
    apiFetch("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  changePassword: (payload) =>
    apiFetch("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  forgotPassword: (email) =>
    apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    }),
  resetPassword: (payload) =>
    apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload)
    })
};

export const GrievanceAPI = {
  getStats: () => apiFetch("/grievances/stats"),
  getMap: () => apiFetch("/grievances/map"),
  track: (ticketId) => apiFetch(`/grievances/track/${encodeURIComponent(ticketId)}`),
  submit: (formData) =>
    apiFetch("/grievances/submit", {
      method: "POST",
      body: formData
    }),
  getMyGrievances: () => apiFetch("/grievances/my-complaints"),
  rate: (ticketId, payload) =>
    apiFetch(`/grievances/${encodeURIComponent(ticketId)}/rate`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  reopen: (ticketId, payload) =>
    apiFetch(`/grievances/${encodeURIComponent(ticketId)}/reopen`, {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  upvote: (ticketId) =>
    apiFetch(`/grievances/${encodeURIComponent(ticketId)}/upvote`, {
      method: "POST"
    })
};

export const NotificationAPI = {
  list: () => apiFetch("/grievances/notifications"),
  markAsRead: (id) =>
    apiFetch(`/grievances/notifications/${encodeURIComponent(id)}/read`, {
      method: "PATCH"
    }),
  markAllAsRead: () =>
    apiFetch("/grievances/notifications/read-all", {
      method: "POST"
    })
};
