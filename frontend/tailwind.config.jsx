export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F7F3EC',
        surface: '#FFFFFF',
        'surface-sunken': '#EFEAE0',
        'surface-raised': '#FCFAF5',
        ink: '#2B2A28',
        'ink-soft': '#6B6660',
        'ink-faint': '#A39E92',
        line: '#E3DDD0',
        'line-strong': '#D3CBB9',
        sky: { DEFAULT: '#5E87A0', deep: '#496D82', soft: '#DCE7EA', tint: '#EEF4F6' },
        sage: { DEFAULT: '#7C9470', deep: '#62795A', soft: '#E3E8DA', tint: '#EFF2E9' },
        clay: { DEFAULT: '#C2724F', deep: '#A65D3D', soft: '#F3DFD4', tint: '#F8EBE3' },
        gold: { DEFAULT: '#B8902E', soft: '#F3EBCB', tint: '#FAF5E3' },
      },
      fontFamily: {
        display: ["'Fraunces'", 'Georgia', 'serif'],
        body: ["'Inter'", 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(43,42,40,0.04), 0 8px 24px rgba(43,42,40,0.06)',
        lifted: '0 4px 12px rgba(43,42,40,0.06), 0 16px 40px rgba(43,42,40,0.08)',
      },
    },
  },
  plugins: [],
}
