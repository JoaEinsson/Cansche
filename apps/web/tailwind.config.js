/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        linear: {
          base: '#0b0c0e',
          surface: '#14151a',
          elevated: '#1c1d24',
          subtle: '#22232a',
          border: '#2a2b36',
          brand: '#5e6ad2',
          'brand-hover': '#4f5bc4',
          text: '#f1f2f4',
          muted: '#8f94a0',
          darkMuted: '#585d6a',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
