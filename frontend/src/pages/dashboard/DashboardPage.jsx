import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ResourcesAPI, RequestsAPI, NotificationsAPI, DepartmentsAPI, UsersAPI } from "../../api";
import { StatCard } from "../../components/common/StatCard";
import { StatusPill } from "../../components/common/StatusPill";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";

export function DashboardPage() {
  const { user, isRole } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResources: 0,
    availableResources: 0,
    pendingRequests: 0,
    unreadNotifications: 0,
    totalDepartments: 0,
    totalUsers: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [lowStockResources, setLowStockResources] = useState([]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [resData, reqData, notifData] = await Promise.allSettled([
        ResourcesAPI.list(),
        RequestsAPI.list(),
        NotificationsAPI.list(true)
      ]);

      const resources = resData.status === "fulfilled" && resData.value?.resources ? resData.value.resources : [];
      const requests = reqData.status === "fulfilled" && reqData.value?.requests ? reqData.value.requests : [];
      const notifications = notifData.status === "fulfilled" && notifData.value?.notifications ? notifData.value.notifications : [];

      const availableCount = resources.filter((r) => r.status === "available" || r.availableQuantity > 0).length;
      const pendingCount = requests.filter((req) => req.status === "pending").length;

      // Find resources with low stock (availableQuantity <= 1 or < 20% of quantity)
      const lowStock = resources.filter(
        (r) => r.quantity > 0 && r.availableQuantity / r.quantity <= 0.25
      );

      let deptsCount = 0;
      let usersCount = 0;

      if (isRole("city_admin")) {
        const [deptData, usrData] = await Promise.allSettled([
          DepartmentsAPI.list(),
          UsersAPI.list()
        ]);
        if (deptData.status === "fulfilled" && deptData.value?.departments) {
          deptsCount = deptData.value.departments.length;
        }
        if (usrData.status === "fulfilled" && usrData.value?.users) {
          usersCount = usrData.value.users.length;
        }
      }

      setStats({
        totalResources: resources.length,
        availableResources: availableCount,
        pendingRequests: pendingCount,
        unreadNotifications: notifications.length,
        totalDepartments: deptsCount,
        totalUsers: usersCount
      });

      setRecentRequests(requests.slice(0, 5));
      setLowStockResources(lowStock.slice(0, 4));
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  }, [isRole]);

  useEffect(() => {
    loadDashboardData();

    const handleRefresh = () => loadDashboardData();
    window.addEventListener("citysync:refresh-data", handleRefresh);
    return () => window.removeEventListener("citysync:refresh-data", handleRefresh);
  }, [loadDashboardData]);

  if (loading) {
    return <LoadingSpinner text="Aggregating city metrics..." />;
  }

  const deptName =
    user?.department && typeof user.department === "object"
      ? user.department.name
      : user?.department || "General Municipal Services";

  return (
    <div className="page dashboard-page">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-badge">MUNICIPAL OPERATIONS HUB</div>
          <h2 className="welcome-title">
            Welcome back, {user?.name || "Officer"}
          </h2>
          <p className="welcome-sub">
            Logged in as <strong>{user?.role?.replace(/_/g, " ")}</strong> representing{" "}
            <strong>{deptName}</strong>.
          </p>
        </div>
        <div className="welcome-actions">
          <button className="btn btn-primary" onClick={() => navigate("/requests")}>
            <span>+ Submit Request</span>
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("/resources")}>
            <span>Browse Equipment</span>
          </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon="📦"
          count={stats.totalResources}
          label="Total Resources"
          subtitle="Registered machinery & assets"
          onClick={() => navigate("/resources")}
        />
        <StatCard
          icon="✅"
          count={stats.availableResources}
          label="Available Units"
          subtitle="Ready for inter-dept transfer"
          onClick={() => navigate("/resources")}
        />
        <StatCard
          icon="⏳"
          count={stats.pendingRequests}
          label="Pending Requests"
          subtitle="Awaiting authorization"
          onClick={() => navigate("/requests")}
        />
        <StatCard
          icon="🔔"
          count={stats.unreadNotifications}
          label="Unread Alerts"
          subtitle="Actionable notices"
          onClick={() => navigate("/notifications")}
        />

        {isRole("city_admin") && (
          <>
            <StatCard
              icon="🏛️"
              count={stats.totalDepartments}
              label="Active Departments"
              subtitle="Coordinating municipal bodies"
              onClick={() => navigate("/departments")}
            />
            <StatCard
              icon="👥"
              count={stats.totalUsers}
              label="Registered Officers"
              subtitle="Users across all agencies"
              onClick={() => navigate("/users")}
            />
          </>
        )}
      </div>

      <div className="dashboard-columns">
        {/* Recent Requests Section */}
        <div className="dashboard-section main-col">
          <div className="section-header">
            <div className="section-title-wrap">
              <h3>Recent Requisition Activity</h3>
              <span className="section-hint">Latest equipment requests and bookings</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/requests")}>
              View All
            </button>
          </div>

          {recentRequests.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No recent requests"
              message="No equipment requisitions have been placed yet."
              actionButton={
                <button className="btn btn-primary btn-sm" onClick={() => navigate("/requests")}>
                  Create First Request
                </button>
              }
            />
          ) : (
            <div className="card-list">
              {recentRequests.map((req) => {
                const resName = req.resource?.name || "Equipment";
                const requesterName = req.requestedBy?.name || "Officer";
                const dept = req.requestingDepartment?.name || "Agency";
                return (
                  <div
                    key={req._id}
                    className="req-card"
                    onClick={() => navigate("/requests")}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="req-card-icon">🚜</div>
                    <div className="req-card-info">
                      <div className="req-card-header">
                        <span className="req-card-title">{resName}</span>
                        <StatusPill status={req.status} />
                        <StatusPill status={req.priority} type="priority" />
                      </div>
                      <div className="req-card-meta">
                        <span>
                          <strong>{req.quantityRequested}</strong> unit(s) requested by{" "}
                          <strong>{requesterName}</strong> ({dept})
                        </span>
                        <span className="dot-sep">•</span>
                        <span>
                          {new Date(req.startDate).toLocaleDateString()} to{" "}
                          {new Date(req.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Low Stock / Quick Insights Section */}
        <div className="dashboard-section side-col">
          <div className="section-header">
            <div className="section-title-wrap">
              <h3>Equipment Stock Alerts</h3>
              <span className="section-hint">High-demand machinery</span>
            </div>
          </div>

          {lowStockResources.length === 0 ? (
            <div className="info-box success">
              <span>✅ All shared equipment inventory levels are optimal.</span>
            </div>
          ) : (
            <div className="alert-stack">
              {lowStockResources.map((res) => (
                <div key={res._id} className="stock-alert-card">
                  <div className="stock-alert-header">
                    <span className="stock-alert-name">{res.name}</span>
                    <StatusPill status={res.status} />
                  </div>
                  <div className="stock-alert-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill low"
                        style={{
                          width: `${Math.max(
                            5,
                            (res.availableQuantity / (res.quantity || 1)) * 100
                          )}%`
                        }}
                      />
                    </div>
                    <span className="stock-alert-qty">
                      {res.availableQuantity} of {res.quantity} {res.unit || "units"} available
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Institutional Governance Notice */}
          <div className="governance-card">
            <h4>🛡️ Dig-Later Inter-Agency Protocol</h4>
            <p>
              Under Municipal Coordination Guidelines, ensure all heavy excavation machinery
              requests align with active utility moratoriums before authorizing deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
