/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00f0ff',
          pink: '#ff00e5',
          green: '#39ff14',
          yellow: '#f0ff00',
          purple: '#bf00ff',
        },
        cyber: {
          dark: '#0a0a1a',
          darker: '#050510',
          card: '#111128',
          border: '#1a1a3e',
        },
      },
      fontFamily: {
        cyber: ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 10px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.2)',
        'neon-pink': '0 0 10px rgba(255, 0, 229, 0.5), 0 0 40px rgba(255, 0, 229, 0.2)',
        'neon-green': '0 0 10px rgba(57, 255, 20, 0.5), 0 0 40px rgba(57, 255, 20, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 255, 255, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 255, 255, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
