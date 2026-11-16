import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Landmark, Mail, Lock, ShieldCheck, Eye, EyeOff, X, KeyRound, CheckCircle2 } from "lucide-react";
import { useCitizenAuth } from "../context/CitizenAuthContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { CitizenAuthAPI } from "../api/client";

export function CitizenLoginPage() {
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/my-complaints";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState(1); // 1: Enter email, 2: Enter OTP & New Password
  const [receivedOtp, setReceivedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [resetNewPass, setResetNewPass] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { login } = useCitizenAuth();
  const { addToast } = useToast();
  const { t, isHindi } = useLanguage();
  const navigate = useNavigate();

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const res = await CitizenAuthAPI.forgotPassword(forgotEmail);
      setReceivedOtp(res.otp || "");
      setForgotStep(2);
      addToast(
        isHindi
          ? `सत्यापन कोड उत्पन्न: ${res.otp}`
          : `Verification code generated: ${res.otp}`,
        "info"
      );
    } catch (err) {
      addToast(err.message || (isHindi ? "अनुरोध विफल रहा" : "Failed to generate reset code"), "error");
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      await CitizenAuthAPI.resetPassword({
        email: forgotEmail,
        otp: enteredOtp,
        newPassword: resetNewPass
      });
      addToast(isHindi ? "पासवर्ड रीसेट हो गया! अब आप साइन इन कर सकते हैं।" : "Password reset! You can now sign in.", "success");
      setShowForgotModal(false);
      setForgotStep(1);
      setPassword(resetNewPass);
      setEmail(forgotEmail);
    } catch (err) {
      addToast(err.message || (isHindi ? "रीसेट विफल रहा" : "Reset failed"), "error");
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      addToast("Welcome back!", "success");
      navigate(redirectPath);
    } catch (err) {
      addToast(err.message || "Invalid credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold mx-auto mb-3 shadow-sm">
            <Landmark className="w-6 h-6 text-emerald-200" />
          </div>
          <h1 className="text-xl font-black text-[var(--text-primary)]">{t("citizenAuth.loginTitle")}</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {t("citizenAuth.loginSub")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              {t("citizenAuth.email")}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                placeholder={t("citizenAuth.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {t("citizenAuth.password")}
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotStep(1);
                  setShowForgotModal(true);
                }}
                className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {isHindi ? "पासवर्ड भूल गए?" : "Forgot Password?"}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder={t("citizenAuth.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-[var(--text-primary)] transition-colors cursor-pointer p-0.5"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm mt-2"
          >
            {loading ? t("citizenAuth.signingIn") : t("citizenAuth.signInBtn")}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)]">
          {t("citizenAuth.noAccount")}{" "}
          <Link
            to={redirectPath !== "/my-complaints" ? `/register?redirect=${encodeURIComponent(redirectPath)}` : "/register"}
            className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            {t("citizenAuth.registerHere")}
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {isHindi ? "पासवर्ड पुनर्प्राप्ति (रीसेट)" : "Citizen Password Recovery"}
              </h3>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotRequest} className="space-y-3">
                <p className="text-xs text-[var(--text-muted)]">
                  {isHindi
                    ? "अपना पंजीकृत ईमेल दर्ज करें। सत्यापन के लिए एक 6-अंकों का ओटीपी कोड जनरेट होगा।"
                    : "Enter your registered citizen email. A 6-digit verification code will be generated."}
                </p>
                <input
                  type="email"
                  required
                  placeholder="e.g. citizen@gmail.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full btn btn-primary text-xs py-2"
                >
                  {resetLoading ? "Processing..." : isHindi ? "सत्यापन कोड प्राप्त करें" : "Generate Reset Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs">
                  <span>{isHindi ? "सत्यापन कोड:" : "Your Reset OTP Code:"} </span>
                  <strong className="font-mono text-sm tracking-wider font-bold">{receivedOtp}</strong>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                    {isHindi ? "6-अंकों का ओटीपी कोड दर्ज करें" : "Enter 6-Digit Code"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 123456"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                    {isHindi ? "नया पासवर्ड (न्यूनतम 6 अक्षर)" : "New Password (Min 6 chars)"}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={resetNewPass}
                    onChange={(e) => setResetNewPass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full btn btn-primary text-xs py-2"
                  >
                    {resetLoading ? "Resetting..." : isHindi ? "पासवर्ड अपडेट करें" : "Set New Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="btn btn-secondary text-xs py-2 px-3"
                  >
                    {isHindi ? "पीछे" : "Back"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CitizenRegisterPage() {
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/report";
  const isFromReport = redirectPath.includes("/report");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: ""
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useCitizenAuth();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      addToast(t("citizenAuth.passwordMismatch") || "Passwords do not match", "error");
      return;
    }
    if (formData.password.length < 6) {
      addToast("Password must be at least 6 characters long", "error");
      return;
    }
    setLoading(true);
    try {
      await register(formData);
      addToast("Account created successfully! You can now file your complaint.", "success");
      navigate(redirectPath);
    } catch (err) {
      addToast(err.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      {isFromReport && (
        <div className="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>{t("citizenAuth.regRequiredTitle")}:</strong> {t("citizenAuth.regRequiredSub")}
          </span>
        </div>
      )}

      <div className="p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold mx-auto mb-3 shadow-sm">
            <Landmark className="w-6 h-6 text-emerald-200" />
          </div>
          <h1 className="text-xl font-black text-[var(--text-primary)]">{t("citizenAuth.regTitle")}</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {t("citizenAuth.regSub")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              {t("citizenAuth.fullName")}
            </label>
            <input
              type="text"
              required
              placeholder={t("citizenAuth.namePlaceholder")}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              {t("citizenAuth.email")}
            </label>
            <input
              type="email"
              required
              placeholder={t("citizenAuth.emailPlaceholder")}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              {t("citizenAuth.phone")}
            </label>
            <input
              type="tel"
              placeholder={t("citizenAuth.phonePlaceholder")}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              {t("citizenAuth.address")}
            </label>
            <input
              type="text"
              placeholder={t("citizenAuth.addressPlaceholder")}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              {t("citizenAuth.password")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder={t("citizenAuth.passwordPlaceholder")}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-3 pr-10 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-2 text-slate-400 hover:text-[var(--text-primary)] transition-colors cursor-pointer p-0.5"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              {t("citizenAuth.confirmPassword")}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder={t("citizenAuth.confirmPasswordPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-3 pr-10 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-2 text-slate-400 hover:text-[var(--text-primary)] transition-colors cursor-pointer p-0.5"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm mt-3"
          >
            {loading ? t("citizenAuth.creating") : t("citizenAuth.createBtn")}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)]">
          {t("citizenAuth.alreadyHave")}{" "}
          <Link
            to={redirectPath !== "/report" ? `/login?redirect=${encodeURIComponent(redirectPath)}` : "/login?redirect=/report"}
            className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            {t("citizenAuth.signInHere")}
          </Link>
        </div>
      </div>
    </div>
  );
}
