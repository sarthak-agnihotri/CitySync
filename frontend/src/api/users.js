import { apiFetch } from "./client";

export const UsersAPI = {
  list: () => apiFetch("/users"),

  assignDepartment: (userId, departmentId) =>
    apiFetch(`/users/${userId}/department`, {
      method: "PATCH",
      body: JSON.stringify({ departmentId })
    })
};
