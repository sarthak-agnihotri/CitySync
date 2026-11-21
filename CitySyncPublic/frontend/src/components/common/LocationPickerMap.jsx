
import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap
} from "react-leaflet";
import L from "leaflet";
import { MapPin, LocateFixed, Move, Crosshair } from "lucide-react";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });

  return null;
}

function RecenterMap({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 15), {
        duration: 0.8
      });
    }
  }, [lat, lng, map]);

  return null;
}

export function LocationPickerMap({
  latitude,
  longitude,
  onSelectLocation,
  zone
}) {
  const defaultCenter = [28.6139, 77.2090];

  const hasLocation =
    latitude !== "" &&
    longitude !== "" &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude));

  const currentPos = hasLocation
    ? [Number(latitude), Number(longitude)]
    : defaultCenter;

  const handleLocationSelect = (lat, lng) => {
    onSelectLocation(lat.toFixed(6), lng.toFixed(6));
  };

  const handleMarkerDragEnd = (e) => {
    const position = e.target.getLatLng();
    handleLocationSelect(position.lat, position.lng);
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg">

      {/* Map Header */}
      <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <MapPin size={21} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Pinpoint Complaint Location
            </h3>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Select the exact location of the civic issue
            </p>
          </div>
        </div>

        <div
          className={`flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
            hasLocation
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              hasLocation ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          {hasLocation ? "Location selected" : "Awaiting location"}
        </div>
      </div>

      {/* Map Area */}
      <div className="relative h-[320px] w-full bg-[var(--bg-surface-secondary)] sm:h-[380px]">

        <MapContainer
          center={currentPos}
          zoom={hasLocation ? 15 : 13}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onLocationSelect={handleLocationSelect} />

          {hasLocation && (
            <>
              <Marker
                position={currentPos}
                draggable={true}
                eventHandlers={{
                  dragend: handleMarkerDragEnd
                }}
              />

              <RecenterMap
                lat={currentPos[0]}
                lng={currentPos[1]}
              />
            </>
          )}
        </MapContainer>

        {/* Floating Map Instruction */}
        <div className="absolute left-3 top-3 z-[1000] flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 shadow-md backdrop-blur-sm">
          <Move size={15} className="text-emerald-600" />
          <span className="text-[11px] font-semibold text-[var(--text-primary)]">
            Click map or drag pin
          </span>
        </div>

        {/* Location Indicator */}
        <div className="absolute right-3 top-3 z-[1000] flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-emerald-700 dark:text-emerald-300 shadow-md">
          <Crosshair size={17} />
        </div>
      </div>

      {/* Coordinates Footer */}
      <div className="flex flex-col gap-3 bg-[var(--bg-surface)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <LocateFixed size={18} />
          </div>

          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">
              {hasLocation ? "Selected Coordinates" : "No location selected"}
            </p>

            <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">
              {hasLocation
                ? `${latitude}, ${longitude}`
                : "Use Auto-Pin or click anywhere on the map"}
            </p>
          </div>
        </div>

        {zone && (
          <div className="rounded-lg bg-[var(--bg-surface-secondary)] px-3 py-2 text-[11px] font-medium text-[var(--text-secondary)]">
            Administrative Zone: {zone}
          </div>
        )}
      </div>
    </div>
  );
}


