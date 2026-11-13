
import React, { useEffect, useMemo, useState } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import { ProjectsAPI, ResourcesAPI } from "../../api";
import { useToast } from "../../context/ToastContext";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { MapView } from "./MapView";

export function MapPage() {
  const [projects, setProjects] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { showToast } = useToast();

  const fetchMapData = async () => {
    try {
      setLoading(true);

      const [projectResponse, resourceResponse] = await Promise.all([
        ProjectsAPI.getAll(),
        ResourcesAPI.list(),
      ]);

      setProjects(projectResponse.projects || []);
      setResources(resourceResponse.resources || []);
    } catch (error) {
      showToast(error.message || "Could not load map data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();

    const handleRefresh = () => fetchMapData();
    window.addEventListener("citysync:refresh-data", handleRefresh);

    return () => {
      window.removeEventListener("citysync:refresh-data", handleRefresh);
    };
  }, []);

  const departments = useMemo(() => {
    return [
      ...new Set([
        ...projects.map((project) => project.department?.name),
        ...resources.map((resource) => resource.ownerDepartment?.name),
      ].filter(Boolean)),
    ];
  }, [projects, resources]);

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

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesDepartment =
        !departmentFilter ||
        resource.ownerDepartment?.name === departmentFilter;

      return matchesDepartment;
    });
  }, [resources, departmentFilter]);

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
            Geographic overview of municipal projects and resources.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={fetchMapData}
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
        <MapView
          projects={mappedProjects}
          resources={filteredResources}
        />
      )}
    </div>
  );
}
