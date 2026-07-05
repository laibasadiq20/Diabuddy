import { theme } from '../theme';

const t = theme;

/** A simplified "heart held in an open hand" illustration — the central
 * motif of the hero image — rendered as flat, paper-cut style shapes so it
 * matches the warm, illustrated tone of the rest of the page. */
export default function HeartInHand({ width = 360 }) {
  return (
    <svg width={width} viewBox="0 0 360 360" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* soft glow behind the heart */}
      <circle cx="180" cy="150" r="120" fill={t.peachSoft} opacity="0.35" />

      {/* hand — open palm, simplified paper-cut shape */}
      <path
        d="M70 230c-6-30-4-66 10-92 8-15 22-26 30-18 6 6 2 20-2 32 10-10 26-22 36-16 7 4 4 16-2 26 12-8 28-14 36-6 7 7 1 18-6 26 14 6 30 18 28 32-3 22-30 46-66 52-42 7-78-8-64-36Z"
        fill={t.peach}
      />
      <path
        d="M70 230c-6-30-4-66 10-92 8-15 22-26 30-18 6 6 2 20-2 32 10-10 26-22 36-16 7 4 4 16-2 26 12-8 28-14 36-6 7 7 1 18-6 26 14 6 30 18 28 32-3 22-30 46-66 52-42 7-78-8-64-36Z"
        fill="url(#handShade)"
        opacity="0.25"
      />

      {/* heart resting in palm */}
      <path
        d="M180 110c-10-16-32-20-44-6-12 14-9 34 6 48l38 36 38-36c15-14 18-34 6-48-12-14-34-10-44 6Z"
        fill={t.clay}
      />
      <path
        d="M180 110c-10-16-32-20-44-6-9 10-9 24-1 36 8-12 22-18 34-12 6 3 9 8 11 14 2-6 5-11 11-14 12-6 26 0 34 12 8-12 8-26-1-36-12-14-34-10-44 6Z"
        fill={t.clayDeep}
        opacity="0.3"
      />

      {/* leaf accents, bottom right (echoes hero foliage) */}
      <ellipse cx="290" cy="300" rx="18" ry="38" fill={t.sage} opacity="0.8" transform="rotate(30 290 300)" />
      <ellipse cx="260" cy="320" rx="14" ry="30" fill={t.sageDeep} opacity="0.7" transform="rotate(-10 260 320)" />
      <circle cx="320" cy="270" r="5" fill={t.clay} />
      <circle cx="332" cy="284" r="4" fill={t.clay} />
      <circle cx="312" cy="288" r="3.5" fill={t.clay} />

      <defs>
        <linearGradient id="handShade" x1="70" y1="120" x2="180" y2="266" gradientUnits="userSpaceOnUse">
          <stop stopColor={t.clay} stopOpacity="0" />
          <stop offset="1" stopColor={t.clayDeep} stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  );
}
