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
  getMe: () => apiFetch("/auth/me")
};

export const GrievanceAPI = {
  getStats: () => apiFetch("/grievances/stats"),
  track: (ticketId) => apiFetch(`/grievances/track/${encodeURIComponent(ticketId)}`),
  submit: (formData) =>
    apiFetch("/grievances/submit", {
      method: "POST",
      body: formData
    }),
  getMyGrievances: () => apiFetch("/grievances/my-complaints")
};

