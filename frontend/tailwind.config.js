/** @type {import('tailwindcss').Config} */

import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

export default {
  // 'media' is more robust than 'class' — respects OS preference automatically.
  // Switch back to 'class' only if you need a manual toggle button.
  darkMode: 'class',

  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  theme: {
    extend: {

      /* ===============================
         FONTS
         Syne for display headings,
         DM Sans for body — matches index.html
      =============================== */

      fontFamily: {
        display: ['Syne', ...defaultTheme.fontFamily.sans],
        sans:    ['DM Sans', ...defaultTheme.fontFamily.sans],
        mono:    ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },

      /* ===============================
         COLORS
         Semantic naming → easier theming,
         consistent with Dashboard + WellnessCard.
         Each brand hue has a full 50-900 scale
         so Tailwind utilities (bg-brand-100,
         text-brand-700, etc.) all work.
      =============================== */

      colors: {

        /* ── Brand / Primary ── */
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',   // primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },

        /* ── Accent / Violet ── */
        accent: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',   // accent
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },

        /* ── Teal / Calm ── */
        calm: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',   // calm
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },

        /* ── Rose / Alert ── */
        alert: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',   // alert
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },

        /* ── Amber / Warm ── */
        warm: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',   // warm
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },

        /* ── Surfaces (light + dark) ── */
        surface: {
          DEFAULT: 'rgba(255,255,255,0.80)',
          subtle:  'rgba(255,255,255,0.50)',
          dark:    'rgba(15,23,42,0.80)',
          glass:   'rgba(255,255,255,0.72)',
        },

        /* ── Base ink / page ── */
        ink:   '#0f172a',
        night: '#020617',
        mist:  '#f8fbff',
      },

      /* ===============================
         TYPOGRAPHY SCALE
         Adds a few extra steps above
         Tailwind's default for hero text.
      =============================== */

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        '8xl': ['6rem',     { lineHeight: '1'    }],
        '9xl': ['8rem',     { lineHeight: '1'    }],
      },

      /* ===============================
         LETTER SPACING
      =============================== */

      letterSpacing: {
        widest2: '0.2em',
        widest3: '0.3em',
      },

      /* ===============================
         SHADOWS
         Named by intent, not intensity.
         Avoids magic numbers scattered
         across components.
      =============================== */

      boxShadow: {
        // Elevation
        'xs':      '0 1px 4px rgba(15,23,42,0.06)',
        'sm':      '0 4px 16px rgba(15,23,42,0.08)',
        'md':      '0 10px 40px rgba(15,23,42,0.10)',
        'lg':      '0 20px 60px rgba(15,23,42,0.14)',
        'xl':      '0 30px 80px rgba(15,23,42,0.18)',

        // Glow — brand colour
        'glow-sm': '0 0 20px rgba(99,102,241,0.15)',
        'glow':    '0 0 45px rgba(99,102,241,0.22)',
        'glow-lg': '0 0 80px rgba(99,102,241,0.30)',

        // Glow — calm/teal
        'glow-calm': '0 0 45px rgba(20,184,166,0.22)',

        // Card hover — used by WellnessCard
        'card-hover': '0 16px 48px rgba(99,102,241,0.18)',

        // Glass panel
        'glass':   '0 8px 32px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.6)',

        // Dark-mode inner glow
        'inner-glow': 'inset 0 0 30px rgba(99,102,241,0.10)',
      },

      /* ===============================
         BACKDROP BLUR
      =============================== */

      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
        '3xl': '64px',
      },

      /* ===============================
         BORDER RADIUS
      =============================== */

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },

      /* ===============================
         SPACING EXTRAS
         A few large values for hero
         sections and blob positioning.
      =============================== */

      spacing: {
        '18':  '4.5rem',
        '22':  '5.5rem',
        '30':  '7.5rem',
        '128': '32rem',
        '144': '36rem',
      },

      /* ===============================
         BACKGROUND SIZE
      =============================== */

      backgroundSize: {
        shimmer: '200% 100%',
        '200':   '200% 200%',
      },

      /* ===============================
         KEYFRAMES
      =============================== */

      keyframes: {

        // Gentle floating — orb / hero elements
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%':      { transform: 'translate3d(0, -18px, 0) scale(1.04)' },
        },

        // Slow breath — ambient blobs
        breathe: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':      { opacity: '0.8', transform: 'scale(1.10)' },
        },

        // Loading shimmer — skeleton cards
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },

        // Entrance — used by AnimatedPage + WellnessCard
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },

        // Entrance — horizontal
        fadeRight: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to:   { opacity: '1', transform: 'translateX(0)'     },
        },

        // Box-shadow glow pulse
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 25px rgba(99,102,241,0.15)' },
          '50%':      { boxShadow: '0 0 55px rgba(99,102,241,0.35)' },
        },

        // Conic spinner — ring loader
        spin: {
          to: { transform: 'rotate(360deg)' },
        },

        // Scale in — modal / popover
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)'    },
        },

        // Slide down — dropdown / toast
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to:   { opacity: '1', transform: 'translateY(0)'     },
        },
      },

      /* ===============================
         ANIMATIONS
         Duration and easing are set here
         so they're consistent everywhere.
      =============================== */

      animation: {
        'float':       'float 9s ease-in-out infinite',
        'breathe':     'breathe 7s ease-in-out infinite',
        'shimmer':     'shimmer 2.5s linear infinite',
        'fade-up':     'fadeUp 0.45s ease forwards',
        'fade-right':  'fadeRight 0.45s ease forwards',
        'glow':        'glowPulse 4s ease-in-out infinite',
        'scale-in':    'scaleIn 0.3s ease forwards',
        'slide-down':  'slideDown 0.3s ease forwards',
        'spin-slow':   'spin 8s linear infinite',

        // Staggered fade-ups — apply via delay utility
        'fade-up-1':   'fadeUp 0.45s 0.07s ease forwards both',
        'fade-up-2':   'fadeUp 0.45s 0.14s ease forwards both',
        'fade-up-3':   'fadeUp 0.45s 0.21s ease forwards both',
        'fade-up-4':   'fadeUp 0.45s 0.28s ease forwards both',
      },
    },
  },

  plugins: [

    // ── Utility: glass morphism surface ───────────────────────────────────
    plugin(({ addUtilities, theme }) => {
      addUtilities({
        '.glass': {
          background:       theme('colors.surface.glass'),
          backdropFilter:   'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border:           '1px solid rgba(255,255,255,0.18)',
          boxShadow:        theme('boxShadow.glass'),
        },
        '.glass-dark': {
          background:       'rgba(15,23,42,0.72)',
          backdropFilter:   'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border:           '1px solid rgba(255,255,255,0.08)',
          boxShadow:        theme('boxShadow.md'),
        },

        // ── Gradient text shorthand ────────────────────────────────────
        '.text-gradient': {
          background:          'linear-gradient(135deg, #6366f1, #14b8a6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip:      'text',
        },
        '.text-gradient-warm': {
          background:          'linear-gradient(135deg, #f59e0b, #fb7185)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip:      'text',
        },

        // ── Visually hidden (a11y) ─────────────────────────────────────
        '.sr-only': {
          position:   'absolute',
          width:      '1px',
          height:     '1px',
          padding:    '0',
          margin:     '-1px',
          overflow:   'hidden',
          clip:       'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border:     '0',
        },

        // ── Scrollbar hide ─────────────────────────────────────────────
        '.scrollbar-hide': {
          '-ms-overflow-style':  'none',
          'scrollbar-width':     'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },

        // ── Safe area padding (notch / home bar) ──────────────────────
        '.pt-safe': { paddingTop:    'env(safe-area-inset-top)'    },
        '.pb-safe': { paddingBottom: 'env(safe-area-inset-bottom)' },
        '.pl-safe': { paddingLeft:   'env(safe-area-inset-left)'   },
        '.pr-safe': { paddingRight:  'env(safe-area-inset-right)'  },
      });
    }),
  ],
};