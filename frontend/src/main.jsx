import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

import './styles.css';

/* ─────────────────────────────────────────────────────
   Flash-of-unstyled-content guard
   Reads the persisted theme BEFORE first paint so the
   background is correct before React even mounts.
───────────────────────────────────────────────────── */

const STORAGE_KEY = 'app-theme';

function applyInitialTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;

    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.classList.add('scroll-smooth');

    // Match the CSS variable background exactly — no jarring white flash
    root.style.background = isDark ? '#110e0b' : '#faf8f5';
  } catch {
    // localStorage may be blocked in private browsing — silently ignore
  }
}

applyInitialTheme();

/* ─────────────────────────────────────────────────────
   Toast configuration
   Centralised here so styling stays in sync with the
   design system in styles.css. Update once, works everywhere.
───────────────────────────────────────────────────── */

const TOAST_BASE_STYLE = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: '13.5px',
  fontWeight: '500',
  lineHeight: '1.5',
  borderRadius: '14px',
  padding: '12px 16px',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  maxWidth: '360px',
};

const TOAST_LIGHT = {
  ...TOAST_BASE_STYLE,
  background: 'rgba(255, 252, 248, 0.92)',
  color: '#1c1410',
  border: '1px solid rgba(180, 160, 130, 0.22)',
  boxShadow: '0 8px 28px rgba(28, 20, 16, 0.12), 0 1px 0 rgba(255,255,255,0.6) inset',
};

const TOAST_DARK = {
  ...TOAST_BASE_STYLE,
  background: 'rgba(35, 28, 20, 0.92)',
  color: '#f5ede4',
  border: '1px solid rgba(255, 220, 180, 0.10)',
  boxShadow: '0 8px 28px rgba(0, 0, 0, 0.40)',
};

function getToastStyle() {
  return document.documentElement.classList.contains('dark')
    ? TOAST_DARK
    : TOAST_LIGHT;
}

const toastConfig = {
  position: /** @type {const} */ ('top-right'),
  reverseOrder: false,
  gutter: 10,
  containerStyle: { top: 16, right: 16 },
  toastOptions: {
    duration: 3500,
    style: getToastStyle(),
    success: {
      duration: 3000,
      iconTheme: { primary: '#c85a14', secondary: '#fff' },
    },
    error: {
      duration: 5000,
      iconTheme: { primary: '#dc2626', secondary: '#fff' },
    },
    loading: {
      duration: Infinity,
    },
  },
};

/* ─────────────────────────────────────────────────────
   Root element guard
   Fail loudly in development, gracefully in production.
───────────────────────────────────────────────────── */

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    '[main.jsx] Could not find #root element. ' +
    'Make sure index.html contains <div id="root"></div>.'
  );
}

/* ─────────────────────────────────────────────────────
   Render tree
───────────────────────────────────────────────────── */

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider storageKey={STORAGE_KEY}>
        <AuthProvider>

          <Toaster {...toastConfig} />

          <div className="min-h-screen text-[var(--text-primary)]">
            <App />
          </div>

        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

/* ─────────────────────────────────────────────────────
   Service worker — production only
   Silently swallows registration errors so a failed SW
   never breaks the app, but logs in development to help
   debugging.
───────────────────────────────────────────────────── */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    if (!import.meta.env.PROD) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      // Prompt users to reload when a new SW version is waiting
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // Defer to your toast/notification system here if you want a
            // "New version available — reload?" UX.
            console.info('[SW] New version available. Refresh to update.');
          }
        });
      });
    } catch (err) {
      console.warn('[SW] Registration failed:', err);
    }
  });
}