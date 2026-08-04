import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';
import AppSidebar from '../../components/AppSidebar';
import ThemedSelect from '../../components/ThemedSelect';
import {
  Save,
  CheckCircle2,
  LogOut,
  MapPin,
  Mail,
  Camera,
  UserRound,
  HeartPulse,
  Users,
} from 'lucide-react';

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
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: '',
    bio: '',
    location: '',
    diabetesType: '',
    gender: '',
    age: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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
    const value = typeof e === 'string' ? e : e?.target?.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage('');
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError(tr('account.nameRequired') || 'Full name is required.');
      return;
    }
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

  const saveProfileImage = async (url) => {
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ profileImageUrl: url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || tr('account.photoUploadError'));
    setUser(data.data);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingPhoto(true);
    setMessage('');
    setError('');
    try {
      const formData = new FormData();
      formData.append('images', file);
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...authHeaders() },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.urls?.[0]) {
        setError(data.message || tr('account.photoUploadError'));
        return;
      }
      await saveProfileImage(data.urls[0]);
      setMessage(tr('account.photoUpdated'));
    } catch (err) {
      setError(err.message || tr('account.photoUploadError'));
    } finally {
      setUploadingPhoto(false);
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

  const sectionCardStyle = {
    background: t.surface,
    border: `1.5px solid ${t.lineStrong}`,
    borderRadius: 20,
    padding: '22px 24px',
    boxShadow: t.shadowCard,
    marginBottom: 16,
  };

  const sectionTitleStyle = {
    margin: '0 0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: t.forest,
  };

  const photoUrl = user?.profileImageUrl || '';
  const hasPhoto = Boolean(photoUrl);
  const emailVerified = user?.isVerified !== false;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: t.bg, fontFamily: t.fontBody }}>
      <AppSidebar />

      <main style={{ flex: 1, minWidth: 0, padding: '32px 28px 64px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div
            className="db-account-header"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}
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
              className="db-account-logout-btn"
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
                flexShrink: 0,
                transition: 'background 0.15s, border-color 0.15s, color 0.15s',
              }}
            >
              <LogOut size={15} />
              {tr('common.logout')}
            </button>
          </div>

          {/* Profile summary card */}
          <div
            className="db-account-card db-account-hero"
            style={{
              background: `linear-gradient(150deg, ${t.forestDeep} 0%, ${t.forest} 100%)`,
              borderRadius: 20,
              padding: '22px 20px',
              boxShadow: t.shadowCard,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div className="db-account-hero-avatar-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <label
                className="db-account-hero-avatar-label"
                style={{
                  position: 'relative',
                  width: 84,
                  height: 84,
                  borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.35)',
                  background: t.peach,
                  color: t.forestDeep,
                  padding: 0,
                  cursor: uploadingPhoto ? 'wait' : 'pointer',
                  overflow: 'hidden',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {hasPhoto ? (
                  <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 30, fontWeight: 700 }}>
                    {(form.name || user?.name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
                <span
                  className="db-account-photo-overlay"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(20, 40, 28, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Camera size={22} color="#FFF" />
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  disabled={uploadingPhoto}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: uploadingPhoto ? 'wait' : 'pointer',
                  }}
                  onChange={handlePhotoChange}
                />
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                style={{
                  border: 'none',
                  background: 'rgba(255,255,255,0.16)',
                  color: '#F4F0E8',
                  borderRadius: 999,
                  padding: '6px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: uploadingPhoto ? 'wait' : 'pointer',
                  fontFamily: t.fontBody,
                }}
              >
                {uploadingPhoto
                  ? tr('account.uploadingPhoto')
                  : hasPhoto
                    ? tr('account.changePhoto')
                    : tr('account.uploadPhoto')}
              </button>
            </div>

            <div style={{ minWidth: 0, flex: '1 1 180px' }}>
              <p className="db-account-hero-name" style={{ margin: 0, fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: 600, color: '#FFF', fontFamily: t.fontDisplay, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {form.name || user?.name}
              </p>

              {user?.username && (
                <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(244,240,232,0.85)', fontWeight: 500 }}>
                  @{user.username}
                </p>
              )}
            </div>
          </div>

          {(error || message) && (
            <p
              style={{
                margin: '0 0 14px',
                color: error ? t.clayDeep : t.sageDeep,
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {!error && <CheckCircle2 size={15} />}
              {error || message}
            </p>
          )}

          <form onSubmit={handleSave}>
            {/* Personal Information */}
            <div className="db-account-card" style={sectionCardStyle}>
              <p style={sectionTitleStyle}>
                <UserRound size={15} /> {tr('account.personalInfo')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                <div className="db-form-grid">
                  <div>
                    <label style={labelStyle}>{tr('account.gender')}</label>
                    <ThemedSelect
                      value={form.gender}
                      onChange={onChange('gender')}
                      placeholder={tr('common.preferNotToSay')}
                      options={[
                        { value: '', label: tr('common.preferNotToSay') },
                        { value: 'Female', label: tr('account.genderFemale') },
                        { value: 'Male', label: tr('account.genderMale') },
                        { value: 'Other', label: tr('account.genderOther') },
                      ]}
                    />
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
              </div>
            </div>

            {/* Health Information */}
            <div className="db-account-card" style={sectionCardStyle}>
              <p style={sectionTitleStyle}>
                <HeartPulse size={15} /> {tr('account.healthInfo')}
              </p>
              <div>
                <label style={labelStyle}>{tr('account.diabetesType')}</label>
                <ThemedSelect
                  style={{ maxWidth: 320 }}
                  value={form.diabetesType}
                  onChange={onChange('diabetesType')}
                  placeholder={tr('common.preferNotToSay')}
                  options={[
                    { value: '', label: tr('common.preferNotToSay') },
                    { value: 'Type 1', label: tr('account.type1') },
                    { value: 'Type 2', label: tr('account.type2') },
                    { value: 'Gestational', label: tr('account.typeGestational') },
                  ]}
                />
              </div>
            </div>

            {/* Community Profile */}
            <div className="db-account-card" style={sectionCardStyle}>
              <p style={sectionTitleStyle}>
                <Users size={15} /> {tr('account.communityProfile')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
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
                marginBottom: 16,
              }}
            >
              <Save size={16} />
              {saving ? tr('account.saving') : tr('account.saveProfile')}
            </button>
          </form>

          <p style={{ fontSize: 12, color: t.inkFaint, margin: 0 }}>
            {tr('account.emailNote')}
          </p>
        </div>
      </main>

      <style>{`
        .db-account-photo-overlay {
          opacity: 0.9;
          transition: opacity 0.15s ease;
        }
        .db-account-logout-btn:hover {
          background: ${t.clayTint} !important;
          border-color: ${t.clay} !important;
        }
        @media (min-width: 641px) {
          .db-account-photo-overlay { opacity: 0; }
          label:hover .db-account-photo-overlay,
          label:focus-within .db-account-photo-overlay {
            opacity: 1;
          }
        }
        @media (max-width: 640px) {
          .db-account-header {
            align-items: center !important;
            margin-bottom: 16px !important;
          }
          .db-account-logout-btn {
            padding: 8px 14px !important;
            font-size: 12px !important;
          }
          .db-account-hero {
            padding: 16px 14px !important;
            border-radius: 18px !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 14px !important;
            flex-wrap: nowrap !important;
          }
          .db-account-hero-avatar-wrap {
            flex-direction: column !important;
            align-items: center !important;
            gap: 6px !important;
            flex-shrink: 0 !important;
          }
          .db-account-hero-avatar-label {
            width: 68px !important;
            height: 68px !important;
          }
          .db-account-hero-avatar-label span {
            font-size: 24px !important;
          }
          .db-account-hero-name {
            font-size: 17px !important;
          }
          .db-account-card {
            padding: 18px 14px !important;
            border-radius: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
