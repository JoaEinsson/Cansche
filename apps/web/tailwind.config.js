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
          base: '#08090a',
          surface: '#0f1011',
          elevated: '#161718',
          subtle: '#23252a',
          border: '#383b3f',
          brand: '#e4f222',
          'brand-hover': '#cbd922',
          text: '#e5e5e6',
          muted: '#8a8f98',
          darkMuted: '#62666d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Berkeley Mono', 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontWeight: {
        medium: '510',
        semibold: '590',
      },
    },
  },
  plugins: [],
};
