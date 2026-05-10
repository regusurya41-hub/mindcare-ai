export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#17202a',
        mist: '#eff8f6',
        sage: '#7aa89d',
        lagoon: '#0f766e',
        coral: '#ef8d7b',
        amberlight: '#f6c56f'
      },
      boxShadow: {
        glow: '0 24px 80px rgba(15, 118, 110, 0.18)'
      }
    }
  },
  plugins: []
};
