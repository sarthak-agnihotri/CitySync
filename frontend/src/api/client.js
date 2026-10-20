// Centralized API Client

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.replace(/\/$/, "");
  }
  return "http://localhost:5000/api";
};

export const API_BASE = getBaseUrl();

export const getToken = () => localStorage.getItem("cs_token");
export const setToken = (token) => localStorage.setItem("cs_token", token);
export const removeToken = () => {
  localStorage.removeItem("cs_token");
  localStorage.removeItem("cs_user");
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("cs_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
export const setStoredUser = (user) => localStorage.setItem("cs_user", JSON.stringify(user));

/**
 * Universal fetch wrapper for CitySync backend
 */
export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (netErr) {
    const err = new Error(
      `Cannot connect to CitySync backend at ${API_BASE}. Please ensure the backend server is running.`
    );
    err.isNetworkError = true;
    throw err;
  }

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      removeToken();
      window.dispatchEvent(new CustomEvent("citysync:session-expired"));
    }

    const message = (data && (data.message || data.error)) || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
