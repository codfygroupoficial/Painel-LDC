/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ldc: {
          green: '#16a34a',
          orange: '#f59e0b',
          red: '#dc2626',
          blue: '#2563eb',
          purple: '#7c3aed',
          dark: '#111827',
        },
      },
    },
  },
  plugins: [],
}
