import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { theme } from '../../theme';
import { API_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import AppSidebar from '../../components/AppSidebar';
import { ArrowLeft, Link2Off, RefreshCw, Watch } from 'lucide-react';

const t = theme;

export default function GoogleHealth() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, authHeaders } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadStatus = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/google-health/status`, {
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.status === 'success') {
        setStatus(data.data);
      } else {
        setError(data.message || 'Could not load connection status');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, [user]);

  useEffect(() => {
    const connected = searchParams.get('connected');
    const err = searchParams.get('error');
    if (connected === '1') {
      setMessage('Google Health connected. You can sync steps now.');
      setSearchParams({}, { replace: true });
      loadStatus();
    } else if (err) {
      setError(decodeURIComponent(err));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const connect = () => {
    // Full navigation so Google OAuth redirect works with session cookie
    window.location.href = `${API_URL}/google-health/connect`;
  };

  const sync = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/google-health/sync`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ tzOffset: new Date().getTimezoneOffset() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Sync failed');
      }
      const parts = [
        `${Number(data.data?.steps || 0).toLocaleString()} steps`,
        data.data?.calories != null ? `${data.data.calories} kcal` : null,
        data.data?.distanceKm ? `${data.data.distanceKm} km` : null,
        data.data?.durationMinutes ? `${data.data.durationMinutes} min` : null,
      ].filter(Boolean);
      const when = data.data?.lastSyncAt
        ? new Date(data.data.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null;
      setMessage(
        `Synced for today${when ? ` at ${when}` : ''}: ${parts.join(' · ')}. Saved in Activity logs.`
      );
      await loadStatus();
    } catch (err) {
      setError(err.message || 'Sync failed');
    } finally {
      setBusy(false);
    }
  };

  const disconnect = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/google-health/disconnect`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...authHeaders() },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Disconnect failed');
      setMessage('Disconnected from Google Health.');
      await loadStatus();
    } catch (err) {
      setError(err.message || 'Disconnect failed');
    } finally {
      setBusy(false);
    }
  };

  const connected = Boolean(status?.connected);
  const configured = status?.configured !== false;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: `linear-gradient(180deg, #EDE6DA 0%, ${t.bg} 45%)`, fontFamily: t.fontBody }}>
      <AppSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: '28px 20px 64px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => navigate('/logs/exercise')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 16,
              border: 'none',
              background: 'none',
              color: t.inkSoft,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: t.fontBody,
              padding: 0,
            }}
          >
            <ArrowLeft size={16} />
            Back to activity
          </button>
          <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.inkFaint }}>
            Activity
          </p>
          <h1 style={{ margin: 0, fontFamily: t.fontDisplay, fontSize: 'clamp(26px, 6vw, 32px)', fontWeight: 500, color: t.ink }}>
            Connect Google Health
          </h1>
          <p style={{ margin: '8px 0 24px', fontSize: 14, color: t.inkSoft, lineHeight: 1.5 }}>
            Sync steps through Google Health (works with Fitbit accounts linked to Google). You can still log activity manually anytime.
          </p>

          {message && (
            <p style={{ margin: '0 0 12px', padding: '10px 12px', borderRadius: 12, background: t.sageSoft, color: t.sageDeep, fontSize: 13 }}>
              {message}
            </p>
          )}
          {error && (
            <p style={{ margin: '0 0 12px', padding: '10px 12px', borderRadius: 12, background: t.claySoft, color: t.clayDeep, fontSize: 13 }}>
              {error}
            </p>
          )}

          <div
            style={{
              background: '#FFF',
              borderRadius: 20,
              border: `1.5px solid ${t.lineStrong}`,
              boxShadow: t.shadowCard,
              padding: 28,
              textAlign: 'center',
            }}
          >
            <span
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: t.goldSoft,
                color: t.gold,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Watch size={28} />
            </span>

            {loading ? (
              <p style={{ margin: 0, color: t.inkSoft, fontSize: 14 }}>Checking connection…</p>
            ) : !configured ? (
              <>
                <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 17, color: t.ink }}>
                  Not configured
                </p>
                <p style={{ margin: '0 0 20px', fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
                  Add Google OAuth env vars on the server, then restart.
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 17, color: t.ink }}>
                  {connected ? 'Google Health connected' : 'Connect with Google'}
                </p>
                <p style={{ margin: '0 0 8px', fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
                  {connected
                    ? status?.lastSyncAt
                      ? `Last sync: ${new Date(status.lastSyncAt).toLocaleString()} · ${[
                          `${Number(status.lastSteps || 0).toLocaleString()} steps`,
                          status.lastCalories ? `${status.lastCalories} kcal` : null,
                          status.lastDistanceKm ? `${status.lastDistanceKm} km` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}`
                      : 'Connected — sync to pull today’s steps, calories, and distance.'
                    : 'Sign in with Google to allow DiaBuddy to read activity and steps.'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 16 }}>
                  {!connected ? (
                    <button
                      type="button"
                      onClick={connect}
                      disabled={busy}
                      style={{
                        padding: '12px 22px',
                        borderRadius: 999,
                        border: 'none',
                        background: t.forest,
                        color: '#FFF',
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: 'pointer',
                        fontFamily: t.fontBody,
                      }}
                    >
                      Connect Google Health
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={sync}
                        disabled={busy}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '12px 22px',
                          borderRadius: 999,
                          border: 'none',
                          background: t.forest,
                          color: '#FFF',
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: busy ? 'wait' : 'pointer',
                          fontFamily: t.fontBody,
                          opacity: busy ? 0.7 : 1,
                        }}
                      >
                        <RefreshCw size={16} />
                        Sync steps
                      </button>
                      <button
                        type="button"
                        onClick={disconnect}
                        disabled={busy}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '12px 22px',
                          borderRadius: 999,
                          border: `1.5px solid ${t.lineStrong}`,
                          background: '#FFF',
                          color: t.ink,
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: busy ? 'wait' : 'pointer',
                          fontFamily: t.fontBody,
                        }}
                      >
                        <Link2Off size={16} />
                        Disconnect
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate('/logs/exercise')}
                    style={{
                      padding: '12px 22px',
                      borderRadius: 999,
                      border: `1.5px solid ${t.lineStrong}`,
                      background: '#FFF',
                      color: t.ink,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer',
                      fontFamily: t.fontBody,
                    }}
                  >
                    Log activity manually
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
