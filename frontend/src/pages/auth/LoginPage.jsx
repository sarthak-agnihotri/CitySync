import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email.trim(), password);
      showToast("Signed in successfully", "success");
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
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
          <p className="brand-sub">Inter-Departmental Municipal Cooperation</p>
        </div>

        <div className="auth-tabs">
          <span className="auth-tab active">Sign In</span>
          <Link to="/register" className="auth-tab">
            Register Officer
          </Link>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">Municipal Email Address</label>
            <input
              id="login-email"
              type="email"
              required
              autoFocus
              placeholder="officer@citymail.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-inline" />
                <span>Authenticating...</span>
              </>
            ) : (
              "Sign In to Portal"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>New municipal officer? </span>
          <Link to="/register" className="text-link">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
