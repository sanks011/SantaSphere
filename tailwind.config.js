/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        holiday: {
          red: '#D42F2F',
          green: '#0B6E4F',
          gold: '#FFB800',
          snow: '#F3F4F6',
          pine: '#1A472A',
        },
      },
      scale: {
        '101': '1.01',
        '102': '1.02',
        '103': '1.03',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'snow-fall': 'snow-fall 10s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'snow-fall': {
          '0%': { transform: 'translateY(-10vh) translateX(0)' },
          '100%': { transform: 'translateY(100vh) translateX(20px)' },
        },
      },
    },
  },
  plugins: [],
}