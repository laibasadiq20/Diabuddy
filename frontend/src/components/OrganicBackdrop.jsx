import { theme } from '../theme';

const t = theme;

/**
 * The organic, botanical backdrop from the marketing hero: a deep forest
 * gradient on the left fading into warm peach on the right, with soft
 * overlapping leaf/circle blobs and a fine grain texture. Used as a single,
 * unsplit full-bleed background — never as two separate color panels — so
 * every screen that uses it (landing hero, auth pages) reads as one
 * continuous scene rather than a divided layout.
 *
 * `tone="full"` shows the full forest→peach hero gradient (landing page).
 * `tone="deep"` keeps the same motif but weighted darker/quieter, sized for
 * auth screens where a centered card needs to stay legible on top.
 */
export default function OrganicBackdrop({ tone = 'full' }) {
  const isDeep = tone === 'deep';

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: isDeep
          ? `linear-gradient(135deg, ${t.forestDeep} 0%, ${t.forest} 38%, #4a4332 70%, #7a5d44 100%)`
          : `linear-gradient(100deg, ${t.forestDeep} 0%, ${t.forest} 32%, #5b4f3a 58%, #a9805d 78%, ${t.peachSoft} 100%)`,
      }}
    >
      {/* grain texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* large peach circle, upper right */}
      <div
        style={{
          position: 'absolute',
          top: '-12%',
          right: isDeep ? '-18%' : '4%',
          width: isDeep ? '52%' : '46%',
          height: isDeep ? '70%' : '78%',
          background: `radial-gradient(circle, ${t.peachSoft}55 0%, transparent 72%)`,
          borderRadius: '50%',
        }}
      />

      {/* second peach circle, lower right, only on full hero */}
      {!isDeep && (
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-6%',
            width: '40%',
            height: '60%',
            background: `radial-gradient(circle, ${t.peach}45 0%, transparent 70%)`,
            borderRadius: '50%',
          }}
        />
      )}

      {/* warm glow, lower left — echoes the heart/terracotta motif */}
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: '46%',
          height: '50%',
          background: `radial-gradient(circle, ${t.clay}22 0%, transparent 70%)`,
          borderRadius: '50%',
        }}
      />

      {/* sage leaf shapes, lower right */}
      <svg
        style={{ position: 'absolute', bottom: isDeep ? '-4%' : '-2%', right: isDeep ? '0%' : '8%', width: isDeep ? '160px' : '220px', opacity: isDeep ? 0.35 : 0.55 }}
        viewBox="0 0 200 200"
        fill="none"
      >
        <ellipse cx="120" cy="150" rx="36" ry="70" fill={t.sage} opacity="0.5" transform="rotate(35 120 150)" />
        <ellipse cx="70" cy="170" rx="28" ry="56" fill={t.sageDeep} opacity="0.4" transform="rotate(-15 70 170)" />
        <circle cx="165" cy="120" r="5" fill={t.clay} opacity="0.6" />
        <circle cx="178" cy="135" r="4" fill={t.clay} opacity="0.5" />
        <circle cx="158" cy="138" r="3.5" fill={t.clay} opacity="0.55" />
      </svg>

      {/* tiny sparkle accents, full hero only */}
      {!isDeep && (
        <>
          <svg style={{ position: 'absolute', top: '22%', left: '37%', width: '18px', opacity: 0.5 }} viewBox="0 0 24 24" fill="none">
            <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill={t.peachSoft} />
          </svg>
          <svg style={{ position: 'absolute', top: '15%', left: '10%', width: '8px', opacity: 0.4 }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" fill={t.peachSoft} />
          </svg>
        </>
      )}
    </div>
  );
}
