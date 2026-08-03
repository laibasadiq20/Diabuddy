// DiaBuddy theme tokens — "Paper & Sky"
// A warm, parchment-based palette designed for a daily-use health companion app.
// Two functional accents (sky = data/glucose, sage = body/wellness actions) plus
// a single warm alert color (clay) and a time/reminder color (gold).
// Kept intentionally restrained: most surfaces are quiet paper tones, and color
// is reserved for things that mean something (status, action, time).

// Surface/text/line tokens are wired to the CSS custom properties defined in
// index.css (--bg, --ink, --line, etc.) so toggling `data-theme="dark"` on
// <html> re-skins every screen that reads these values — no per-component
// dark-mode branching needed. Brand accent hues (sky/sage/clay/gold/forest)
// stay visually consistent between modes on purpose; only their soft/tint
// backgrounds shift (also via CSS vars) so badges/alerts still read cleanly
// on a dark surface.
export const theme = {
  // Base surfaces
  bg: 'var(--bg, #F7F3EC)',                     // warm parchment — page background
  surface: 'var(--surface, #FFFFFF)',           // cards
  surfaceSunken: 'var(--surface-sunken, #EFEAE0)', // input backgrounds, insets
  surfaceRaised: 'var(--surface-raised, #FCFAF5)', // sidebar / subtly lifted panels

  // Text — kept darker for readable contrast on parchment
  ink: 'var(--ink, #1F1E1C)',           // primary text — warm near-black
  inkSoft: 'var(--ink-soft, #4F4A44)',   // secondary text
  inkFaint: 'var(--ink-faint, #7A746A)',  // tertiary / placeholder text

  // Lines
  line: 'var(--line, #D6CFC0)',
  lineStrong: 'var(--line-strong, #C4BBA8)',

  // Sky — data, glucose, primary brand
  sky: 'var(--sky, #5E87A0)',
  skyDeep: 'var(--sky-deep, #496D82)',
  skySoft: 'var(--sky-soft, #DCE7EA)',
  skyTint: 'var(--sky-tint, #EEF4F6)',

  // Sage — wellness actions: meds, meals, exercise, success states.
  // sageDeep is remapped in dark mode (see index.css) to a lighter muted
  // olive so italic emphasis text and chart lines stay readable on the
  // deep forest dark background instead of reading muddy/low-contrast.
  sage: 'var(--sage, #7C9470)',
  sageDeep: 'var(--sage-deep, #62795A)',
  olive: 'var(--olive, #4C5A26)',       // darker olive used for hover state on sage buttons
  sageSoft: 'var(--sage-soft, #E3E8DA)',
  sageTint: 'var(--sage-tint, #EFF2E9)',

  // Forest — the deep green used on the hero/auth backdrop and wordmark.
  // Intentionally NOT remapped for dark mode — it's a brand accent that
  // stays consistent (sidebar, hero CTAs) across both themes.
  forest: 'var(--forest, #27392E)',
  forestDeep: 'var(--forest-deep, #162119)',

  // Peach — the warm illustration tone on the right of the hero backdrop
  peach: 'var(--peach, #E8B89A)',
  peachSoft: 'var(--peach-soft, #F3D8C2)',

  // Clay — the single warm alert/CTA-highlight color
  clay: 'var(--clay, #C2724F)',
  clayDeep: 'var(--clay-deep, #A65D3D)',
  claySoft: 'var(--clay-soft, #F3DFD4)',
  clayTint: 'var(--clay-tint, #F8EBE3)',

  // Gold — time-sensitive / reminders
  gold: 'var(--gold, #B8902E)',
  goldSoft: 'var(--gold-soft, #F3EBCB)',
  goldTint: 'var(--gold-tint, #FAF5E3)',

  // Shared "top of page" fade used behind hero headers on Dashboard/Logs/
  // Reports/Community — swaps to a dark tone in dark mode instead of a
  // cream flash (see index.css --page-fade-top).
  pageFadeTop: 'var(--page-fade-top, #EDE6DA)',

  // Fonts
  fontDisplay: "'Playfair Display', Georgia, serif",
  fontBody: "'DM Sans', system-ui, -apple-system, sans-serif",

  // Shadows — soft paper in light; deeper forest lifts in dark (see --shadow-* in index.css)
  shadowCard: 'var(--shadow-card, 0 1px 2px rgba(43,42,40,0.04), 0 8px 24px rgba(43,42,40,0.06))',
  shadowLifted: 'var(--shadow-lifted, 0 4px 12px rgba(43,42,40,0.06), 0 16px 40px rgba(43,42,40,0.08))',
};
