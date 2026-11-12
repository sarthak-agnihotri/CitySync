import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Landmark, ArrowLeft, User, Mail, Lock, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { ThemeToggle } from "../../components/common/ThemeToggle";
import { LanguageToggle } from "../../components/common/LanguageToggle";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password);
      showToast("Officer profile registered! Please sign in with your credentials.", "success");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed. Please check the details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary transition-colors py-1.5 px-3 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
        >
          <ArrowLeft size={14} />
          <span>{t("auth.returnPublic")}</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className="auth-card">
        <div className="brand">
          <div className="brand-icon">
            <Landmark size={28} />
          </div>
          <h1 className="brand-name">CitySync</h1>
          <p className="brand-sub">{t("auth.regSub")}</p>
        </div>

        <div className="auth-tabs">
          <Link to="/login" className="auth-tab">
            {t("auth.tabSignIn")}
          </Link>
          <span className="auth-tab active">{t("auth.tabRegister")}</span>
        </div>

        {error && (
          <div className="form-error flex items-start gap-2">
            <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-name">{t("auth.nameLabel")}</label>
            <div style={{ position: "relative" }}>
              <User
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  pointerEvents: "none"
                }}
              />
              <input
                id="reg-name"
                type="text"
                required
                autoFocus
                placeholder={t("auth.namePlaceholder")}
                style={{ paddingLeft: 36, width: "100%" }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">{t("auth.deptEmailLabel")}</label>
            <div style={{ position: "relative" }}>
              <Mail
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  pointerEvents: "none"
                }}
              />
              <input
                id="reg-email"
                type="email"
                required
                placeholder={t("auth.deptEmailPlaceholder")}
                style={{ paddingLeft: 36, width: "100%" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">{t("auth.regPassLabel")}</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  pointerEvents: "none"
                }}
              />
              <input
                id="reg-password"
                type="password"
                required
                minLength={8}
                placeholder={t("auth.regPassPlaceholder")}
                style={{ paddingLeft: 36, width: "100%" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">{t("auth.confirmPassLabel")}</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  pointerEvents: "none"
                }}
              />
              <input
                id="reg-confirm"
                type="password"
                required
                minLength={8}
                placeholder={t("auth.confirmPassPlaceholder")}
                style={{ paddingLeft: 36, width: "100%" }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-inline" />
                <span>{t("auth.registering")}</span>
              </>
            ) : (
              t("auth.registerBtn")
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>{t("auth.alreadyRegistered")} </span>
          <Link to="/login" className="text-link">
            {t("auth.signInLink")}
          </Link>
        </div>
      </div>
    </div>
  );
}
