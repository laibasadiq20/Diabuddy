import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';
import en from './translations/en';
import ur from './translations/ur';

const I18nContext = createContext();

const STORAGE_KEY = 'diabuddy_lang';
const DICTIONARIES = { en, ur };

function getInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ur') return saved;
  } catch (_) {
    /* ignore */
  }
  // Always default to English unless the user explicitly chose Urdu.
  return 'en';
}

function lookup(dict, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), dict);
}

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(getInitialLang);
  const { user, setUser, authHeaders } = useAuth() || {};
  const hasExplicitChoice = (() => {
    try {
      return !!localStorage.getItem(STORAGE_KEY);
    } catch (_) {
      return false;
    }
  })();

  useEffect(() => {
    const isUrdu = lang === 'ur';
    document.documentElement.setAttribute('lang', isUrdu ? 'ur' : 'en');
    document.documentElement.setAttribute('dir', isUrdu ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('data-lang', lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {
      /* ignore */
    }
  }, [lang]);

  useEffect(() => {
    if (user?.language && !hasExplicitChoice) {
      setLangState(user.language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.language]);

  const setLang = (next) => {
    setLangState(next);
    if (user && authHeaders) {
      fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ language: next }),
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

  const t = (path, fallback) => {
    const value = lookup(DICTIONARIES[lang], path) ?? lookup(DICTIONARIES.en, path);
    return value !== undefined ? value : fallback ?? path;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
