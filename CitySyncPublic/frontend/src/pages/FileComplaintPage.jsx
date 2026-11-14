import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  MapPin,
  CheckCircle2,
  X,
  Navigation,
  FileText
} from "lucide-react";
import { useCitizenAuth } from "../context/CitizenAuthContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { GrievanceAPI } from "../api/client";

const CATEGORY_DATA = [
  { id: "pothole", labelEn: "Pothole / Road Damage", labelHi: "गड्ढा / टूटी सड़क", deptEn: "Public Works Dept", deptHi: "लोक निर्माण विभाग (PWD)" },
  { id: "broken_road", labelEn: "Broken / Unpaved Road", labelHi: "टूटी / कच्ची सड़क", deptEn: "Public Works Dept", deptHi: "लोक निर्माण विभाग (PWD)" },
  { id: "water_leakage", labelEn: "Water Pipe Rupture / Leak", labelHi: "पानी की पाइपलाइन रिसाव / टूटन", deptEn: "Water Supply Board", deptHi: "जल आपूर्ति बोर्ड" },
  { id: "sewage_overflow", labelEn: "Sewage Overflow / Blockage", labelHi: "सीवर ओवरफ्लो / जाम", deptEn: "Water & Sewerage Board", deptHi: "जल एवं सीवरेज बोर्ड" },
  { id: "street_light", labelEn: "Faulty Streetlight / Dark Spot", labelHi: "खराब स्ट्रीट लाइट / अंधेरा", deptEn: "Electricity DISCOM", deptHi: "विद्युत वितरण निगम" },
  { id: "garbage_dumping", labelEn: "Illegal Garbage Dumping", labelHi: "कचरे का अवैध ढेर", deptEn: "Solid Waste Division", deptHi: "ठोस अपशिष्ट प्रबंधन" },
  { id: "traffic_signal", labelEn: "Damaged Traffic Sign / Signal", labelHi: "क्षतिग्रस्त ट्रैफिक सिग्नल / साइन", deptEn: "Traffic Division", deptHi: "यातायात प्रभाग" },
  { id: "other", labelEn: "Other Civic Problem", labelHi: "अन्य नागरिक समस्या", deptEn: "General Municipal Support", deptHi: "सामान्य नगरपालिका सहायता" }
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
  const { t, isHindi } = useLanguage();
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
      addToast(isHindi ? "आप अधिकतम 3 फोटो अपलोड कर सकते हैं" : "You can upload a maximum of 3 photos", "error");
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        addToast(`${file.name} ${isHindi ? "5MB से बड़ा है" : "is larger than 5MB"}`, "error");
        return false;
      }
      return true;
    });

    const newImages = [...images, ...validFiles];
    setImages(newImages);

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      addToast(isHindi ? "आपके ब्राउज़र में जीपीएस समर्थित नहीं है" : "Geolocation is not supported by your browser", "error");
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
        addToast(isHindi ? "जीपीएस स्थान सफलतापूर्वक प्राप्त किया गया" : "GPS coordinates acquired accurately", "success");
      },
      (err) => {
        setLocating(false);
        addToast(err.message || (isHindi ? "स्थान प्राप्त करने में असमर्थ" : "Unable to retrieve device location"), "error");
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      addToast(isHindi ? "कृपया शीर्षक और समस्या विवरण भरें" : "Please fill in the title and description", "error");
      return;
    }

    setSubmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append("citizenName", user?.name || formData.citizenName);
      formPayload.append("citizenPhone", user?.phone || formData.citizenPhone);
      formPayload.append("citizenEmail", user?.email || formData.citizenEmail);
      formPayload.append("category", formData.category);
      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description);
      formPayload.append("zone", formData.zone);
      formPayload.append("landmark", formData.landmark);
      if (formData.latitude) formPayload.append("latitude", formData.latitude);
      if (formData.longitude) formPayload.append("longitude", formData.longitude);

      images.forEach((img) => {
        formPayload.append("images", img);
      });

      const res = await GrievanceAPI.submit(formPayload);
      setSubmittedTicket(res.grievance.ticketId);
      addToast(isHindi ? "शिकायत सफलतापूर्वक दर्ज की गई!" : "Complaint registered successfully!", "success");
    } catch (err) {
      addToast(err.message || (isHindi ? "शिकायत दर्ज करने में विफल" : "Failed to lodge grievance"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedTicket) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center flex flex-col items-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {t("report.successTitle")}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-2 max-w-sm">
            {t("report.successDesc")}
          </p>

          <div className="my-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 w-full">
            <span className="text-xs uppercase font-bold text-emerald-800 dark:text-emerald-300">
              {t("report.trackingIdLabel")}
            </span>
            <div className="text-2xl font-black font-mono text-emerald-900 dark:text-emerald-200 mt-1 select-all">
              {submittedTicket}
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
              {t("report.trackingIdSub")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => navigate(`/track?ticket=${encodeURIComponent(submittedTicket)}`)}
              className="flex-1 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs cursor-pointer shadow-sm"
            >
              {t("report.trackBtn")}
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
              {t("report.anotherBtn")}
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
          {t("report.pageTitle")}
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {t("report.pageSubtitle")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-6"
      >
        {/* Category Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            {t("report.categoryLabel")}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CATEGORY_DATA.map((cat) => (
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
                  <div className="font-bold text-[var(--text-primary)]">
                    {isHindi ? cat.labelHi : cat.labelEn}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {isHindi ? "संबंधित विभाग" : "Assigned to"}: {isHindi ? cat.deptHi : cat.deptEn}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              {t("report.titleLabel")}
            </label>
            <input
              type="text"
              required
              placeholder={t("report.titlePlaceholder")}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              {t("report.descLabel")}
            </label>
            <textarea
              required
              rows={4}
              placeholder={t("report.descPlaceholder")}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
            />
          </div>
        </div>

        {/* Photo Evidence Upload */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
            {t("report.photosLabel")}
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
                {t("report.uploadClick")}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] mt-1">
                {t("report.uploadFormats")}
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
              {t("report.zoneLabel")}
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
              {t("report.landmarkLabel")}
            </label>
            <input
              type="text"
              placeholder={t("report.landmarkPlaceholder")}
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                  ? `${t("report.gpsPinned")}: ${formData.latitude}, ${formData.longitude}`
                  : t("report.pinGps")}
              </span>
              <p className="text-[10px] text-[var(--text-muted)]">
                {t("report.gpsDesc")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={locating}
            className="px-3 py-1.5 rounded-lg border border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold cursor-pointer shrink-0"
          >
            {locating ? t("report.gpsAcquiring") : t("report.gpsBtn")}
          </button>
        </div>

        {/* Citizen Contact (Pre-filled from registered account) */}
        <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-primary)]">
              {t("report.complainantInfo")}
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {t("report.verified")}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[var(--text-secondary)] pt-1">
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block">{t("report.name")}:</span>
              <strong className="text-[var(--text-primary)]">{user?.name}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block">{t("report.email")}:</span>
              <strong className="text-[var(--text-primary)]">{user?.email}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block">{t("report.mobile")}:</span>
              <strong className="text-[var(--text-primary)]">{user?.phone || t("report.notProvided")}</strong>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-sm transition-colors cursor-pointer shadow-md"
        >
          {submitting ? t("report.submitting") : t("report.submitBtn")}
        </button>
      </form>
    </div>
  );
}
