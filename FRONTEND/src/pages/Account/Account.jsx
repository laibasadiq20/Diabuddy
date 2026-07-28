import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';
import AppSidebar from '../../components/AppSidebar';
import { UserRound, Save, CheckCircle2, BadgeCheck } from 'lucide-react';

const t = theme;

export default function Account() {
  const { user, setUser, authHeaders } = useAuth();
  const [form, setForm] = useState({
    name: '',
    bio: '',
    location: '',
    diabetesType: '',
    gender: '',
    age: '',
    glucoseUnit: 'mg/dL',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [proCredentials, setProCredentials] = useState('');
  const [proNote, setProNote] = useState('');
  const [proSubmitting, setProSubmitting] = useState(false);
  const [proMessage, setProMessage] = useState('');
  const [proError, setProError] = useState('');

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      bio: user.bio || '',
      location: user.location || '',
      diabetesType: user.diabetesType || '',
      gender: user.gender || '',
      age: user.age ?? '',
      glucoseUnit: user.glucoseUnit || 'mg/dL',
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
        glucoseUnit: form.glucoseUnit,
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
        setError(data.message || 'Could not save profile');
        return;
      }
      setUser(data.data);
      setMessage('Profile updated');
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleProRequest = async (e) => {
    e.preventDefault();
    setProSubmitting(true);
    setProMessage('');
    setProError('');
    try {
      const res = await fetch(`${API_URL}/auth/pro-request`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          credentials: proCredentials.trim(),
          note: proNote.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProError(data.message || 'Could not submit request');
        return;
      }
      setUser(data.data);
      setProMessage('Request submitted — an admin will review it.');
      setProCredentials('');
      setProNote('');
    } catch {
      setProError('Connection error. Please try again.');
    } finally {
      setProSubmitting(false);
    }
  };

  const proStatus = user?.professionalVerification?.status || 'none';
  const showProForm = user?.role !== 'admin' && !user?.isVerifiedProfessional && proStatus !== 'pending' && proStatus !== 'approved';

  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 14px',
    borderRadius: 12,
    border: `1.5px solid ${t.lineStrong}`,
    background: '#FFF',
    color: t.ink,
    fontSize: 14,
    fontFamily: t.fontBody,
    outline: 'none',
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: t.bg, fontFamily: t.fontBody }}>
      <AppSidebar />

      <main style={{ flex: 1, minWidth: 0, padding: '32px 28px 64px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: t.forest,
                color: t.peach,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <UserRound size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(24px, 5vw, 30px)', color: t.ink, fontWeight: 500 }}>
                My Account
              </h1>
              <p style={{ margin: '4px 0 0', color: t.inkSoft, fontSize: 14 }}>
                Personalize how you appear across DiaBuddy
              </p>
            </div>
          </div>

          <div
            className="db-account-card"
            style={{
              background: '#FFF',
              border: `1.5px solid ${t.lineStrong}`,
              borderRadius: 20,
              padding: '28px',
              boxShadow: t.shadowCard,
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: t.forest,
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                {(form.name || user?.name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: t.ink }}>{form.name || user?.name}</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: t.inkSoft }}>{user?.email}</p>
                {user?.username && (
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: t.inkFaint }}>@{user.username}</p>
                )}
              </div>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle}>Display name</label>
                <input style={fieldStyle} value={form.name} onChange={onChange('name')} required minLength={2} />
              </div>

              <div className="db-form-grid">
                <div>
                  <label style={labelStyle}>Diabetes type</label>
                  <select style={fieldStyle} value={form.diabetesType} onChange={onChange('diabetesType')}>
                    <option value="">Prefer not to say</option>
                    <option value="Type 1">Type 1</option>
                    <option value="Type 2">Type 2</option>
                    <option value="Gestational">Gestational</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Glucose unit</label>
                  <select style={fieldStyle} value={form.glucoseUnit} onChange={onChange('glucoseUnit')}>
                    <option value="mg/dL">mg/dL</option>
                    <option value="mmol/L">mmol/L</option>
                  </select>
                </div>
              </div>

              <div className="db-form-grid">
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select style={fieldStyle} value={form.gender} onChange={onChange('gender')}>
                    <option value="">Prefer not to say</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Age</label>
                  <input
                    style={fieldStyle}
                    type="number"
                    min={1}
                    max={120}
                    value={form.age}
                    onChange={onChange('age')}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Location</label>
                <input
                  style={fieldStyle}
                  value={form.location}
                  onChange={onChange('location')}
                  placeholder="City or country"
                  maxLength={100}
                />
              </div>

              <div>
                <label style={labelStyle}>Bio</label>
                <textarea
                  style={{ ...fieldStyle, minHeight: 110, resize: 'vertical', lineHeight: 1.5 }}
                  value={form.bio}
                  onChange={onChange('bio')}
                  placeholder="A short intro for the community…"
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
                {saving ? 'Saving…' : 'Save profile'}
              </button>
            </form>
          </div>

          {user?.role !== 'admin' && (
            <div
              className="db-account-card"
              style={{
                background: '#FFF',
                border: `1.5px solid ${t.lineStrong}`,
                borderRadius: 20,
                padding: '28px',
                boxShadow: t.shadowCard,
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <BadgeCheck size={20} color={t.sageDeep} />
                <h2 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 20, fontWeight: 500, color: t.ink }}>
                  Verified professional
                </h2>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: t.inkSoft, lineHeight: 1.5 }}>
                Clinicians and diabetes educators can request a verified-pro badge shown next to their name in the community.
              </p>

              {user?.isVerifiedProfessional || proStatus === 'approved' ? (
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: t.sageDeep, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={15} /> Your account is verified.
                </p>
              ) : proStatus === 'pending' ? (
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: t.gold }}>
                  Your request is pending admin review.
                </p>
              ) : (
                <>
                  {proStatus === 'rejected' && (
                    <p style={{ margin: '0 0 12px', fontSize: 13, color: t.clayDeep }}>
                      Your last request was not approved. You can submit again with clearer credentials.
                    </p>
                  )}
                  {showProForm && (
                    <form onSubmit={handleProRequest} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <label style={labelStyle}>Credentials</label>
                        <textarea
                          style={{ ...fieldStyle, minHeight: 90, resize: 'vertical', lineHeight: 1.5 }}
                          value={proCredentials}
                          onChange={(e) => {
                            setProCredentials(e.target.value);
                            setProError('');
                            setProMessage('');
                          }}
                          placeholder="e.g. Registered dietitian, CDE — license # / clinic"
                          maxLength={500}
                          required
                          minLength={8}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Optional note</label>
                        <input
                          style={fieldStyle}
                          value={proNote}
                          onChange={(e) => setProNote(e.target.value)}
                          placeholder="Anything else admins should know"
                          maxLength={500}
                        />
                      </div>
                      {proError && <p style={{ margin: 0, color: t.clayDeep, fontSize: 13 }}>{proError}</p>}
                      {proMessage && (
                        <p style={{ margin: 0, color: t.sageDeep, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle2 size={15} /> {proMessage}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={proSubmitting}
                        style={{
                          alignSelf: 'flex-start',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          background: t.forest,
                          color: '#FFF',
                          border: 'none',
                          borderRadius: 12,
                          padding: '11px 18px',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: proSubmitting ? 'wait' : 'pointer',
                          opacity: proSubmitting ? 0.7 : 1,
                        }}
                      >
                        <BadgeCheck size={16} />
                        {proSubmitting ? 'Submitting…' : 'Request verification'}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          )}

          <p style={{ fontSize: 12, color: t.inkFaint, margin: 0 }}>
            Email is tied to your login and can’t be changed here. Use Forgot password on the sign-in page to reset access.
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
