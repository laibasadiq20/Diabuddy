import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { theme as t } from '../theme';

/**
 * Themed dropdown that replaces native <select> — matches DiaBuddy paper/sky UI
 * and stays usable on mobile (large tap targets, full-width menu).
 */
export default function ThemedSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  disabled = false,
  style,
  className = '',
  id,
  'aria-label': ariaLabel,
  required = false,
}) {
  const autoId = useId();
  const selectId = id || autoId;
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);

  const normalized = options.map((o) =>
    typeof o === 'string' || typeof o === 'number'
      ? { value: String(o), label: String(o) }
      : { value: String(o.value), label: o.label ?? String(o.value), disabled: o.disabled }
  );

  const selected = normalized.find((o) => o.value === String(value ?? ''));
  const display = selected?.label || placeholder;

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (opt) => {
    if (opt.disabled) return;
    onChange?.(opt.value);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`db-themed-select${open ? ' is-open' : ''}${disabled ? ' is-disabled' : ''} ${className}`.trim()}
      style={{ position: 'relative', width: '100%', minWidth: 0, ...style }}
    >
      {/* Hidden input so native form required validation still works when wrapped in forms */}
      {required ? (
        <input
          tabIndex={-1}
          aria-hidden
          required
          value={value ?? ''}
          onChange={() => {}}
          style={{
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'none',
            width: 1,
            height: 1,
          }}
        />
      ) : null}

      <button
        type="button"
        id={selectId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((v) => !v)}
        className="db-themed-select-trigger"
      >
        <span className={`db-themed-select-value${selected ? '' : ' is-placeholder'}`}>{display}</span>
        <ChevronDown size={16} strokeWidth={2} className="db-themed-select-chevron" aria-hidden />
      </button>

      {open ? (
        <ul className="db-themed-select-menu" role="listbox" aria-labelledby={selectId}>
          {normalized.map((opt) => {
            const active = opt.value === String(value ?? '');
            return (
              <li key={opt.value || '__empty'}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={opt.disabled}
                  className={`db-themed-select-option${active ? ' is-active' : ''}`}
                  onClick={() => pick(opt)}
                >
                  <span>{opt.label}</span>
                  {active ? <Check size={14} strokeWidth={2.5} aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <style>{`
        .db-themed-select-trigger {
          width: 100%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          min-height: 44px;
          padding: 10px 12px 10px 14px;
          border-radius: 10px;
          border: 1.5px solid ${t.lineStrong};
          background: ${t.surfaceSunken};
          color: ${t.ink};
          font-size: 14px;
          font-family: ${t.fontBody};
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .db-themed-select.is-open .db-themed-select-trigger,
        .db-themed-select-trigger:focus-visible {
          border-color: ${t.forest};
          box-shadow: 0 0 0 3px rgba(39, 57, 46, 0.12);
        }
        .db-themed-select.is-disabled .db-themed-select-trigger {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .db-themed-select-value {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .db-themed-select-value.is-placeholder {
          color: ${t.inkFaint};
          font-weight: 500;
        }
        .db-themed-select-chevron {
          flex-shrink: 0;
          color: ${t.inkFaint};
          transition: transform 0.15s ease;
        }
        .db-themed-select.is-open .db-themed-select-chevron {
          transform: rotate(180deg);
          color: ${t.forest};
        }
        .db-themed-select-menu {
          position: absolute;
          z-index: 80;
          left: 0;
          right: 0;
          top: calc(100% + 6px);
          margin: 0;
          padding: 6px;
          list-style: none;
          max-height: min(280px, 50vh);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 12px;
          border: 1.5px solid ${t.lineStrong};
          background: ${t.surface};
          box-shadow: ${t.shadowLifted};
        }
        .db-themed-select-option {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          min-height: 42px;
          padding: 10px 12px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: ${t.ink};
          font-size: 14px;
          font-family: ${t.fontBody};
          font-weight: 500;
          text-align: left;
          cursor: pointer;
        }
        .db-themed-select-option:hover,
        .db-themed-select-option:focus-visible {
          background: ${t.surfaceSunken};
          outline: none;
        }
        .db-themed-select-option.is-active {
          background: ${t.sageTint};
          color: ${t.forest};
          font-weight: 650;
        }
        .db-themed-select-option:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        @media (max-width: 640px) {
          .db-themed-select-trigger {
            font-size: 16px;
            min-height: 46px;
            padding: 12px 14px;
          }
          .db-themed-select-menu {
            max-height: min(320px, 55vh);
            border-radius: 14px;
          }
          .db-themed-select-option {
            min-height: 46px;
            font-size: 15px;
            padding: 12px 14px;
          }
        }
      `}</style>
    </div>
  );
}
