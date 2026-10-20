import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthAPI, getToken, setToken, removeToken, getStoredUser, setStoredUser } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setTokenState] = useState(getToken);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const data = await AuthAPI.getMe();
      if (data && data.user) {
        setUser(data.user);
        setStoredUser(data.user);
        return data.user;
      }
    } catch (err) {
      console.warn("Failed to fetch current user profile:", err.message);
      if (err.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
    return null;
  }, [logout]);

  useEffect(() => {
    refreshUser();

    const handleSessionExpired = () => {
      logout();
    };

    window.addEventListener("citysync:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("citysync:session-expired", handleSessionExpired);
    };
  }, [refreshUser, logout]);

  const login = async (email, password) => {
    const data = await AuthAPI.login(email, password);
    if (data.token) {
      setToken(data.token);
      setTokenState(data.token);
    }
    if (data.user) {
      setUser(data.user);
      setStoredUser(data.user);
    }
    // Also fetch populated user details
    await refreshUser();
    return data;
  };

  const register = async (name, email, password) => {
    const data = await AuthAPI.register(name, email, password);
    return data;
  };

  const isRole = (...roles) => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isRole,
        isAuthenticated: Boolean(token && user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
