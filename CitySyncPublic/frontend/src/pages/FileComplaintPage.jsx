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
import { LocationPickerMap } from "../components/common/LocationPickerMap";

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
            <div className="text-2xl font-black font-mono text-emerald-900 dark:text-emerald-300 dark:text-emerald-200 mt-1 select-all">
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
    <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-700 p-7 sm:p-10 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-50 mb-4">
            <MapPin size={14} />
            CITYSYNC · CITIZEN SERVICES
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {t("report.pageTitle")}
          </h1>

          <p className="mt-3 text-sm sm:text-base leading-relaxed text-emerald-50/90">
            {t("report.pageSubtitle")}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-8 shadow-xl shadow-slate-200/40 space-y-8"
      >

        {/* Modern Category Selection */}
        <div>
          <div className="mb-4">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              {t("report.categoryLabel")}
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Select the civic issue you want to report
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORY_DATA.map((cat, index) => {
              const categoryIcons = [
                "🛣️",
                "🚧",
                "💧",
                "🚰",
                "💡",
                "🗑️",
                "🚦",
                "🏙️"
              ];

              const selected = formData.category === cat.id;

              return (
                <label
                  key={cat.id}
                  className={`relative flex items-start gap-3 rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${selected
                    ? "border-emerald-600 bg-emerald-50 shadow-md shadow-emerald-100 dark:bg-emerald-950/30 dark:shadow-none"
                    : "border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-emerald-500"
                    }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.id}
                    checked={selected}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value
                      }))
                    }
                    className="sr-only"
                  />

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl ${selected
                      ? "bg-emerald-100 dark:bg-emerald-900/50"
                      : "bg-[var(--bg-surface-secondary)]"
                      }`}
                  >
                    {categoryIcons[index]}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className={`text-sm font-bold ${selected ? "text-emerald-900 dark:text-emerald-300" : "text-[var(--text-primary)]"
                      }`}>
                      {isHindi ? cat.labelHi : cat.labelEn}
                    </h3>

                    <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
                      {isHindi ? "संबंधित विभाग" : "Assigned to"}:{" "}
                      {isHindi ? cat.deptHi : cat.deptEn}
                    </p>
                  </div>

                  {selected && (
                    <CheckCircle2
                      size={19}
                      className="absolute right-3 top-3 shrink-0 text-emerald-600"
                    />
                  )}
                </label>
              );
            })}
          </div>
        </div>



        {/* Modern Complaint Details */}
        <div className="space-y-5">
          <div>
            <div className="mb-3">
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                {isHindi ? "शिकायत का विवरण" : "Complaint Details"}
              </h2>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {isHindi
                  ? "अपनी समस्या के बारे में विस्तार से बताएं"
                  : "Provide details to help the concerned department understand the issue"}
              </p>
            </div>

            <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
              {t("report.titleLabel")} <span className="text-rose-500">*</span>
            </label>

            <input
              type="text"
              required
              placeholder={t("report.titlePlaceholder")}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-4 py-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all focus:border-emerald-500 focus:bg-[var(--bg-surface)] focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
              {t("report.descLabel")} <span className="text-rose-500">*</span>
            </label>

            <textarea
              required
              rows={5}
              placeholder={t("report.descPlaceholder")}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-4 py-3.5 text-sm leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all focus:border-emerald-500 focus:bg-[var(--bg-surface)] focus:ring-4 focus:ring-emerald-500/10"
            />

            <p className="mt-2 text-right text-xs text-[var(--text-muted)]">
              {formData.description.length} characters
            </p>
          </div>
        </div>


        
{/* Modern Photo Evidence Upload */}
<div>
  <div className="mb-3">
    <h2 className="text-base font-bold text-[var(--text-primary)]">
      {t("report.photosLabel")}
    </h2>
    <p className="mt-1 text-xs text-[var(--text-muted)]">
      Upload photographs to help authorities understand the issue
    </p>
  </div>

  <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20 p-6 text-center transition-all hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
    <input
      type="file"
      id="photo-upload"
      accept="image/jpeg,image/png,image/webp"
      multiple
      onChange={handleImageChange}
      className="hidden"
    />

    <label
      htmlFor="photo-upload"
      className="flex cursor-pointer flex-col items-center"
    >
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm dark:bg-[var(--bg-surface)] dark:text-emerald-300">
        <Camera size={27} />
      </div>

      <span className="text-sm font-bold text-[var(--text-primary)]">
        Click to upload complaint photos
      </span>

      <span className="mt-1 text-xs text-[var(--text-muted)]">
        JPEG, PNG or WEBP · Maximum 5MB per photo
      </span>

      <span className="mt-3 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white">
        Browse Photos
      </span>
    </label>
  </div>

  {imagePreviews.length > 0 && (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-bold text-[var(--text-primary)]">
          Uploaded Photos
        </span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          {imagePreviews.length}/3 Photos
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {imagePreviews.map((src, i) => (
          <div
            key={i}
            className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] shadow-sm"
          >
            <img
              src={src}
              alt={`Complaint evidence ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <button
              type="button"
              onClick={() => removeImage(i)}
              aria-label={`Remove photo ${i + 1}`}
              className="absolute right-2 top-2 rounded-full bg-slate-900/80 p-1.5 text-white transition-colors hover:bg-rose-600"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )}
</div>


        
        {/* Location & Ward Pinning */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Administrative Zone */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm transition-all hover:border-emerald-200">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <MapPin size={21} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {t("report.zoneLabel")}
                </h3>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  Select the area where the issue is located
                </p>
              </div>
            </div>

            <select
              value={formData.zone}
              onChange={(e) =>
                setFormData({ ...formData, zone: e.target.value })
              }
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-emerald-500 focus:bg-[var(--bg-surface)] focus:ring-4 focus:ring-emerald-500/10"
            >
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          {/* Nearby Landmark */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm transition-all hover:border-emerald-200">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                <Navigation size={21} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {t("report.landmarkLabel")}
                </h3>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  Add a nearby landmark for easy identification
                </p>
              </div>
            </div>

            <input
              type="text"
              placeholder={t("report.landmarkPlaceholder")}
              value={formData.landmark}
              onChange={(e) =>
                setFormData({ ...formData, landmark: e.target.value })
              }
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-emerald-500 focus:bg-[var(--bg-surface)] focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>


        
        {/* GPS Coordinates Button & Map Pin Drop */}
        <div className="space-y-5">
          {/* GPS Status Card */}
          <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm dark:border-emerald-800 dark:from-emerald-950/40 dark:to-teal-950/40">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm dark:bg-[var(--bg-surface)] dark:text-emerald-300">
                  <MapPin size={23} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {formData.latitude && formData.longitude
                      ? t("report.gpsPinned")
                      : t("report.pinGps")}
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {formData.latitude && formData.longitude
                      ? `${formData.latitude}, ${formData.longitude}`
                      : t("report.gpsDesc")}
                  </p>

                  {formData.latitude && formData.longitude && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                      <CheckCircle2 size={12} />
                      Location selected
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={locating}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-xs font-bold text-white shadow-md transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Navigation size={15} />
                {locating ? t("report.gpsAcquiring") : t("report.gpsBtn")}
              </button>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {isHindi
                  ? "मानचित्र पर सटीक स्थान चुनें"
                  : "Pinpoint Location on Map"}
              </h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {isHindi
                  ? "पिन को खींचें या मानचित्र पर क्लिक करें"
                  : "Click anywhere on the map or drag the pin to mark the exact issue location."}
              </p>
            </div>

            <LocationPickerMap
              latitude={formData.latitude}
              longitude={formData.longitude}
              zone={formData.zone}
              onSelectLocation={(lat, lng) => {
                setFormData((prev) => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng
                }));
              }}
            />
          </div>
        </div>


        
        {/* Citizen Contact (Pre-filled from registered account) */}
        <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] px-5 py-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {t("report.complainantInfo")}
              </h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Your registered account information
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 dark:border-emerald-800 dark:bg-emerald-950/40 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              <CheckCircle2 size={13} />
              {t("report.verified")}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-4">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {t("report.name")}
              </span>
              <p className="break-words text-sm font-semibold text-[var(--text-primary)]">
                {user?.name || "—"}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-4">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {t("report.email")}
              </span>
              <p className="break-words text-sm font-semibold text-[var(--text-primary)]">
                {user?.email || "—"}
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-4">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {t("report.mobile")}
              </span>
              <p className="break-words text-sm font-semibold text-[var(--text-primary)]">
                {user?.phone || t("report.notProvided")}
              </p>
            </div>
          </div>
        </div>


        
        <button
          type="submit"
          disabled={submitting}
          className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-700 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:from-emerald-800 hover:to-teal-800 hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {t("report.submitting")}
            </>
          ) : (
            <>
              <FileText size={19} />
              {t("report.submitBtn")}
              <span className="text-lg transition-transform group-hover:translate-x-1">
                →
              </span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}



