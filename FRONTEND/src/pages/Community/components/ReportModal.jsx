import React from 'react';
import { theme } from '../../../theme';
import { REPORT_REASONS } from './reportReasons';
import { useI18n } from '../../../i18n/I18nContext';
import ThemedSelect from '../../../components/ThemedSelect';

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
  const { t: tr } = useI18n();
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
        background: t.surface,
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
            <h3 style={{ fontFamily: t.fontDisplay, margin: '0 0 8px 0' }}>{tr('reportModal.reportSubmitted')}</h3>
            <p style={{ color: t.inkSoft, fontSize: '14px', margin: 0 }}>{tr('reportModal.thankYou')}</p>
          </div>
        ) : (
          <>
            <h3 style={{ fontFamily: t.fontDisplay, fontSize: '22px', margin: '0 0 16px 0', color: t.ink }}>
              {tr('reportModal.reportContent')}
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: t.inkSoft, textTransform: 'uppercase', marginBottom: '6px' }}>
                {tr('reportModal.reason')}
              </label>
              <ThemedSelect
                value={reason}
                onChange={onReasonChange}
                options={REPORT_REASONS.map((r) => ({
                  value: r.value,
                  label: tr(`reportReasons.${r.value}`),
                }))}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: t.inkSoft, textTransform: 'uppercase', marginBottom: '6px' }}>
                {tr('reportModal.additionalDetails')}
              </label>
              <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder={tr('reportModal.describePlaceholder')}
                rows={4}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px',
                  borderRadius: '8px',
                  border: `1.5px solid ${t.line}`,
                  background: t.surfaceSunken,
                  color: t.ink,
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
                {tr('common.cancel')}
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
                {tr('reportModal.submitReport')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
