import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';
import AppSidebar from '../../components/AppSidebar';
import { Save, CheckCircle2, LogOut, Droplet, MapPin, Mail } from 'lucide-react';

const t = theme;

function diabetesTypeLabel(value, tr) {
  if (value === 'Type 1') return tr('account.type1');
  if (value === 'Type 2') return tr('account.type2');
  if (value === 'Gestational') return tr('account.typeGestational');
  return value;
}

export default function Account() {
  const { user, setUser, logout, authHeaders } = useAuth();
  const { t: tr } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    bio: '',
    location: '',
    diabetesType: '',
    gender: '',
    age: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      bio: user.bio || '',
      location: user.location || '',
      diabetesType: user.diabetesType || '',
      gender: user.gender || '',
      age: user.age ?? '',
    });
  }, [user]);

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setMessage('');
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
    const payload = {
        name: form.name.trim(),
        bio: form.bio,
        location: form.location,
      };
      if (form.age !== '') payload.age = Number(form.age);
      if (form.diabetesType) payload.diabetesType = form.diabetesType;
      if (form.gender) payload.gender = form.gender;

      const res = await fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || tr('account.saveError'));
        return;
      }
      setUser(data.data);
      setMessage(tr('account.profileUpdated'));
    } catch (err) {
      setError(tr('account.connectionError'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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

  const fieldStyleDisabled = {
    ...fieldStyle,
    background: t.surfaceSunken,
    color: t.inkSoft,
    cursor: 'not-allowed',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    color: t.inkSoft,
    marginBottom: 6,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  const pillStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 600,
    color: '#F4F0E8',
  };

  const sectionLabelStyle = {
    margin: '4px 0 -4px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: t.inkFaint,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: t.bg, fontFamily: t.fontBody }}>
      <AppSidebar />

      <main style={{ flex: 1, minWidth: 0, padding: '32px 28px 64px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div
            className="db-account-header"
            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}
          >
            <div>
              <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(24px, 5vw, 30px)', color: t.ink, fontWeight: 500 }}>
                {tr('account.heading')}
              </h1>
              <p style={{ margin: '4px 0 0', color: t.inkSoft, fontSize: 14 }}>
                {tr('account.subheading')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: t.surface,
                border: `1.5px solid ${t.lineStrong}`,
                borderRadius: 999,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 700,
                color: t.clayDeep,
                cursor: 'pointer',
                fontFamily: t.fontBody,
              }}
            >
              <LogOut size={15} />
              {tr('common.logout')}
            </button>
          </div>

          <div
            className="db-account-card"
            style={{
              background: `linear-gradient(150deg, ${t.forestDeep} 0%, ${t.forest} 100%)`,
              borderRadius: 20,
              padding: '26px 28px',
              boxShadow: t.shadowCard,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: t.peach,
                color: t.forestDeep,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 700,
                flexShrink: 0,
                border: '2px solid rgba(255,255,255,0.25)',
              }}
            >
              {(form.name || user?.name || '?').charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              {/* Primary identity: exactly one bold display name */}
              <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#FFF', fontFamily: t.fontDisplay, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {form.name || user?.name}
              </p>
              {/* Secondary contact info — muted, icon-led so it never reads as another "name" */}
              <p style={{ margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(244,240,232,0.72)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <Mail size={12} style={{ flexShrink: 0 }} />
                {user?.email}
              </p>
              {user?.username && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(244,240,232,0.5)' }}>
                  <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginInlineEnd: 6 }}>
                    {tr('account.username')}
                  </span>
                  @{user.username}
                </p>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {form.diabetesType && (
                  <span style={pillStyle}>{diabetesTypeLabel(form.diabetesType, tr)}</span>
                )}
                {form.location && (
                  <span style={pillStyle}>
                    <MapPin size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
                    {form.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {form.bio && (
            <div
              style={{
                background: t.peachSoft,
                border: `1.5px solid ${t.claySoft}`,
                borderRadius: 16,
                padding: '16px 20px',
                marginBottom: 20,
                fontSize: 14,
                color: t.inkSoft,
                fontStyle: 'italic',
                lineHeight: 1.5,
              }}
            >
              “{form.bio}”
            </div>
          )}

          <div
            className="db-account-card"
            style={{
              background: t.surface,
              border: `1.5px solid ${t.lineStrong}`,
              borderRadius: 20,
              padding: '28px',
              boxShadow: t.shadowCard,
              marginBottom: 20,
            }}
          >
            <p style={{ margin: '0 0 18px', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.forest }}>
              {tr('account.editProfile')}
            </p>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>{tr('account.fullName')}</label>
                <input style={fieldStyle} value={form.name} onChange={onChange('name')} required minLength={2} />
              </div>

              <div className="db-form-grid">
                <div>
                  <label style={labelStyle}>{tr('account.username')}</label>
                  <input style={fieldStyleDisabled} value={user?.username ? `@${user.username}` : ''} disabled readOnly />
                </div>
                <div>
                  <label style={labelStyle}>{tr('account.email')}</label>
                  <input style={fieldStyleDisabled} value={user?.email || ''} disabled readOnly />
                </div>
              </div>

              <p style={sectionLabelStyle}><Droplet size={12} /> {tr('account.healthDetails')}</p>
              <div>
                <label style={labelStyle}>{tr('account.diabetesType')}</label>
                <select style={{ ...fieldStyle, maxWidth: 320 }} value={form.diabetesType} onChange={onChange('diabetesType')}>
                  <option value="">{tr('common.preferNotToSay')}</option>
                  <option value="Type 1">{tr('account.type1')}</option>
                  <option value="Type 2">{tr('account.type2')}</option>
                  <option value="Gestational">{tr('account.typeGestational')}</option>
                </select>
              </div>

              <p style={sectionLabelStyle}>{tr('account.aboutYou')}</p>
              <div className="db-form-grid">
                <div>
                  <label style={labelStyle}>{tr('account.gender')}</label>
                  <select style={fieldStyle} value={form.gender} onChange={onChange('gender')}>
                    <option value="">{tr('common.preferNotToSay')}</option>
                    <option value="Female">{tr('account.genderFemale')}</option>
                    <option value="Male">{tr('account.genderMale')}</option>
                    <option value="Other">{tr('account.genderOther')}</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{tr('account.age')}</label>
                  <input
                    style={fieldStyle}
                    type="number"
                    min={1}
                    max={120}
                    value={form.age}
                    onChange={onChange('age')}
                    placeholder={tr('common.optional')}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>{tr('account.location')}</label>
                <input
                  style={fieldStyle}
                  value={form.location}
                  onChange={onChange('location')}
                  placeholder={tr('account.locationPlaceholder')}
                  maxLength={100}
                />
              </div>

              <div>
                <label style={labelStyle}>{tr('account.bio')}</label>
                <textarea
                  style={{ ...fieldStyle, minHeight: 110, resize: 'vertical', lineHeight: 1.5 }}
                  value={form.bio}
                  onChange={onChange('bio')}
                  placeholder={tr('account.bioPlaceholder')}
                  maxLength={300}
                />
                <p style={{ margin: '6px 0 0', fontSize: 11, color: t.inkFaint }}>{form.bio.length}/300</p>
              </div>

              {error && (
                <p style={{ margin: 0, color: t.clayDeep, fontSize: 13, fontWeight: 500 }}>{error}</p>
              )}
              {message && (
                <p style={{ margin: 0, color: t.sageDeep, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={15} /> {message}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                style={{
                  alignSelf: 'stretch',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: t.forest,
                  color: '#FFF',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 22px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? 'wait' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <Save size={16} />
                {saving ? tr('account.saving') : tr('account.saveProfile')}
              </button>
            </form>
          </div>

          <p style={{ fontSize: 12, color: t.inkFaint, margin: 0 }}>
            {tr('account.emailNote')}
          </p>
        </div>
      </main>

      <style>{`
        @media (max-width: 640px) {
          .db-account-card { padding: 18px !important; border-radius: 18px !important; }
        }
        @media (min-width: 641px) {
          .db-account-card button[type="submit"] { align-self: flex-start !important; }
        }
      `}</style>
    </div>
  );
}
