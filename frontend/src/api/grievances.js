import { apiFetch } from "./client";

export const GrievancesAPI = {
  list: () => apiFetch("/grievances"),

  assign: (grievanceId, departmentId, officerId) =>
    apiFetch(`/grievances/${grievanceId}/assign`, {
      method: "POST",
      body: JSON.stringify({ departmentId, officerId })
    }),

  update: (grievanceId, data) =>
    apiFetch(`/grievances/${grievanceId}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    })
};
