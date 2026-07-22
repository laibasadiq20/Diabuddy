/** @type {import('tailwindcss').Config} */
/**
 * Tailwind v4 is loaded via `@tailwindcss/vite` in vite.config.js.
 * This file documents design tokens / content paths for tooling that still
 * reads a classic config. Prefer theme.js and CSS variables in index.css.
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F7F3EC',
        ink: '#1F1E1C',
        sky: '#5E87A0',
        sage: '#7C9470',
        forest: '#27392E',
        clay: '#C2724F',
        peach: '#E8B89A',
        gold: '#B8902E',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        db: '16px',
      },
    },
  },
  plugins: [],
};
