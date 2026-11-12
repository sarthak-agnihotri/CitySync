import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Landmark, ArrowLeft, Lock, Mail, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { ThemeToggle } from "../../components/common/ThemeToggle";
import { LanguageToggle } from "../../components/common/LanguageToggle";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email.trim(), password);
      showToast("Signed in successfully to Municipal Portal", "success");
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
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
          <p className="brand-sub">{t("auth.portalSub")}</p>
        </div>

        <div className="auth-tabs">
          <span className="auth-tab active">{t("auth.tabSignIn")}</span>
          <Link to="/register" className="auth-tab">
            {t("auth.tabRegister")}
          </Link>
        </div>

        {error && (
          <div className="form-error flex items-start gap-2">
            <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">{t("auth.emailLabel")}</label>
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
                id="login-email"
                type="email"
                required
                autoFocus
                placeholder={t("auth.emailPlaceholder")}
                style={{ paddingLeft: 36, width: "100%" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">{t("auth.passwordLabel")}</label>
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
                id="login-password"
                type="password"
                required
                placeholder={t("auth.passwordPlaceholder")}
                style={{ paddingLeft: 36, width: "100%" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-inline" />
                <span>{t("auth.signingIn")}</span>
              </>
            ) : (
              t("auth.signInBtn")
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>{t("auth.newPersonnel")} </span>
          <Link to="/register" className="text-link">
            {t("auth.requestReg")}
          </Link>
        </div>
      </div>
    </div>
  );
}
