import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { API_URL } from '../config/api';

const ThemeContext = createContext();

const STORAGE_KEY = 'diabuddy_theme';

function getInitialMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (_) {
    /* ignore */
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export const ThemeProvider = ({ children }) => {
  const [mode, setModeState] = useState(getInitialMode);
  const { user, setUser, authHeaders } = useAuth() || {};
  const hasExplicitChoice = (() => {
    try {
      return !!localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return false;
    }
  })();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (_) {
      /* ignore */
    }
  }, [mode]);

  // If the signed-in user has a saved theme preference and this browser
  // hasn't made an explicit local choice yet, adopt the account's setting.
  useEffect(() => {
    if (user?.theme && !hasExplicitChoice) {
      setModeState(user.theme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.theme]);

  const setMode = (next) => {
    setModeState(next);
    if (user && authHeaders) {
      fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ theme: next }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.data && setUser) setUser(data.data);
        })
        .catch(() => {
          /* non-blocking — localStorage already has the preference */
        });
    }
  };

  const toggleMode = () => setMode(mode === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeContext);
