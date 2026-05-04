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
        sakura: {
          50: '#fef7f7',
          100: '#fdeef0',
          200: '#fbd5db',
          300: '#f8b0bb',
          400: '#f48295',
          500: '#eb5571',
          600: '#d83454',
          700: '#b52744',
          800: '#97243e',
          900: '#812239',
        },
        indigo: {
          950: '#0a0e27',
        },
        nihon: {
          dark: '#0f1729',
          darker: '#080d1a',
          card: '#151e35',
          border: '#1e2a4a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        japanese: ['"Noto Sans JP"', '"Hiragino Sans"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'stroke-draw': 'strokeDraw 1s ease-in-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        strokeDraw: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(235, 85, 113, 0.15)',
        'glow-lg': '0 0 40px rgba(235, 85, 113, 0.2)',
      },
    },
  },
  plugins: [],
}
