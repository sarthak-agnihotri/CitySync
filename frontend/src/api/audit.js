import { apiFetch } from "./client";

export const AuditAPI = {
  list: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    );
    const qs = new URLSearchParams(cleanParams).toString();
    return apiFetch(`/audit${qs ? `?${qs}` : ""}`);
  }
};
