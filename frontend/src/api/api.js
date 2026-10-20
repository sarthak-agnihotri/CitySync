// Centralized API barrel re-exporting modules
export { API_BASE, getToken, setToken, removeToken, getStoredUser, setStoredUser, apiFetch } from "./client";
export { AuthAPI as Auth } from "./auth";
export { DepartmentsAPI as Departments } from "./departments";
export { UsersAPI as Users } from "./users";
export { ResourcesAPI as Resources } from "./resources";
export { RequestsAPI as Requests } from "./requests";
export { NotificationsAPI as Notifications } from "./notifications";
export { AuditAPI as Audit } from "./audit";

export * from "./index";
