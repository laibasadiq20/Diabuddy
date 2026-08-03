import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useI18n } from '../../i18n/I18nContext';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';
import AppSidebar from '../../components/AppSidebar';
import { CheckCircle2, Droplet, Sun, Moon, Languages } from 'lucide-react';

const t = theme;

export default function Settings() {
  const { user, setUser, authHeaders } = useAuth();
  const { mode, setMode } = useThemeMode();
  const { lang, setLang, t: tr } = useI18n();
  const [glucoseUnit, setGlucoseUnit] = useState('mg/dL');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    setGlucoseUnit(user.glucoseUnit || 'mg/dL');
  }, [user]);

  const handleGlucoseUnitChange = async (e) => {
    const next = e.target.value;
    setGlucoseUnit(next);
    setMessage('');
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ glucoseUnit: next }),
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setUser(data.data);
        setMessage(tr('settings.unitUpdated'));
      }
    } catch (err) {
      // Non-blocking — the selector already reflects the chosen value.
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: t.inkSoft,
    marginBottom: 6,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px',
    borderRadius: 12,
    border: `1.5px solid ${t.lineStrong}`,
    background: t.surface,
    color: t.ink,
    fontSize: 14,
    fontFamily: t.fontBody,
    outline: 'none',
  };

  const segmentBtnStyle = (active) => ({
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '11px 14px',
    borderRadius: 10,
    border: active ? `1.5px solid ${t.forest}` : `1.5px solid ${t.lineStrong}`,
    background: active ? t.forest : t.surface,
    color: active ? '#FFF' : t.inkSoft,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: t.fontBody,
    transition: 'background 0.15s, color 0.15s, border-color 0.15s',
  });

  const cardStyle = {
    background: t.surface,
    border: `1.5px solid ${t.lineStrong}`,
    borderRadius: 20,
    padding: '28px',
    boxShadow: t.shadowCard,
    marginBottom: 20,
  };

  const cardTitleStyle = {
    margin: '0 0 18px',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: t.forest,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: t.bg, fontFamily: t.fontBody }}>
      <AppSidebar />

      <main style={{ flex: 1, minWidth: 0, padding: '32px 28px 64px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(24px, 5vw, 30px)', color: t.ink, fontWeight: 500 }}>
              {tr('settings.heading')}
            </h1>
            <p style={{ margin: '4px 0 0', color: t.inkSoft, fontSize: 14 }}>
              {tr('settings.subheading')}
            </p>
          </div>

          <div className="db-account-card" style={cardStyle}>
            <p style={cardTitleStyle}>{tr('settings.appearance')}</p>
            <label style={labelStyle}>
              {mode === 'dark' ? <Moon size={12} style={{ marginRight: 5 }} /> : <Sun size={12} style={{ marginRight: 5 }} />}
              {tr('settings.appearance')}
            </label>
            <p style={{ margin: '0 0 10px', fontSize: 12, color: t.inkFaint }}>{tr('settings.appearanceHint')}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" style={segmentBtnStyle(mode === 'light')} onClick={() => setMode('light')}>
                <Sun size={15} /> {tr('settings.light')}
              </button>
              <button type="button" style={segmentBtnStyle(mode === 'dark')} onClick={() => setMode('dark')}>
                <Moon size={15} /> {tr('settings.dark')}
              </button>
            </div>
          </div>

          <div className="db-account-card" style={cardStyle}>
            <p style={cardTitleStyle}>{tr('settings.language')}</p>
            <label style={labelStyle}>
              <Languages size={12} style={{ marginRight: 5 }} />
              {tr('settings.language')}
            </label>
            <p style={{ margin: '0 0 10px', fontSize: 12, color: t.inkFaint }}>{tr('settings.languageHint')}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" style={segmentBtnStyle(lang === 'en')} onClick={() => setLang('en')}>
                {tr('settings.english')}
              </button>
              <button
                type="button"
                style={{ ...segmentBtnStyle(lang === 'ur'), fontFamily: "'Noto Nastaliq Urdu', 'Noto Sans Arabic', sans-serif" }}
                onClick={() => setLang('ur')}
              >
                {tr('settings.urdu')}
              </button>
            </div>
          </div>

          <div className="db-account-card" style={cardStyle}>
            <p style={cardTitleStyle}>{tr('settings.units')}</p>
            <label style={labelStyle}>
              <Droplet size={12} style={{ marginRight: 5 }} />
              {tr('settings.glucoseUnit')}
            </label>
            <p style={{ margin: '0 0 10px', fontSize: 12, color: t.inkFaint }}>{tr('settings.glucoseUnitHint')}</p>
            <select
              style={{ ...fieldStyle, maxWidth: 240 }}
              value={glucoseUnit}
              onChange={handleGlucoseUnitChange}
              disabled={saving}
            >
              <option value="mg/dL">mg/dL</option>
              <option value="mmol/L">mmol/L</option>
            </select>
            {message && (
              <p style={{ margin: '12px 0 0', color: t.sageDeep, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={15} /> {message}
              </p>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 640px) {
          .db-account-card { padding: 18px !important; border-radius: 18px !important; }
        }
      `}</style>
    </div>
  );
}
