import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { API_URL } from '../../config/api';
import { 
  Shield, 
  Trash2, 
  EyeOff, 
  UserX, 
  Check, 
  RefreshCw, 
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  FileText
} from 'lucide-react';

const t = theme;

export default function AdminReports() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [error, setError] = useState('');

  // Redirect non-admins
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user]);

  const fetchQueue = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/admin/reports?status=pending`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setReports(data || []);
      } else {
        setError(data.message || 'Failed to fetch reported content.');
      }
    } catch (err) {
      setError('Connection failure loading moderation queue.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchQueue();
    }
  }, [user]);

  // Resolve Report Handler
  const handleResolveReport = async (reportId, actionType) => {
    if (!window.confirm(`Are you sure you want to perform action: "${actionType}"?`)) return;
    
    setActioningId(reportId);
    try {
      const res = await fetch(`${API_URL}/admin/reports/${reportId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'reviewed',
          action: actionType
        })
      });
      
      if (res.ok) {
        // Remove resolved report from local state list
        setReports(prev => prev.filter(r => r._id !== reportId));
      } else {
        const data = await res.json();
        alert(data.message || 'Resolution failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Connection error resolving report.');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: t.bg }}>
      <Navbar />
      
      <main style={{ flexGrow: 1, paddingTop: '100px', paddingBottom: '60px', fontFamily: t.fontBody }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h1 style={{ 
                fontFamily: t.fontDisplay, 
                fontSize: '32px', 
                color: t.ink, 
                fontWeight: '500',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Shield size={32} color={t.clayDeep} /> Admin Moderation Queue
              </h1>
              <p style={{ color: t.inkSoft, fontSize: '15px', marginTop: '4px', margin: 0 }}>
                Review and resolve reported forum posts and comments submitted by community members.
              </p>
            </div>

            <button 
              onClick={fetchQueue}
              style={{
                background: t.surface,
                border: `1.5px solid ${t.line}`,
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                color: t.inkSoft,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {error && (
            <div style={{ background: t.clayTint, border: `1.5px solid ${t.clay}30`, borderRadius: '12px', padding: '16px', color: t.clayDeep, fontSize: '14px', marginBottom: '24px' }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: t.inkSoft }}>
              <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 16px' }} />
              <p style={{ margin: 0 }}>Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div style={{ background: t.surface, border: `1.5px solid ${t.line}`, borderRadius: '24px', padding: '60px 24px', textAlign: 'center', boxShadow: t.shadowCard }}>
              <Check size={48} color={t.sage} style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontFamily: t.fontDisplay, fontSize: '20px', margin: '0 0 8px 0', color: t.ink }}>Clean Slate!</h3>
              <p style={{ color: t.inkSoft, fontSize: '14px', margin: 0 }}>
                There are no pending reports in the queue. All forum content is verified active.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {reports.map(report => (
                <div 
                  key={report._id}
                  style={{
                    background: t.surface,
                    border: `1.5px solid ${t.line}`,
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: t.shadowCard,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    position: 'relative',
                    opacity: actioningId === report._id ? 0.6 : 1
                  }}
                >
                  {/* Top line badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: '700', 
                      color: t.clayDeep, 
                      background: t.clayTint, 
                      padding: '4px 10px', 
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <AlertTriangle size={12} /> {report.reason}
                    </span>

                    <span style={{ fontSize: '12px', color: t.inkFaint }}>
                      Reported by {report.reporterId?.name || 'Anonymous Buddy'} on {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Report details info */}
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: t.inkSoft, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px 0' }}>
                      Report description
                    </h3>
                    <p style={{ fontSize: '14px', color: t.ink, margin: 0, lineHeight: '1.5', background: t.bg, padding: '12px 16px', borderRadius: '8px' }}>
                      {report.description || 'No additional explanation provided by reporter.'}
                    </p>
                  </div>

                  {/* Target content snippet reference */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.surfaceSunken, padding: '12px 16px', borderRadius: '10px', borderLeft: `4px solid ${t.lineStrong}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {report.targetType === 'ForumPost' ? (
                        <FileText size={18} color={t.skyDeep} />
                      ) : (
                        <MessageSquare size={18} color={t.sageDeep} />
                      )}
                      
                      <span style={{ fontSize: '13px', fontWeight: '600', color: t.ink }}>
                        Reported {report.targetType === 'ForumPost' ? 'Post' : 'Comment reply'} (ID: {report.targetId})
                      </span>
                    </div>

                    {report.targetType === 'ForumPost' && (
                      <button
                        onClick={() => navigate(`/community/posts/${report.targetId}`)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: t.skyDeep,
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        View Post <ExternalLink size={12} />
                      </button>
                    )}
                  </div>

                  {/* Action Buttons panel */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: '10px',
                    borderTop: `1px solid ${t.line}`,
                    paddingTop: '16px',
                    flexWrap: 'wrap'
                  }}>
                    
                    <button
                      onClick={() => handleResolveReport(report._id, 'dismiss')}
                      disabled={actioningId !== null}
                      style={{
                        background: t.sageSoft,
                        color: t.sageDeep,
                        border: `1.5px solid ${t.sage}40`,
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Check size={14} /> Dismiss Report
                    </button>

                    <button
                      onClick={() => handleResolveReport(report._id, 'hide_content')}
                      disabled={actioningId !== null}
                      style={{
                        background: t.goldSoft,
                        color: t.gold,
                        border: `1.5px solid ${t.gold}30`,
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <EyeOff size={14} /> Hide Content
                    </button>

                    <button
                      onClick={() => handleResolveReport(report._id, 'delete_content')}
                      disabled={actioningId !== null}
                      style={{
                        background: t.claySoft,
                        color: t.clayDeep,
                        border: `1.5px solid ${t.clay}30`,
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={14} /> Soft Delete
                    </button>

                    <button
                      onClick={() => handleResolveReport(report._id, 'ban_user')}
                      disabled={actioningId !== null}
                      style={{
                        background: '#FFECEC',
                        color: '#D32F2F',
                        border: '1.5px solid #FFCDD2',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <UserX size={14} /> Ban Author
                    </button>

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
