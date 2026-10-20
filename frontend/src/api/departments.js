import { apiFetch } from "./client";

export const DepartmentsAPI = {
  list: () => apiFetch("/departments"),

  create: (departmentData) =>
    apiFetch("/departments", {
      method: "POST",
      body: JSON.stringify(departmentData)
    }),

  update: (id, departmentData) =>
    apiFetch(`/departments/${id}`, {
      method: "PUT",
      body: JSON.stringify(departmentData)
    }),

  deactivate: (id) =>
    apiFetch(`/departments/${id}/deactivate`, {
      method: "PATCH"
    })
};
