import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Droplets,
  Clock,
  CheckCircle2,
  ShieldAlert,
  X,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { theme } from '../theme';

const t = theme;

export default function LowGlucoseModal({ isOpen, onClose, glucoseLevel, unit = 'mg/dL' }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const originalBodyStyle = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // Physically lock the background page to prevent any scrolling underneath
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Prevent touch scrolling outside the scrollable modal container
    const preventBackgroundTouch = (e) => {
      if (!e.target.closest('.db-modal-scrollable')) {
        if (e.cancelable) e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventBackgroundTouch, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventBackgroundTouch);
      document.body.style.position = originalBodyStyle.position;
      document.body.style.top = originalBodyStyle.top;
      document.body.style.left = originalBodyStyle.left;
      document.body.style.right = originalBodyStyle.right;
      document.body.style.width = originalBodyStyle.width;
      document.body.style.overflow = originalBodyStyle.overflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="low-glucose-title"
      className="db-modal-overlay"
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(31, 30, 28, 0.65)',
        backdropFilter: 'blur(6px)',
        animation: 'dbModalFadeIn 0.2s ease-out',
        overscrollBehavior: 'contain',
      }}
    >
      <div
        className="db-modal-dialog"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '88vh',
          background: t.surface,
          borderRadius: '16px',
          border: `1px solid ${t.lineStrong}`,
          boxShadow: t.shadowLifted,
          fontFamily: t.fontBody,
          color: t.ink,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'dbModalSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Sticky Fixed Header Section */}
        <div
          className="db-modal-header"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            padding: '16px 24px 18px',
            background: t.surfaceRaised,
            borderBottom: `1px solid ${t.line}`,
            flexShrink: 0,
          }}
        >
          {/* Mobile Back Bar */}
          <div className="db-modal-mobile-bar" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                background: 'none',
                padding: 0,
                color: t.forest,
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: t.fontBody,
              }}
            >
              <ArrowLeft size={18} />
              <span>Back to Log</span>
            </button>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: t.skyDeep }}>
              Clinical Advisory
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: t.skyTint,
                  border: `1px solid ${t.skySoft}`,
                  color: t.skyDeep,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Droplets size={20} strokeWidth={2.2} />
              </div>
              <div>
                <span
                  className="db-desktop-badge"
                  style={{
                    display: 'inline-block',
                    fontSize: '11px',
                    fontWeight: 750,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: t.skyDeep,
                  }}
                >
                  Clinical Advisory • Hypoglycemia
                </span>
                <h2
                  id="low-glucose-title"
                  style={{
                    margin: '2px 0 0',
                    fontFamily: t.fontDisplay,
                    fontSize: '20px',
                    fontWeight: 700,
                    color: t.ink,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Your blood sugar is low
                </h2>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close guidance"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: `1px solid ${t.line}`,
                background: t.surface,
                color: t.inkSoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = t.surfaceSunken;
                e.currentTarget.style.color = t.ink;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = t.surface;
                e.currentTarget.style.color = t.inkSoft;
              }}
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          </div>

          <p
            style={{
              margin: '12px 0 0',
              fontSize: '13px',
              lineHeight: 1.5,
              color: t.inkSoft,
            }}
          >
            If your blood glucose is below <strong>70 mg/dL (3.9 mmol/L)</strong>
            {glucoseLevel ? (
              <span> (current reading: <strong>{glucoseLevel} {unit}</strong>)</span>
            ) : null}
            , treat it promptly with <strong>15 g of fast-acting carbohydrate</strong>.
          </p>
        </div>

        {/* Smooth Scrollable Body with Thin Scrollbar */}
        <div
          className="db-modal-scrollable"
          style={{
            flex: '1 1 auto',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            scrollBehavior: 'smooth',
            padding: '20px 24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Prominent Protocol Card (15-15 Rule) */}
          <div
            style={{
              padding: '15px 18px',
              borderRadius: '12px',
              background: t.skyTint,
              border: `1px solid ${t.skySoft}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <Clock size={19} color={t.skyDeep} strokeWidth={2.3} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div
                style={{
                  fontSize: '11.5px',
                  fontWeight: 750,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: t.skyDeep,
                  marginBottom: '3px',
                }}
              >
                Immediate Clinical Protocol (15-15 Rule)
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: 650,
                  color: t.forest,
                  lineHeight: 1.45,
                }}
              >
                “Take 15 g of fast-acting carbohydrate, wait 15 minutes, then check your blood glucose again.”
              </p>
            </div>
          </div>

          {/* Structured Fast-Acting Carbohydrate Sources */}
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 750,
                color: t.inkSoft,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '10px',
              }}
            >
              Recommended Sources (~15 g Fast-Acting Carbohydrates)
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '8px',
              }}
            >
              <div style={sourceCardStyle}>
                <span style={indicatorDotStyle} />
                <span style={{ fontSize: '13px', color: t.ink, lineHeight: 1.4 }}>
                  <strong>3–4 glucose tablets</strong> (per product label)
                </span>
              </div>

              <div style={sourceCardStyle}>
                <span style={indicatorDotStyle} />
                <span style={{ fontSize: '13px', color: t.ink, lineHeight: 1.4 }}>
                  <strong>½ cup (120 mL)</strong> fruit juice
                </span>
              </div>

              <div style={sourceCardStyle}>
                <span style={indicatorDotStyle} />
                <span style={{ fontSize: '13px', color: t.ink, lineHeight: 1.4 }}>
                  <strong>½ cup (120 mL)</strong> regular, non-diet soda
                </span>
              </div>

              <div style={sourceCardStyle}>
                <span style={indicatorDotStyle} />
                <span style={{ fontSize: '13px', color: t.ink, lineHeight: 1.4 }}>
                  <strong>3–4 teaspoons</strong> sugar dissolved in water
                </span>
              </div>

              <div style={{ ...sourceCardStyle, gridColumn: '1 / -1' }}>
                <span style={indicatorDotStyle} />
                <span style={{ fontSize: '13px', color: t.ink, lineHeight: 1.4 }}>
                  <strong>Appropriate glucose gel</strong> according to package instructions
                </span>
              </div>
            </div>
          </div>

          {/* Recheck Protocol Notice */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: t.surfaceSunken,
              border: `1px solid ${t.line}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <CheckCircle2 size={17} color={t.skyDeep} style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '13px', color: t.ink, lineHeight: 1.45 }}>
              <strong>Recheck reminder:</strong> If your blood glucose is still below 70 mg/dL after 15 minutes, repeat the treatment and recheck.
            </p>
          </div>

          {/* Emergency Safety Warning */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '10px',
              background: t.clayTint,
              border: `1px solid ${t.claySoft}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <ShieldAlert size={18} color={t.clayDeep} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: '12.5px', color: t.clayDeep, display: 'block', marginBottom: '2px' }}>
                Emergency Safety Note:
              </strong>
              <p style={{ margin: 0, fontSize: '12.5px', color: t.inkSoft, lineHeight: 1.45 }}>
                If you are unconscious, having a seizure, severely confused, or unable to swallow safely, do not give food or drink by mouth. Seek emergency medical help and follow the person's prescribed emergency glucagon plan if available.
              </p>
            </div>
          </div>

          {/* Footer & Source Attribution */}
          <div
            style={{
              paddingTop: '10px',
              borderTop: `1px solid ${t.line}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} color={t.inkFaint} />
              <p style={{ margin: 0, fontSize: '11.5px', color: t.inkFaint }}>
                Based on guidance from the <strong>CDC</strong> and <strong>American Diabetes Association (ADA)</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 22px',
                borderRadius: '8px',
                border: 'none',
                background: t.forest,
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: t.fontBody,
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.forestDeep)}
              onMouseLeave={(e) => (e.currentTarget.style.background = t.forest)}
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dbModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes dbModalSlideUp {
          from { opacity: 0; transform: translateY(10px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .db-modal-scrollable {
          scrollbar-width: thin;
          scrollbar-color: var(--line-strong, #C4BBA8) transparent;
          -webkit-overflow-scrolling: touch;
        }
        .db-modal-scrollable::-webkit-scrollbar {
          width: 5px;
        }
        .db-modal-scrollable::-webkit-scrollbar-track {
          background: transparent;
          margin: 4px 0;
        }
        .db-modal-scrollable::-webkit-scrollbar-thumb {
          background: var(--line-strong, #C4BBA8);
          border-radius: 10px;
        }
        .db-modal-scrollable::-webkit-scrollbar-thumb:hover {
          background: var(--ink-faint, #7A746A);
        }

        @media (max-width: 640px) {
          .db-modal-overlay {
            padding: 0 !important;
            align-items: stretch !important;
            justify-content: stretch !important;
            background: var(--bg, #F7F3EC) !important;
          }
          .db-modal-dialog {
            max-width: 100vw !important;
            width: 100vw !important;
            height: 100% !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: var(--bg, #F7F3EC) !important;
          }
          .db-modal-mobile-bar {
            display: flex !important;
          }
          .db-desktop-badge {
            display: none !important;
          }
          .db-modal-header {
            padding: 14px 18px 14px !important;
            border-radius: 0 !important;
            background: var(--surface, #FFFFFF) !important;
          }
          .db-modal-scrollable {
            padding: 16px 18px 24px !important;
            background: var(--bg, #F7F3EC) !important;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}

const sourceCardStyle = {
  background: t.surface,
  border: `1px solid ${t.line}`,
  borderRadius: '8px',
  padding: '10px 12px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const indicatorDotStyle = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: t.skyDeep,
  flexShrink: 0,
};
