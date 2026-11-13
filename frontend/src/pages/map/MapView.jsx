
import React, { useMemo } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./map.css";

// Fix default Leaflet marker icons in Vite
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

function MapBounds({ projects }) {
    const map = useMap();

    React.useEffect(() => {
        if (projects.length === 0) return;

        if (projects.length === 1) {
            const { latitude, longitude } = projects[0].coordinates;
            map.setView([Number(latitude), Number(longitude)], 13);
            return;
        }

        const bounds = projects.map((project) => [
            Number(project.coordinates.latitude),
            Number(project.coordinates.longitude),
        ]);

        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }, [projects, map]);

    return null;
}

function getProjectIcon(status) {
    const normalizedStatus = (status || "").toLowerCase().replace(/[\s-]/g, "_");

    const colors = {
        proposed: "#f59e0b",
        in_progress: "#3b82f6",
        completed: "#16a34a",
        cancelled: "#6b7280",
    };

    const color = colors[normalizedStatus] || "#64748b";

    return L.divIcon({
        className: "custom-project-marker",
        html: `<div style="
      width: 18px;
      height: 18px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 1px 5px rgba(0,0,0,0.5);
    "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });
}

export function MapView({ projects = [] }) {
    const validProjects = useMemo(
        () =>
            projects.filter((project) => {
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
            }),
        [projects]
    );

    const center = validProjects.length
        ? [
            Number(validProjects[0].coordinates.latitude),
            Number(validProjects[0].coordinates.longitude),
        ]
        : [20.5937, 78.9629];

    return (
        <div className="smart-map-container">
            <MapContainer
                center={center}
                zoom={5}
                scrollWheelZoom
                className="smart-city-map"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapBounds projects={validProjects} />

                {validProjects.map((project) => (
                    <Marker
                        key={project._id}
                        position={[
                            Number(project.coordinates.latitude),
                            Number(project.coordinates.longitude),
                        ]}
                        icon={getProjectIcon(project.status)}
                    >
                        <Popup>
                            <div className="map-popup">
                                <strong>{project.title}</strong>
                                <p>
                                    <b>Department:</b>{" "}
                                    {project.department?.name || "Unassigned"}
                                </p>
                                <p>
                                    <b>Category:</b>{" "}
                                    {project.category?.replace(/_/g, " ")}
                                </p>
                                <p>
                                    <b>Status:</b> {project.status || "Proposed"}
                                </p>
                                <p>
                                    <b>Priority:</b> {project.priority || "Medium"}
                                </p>
                                <p>
                                    <b>Zone:</b> {project.zone || "Not specified"}
                                </p>
                                <p>
                                    <b>Address:</b> {project.address || "Not specified"}
                                </p>
                                <p>
                                    <b>Latitude:</b> {project.coordinates.latitude}
                                </p>
                                <p>
                                    <b>Longitude:</b> {project.coordinates.longitude}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            <div className="map-legend">
                <strong>Project Status</strong>

                <div>
                    <span className="legend-dot proposed"></span>
                    Proposed
                </div>

                <div>
                    <span className="legend-dot in-progress"></span>
                    In Progress
                </div>

                <div>
                    <span className="legend-dot completed"></span>
                    Completed
                </div>

                <div>
                    <span className="legend-dot cancelled"></span>
                    Cancelled
                </div>
            </div>
        </div>
    );
}
