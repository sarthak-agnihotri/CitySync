
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

function MapBounds({ locations }) {
    const map = useMap();

    React.useEffect(() => {
        if (locations.length === 0) return;

        if (locations.length === 1) {
            map.setView(locations[0], 13);
            return;
        }

        map.fitBounds(locations, {
            padding: [40, 40],
            maxZoom: 13,
        });
    }, [locations, map]);

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

function getResourceIcon() {
    return L.divIcon({
        className: "custom-resource-marker",
        html: `<div style="
            width: 18px;
            height: 18px;
            background: #ea580c;
            border: 3px solid white;
            border-radius: 3px;
            box-shadow: 0 1px 5px rgba(0,0,0,0.5);
            transform: rotate(45deg);
        "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });
}

function hasValidCoordinates(latitudeValue, longitudeValue) {
    if (
        latitudeValue === null ||
        latitudeValue === undefined ||
        longitudeValue === null ||
        longitudeValue === undefined ||
        latitudeValue === "" ||
        longitudeValue === ""
    ) {
        return false;
    }

    const latitude = Number(latitudeValue);
    const longitude = Number(longitudeValue);

    return (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
}

export function MapView({ projects = [], resources = [] }) {
    const validProjects = useMemo(
        () =>
            projects.filter((project) =>
                hasValidCoordinates(
                    project.coordinates?.latitude,
                    project.coordinates?.longitude
                )
            ),
        [projects]
    );

    const validResources = useMemo(
        () =>
            resources.filter((resource) =>
                hasValidCoordinates(
                    resource.latitude,
                    resource.longitude
                )
            ),
        [resources]
    );

    const allLocations = useMemo(
        () => [
            ...validProjects.map((project) => [
                Number(project.coordinates.latitude),
                Number(project.coordinates.longitude),
            ]),
            ...validResources.map((resource) => [
                Number(resource.latitude),
                Number(resource.longitude),
            ]),
        ],
        [validProjects, validResources]
    );

    const center = allLocations.length
        ? allLocations[0]
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

                <MapBounds locations={allLocations} />

                {/* Project markers */}
                {validProjects.map((project) => (
                    <Marker
                        key={`project-${project._id}`}
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

                {/* Resource markers */}
                {validResources.map((resource) => (
                    <Marker
                        key={`resource-${resource._id}`}
                        position={[
                            Number(resource.latitude),
                            Number(resource.longitude),
                        ]}
                        icon={getResourceIcon()}
                    >
                        <Popup>
                            <div className="map-popup">
                                <strong>{resource.name}</strong>
                                <p>
                                    <b>Type:</b>{" "}
                                    {resource.category?.replace(/_/g, " ") || "Other"}
                                </p>
                                <p>
                                    <b>Department:</b>{" "}
                                    {resource.ownerDepartment?.name || "Unassigned"}
                                </p>
                                <p>
                                    <b>Status:</b> {resource.status || "Available"}
                                </p>
                                <p>
                                    <b>Quantity:</b>{" "}
                                    {resource.availableQuantity ?? 0} / {resource.quantity ?? 0}{" "}
                                    {resource.unit || ""}
                                </p>
                                <p>
                                    <b>Location:</b> {resource.location || "Not specified"}
                                </p>
                                <p>
                                    <b>Latitude:</b> {resource.latitude}
                                </p>
                                <p>
                                    <b>Longitude:</b> {resource.longitude}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <div className="map-legend">
                <strong>Map Legend</strong>

                <div>
                    <span className="legend-dot proposed"></span>
                    Proposed Project
                </div>

                <div>
                    <span className="legend-dot in-progress"></span>
                    In Progress Project
                </div>

                <div>
                    <span className="legend-dot completed"></span>
                    Completed Project
                </div>

                <div>
                    <span className="legend-dot cancelled"></span>
                    Cancelled Project
                </div>

                <div>
                    <span
                        style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                            background: "#ea580c",
                            borderRadius: "2px",
                            transform: "rotate(45deg)",
                            marginRight: "8px",
                        }}
                    ></span>
                    Resource
                </div>
            </div>
        </div>
    );
}
