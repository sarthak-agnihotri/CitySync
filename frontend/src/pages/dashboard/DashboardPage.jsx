import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Boxes,
  CheckCircle2,
  Clock,
  Bell,
  Building2,
  Users,
  HardHat,
  ShieldCheck,
  ArrowRight,
  Plus,
  AlertTriangle,
  FolderKanban
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  ResourcesAPI,
  RequestsAPI,
  NotificationsAPI,
  DepartmentsAPI,
  UsersAPI,
  ProjectsAPI,
  ConflictsAPI
} from "../../api";
import { StatCard } from "../../components/common/StatCard";
import { StatusPill } from "../../components/common/StatusPill";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";

export function DashboardPage() {
  const { user, isRole } = useAuth();
  const { t, isHindi } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [stats, setStats] = useState({
    totalResources: 0,
    availableResources: 0,
    pendingRequests: 0,
    unreadNotifications: 0,
    totalProjects: 0,
    activeConflicts: 0,
    totalDepartments: 0,
    totalUsers: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentConflicts, setRecentConflicts] = useState([]);
  const [lowStockResources, setLowStockResources] = useState([]);

  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent && !hasLoadedOnce) {
      setLoading(true);
    }
    try {
      const isAdmin = isRole("city_admin");
      const [resData, reqData, notifData, projData, confData, deptData, usrData] = await Promise.allSettled([
        ResourcesAPI.list(),
        RequestsAPI.list(),
        NotificationsAPI.list(true),
        ProjectsAPI.getAll(),
        ConflictsAPI.getAll(),
        isAdmin ? DepartmentsAPI.list() : Promise.resolve(null),
        isAdmin ? UsersAPI.list() : Promise.resolve(null)
      ]);

      const resources = resData.status === "fulfilled" && resData.value?.resources ? resData.value.resources : [];
      const requests = reqData.status === "fulfilled" && reqData.value?.requests ? reqData.value.requests : [];
      const notifications = notifData.status === "fulfilled" && notifData.value?.notifications ? notifData.value.notifications : [];
      const projects = projData.status === "fulfilled" && projData.value?.projects ? projData.value.projects : [];
      const conflicts = confData.status === "fulfilled" && confData.value?.conflicts ? confData.value.conflicts : [];

      const availableCount = resources.filter((r) => r.status === "available" || r.availableQuantity > 0).length;
      const pendingCount = requests.filter((req) => req.status === "pending").length;
      const activeClashes = conflicts.filter((c) => ["detected", "under_review"].includes(c.status));

      const lowStock = resources.filter(
        (r) => r.quantity > 0 && r.availableQuantity / r.quantity <= 0.25
      );

      let deptsCount = 0;
      let usersCount = 0;

      if (isAdmin) {
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
        totalProjects: projects.length,
        activeConflicts: activeClashes.length,
        totalDepartments: deptsCount,
        totalUsers: usersCount
      });

      setRecentRequests(requests.slice(0, 5));
      setRecentConflicts(activeClashes.slice(0, 3));
      setLowStockResources(lowStock.slice(0, 4));
      setHasLoadedOnce(true);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  }, [isRole, hasLoadedOnce]);

  useEffect(() => {
    loadDashboardData(hasLoadedOnce);
    const handleRefresh = () => loadDashboardData(false);
    window.addEventListener("citysync:refresh-data", handleRefresh);
    return () => window.removeEventListener("citysync:refresh-data", handleRefresh);
  }, [loadDashboardData, hasLoadedOnce]);

  if (loading) {
    return <LoadingSpinner text="Aggregating municipal metrics and requisition logs..." />;
  }

  const deptName =
  user?.departmentName ||
  (user?.role === "department_head" && !user?.department
    ? "All Departments"
    : "General Municipal Services");

  return (
    <div className="space-y-6">
      {/* Institutional Officer Welcome Banner */}
      <div className="surface-card p-6 bg-gradient-to-r from-[var(--bg-surface)] to-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t("dashboard.opsHub")}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            {t("dashboard.welcome")}, {user?.name || t("dashboard.officer")}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {t("dashboard.loggedInAs")} <strong className="text-[var(--text-primary)]">{user?.role?.replace(/_/g, " ")}</strong> {t("dashboard.representing")}{" "}
            <strong className="text-[var(--text-primary)]">{deptName}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate("/projects")}
            className="btn btn-primary text-xs py-2 px-3.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t("dashboard.registerProject")}</span>
          </button>
          <button
            onClick={() => navigate("/requests")}
            className="btn btn-secondary text-xs py-2 px-3.5"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t("dashboard.submitRequisition")}</span>
          </button>
          <button
            onClick={() => navigate("/resources")}
            className="btn btn-ghost text-xs py-2 px-3.5"
          >
            <span>{t("dashboard.equipmentDirectory")}</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={<FolderKanban className="w-6 h-6" />}
          count={stats.totalProjects}
          label={t("dashboard.statProjects")}
          subtitle={t("dashboard.statProjectsSub")}
          onClick={() => navigate("/projects")}
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6 text-amber-500" />}
          count={stats.activeConflicts}
          label={t("dashboard.statConflicts")}
          subtitle={t("dashboard.statConflictsSub")}
          onClick={() => navigate("/conflicts")}
        />
        <StatCard
          icon={<Boxes className="w-6 h-6" />}
          count={stats.totalResources}
          label={t("dashboard.statResources")}
          subtitle={t("dashboard.statResourcesSub")}
          onClick={() => navigate("/resources")}
        />
        <StatCard
          icon={<CheckCircle2 className="w-6 h-6" />}
          count={stats.availableResources}
          label={t("dashboard.statAvailable")}
          subtitle={t("dashboard.statAvailableSub")}
          onClick={() => navigate("/resources")}
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          count={stats.pendingRequests}
          label={t("dashboard.statPending")}
          subtitle={t("dashboard.statPendingSub")}
          onClick={() => navigate("/requests")}
        />
        <StatCard
          icon={<Bell className="w-6 h-6" />}
          count={stats.unreadNotifications}
          label={t("dashboard.statAlerts")}
          subtitle={t("dashboard.statAlertsSub")}
          onClick={() => navigate("/notifications")}
        />
      </div>

      {/* Admin Statutory Row */}
      {isRole("city_admin") && (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={<Building2 className="w-6 h-6" />}
            count={stats.totalDepartments}
            label={t("dashboard.statDepts")}
            subtitle={t("dashboard.statDeptsSub")}
            onClick={() => navigate("/departments")}
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            count={stats.totalUsers}
            label={t("dashboard.statUsers")}
            subtitle={t("dashboard.statUsersSub")}
            onClick={() => navigate("/users")}
          />
        </div>
      )}

      {/* Main Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Requisitions & Clashes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Conflicts Card if any */}
          {recentConflicts.length > 0 && (
            <div className="surface-card p-6 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {isHindi ? "सक्रिय कॉरिडोर टकराव एवं समन्वय" : "Active Corridor Clashes Awaiting Deconfliction"} ({recentConflicts.length})
                  </h3>
                </div>
                <button
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  onClick={() => navigate("/conflicts")}
                >
                  {isHindi ? "सभी टकराव देखें" : "View All Conflicts"}
                </button>
              </div>

              <div className="space-y-3">
                {recentConflicts.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => navigate("/conflicts")}
                    className="p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {c.projectA?.title || "Corridor Project A"}
                        </span>
                        <span className="text-[var(--text-muted)] text-xs">↔</span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {c.projectB?.title || "Corridor Project B"}
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold uppercase">
                        {c.severity} Severity • {c.conflictType?.replace(/_/g, " ")}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/conflicts");
                      }}
                      className="btn btn-primary btn-sm text-xs py-1 px-3"
                    >
                      Coordinate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requisitions Card */}
          <div className="surface-card p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {t("dashboard.recentRequests")}
                </h3>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {isHindi ? "नवीनतम अंतर-विभागीय उपकरण मांगें" : "Latest inter-departmental machinery bookings"}
                </span>
              </div>
              <button
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                onClick={() => navigate("/requests")}
              >
                {isHindi ? "सभी मांगें देखें" : "View All Requisitions"}
              </button>
            </div>

            {recentRequests.length === 0 ? (
              <EmptyState
                icon={HardHat}
                title={isHindi ? "कोई सक्रिय मांग पत्र नहीं" : "No active requisitions"}
                message={isHindi ? "अभी तक कोई मशीनरी अनुरोध जमा नहीं किया गया है।" : "No machinery requests have been submitted yet."}
                actionButton={
                  <button
                    className="btn btn-primary text-xs py-1.5 px-3"
                    onClick={() => navigate("/requests")}
                  >
                    {isHindi ? "पहला अनुरोध दर्ज करें" : "Place First Request"}
                  </button>
                }
              />
            ) : (
              <div className="space-y-3">
                {recentRequests.map((req) => {
                  const resName = req.resource?.name || "Machinery Item";
                  const requesterName = req.requestedBy?.name || "Officer";
                  const dept = req.requestingDepartment?.name || "Agency";

                  return (
                    <div
                      key={req._id}
                      onClick={() => navigate("/requests")}
                      className="p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                          <HardHat className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                            {resName}
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)] truncate">
                            {req.quantityRequested} unit(s) • Req by {requesterName} ({dept})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <StatusPill status={req.priority} type="priority" />
                        <StatusPill status={req.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Inventory Alerts & Policy Reminders */}
        <div className="space-y-6">
          {/* Inventory Watch Card */}
          <div className="surface-card p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {isHindi ? "उपकरण उपलब्धता चेतावनी" : "Equipment Availability Alerts"}
              </h3>
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
                {isHindi ? "गंभीर स्तर" : "Critical Level"}
              </span>
            </div>

            {lowStockResources.length === 0 ? (
              <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-400 font-medium">
                {t("dashboard.noLowStock")}
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockResources.map((res) => (
                  <div
                    key={res._id}
                    className="p-3 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[var(--text-primary)]">{res.name}</span>
                      <StatusPill status={res.status} />
                    </div>
                    <div className="w-full bg-[var(--border-subtle)] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-rose-600 rounded-full"
                        style={{
                          width: `${Math.max(5, (res.availableQuantity / (res.quantity || 1)) * 100)}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                      <span>{isHindi ? "उपलब्ध" : "Available"}</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {res.availableQuantity} of {res.quantity} {res.unit || (isHindi ? "इकाइयां" : "units")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Statutory Governance Card */}
          <div className="p-5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-neutral-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{isHindi ? "वैधानिक डिग-लेटर अनुपालन" : "Statutory Dig-Later Compliance"}</span>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "नगरपालिका समन्वय दिशानिर्देशों के अनुसार, मुख्य मार्गों पर तैनात सभी भारी उत्खनन मशीनरी का सक्रिय उपयोगिता डक्ट योजनाओं और सड़क अधिस्थगन नियमों के तहत सत्यापन अनिवार्य है।"
                : "Under municipal coordination guidelines, all heavy excavation machinery deployed on arterial corridors must be verified against active utility duct plans and road moratoriums."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
