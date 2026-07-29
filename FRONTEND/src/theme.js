// DiaBuddy theme tokens — "Paper & Sky"
// A warm, parchment-based palette designed for a daily-use health companion app.
// Two functional accents (sky = data/glucose, sage = body/wellness actions) plus
// a single warm alert color (clay) and a time/reminder color (gold).
// Kept intentionally restrained: most surfaces are quiet paper tones, and color
// is reserved for things that mean something (status, action, time).

export const theme = {
  // Base surfaces
  bg: '#F7F3EC',           // warm parchment — page background
  surface: '#FFFFFF',       // cards
  surfaceSunken: '#EFEAE0', // input backgrounds, insets
  surfaceRaised: '#FCFAF5', // sidebar / subtly lifted panels

  // Text — kept darker for readable contrast on parchment
  ink: '#1F1E1C',       // primary text — warm near-black
  inkSoft: '#4F4A44',   // secondary text
  inkFaint: '#7A746A',  // tertiary / placeholder text

  // Lines
  line: '#D6CFC0',
  lineStrong: '#C4BBA8',

  // Sky — data, glucose, primary brand
  sky: '#5E87A0',
  skyDeep: '#496D82',
  skySoft: '#DCE7EA',
  skyTint: '#EEF4F6',

  // Sage — wellness actions: meds, meals, exercise, success states
  sage: '#7C9470',
  sageDeep: '#62795A',
  olive: '#4C5A26',       // darker olive used for hover state on sage buttons
  sageSoft: '#E3E8DA',
  sageTint: '#EFF2E9',

  // Forest — the deep green used on the hero/auth backdrop and wordmark
  forest: '#27392E',
  forestDeep: '#162119',

  // Peach — the warm illustration tone on the right of the hero backdrop
  peach: '#E8B89A',
  peachSoft: '#F3D8C2',

  // Clay — the single warm alert/CTA-highlight color
  clay: '#C2724F',
  clayDeep: '#A65D3D',
  claySoft: '#F3DFD4',
  clayTint: '#F8EBE3',

  // Gold — time-sensitive / reminders
  gold: '#B8902E',
  goldSoft: '#F3EBCB',
  goldTint: '#FAF5E3',

  // Fonts
  fontDisplay: "'Playfair Display', Georgia, serif",
  fontBody: "'DM Sans', system-ui, -apple-system, sans-serif",

  // Shadows — soft, warm, paper-like (never harsh black)
  shadowCard: '0 1px 2px rgba(43,42,40,0.04), 0 8px 24px rgba(43,42,40,0.06)',
  shadowLifted: '0 4px 12px rgba(43,42,40,0.06), 0 16px 40px rgba(43,42,40,0.08)',
};
