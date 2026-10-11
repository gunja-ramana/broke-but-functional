/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: {
          DEFAULT: '#0f172a',
          hover: '#1e293b',
          card: '#111b2e',
          border: '#1e293b',
        },
        brand: {
          primary: '#10b981', // vibrant emerald/lime
          accent: '#00f59b',  // neon mint
          warning: '#f59e0b',
          danger: '#f43f5e',
          info: '#38bdf8',
          purple: '#a855f7',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-brand': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'glow-danger': '0 0 25px -5px rgba(244, 63, 94, 0.25)',
      }
    },
  },
  plugins: [],
}
