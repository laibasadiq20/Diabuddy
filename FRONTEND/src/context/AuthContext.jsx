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

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUser = (raw) => setUserState(normalizeUser(raw));

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUserState(null);
        return null;
      }

      const data = await res.json();
      const normalized = normalizeUser(data.data);
      setUserState(normalized);
      return normalized;
    } catch (err) {
      setUserState(null);
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
      });
    } catch (err) {
      console.log(err);
    } finally {
      setUserState(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
