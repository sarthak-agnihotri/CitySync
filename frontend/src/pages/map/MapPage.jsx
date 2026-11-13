
import React, { useEffect, useMemo, useState } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import { ProjectsAPI } from "../../api";
import { useToast } from "../../context/ToastContext";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { MapView } from "./MapView";

export function MapPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { showToast } = useToast();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await ProjectsAPI.getAll();
      setProjects(response.projects || []);
    } catch (error) {
      showToast(error.message || "Could not load map projects", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    const handleRefresh = () => fetchProjects();
    window.addEventListener("citysync:refresh-data", handleRefresh);

    return () => {
      window.removeEventListener("citysync:refresh-data", handleRefresh);
    };
  }, []);

  const departments = useMemo(() => {
    return [
      ...new Set(
        projects
          .map((project) => project.department?.name)
          .filter(Boolean)
      ),
    ];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesDepartment =
        !departmentFilter ||
        project.department?.name === departmentFilter;

      const matchesStatus =
        !statusFilter || project.status === statusFilter;

      return matchesDepartment && matchesStatus;
    });
  }, [projects, departmentFilter, statusFilter]);

  const mappedProjects = filteredProjects.filter((project) => {
    const latitude = Number(project.coordinates?.latitude);
    const longitude = Number(project.coordinates?.longitude);

    return (
      project.coordinates?.latitude !== null &&
      project.coordinates?.latitude !== undefined &&
      project.coordinates?.longitude !== null &&
      project.coordinates?.longitude !== undefined &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  });

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h3 className="section-title">Smart City Map</h3>
          <p className="section-hint">
            Geographic overview of municipal infrastructure projects.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={fetchProjects}
          disabled={loading}
        >
          <RefreshCw size={15} />
          Refresh Map
        </button>
      </div>

      <div className="page-actions">
        <select
          className="select-input"
          value={departmentFilter}
          onChange={(event) => setDepartmentFilter(event.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>

        <select
          className="select-input"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">All Project Statuses</option>
          {[...new Set(projects.map((project) => project.status).filter(Boolean))].map(
            (status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            )
          )}
        </select>

        <span className="results-count">
          <MapPin size={13} />
          {" "}{mappedProjects.length} mapped / {filteredProjects.length} projects
        </span>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading infrastructure locations..." />
      ) : (
        <MapView projects={mappedProjects} />
      )}
    </div>
  );
}
