/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Quicksand', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        clay: {
          bg: '#EAE6F7',
          surface: '#F3F0FB',
          surfaceDark: '#2B2640',
          bgDark: '#201C30',
          primary: '#8B7FE8',
          primaryDark: '#A79CF0',
          secondary: '#6FD6C4',
          secondaryDark: '#7FE3D1',
          danger: '#EF8B8B',
          dangerDark: '#F2A0A0',
          text: '#463F5E',
          textDark: '#E7E3F7',
          muted: '#8E86A8',
          mutedDark: '#A79EC7',
        },
      },
      boxShadow: {
        clay: '8px 8px 16px rgba(163,157,199,0.45), -8px -8px 16px rgba(255,255,255,0.8)',
        'clay-sm': '4px 4px 10px rgba(163,157,199,0.4), -4px -4px 10px rgba(255,255,255,0.75)',
        'clay-inset': 'inset 5px 5px 10px rgba(163,157,199,0.45), inset -5px -5px 10px rgba(255,255,255,0.7)',
        'clay-dark': '8px 8px 16px rgba(0,0,0,0.55), -8px -8px 16px rgba(255,255,255,0.04)',
        'clay-dark-sm': '4px 4px 10px rgba(0,0,0,0.5), -4px -4px 10px rgba(255,255,255,0.035)',
        'clay-dark-inset': 'inset 5px 5px 10px rgba(0,0,0,0.5), inset -5px -5px 10px rgba(255,255,255,0.03)',
      },
      borderRadius: {
        clay: '28px',
        'clay-lg': '36px',
      },
      keyframes: {
        fade: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: 0.7 },
          '70%': { transform: 'scale(1.4)', opacity: 0 },
          '100%': { transform: 'scale(1.4)', opacity: 0 },
        },
      },
      animation: {
        fade: 'fade 0.3s ease-in-out',
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.2, 0.6, 0.4, 1) infinite',
      },
    },
  },
  plugins: [],
}
