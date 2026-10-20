import { apiFetch } from "./client";

export const AuthAPI = {
  register: (name, email, password) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    }),

  login: (email, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),

  getMe: () => apiFetch("/auth/me")
};
