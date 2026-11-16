import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Eye,
  EyeOff
} from "lucide-react";
import { useCitizenAuth } from "../context/CitizenAuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { CitizenAuthAPI } from "../api/client";

export function CitizenProfilePage() {
  const { user, updateUser } = useCitizenAuth();
  const { t, isHindi } = useLanguage();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || ""
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await CitizenAuthAPI.updateProfile(formData);
      updateUser(res.user);
      addToast(isHindi ? "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!" : "Profile updated successfully!", "success");
    } catch (err) {
      addToast(err.message || (isHindi ? "अपडेट विफल रहा" : "Failed to update profile"), "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      addToast(isHindi ? "नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते" : "New passwords do not match", "error");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      addToast(isHindi ? "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए" : "Password must be at least 6 characters", "error");
      return;
    }

    setChangingPassword(true);
    try {
      await CitizenAuthAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      addToast(isHindi ? "पासवर्ड सफलतापूर्वक बदला गया!" : "Password changed successfully!", "success");
      setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      addToast(err.message || (isHindi ? "पासवर्ड बदलने में विफल" : "Failed to change password"), "error");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Profile Header */}
      <div className="surface-card p-6 border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
          {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl font-black text-[var(--text-primary)]">{user?.name}</h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {isHindi ? "सत्यापित नागरिक" : "Verified Citizen"}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[var(--text-secondary)] pt-2">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              {user?.phone || (isHindi ? "मोबाइल नंबर दर्ज नहीं" : "No mobile linked")}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {user?.address || (isHindi ? "वार्ड पता दर्ज नहीं" : "No default address")}
            </span>
          </div>
        </div>
        <Link
          to="/my-complaints"
          className="btn btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 shrink-0 self-center sm:self-start"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{isHindi ? "मेरी शिकायतें" : "My Complaints"}</span>
        </Link>
      </div>

      {/* Edit Profile Form */}
      <div className="surface-card p-6 border border-[var(--border-subtle)] space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            {isHindi ? "नागरिक प्रोफ़ाइल विवरण संपादित करें" : "Edit Citizen Profile Details"}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {isHindi
              ? "यह विवरण आपकी भविष्य की नगर निगम शिकायतों में स्वतः भरा जाएगा।"
              : "This contact information is pre-filled when reporting broken infrastructure."}
          </p>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              {isHindi ? "पूरा नाम" : "Full Name"}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                {isHindi ? "मोबाइल नंबर" : "Mobile Number"}
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                {isHindi ? "निवास का पता / वार्ड" : "Residential Address / Ward"}
              </label>
              <input
                type="text"
                placeholder="e.g. Sector 15, Ward 3"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updatingProfile}
            className="btn btn-primary text-xs py-2 px-4 cursor-pointer"
          >
            {updatingProfile
              ? (isHindi ? "अपडेट हो रहा है..." : "Saving Changes...")
              : (isHindi ? "विवरण सहेजें" : "Save Profile Details")}
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="surface-card p-6 border border-[var(--border-subtle)] space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            {isHindi ? "सुरक्षा एवं पासवर्ड बदलें" : "Security & Change Password"}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {isHindi ? "अपने खाते को सुरक्षित रखने के लिए एक मजबूत पासवर्ड चुनें।" : "Ensure your citizen account uses a strong password."}
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              {isHindi ? "वर्तमान पासवर्ड" : "Current Password"}
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full pl-3 pr-10 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3 top-2 text-slate-400 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                {isHindi ? "नया पासवर्ड" : "New Password"}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  placeholder="Min 6 characters"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full pl-3 pr-10 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                {isHindi ? "नए पासवर्ड की पुष्टि करें" : "Confirm New Password"}
              </label>
              <input
                type="password"
                required
                value={passwordData.confirmNewPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="btn btn-secondary text-xs py-2 px-4 cursor-pointer"
          >
            {changingPassword
              ? (isHindi ? "अपडेट हो रहा है..." : "Updating Password...")
              : (isHindi ? "पासवर्ड अपडेट करें" : "Update Password")}
          </button>
        </form>
      </div>
    </div>
  );
}
