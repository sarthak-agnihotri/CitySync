import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
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
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

export function LocationPickerMap({ latitude, longitude, onSelectLocation, zone }) {
  // Default central coordinates (New Delhi civic center)
  const defaultCenter = [28.6139, 77.2090];
  const currentPos = latitude && longitude ? [parseFloat(latitude), parseFloat(longitude)] : defaultCenter;

  const handleMarkerDragEnd = (e) => {
    const marker = e.target;
    const position = marker.getLatLng();
    onSelectLocation(position.lat.toFixed(6), position.lng.toFixed(6));
  };

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-[var(--border-subtle)] relative shadow-xs">
      <MapContainer
        center={currentPos}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler
          onLocationSelect={(lat, lng) => onSelectLocation(lat.toFixed(6), lng.toFixed(6))}
        />
        {latitude && longitude && (
          <>
            <Marker
              position={[parseFloat(latitude), parseFloat(longitude)]}
              draggable={true}
              eventHandlers={{
                dragend: handleMarkerDragEnd
              }}
            />
            <RecenterMap lat={parseFloat(latitude)} lng={parseFloat(longitude)} />
          </>
        )}
      </MapContainer>
      <div className="absolute bottom-2 left-2 right-2 bg-black/75 text-white text-[11px] px-3 py-1.5 rounded-lg z-[1000] backdrop-blur-xs flex items-center justify-between pointer-events-none">
        <span>📍 Click or drag pin to exact road point</span>
        <span className="font-mono font-bold">
          {latitude && longitude ? `${latitude}, ${longitude}` : "No coordinates selected"}
        </span>
      </div>
    </div>
  );
}
