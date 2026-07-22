import React from 'react';
import { theme } from '../../../theme';
import { REPORT_REASONS } from './reportReasons';

const t = theme;

export default function ReportModal({
  open,
  success,
  reason,
  description,
  onReasonChange,
  onDescriptionChange,
  onCancel,
  onSubmit,
}) {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      fontFamily: t.fontBody,
      padding: 16,
    }}>
      <div style={{
        background: '#FFF',
        border: `1.5px solid ${t.lineStrong}`,
        borderRadius: '18px',
        width: '100%',
        maxWidth: '440px',
        padding: '24px',
        boxShadow: t.shadowLifted
      }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
            <h3 style={{ fontFamily: t.fontDisplay, margin: '0 0 8px 0' }}>Report Submitted</h3>
            <p style={{ color: t.inkSoft, fontSize: '14px', margin: 0 }}>Thank you, moderators will review this content.</p>
          </div>
        ) : (
          <>
            <h3 style={{ fontFamily: t.fontDisplay, fontSize: '22px', margin: '0 0 16px 0', color: t.ink }}>
              Report Content
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: t.inkSoft, textTransform: 'uppercase', marginBottom: '6px' }}>
                Reason
              </label>
              <select
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: `1.5px solid ${t.line}`,
                  background: t.bg,
                  fontSize: '13px'
                }}
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: t.inkSoft, textTransform: 'uppercase', marginBottom: '6px' }}>
                Additional Details
              </label>
              <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Describe why you believe this content is inappropriate..."
                rows={4}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px',
                  borderRadius: '8px',
                  border: `1.5px solid ${t.line}`,
                  fontSize: '13px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={onCancel}
                style={{
                  background: 'none',
                  border: `1px solid ${t.line}`,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onSubmit}
                style={{
                  background: t.clayDeep,
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Submit Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
