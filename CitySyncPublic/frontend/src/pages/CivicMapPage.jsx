import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  ThumbsUp,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { GrievanceAPI } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";

// Fix icons in Vite
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

// Custom colored SVG pin icons for status
const createStatusIcon = (status) => {
  let color = "#ef4444"; // red for submitted
  if (status === "resolved") color = "#059669"; // emerald
  else if (["in_progress", "assigned_to_dept", "under_review", "reopened"].includes(status)) color = "#d97706"; // amber

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
    <path fill="${color}" stroke="#ffffff" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>`;

  return L.divIcon({
    className: "custom-pin",
    html: svg,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28]
  });
};

function FitBounds({ locations }) {
  const map = useMap();
  useEffect(() => {
    if (!locations || locations.length === 0) return;
    if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 13);
      return;
    }
    const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [locations, map]);
  return null;
}

export function CivicMapPage() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { t, isHindi } = useLanguage();
  const { addToast } = useToast();

  useEffect(() => {
    GrievanceAPI.getMap()
      .then((data) => {
        setGrievances(data.grievances || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpvote = async (ticketId) => {
    try {
      const res = await GrievanceAPI.upvote(ticketId);
      addToast(
        res.alreadyUpvoted
          ? (isHindi ? "आप पहले ही समर्थन दर्ज कर चुके हैं" : "You have already upvoted this grievance")
          : (isHindi ? "समर्थन दर्ज किया गया (+1)" : "Upvoted! Priority escalated."),
        res.alreadyUpvoted ? "info" : "success"
      );
      setGrievances((prev) =>
        prev.map((g) => (g.ticketId === ticketId ? { ...g, upvotes: res.upvotes } : g))
      );
    } catch {
      addToast(isHindi ? "समर्थन दर्ज करने में विफल" : "Failed to upvote", "error");
    }
  };

  const filtered = grievances.filter((item) => {
    if (statusFilter !== "all") {
      if (statusFilter === "open" && item.status !== "submitted") return false;
      if (statusFilter === "in_progress" && !["in_progress", "assigned_to_dept", "under_review", "reopened"].includes(item.status)) return false;
      if (statusFilter === "resolved" && item.status !== "resolved") return false;
    }
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchTicket = item.ticketId?.toLowerCase().includes(q);
      const matchZone = item.zone?.toLowerCase().includes(q);
      if (!matchTitle && !matchTicket && !matchZone) return false;
    }
    return true;
  });

  const getStatusLabel = (status) => {
    if (status === "resolved") return isHindi ? "समाधान पूर्ण" : "Resolved";
    if (["in_progress", "assigned_to_dept", "under_review", "reopened"].includes(status)) {
      return isHindi ? "कार्य जारी / आवंटित" : "Under Action";
    }
    return isHindi ? "पंजीकृत / खुला" : "Reported";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{isHindi ? "लाइव नागरिक पारदर्शिता मानचित्र" : "Live Civic Transparency Map"}</span>
          </div>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">
            {isHindi ? "शहरी बुनियादी ढांचा एवं शिकायत मानचित्र" : "Citywide Infrastructure Grievance Map"}
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {isHindi
              ? "टूटी सड़कों, गड्ढों और रिसाव की लाइव भौगोलिक स्थिति देखें और प्रभावित नागरिकों का समर्थन करें।"
              : "Explore live geo-tagged potholes, broken roads, and utility leaks across municipal zones."}
          </p>
        </div>

        <Link
          to="/report"
          className="btn btn-primary text-xs py-2 px-4 shadow-sm self-start md:self-auto"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{isHindi ? "नई शिकायत दर्ज करें" : "Report New Issue"}</span>
        </Link>
      </div>

      {/* Control Strip & Filters */}
      <div className="surface-card p-4 flex flex-wrap items-center justify-between gap-3 border border-[var(--border-subtle)]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Buttons */}
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === "all"
                ? "bg-emerald-700 text-white"
                : "border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)]"
            }`}
          >
            {isHindi ? "सभी समस्याएं" : "All Issues"} ({grievances.length})
          </button>
          <button
            onClick={() => setStatusFilter("open")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "open"
                ? "bg-rose-700 text-white"
                : "border border-[var(--border-subtle)] text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>{isHindi ? "खुली शिकायतें" : "Reported / Open"}</span>
          </button>
          <button
            onClick={() => setStatusFilter("in_progress")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "in_progress"
                ? "bg-amber-600 text-white"
                : "border border-[var(--border-subtle)] text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{isHindi ? "कार्य प्रगति पर" : "In Progress"}</span>
          </button>
          <button
            onClick={() => setStatusFilter("resolved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "resolved"
                ? "bg-emerald-700 text-white"
                : "border border-[var(--border-subtle)] text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{isHindi ? "सत्यापित समाधान" : "Resolved"}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder={isHindi ? "टिकट संख्या या क्षेत्र खोजें..." : "Search by ticket or ward..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Map Display */}
      <div className="h-[520px] rounded-2xl overflow-hidden border border-[var(--border-subtle)] relative shadow-md">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-[var(--text-muted)] bg-[var(--bg-surface)]">
            {isHindi ? "नागरिक मानचित्र डेटा लोड हो रहा है..." : "Loading civic map coordinates..."}
          </div>
        ) : (
          <MapContainer
            center={[28.6139, 77.2090]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds locations={filtered.map((g) => ({ lat: g.lat, lng: g.lng }))} />

            {filtered.map((item) => (
              <Marker
                key={item.ticketId}
                position={[item.lat, item.lng]}
                icon={createStatusIcon(item.status)}
              >
                <Popup className="custom-popup">
                  <div className="p-1 space-y-2 max-w-xs text-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1">
                      <span className="font-mono font-bold text-emerald-800 text-[11px]">
                        {item.ticketId}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          item.status === "resolved"
                            ? "bg-emerald-100 text-emerald-800"
                            : ["in_progress", "assigned_to_dept", "under_review", "reopened"].includes(item.status)
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 line-clamp-1">{item.title}</h4>

                    <div className="text-[10px] text-slate-500">
                      📍 {item.zone} {item.landmark ? `• ${item.landmark}` : ""}
                    </div>

                    {item.images && item.images.length > 0 && (
                      <div className="w-full h-24 rounded overflow-hidden border border-slate-200 my-1">
                        <img
                          src={item.images[0].url.startsWith("http") ? item.images[0].url : `http://127.0.0.1:5001${item.images[0].url}`}
                          alt="Hazard preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpvote(item.ticketId)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 text-[10px] font-semibold cursor-pointer"
                        title="I am also facing this problem (+1)"
                      >
                        <ThumbsUp className="w-3 h-3 text-emerald-600" />
                        <span>Me Too ({item.upvotes || 0})</span>
                      </button>

                      <Link
                        to={`/track?ticket=${encodeURIComponent(item.ticketId)}`}
                        className="text-emerald-700 font-bold text-[10px] hover:underline flex items-center gap-0.5"
                      >
                        <span>{isHindi ? "ट्रैक करें" : "Track"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
