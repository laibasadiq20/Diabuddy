import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, Check, Plus, Trash2 } from 'lucide-react';
import { theme as t } from '../theme';

/**
 * Searchable themed picker — shows top N quick picks, rest via search.
 * Used for medicine names (and similar long lists).
 */
export default function SearchSelect({
  value = '',
  onChange,
  options = [],
  customValues = [],
  onDeleteOption,
  onDeleteCustom,
  onAddCustom,
  topCount = 5,
  placeholder = 'Search…',
  allowCustom = true,
  disabled = false,
  required = false,
  style,
  id,
  'aria-label': ariaLabel,
  searchPlaceholder,
  emptyLabel = 'No matches',
  popularLabel = 'Popular',
  searchMoreLabel,
}) {
  const autoId = useId();
  const selectId = id || autoId;
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const normalized = useMemo(
    () =>
      options.map((o) =>
        typeof o === 'string' || typeof o === 'number'
          ? { value: String(o), label: String(o) }
          : { value: String(o.value), label: o.label ?? String(o.value) }
      ),
    [options]
  );

  const topPicks = normalized.slice(0, topCount);
  const q = query.trim().toLowerCase();
  const filtered = q
    ? normalized.filter(
        (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
      )
    : normalized;

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const tmr = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(tmr);
    }
    return undefined;
  }, [open]);

  const pick = (opt) => {
    onChange?.(opt.value);
    setOpen(false);
    setQuery('');
  };

  const commitCustom = () => {
    if (!allowCustom) return;
    const next = query.trim();
    if (!next) return;
    onAddCustom?.(next);
    onChange?.(next);
    setOpen(false);
    setQuery('');
  };

  const renderOption = (opt) => {
    const isCustom = customValues.some(
      (cv) => String(cv).toLowerCase() === String(opt.value).toLowerCase()
    );
    const active = opt.value === value;
    const canDelete = Boolean(onDeleteOption || (isCustom && onDeleteCustom));
    const handleDelete = onDeleteOption || onDeleteCustom;

    return (
      <div
        key={opt.value}
        className={`db-search-select-option-row${active ? ' is-active' : ''}`}
      >
        <button
          type="button"
          role="option"
          aria-selected={active}
          className="db-search-select-option"
          onClick={() => pick(opt)}
        >
          <span className="db-search-select-opt-text">{opt.label}</span>
          {active ? <Check size={14} strokeWidth={2.5} aria-hidden /> : null}
        </button>
        {canDelete ? (
          <button
            type="button"
            className="db-search-select-del-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete(opt.value);
            }}
            title={`Delete "${opt.label}" from list`}
            aria-label={`Delete ${opt.label}`}
          >
            <Trash2 size={13.5} strokeWidth={2} />
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <div
      ref={rootRef}
      className={`db-search-select${open ? ' is-open' : ''}${disabled ? ' is-disabled' : ''}`}
      style={{ position: 'relative', width: '100%', minWidth: 0, ...style }}
    >
      {required ? (
        <input
          tabIndex={-1}
          aria-hidden
          required
          value={value ?? ''}
          onChange={() => {}}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1 }}
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
        className="db-search-select-trigger"
      >
        <span className={`db-search-select-value${value ? '' : ' is-placeholder'}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} strokeWidth={2} className="db-search-select-chevron" aria-hidden />
      </button>

      {open ? (
        <div className="db-search-select-panel" role="listbox" aria-labelledby={selectId}>
          <div className="db-search-select-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filtered.length === 1) pick(filtered[0]);
                  else commitCustom();
                }
              }}
              placeholder={searchPlaceholder || placeholder}
              className="db-search-select-input"
              autoComplete="off"
            />
          </div>

          {!q ? (
            <div className="db-search-select-body">
              <p className="db-search-select-section">{popularLabel}</p>
              <div className="db-search-select-options">
                {topPicks.map(renderOption)}
                {allowCustom ? (
                  <button
                    type="button"
                    className="db-search-select-custom-row"
                    onClick={() => inputRef.current?.focus()}
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    <span>Type custom medicine name…</span>
                  </button>
                ) : null}
              </div>
              {normalized.length > topCount ? (
                <p className="db-search-select-hint">
                  {searchMoreLabel || 'Type above to search or add custom medicine'}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="db-search-select-body">
              {filtered.length === 0 ? (
                <div className="db-search-select-empty">
                  <span>{emptyLabel}</span>
                  {allowCustom && query.trim() ? (
                    <button type="button" className="db-search-select-custom" onClick={commitCustom}>
                      <Plus size={14} strokeWidth={2.5} />
                      <span>Add “<strong>{query.trim()}</strong>” as medicine</span>
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="db-search-select-options">
                  {filtered.map(renderOption)}
                  {allowCustom && query.trim() && !normalized.some((o) => o.label.toLowerCase() === q) ? (
                    <button type="button" className="db-search-select-custom-row" onClick={commitCustom}>
                      <Plus size={14} strokeWidth={2.5} />
                      <span>Add “<strong>{query.trim()}</strong>” as custom medicine</span>
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      <style>{`
        .db-search-select-trigger {
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
        }
        .db-search-select.is-open .db-search-select-trigger,
        .db-search-select-trigger:focus-visible {
          border-color: ${t.lineStrong};
          box-shadow: 0 0 0 3px rgba(43, 42, 40, 0.08);
        }
        .db-search-select.is-disabled .db-search-select-trigger {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .db-search-select-value {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .db-search-select-value.is-placeholder { color: ${t.inkFaint}; }
        .db-search-select-chevron {
          flex-shrink: 0;
          color: ${t.inkFaint};
          transition: transform 0.15s ease;
        }
        .db-search-select.is-open .db-search-select-chevron {
          transform: rotate(180deg);
          color: ${t.forest};
        }
        .db-search-select-panel {
          position: absolute;
          z-index: 80;
          left: 0;
          right: 0;
          top: calc(100% + 6px);
          display: flex;
          flex-direction: column;
          padding: 10px;
          border-radius: 14px;
          border: 1.5px solid ${t.lineStrong};
          background: ${t.surface};
          box-shadow: ${t.shadowLifted};
          max-height: min(360px, 60vh);
          overflow: hidden;
        }
        .db-search-select-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          min-height: 42px;
          border-radius: 10px;
          border: 1.5px solid ${t.lineStrong};
          background: ${t.surfaceSunken};
          color: ${t.inkFaint};
          flex-shrink: 0;
          margin-bottom: 8px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .db-search-select-search:focus-within {
          border-color: ${t.forest};
          box-shadow: 0 0 0 3px rgba(35, 59, 46, 0.12);
        }
        .db-search-select-input,
        .db-search-select-input:focus,
        .db-search-select-input:focus-visible {
          flex: 1;
          min-width: 0;
          border: none !important;
          outline: none !important;
          outline-offset: 0 !important;
          box-shadow: none !important;
          background: transparent !important;
          font-size: 14px;
          font-family: ${t.fontBody};
          color: ${t.ink};
          padding: 10px 0;
        }
        .db-search-select-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: ${t.lineStrong} transparent;
          padding-right: 2px;
        }
        .db-search-select-body::-webkit-scrollbar {
          width: 4px;
        }
        .db-search-select-body::-webkit-scrollbar-thumb {
          background: ${t.lineStrong};
          border-radius: 999px;
        }
        .db-search-select-section {
          margin: 2px 4px 6px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: ${t.inkFaint};
        }
        .db-search-select-options {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .db-search-select-option-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 10px;
          transition: background 0.12s ease;
        }
        .db-search-select-option-row:hover,
        .db-search-select-option-row:focus-within {
          background: ${t.surfaceSunken};
        }
        .db-search-select-option-row.is-active {
          background: ${t.surfaceSunken};
        }
        .db-search-select-option {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          min-height: 44px;
          padding: 10px 12px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: ${t.ink};
          font-size: 14px;
          font-family: ${t.fontBody};
          font-weight: 500;
          text-align: left;
          cursor: pointer;
        }
        .db-search-select-opt-text {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .db-search-select-del-btn {
          width: 32px;
          height: 32px;
          margin-right: 6px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: ${t.inkFaint};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .db-search-select-del-btn:hover {
          background: ${t.clayTint};
          color: ${t.clayDeep};
        }
        .db-search-select-option:hover,
        .db-search-select-option:focus-visible {
          background: transparent;
          outline: none;
        }
        .db-search-select-option.is-active {
          color: ${t.ink};
          font-weight: 650;
          box-shadow: inset 2px 0 0 ${t.forest};
        }
        .db-search-select-custom-row {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 42px;
          padding: 10px 12px;
          border: 1px dashed ${t.lineStrong};
          border-radius: 10px;
          background: ${t.surfaceSunken};
          color: ${t.forest};
          font-size: 13px;
          font-family: ${t.fontBody};
          font-weight: 650;
          text-align: left;
          cursor: pointer;
          margin-top: 4px;
          transition: all 0.15s ease;
        }
        .db-search-select-custom-row:hover {
          background: ${t.sageTint};
          border-color: ${t.forest};
          border-style: solid;
        }
        .db-search-select-hint {
          margin: 10px 4px 4px;
          padding-top: 10px;
          border-top: 1px solid ${t.line};
          font-size: 12px;
          color: ${t.inkFaint};
          line-height: 1.4;
        }
        .db-search-select-empty {
          padding: 16px 12px;
          font-size: 13px;
          color: ${t.inkFaint};
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        .db-search-select-custom {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1.5px solid ${t.forest};
          background: ${t.sageTint};
          color: ${t.forest};
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 700;
          font-family: ${t.fontBody};
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .db-search-select-custom:hover {
          background: ${t.forest};
          color: #FFFFFF;
        }
        @media (max-width: 640px) {
          .db-search-select-trigger,
          .db-search-select-input {
            font-size: 16px;
          }
          .db-search-select-trigger { min-height: 46px; }
          .db-search-select-option { min-height: 48px; font-size: 15px; }
          .db-search-select-panel {
            max-height: min(70vh, 440px);
            left: 0;
            right: 0;
          }
        }
      `}</style>
    </div>
  );
}
