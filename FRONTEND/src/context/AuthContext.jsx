import React, { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../config/api";
import { setCachedData } from "../utils/appCache";

const AuthContext = createContext();

const normalizeUser = (raw) => {
  if (!raw) return null;
  const id = raw._id || raw.id;
  return {
    ...raw,
    _id: id,
    id,
  };
};

/** Cookie-only auth — no JWT in JS-accessible storage */
const authHeaders = () => ({});

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUser = (raw) => setUserState(normalizeUser(raw));

  const saveSession = (_tokenIgnored, userPayload) => {
    // Token is httpOnly cookie only; optionally hydrate user from login payload
    if (userPayload) setUserState(normalizeUser(userPayload));
  };

  const clearSession = () => {
    try {
      sessionStorage.removeItem("diabuddy_token");
      localStorage.removeItem("token");
      localStorage.removeItem("diabuddy_token");
      localStorage.removeItem("diabuddy_user");
    } catch (_) {
      /* ignore */
    }
    setUserState(null);
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
        headers: {
          ...authHeaders(),
        },
      });

      if (!res.ok) {
        clearSession();
        return null;
      }

      const data = await res.json();
      const normalized = normalizeUser(data.data);
      setUserState(normalized);
      return normalized;
    } catch (err) {
      clearSession();
      return null;
    } finally {
      setLoading(false);
    }
  };

  /** Fire-and-forget background preload so dashboard is instant */
  const preloadDashboardData = (user) => {
    if (!user) return;
    const tzOffset = new Date().getTimezoneOffset();
    const creds = { credentials: 'include' };

    // Parallel: all 3 critical endpoints at once, no await blocking the UI
    fetch(`${API_URL}/health-logs/summary?tzOffset=${tzOffset}`, creds)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.status === 'success') setCachedData('dashboard_summary', d.data); })
      .catch(() => {});

    fetch(`${API_URL}/health-logs/streak?tzOffset=${tzOffset}`, creds)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.status === 'success') setCachedData('dashboard_streak', d.data); })
      .catch(() => {});

    fetch(`${API_URL}/reminders?tzOffset=${tzOffset}`, creds)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.status === 'success') {
          const raw = d.data;
          const all = Array.isArray(raw) ? raw : (raw?.reminders || []);
          setCachedData('dashboard_reminders', all);
        }
      })
      .catch(() => {});

    fetch(`${API_URL}/health-logs/report?preset=7d&tzOffset=${tzOffset}`, creds)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.status === 'success') setCachedData('dashboard_report', d.data); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchUser().then(u => preloadDashboardData(u));
  }, []);

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...authHeaders(),
        },
      });
    } catch (err) {
      /* ignore network errors on logout */
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        fetchUser,
        logout,
        saveSession,
        authHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
