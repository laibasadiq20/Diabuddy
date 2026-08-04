import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { I18nProvider } from "./i18n/I18nContext";

// Wake up Railway backend immediately — before React even renders.
// Fires the moment the JS bundle is parsed, giving the server maximum
// time to exit sleep mode before the user needs any data.
(function wakeBackend() {
  try {
    // Hit Railway directly — fastest path, no proxy layer
    fetch('https://backend-production-f8f9.up.railway.app/api/ping', {
      method: 'GET',
      mode: 'no-cors', // fire-and-forget, we don't need the response
    }).catch(() => {});
  } catch (_) { /* ignore */ }
})();

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
