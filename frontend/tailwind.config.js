export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#111827',
        night: '#0f172a',
        mist: '#f8fafc',
        lavender: '#ede9fe',
        indigo: '#6366f1',
        violet: '#8b5cf6',
        lagoon: '#14b8a6',
        coral: '#fb7185',
        amberlight: '#fbbf24'
      },
      boxShadow: {
        glow: '0 24px 80px rgba(99, 102, 241, 0.16)',
        soft: '0 18px 55px rgba(15, 23, 42, 0.08)'
      },
      animation: {
        float: 'float 9s ease-in-out infinite',
        'slow-pulse': 'slowPulse 7s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(0, -18px, 0) scale(1.04)' }
        },
        slowPulse: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.08)' }
        }
      }
    }
  },
  plugins: []
};
