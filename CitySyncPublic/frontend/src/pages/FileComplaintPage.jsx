import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  MapPin,
  Upload,
  AlertCircle,
  CheckCircle2,
  X,
  Navigation,
  FileText
} from "lucide-react";
import { useCitizenAuth } from "../context/CitizenAuthContext";
import { useToast } from "../context/ToastContext";
import { GrievanceAPI } from "../api/client";

const CATEGORIES = [
  { id: "pothole", label: "Pothole / Road Damage", dept: "Public Works Dept" },
  { id: "broken_road", label: "Broken / Unpaved Road", dept: "Public Works Dept" },
  { id: "water_leakage", label: "Water Pipe Rupture / Leak", dept: "Water Supply Board" },
  { id: "sewage_overflow", label: "Sewage Overflow / Blockage", dept: "Water & Sewerage Board" },
  { id: "street_light", label: "Faulty Streetlight / Dark Spot", dept: "Electricity DISCOM" },
  { id: "garbage_dumping", label: "Illegal Garbage Dumping", dept: "Solid Waste Division" },
  { id: "traffic_signal", label: "Damaged Traffic Sign / Signal", dept: "Traffic Division" },
  { id: "other", label: "Other Civic Problem", dept: "General Municipal Support" }
];

const ZONES = [
  "Zone 1 - Central Ward",
  "Zone 2 - North Ridge",
  "Zone 3 - West District",
  "Zone 4 - South Extension",
  "Zone 5 - Eastern Industrial Belt"
];

export function FileComplaintPage() {
  const { user } = useCitizenAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    citizenName: user?.name || "",
    citizenPhone: user?.phone || "",
    citizenEmail: user?.email || "",
    category: "pothole",
    title: "",
    description: "",
    zone: "Zone 1 - Central Ward",
    landmark: "",
    latitude: "",
    longitude: ""
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      addToast("You can upload a maximum of 3 photos", "error");
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        addToast(`${file.name} is larger than 5MB`, "error");
        return false;
      }
      return true;
    });

    const newImages = [...images, ...validFiles];
    setImages(newImages);

    // Create previews
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      addToast("Geolocation is not supported by your browser", "error");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6)
        }));
        setLocating(false);
        addToast("Location pinned from GPS coordinates", "success");
      },
      (err) => {
        setLocating(false);
        addToast("Unable to fetch location: " + err.message, "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      addToast("Please provide both title and detailed description", "error");
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });

      images.forEach((file) => {
        data.append("images", file);
      });

      const res = await GrievanceAPI.submit(data);
      setSubmittedTicket(res.ticketId);
      addToast("Grievance registered successfully!", "success");
    } catch (err) {
      addToast(err.message || "Failed to submit grievance", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedTicket) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[var(--text-primary)]">Grievance Registered</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-2 max-w-sm">
            Your complaint has been logged and assigned to the relevant department engineers for inspection.
          </p>

          <div className="my-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 w-full">
            <span className="text-xs uppercase font-bold text-emerald-800 dark:text-emerald-300">
              Your Grievance Tracking ID
            </span>
            <div className="text-2xl font-black font-mono text-emerald-900 dark:text-emerald-200 mt-1 select-all">
              {submittedTicket}
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
              Save this code to check resolution progress anytime
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => navigate(`/track?ticket=${encodeURIComponent(submittedTicket)}`)}
              className="flex-1 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs cursor-pointer shadow-sm"
            >
              Track Live Status
            </button>
            <button
              onClick={() => {
                setSubmittedTicket(null);
                setFormData({
                  citizenName: user?.name || "",
                  citizenPhone: user?.phone || "",
                  citizenEmail: user?.email || "",
                  category: "pothole",
                  title: "",
                  description: "",
                  zone: "Zone 1 - Central Ward",
                  landmark: "",
                  latitude: "",
                  longitude: ""
                });
                setImages([]);
                setImagePreviews([]);
              }}
              className="flex-1 py-2.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)] font-semibold text-xs cursor-pointer"
            >
              File Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[var(--text-primary)]">
          Report Civic Issue / Damaged Road
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Provide accurate details and photos to help field officers locate and repair the issue promptly.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-6"
      >
        {/* Category Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            Issue Category *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CATEGORIES.map((cat) => (
              <label
                key={cat.id}
                className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  formData.category === cat.id
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-950 dark:text-emerald-200 font-semibold"
                    : "border-[var(--border-subtle)] hover:bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)]"
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.id}
                  checked={formData.category === cat.id}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-0.5 accent-emerald-700"
                />
                <div>
                  <div className="font-bold text-[var(--text-primary)]">{cat.label}</div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Assigned to: {cat.dept}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Short Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hazardous pothole opposite bus stop"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Detailed Problem Statement *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the severity, duration of the issue, and specific road hazard caused..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
            />
          </div>
        </div>

        {/* Photo Evidence Upload */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
            Photo Evidence (Max 3 Images, up to 5MB each)
          </label>
          <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-5 text-center bg-[var(--bg-surface-secondary)]/50">
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center">
              <Camera className="w-8 h-8 text-emerald-700 dark:text-emerald-400 mb-2" />
              <span className="text-xs font-bold text-[var(--text-primary)]">
                Click to snap or upload photos from device
              </span>
              <span className="text-[11px] text-[var(--text-muted)] mt-1">
                JPEG, PNG, or WebP formats supported
              </span>
            </label>
          </div>

          {/* Previews */}
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--border-subtle)] shadow-xs">
                  <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-rose-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location & Ward Pinning */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Administrative Zone *
            </label>
            <select
              value={formData.zone}
              onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Nearest Landmark / Address
            </label>
            <input
              type="text"
              placeholder="e.g. Near Mother Dairy, Gate 2"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* GPS Coordinates Button */}
        <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {formData.latitude && formData.longitude
                  ? `GPS Pinned: ${formData.latitude}, ${formData.longitude}`
                  : "Pin Precise GPS Location (Recommended)"}
              </span>
              <p className="text-[10px] text-[var(--text-muted)]">
                Helps road repair vans navigate directly to the site.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={locating}
            className="px-3 py-1.5 rounded-lg border border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold cursor-pointer shrink-0"
          >
            {locating ? "Acquiring GPS..." : "Auto-Pin Location"}
          </button>
        </div>

        {/* Citizen Contact (Optional if already logged in) */}
        {!user && (
          <div className="p-4 rounded-xl border border-[var(--border-subtle)] space-y-3">
            <div className="text-xs font-bold text-[var(--text-primary)]">
              Contact Details for Updates (Optional)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.citizenName}
                onChange={(e) => setFormData({ ...formData, citizenName: e.target.value })}
                className="px-3 py-2 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] bg-transparent"
              />
              <input
                type="tel"
                placeholder="Mobile (for SMS update)"
                value={formData.citizenPhone}
                onChange={(e) => setFormData({ ...formData, citizenPhone: e.target.value })}
                className="px-3 py-2 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] bg-transparent"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.citizenEmail}
                onChange={(e) => setFormData({ ...formData, citizenEmail: e.target.value })}
                className="px-3 py-2 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] bg-transparent"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-sm transition-colors cursor-pointer shadow-md"
        >
          {submitting ? "Registering Grievance with Municipality..." : "Submit Grievance to CitySync"}
        </button>
      </form>
    </div>
  );
}

