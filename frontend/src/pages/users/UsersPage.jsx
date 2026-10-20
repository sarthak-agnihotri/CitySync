import React, { useState, useEffect, useCallback } from "react";
import { UsersAPI, DepartmentsAPI } from "../../api";
import { useToast } from "../../context/ToastContext";
import { Modal } from "../../components/common/Modal";
import { StatusPill } from "../../components/common/StatusPill";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const { showToast } = useToast();

  // Assignment Modal
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, deptData] = await Promise.all([
        UsersAPI.list(),
        DepartmentsAPI.list()
      ]);
      setUsers(userData.users || []);
      setDepartments(deptData.departments || []);
    } catch (err) {
      showToast(err.message || "Failed to load users and departments", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener("citysync:refresh-data", handleRefresh);
    return () => window.removeEventListener("citysync:refresh-data", handleRefresh);
  }, [loadData]);

  const openAssignModal = (user) => {
    setSelectedUser(user);
    const currDeptId =
      user.department && typeof user.department === "object"
        ? user.department._id
        : user.department || "";
    setSelectedDeptId(currDeptId);
    setAssignOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedDeptId) return;

    setAssigning(true);
    try {
      await UsersAPI.assignDepartment(selectedUser._id, selectedDeptId);
      showToast(
        `Department updated for officer ${selectedUser.name}`,
        "success"
      );
      setAssignOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || "Department assignment failed", "error");
    } finally {
      setAssigning(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.department?.name && u.department.name.toLowerCase().includes(q));

    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="page users-page">
      <div className="page-header-row">
        <div>
          <h3 className="section-title">City Officers & User Directory</h3>
          <p className="section-hint">
            Manage authenticated municipal officers and department affiliations
          </p>
        </div>
      </div>

      <div className="page-actions">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, email, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="select-input"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Municipal Roles</option>
          <option value="city_admin">City Admin</option>
          <option value="department_head">Department Head</option>
          <option value="officer">Field Officer</option>
        </select>

        <span className="results-count">
          Showing <strong>{filteredUsers.length}</strong> of {users.length} officers
        </span>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading user records and departments..." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No users match your criteria"
          message="Try adjusting your search query or role filter."
        />
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Officer</th>
                <th>Role</th>
                <th>Assigned Department</th>
                <th>Registered On</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const deptName =
                  u.department && typeof u.department === "object"
                    ? u.department.name
                    : u.department
                    ? "Assigned"
                    : "Unassigned";

                const deptCode =
                  u.department && typeof u.department === "object" ? u.department.code : null;

                return (
                  <tr key={u._id}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar-cell">
                          {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="user-cell-meta">
                          <span className="user-cell-name">{u.name}</span>
                          <span className="user-cell-email">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusPill status={u.role} type="role" />
                    </td>
                    <td>
                      {deptCode ? (
                        <div className="dept-tag-cell">
                          <span className="tag-code">{deptCode}</span>
                          <span className="tag-name">{deptName}</span>
                        </div>
                      ) : (
                        <span className="unassigned-text">Unassigned</span>
                      )}
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="text-right">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openAssignModal(u)}
                      >
                        Assign Dept
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Department Modal */}
      <Modal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        title={`Assign Department — ${selectedUser?.name}`}
        size="sm"
      >
        <form onSubmit={handleAssignSubmit} className="modal-body">
          <div className="form-group">
            <label>Select Municipal Department *</label>
            <select
              required
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
            >
              <option value="">Choose department...</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
          <p className="confirm-hint">
            The selected officer will inherit visibility over equipment and requests under this
            department.
          </p>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setAssignOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={assigning || !selectedDeptId}
            >
              {assigning ? "Assigning..." : "Update Department"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
