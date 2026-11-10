import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Landmark, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { useCitizenAuth } from "../../context/CitizenAuthContext";
import { useToast } from "../../context/ToastContext";

export function CitizenLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useCitizenAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      addToast("Welcome back!", "success");
      navigate("/my-complaints");
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
          <h1 className="text-xl font-black text-[var(--text-primary)]">Citizen Portal Login</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Access your submitted complaints, track repairs, and verify resolutions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="citizen@citysync.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Password
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
            {loading ? "Signing in..." : "Sign In to Citizen Account"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)]">
          Don't have a citizen account yet?{" "}
          <Link to="/register" className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CitizenRegisterPage() {
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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      addToast("Account created successfully!", "success");
      navigate("/report");
    } catch (err) {
      addToast(err.message || "Registration failed", "error");
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
          <h1 className="text-xl font-black text-[var(--text-primary)]">Citizen Registration</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Create an official resident profile to report and track municipal services
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aakash Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="aakash@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Residential Address / Ward
            </label>
            <input
              type="text"
              placeholder="Sector 14, Urban Estate"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-transparent text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Create Password *
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
            {loading ? "Registering..." : "Create Citizen Profile"}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)]">
          Already registered?{" "}
          <Link to="/login" className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}

