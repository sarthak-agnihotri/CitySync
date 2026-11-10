import React, { createContext, useContext, useState, useEffect } from "react";
import { getToken, getStoredUser, setToken, setStoredUser, removeToken, CitizenAuthAPI } from "../api/client";

const CitizenAuthContext = createContext(null);

export function CitizenAuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await CitizenAuthAPI.getMe();
        if (res.user) {
          setUser(res.user);
          setStoredUser(res.user);
        }
      } catch {
        removeToken();
        setUser(null);
        setTokenState(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await CitizenAuthAPI.login({ email, password });
    setToken(res.token);
    setStoredUser(res.user);
    setTokenState(res.token);
    setUser(res.user);
    return res;
  };

  const register = async (userData) => {
    const res = await CitizenAuthAPI.register(userData);
    setToken(res.token);
    setStoredUser(res.user);
    setTokenState(res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setTokenState(null);
  };

  return (
    <CitizenAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </CitizenAuthContext.Provider>
  );
}

export const useCitizenAuth = () => useContext(CitizenAuthContext);

