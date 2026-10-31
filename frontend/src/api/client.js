// Centralized API Client with In-Memory Caching & Latency Optimization

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.replace(/\/$/, "");
  }
  // When running in Vite dev or production browser, use relative /api
  if (typeof window !== "undefined") {
    return "/api";
  }
  return "http://127.0.0.1:5000/api";
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

// In-memory cache for GET requests to eliminate blocking page-switch loaders
const apiCache = new Map();
const DEFAULT_CACHE_TTL = 30 * 1000; // 30 seconds

export const clearApiCache = () => {
  apiCache.clear();
};

if (typeof window !== "undefined") {
  window.addEventListener("citysync:refresh-data", () => {
    clearApiCache();
  });
}

/**
 * Universal fetch wrapper for CitySync backend with instant cache & timeout protection
 */
export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const method = (options.method || "GET").toUpperCase();

  // If this is a mutation, clear cached GET responses to ensure fresh state
  if (method !== "GET") {
    clearApiCache();
  }

  // Check cache for GET requests
  const cacheKey = `${token || "anon"}:${url}`;
  if (method === "GET" && !options.noCache) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < (options.cacheTtl || DEFAULT_CACHE_TTL)) {
      // Return a deep clone so component mutations don't corrupt cache
      return JSON.parse(JSON.stringify(cached.data));
    }
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Use AbortController to protect against hanging requests
  const controller = new AbortController();
  const timeoutMs = options.timeout || 8000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
  } catch (netErr) {
    clearTimeout(timeoutId);
    if (netErr.name === "AbortError") {
      const err = new Error(`Request to ${endpoint} timed out after ${timeoutMs}ms.`);
      err.isTimeout = true;
      throw err;
    }
    const err = new Error(
      `Cannot connect to CitySync backend at ${API_BASE}. Please ensure the backend server is running.`
    );
    err.isNetworkError = true;
    throw err;
  } finally {
    clearTimeout(timeoutId);
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
      clearApiCache();
      window.dispatchEvent(new CustomEvent("citysync:session-expired"));
    }

    const message = (data && (data.message || data.error)) || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  // Store successful GET response in cache
  if (method === "GET" && data) {
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  return data;
}
