/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF6ED',
        ink: '#20241F',
        forest: {
          50: '#EEF5EC',
          100: '#D9E9D3',
          400: '#5C9A57',
          500: '#3F7D3D',
          600: '#2F6430',
          700: '#234B24',
        },
        amber: {
          400: '#E9A93B',
          500: '#DB9420',
        },
        clay: '#C96A4B',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(32,36,31,0.04), 0 8px 24px -12px rgba(32,36,31,0.18)',
        float: '0 10px 30px -8px rgba(47,100,48,0.55)',
      },
      borderRadius: {
        xl2: '1.75rem',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { transform: 'translateY(16px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        scaleIn: { from: { transform: 'scale(0.96)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
        pulseRing: { '0%,100%': { boxShadow: '0 0 0 0 rgba(63,125,61,0.35)' }, '50%': { boxShadow: '0 0 0 8px rgba(63,125,61,0)' } },
      },
      animation: {
        fadeIn: 'fadeIn .2s ease',
        slideUp: 'slideUp .28s cubic-bezier(.2,.8,.2,1)',
        scaleIn: 'scaleIn .22s cubic-bezier(.2,.8,.2,1)',
        pulseRing: 'pulseRing 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
