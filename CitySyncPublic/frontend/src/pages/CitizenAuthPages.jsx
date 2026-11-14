import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Landmark, Mail, Lock, ShieldCheck } from "lucide-react";
import { useCitizenAuth } from "../context/CitizenAuthContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";

export function CitizenLoginPage() {
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/my-complaints";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useCitizenAuth();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

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
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
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
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              {t("citizenAuth.password")}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
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
  const [loading, setLoading] = useState(false);
  const { register } = useCitizenAuth();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
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
