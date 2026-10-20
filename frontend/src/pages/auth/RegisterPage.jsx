import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

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
      showToast("Account created successfully! Please sign in.", "success");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed. Please check the details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-icon">🏙️</div>
          <h1 className="brand-name">CitySync</h1>
          <p className="brand-sub">Register Official Account</p>
        </div>

        <div className="auth-tabs">
          <Link to="/login" className="auth-tab">
            Sign In
          </Link>
          <span className="auth-tab active">Register Officer</span>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              required
              autoFocus
              placeholder="e.g. Hiralal Mahato"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Official Email</label>
            <input
              id="reg-email"
              type="email"
              require
              placeholder="e.g. officer@pwd.gov "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password (min 8 characters)</label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-inline" />
                <span>Registering Account...</span>
              </>
            ) : (
              "Create Officer Account"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already registered? </span>
          <Link to="/login" className="text-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
