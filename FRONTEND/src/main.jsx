import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { I18nProvider } from "./i18n/I18nContext";

// Keep the push service worker registered so OS notifications work when the tab is closed.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);
