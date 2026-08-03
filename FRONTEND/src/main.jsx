import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { I18nProvider } from "./i18n/I18nContext";

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