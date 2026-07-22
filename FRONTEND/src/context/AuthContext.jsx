import React, { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../config/api";

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

  useEffect(() => {
    fetchUser();
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
