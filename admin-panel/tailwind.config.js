/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF6ED',
        ink: '#20241F',
        forest: {
          50: '#EEF5EC', 100: '#D9E9D3', 400: '#5C9A57',
          500: '#3F7D3D', 600: '#2F6430', 700: '#234B24',
        },
        amber: { 400: '#E9A93B', 500: '#DB9420' },
        clay: '#C96A4B',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(32,36,31,0.04), 0 8px 24px -12px rgba(32,36,31,0.18)',
      },
    },
  },
  plugins: [],
};
