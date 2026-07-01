import { theme } from '../theme';

const t = theme;

/**
 * DiaBuddy logo: a mint badge with a heartbeat-pulse mark, plus a two-tone
 * wordmark ("Dia" in forest green, "Buddy" in sage) — matches the brand
 * mark used across the marketing site.
 *
 * variant="light" flips the wordmark to cream tones for use on dark/forest
 * backgrounds (hero, auth backdrops).
 */
export default function Logo({ size = 36, textSize = 19, variant = 'dark', showText = true }) {
  const isLight = variant === 'light';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.28 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: isLight ? 'rgba(255,255,255,0.14)' : t.sageTint,
          border: isLight ? '1px solid rgba(255,255,255,0.22)' : `1px solid ${t.sage}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none">
          <path
            d="M2 13h4l2.5 6L13 4l3 9h6"
            stroke={isLight ? '#F7F3EC' : t.forest}
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showText && (
        <span style={{ fontSize: textSize, fontWeight: 700, fontFamily: t.fontDisplay, letterSpacing: '-0.2px', whiteSpace: 'nowrap' }}>
          <span style={{ color: isLight ? '#F7F3EC' : t.forest }}>Dia</span>
          <span style={{ color: isLight ? t.sage : t.sageDeep }}>Buddy</span>
        </span>
      )}
    </div>
  );
}
