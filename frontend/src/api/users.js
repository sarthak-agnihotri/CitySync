
import { apiFetch } from "./client";

export const UsersAPI = {
  list: () => apiFetch("/users"),

  getDepartmentOfficers: (departmentId) =>
    apiFetch(`/users/department/${departmentId}/officers`),

  assignDepartment: (userId, departmentId) =>
    apiFetch(`/users/${userId}/department`, {
      method: "PATCH",
      body: JSON.stringify({ departmentId })
    }),

  createDepartmentHead: (data) =>
    apiFetch("/users/department-head", {
      method: "POST",
      body: JSON.stringify(data)
    })
};
