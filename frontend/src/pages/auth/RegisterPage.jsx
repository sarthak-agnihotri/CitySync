import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Landmark, ArrowLeft, User, Mail, Lock, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { ThemeToggle } from "../../components/common/ThemeToggle";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
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
          <span>Return to Public Portal</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="auth-card">
        <div className="brand">
          <div className="brand-icon">
            <Landmark size={28} />
          </div>
          <h1 className="brand-name">CitySync</h1>
          <p className="brand-sub">Register Municipal Officer Account</p>
        </div>

        <div className="auth-tabs">
          <Link to="/login" className="auth-tab">
            Official Sign In
          </Link>
          <span className="auth-tab active">Register Officer</span>
        </div>

        {error && (
          <div className="form-error flex items-start gap-2">
            <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-name">Full Name & Rank</label>
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
                placeholder="e.g. Er. Rajiv Verma"
                style={{ paddingLeft: 36, width: "100%" }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Official Department Email</label>
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
                placeholder="e.g. rverma@pwd.citysync.gov"
                style={{ paddingLeft: 36, width: "100%" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password (minimum 8 characters)</label>
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
                placeholder="••••••••"
                style={{ paddingLeft: 36, width: "100%" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password</label>
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
                placeholder="••••••••"
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
                <span>Registering Personnel Profile...</span>
              </>
            ) : (
              "Submit Official Registration"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already registered in the directory? </span>
          <Link to="/login" className="text-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
