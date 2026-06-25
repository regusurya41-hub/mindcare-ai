import { lazy, Suspense, useEffect } from 'react';

import {
  AnimatePresence,
  motion
} from 'framer-motion';

import {
  Navigate,
  Route,
  Routes,
  useLocation
} from 'react-router-dom';

import { useAuth } from './context/AuthContext.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import ExportPDF from './pages/ExportPDF';

/* ===============================
   Lazy Pages
=============================== */

const Landing    = lazy(() => import('./pages/Landing.jsx'));
const Login      = lazy(() => import('./pages/Login.jsx'));
const Signup     = lazy(() => import('./pages/Signup.jsx'));
const Dashboard  = lazy(() => import('./pages/Dashboard.jsx'));
const Chat       = lazy(() => import('./pages/Chat.jsx'));
const MoodTracker= lazy(() => import('./pages/MoodTracker.jsx'));
const Journal    = lazy(() => import('./pages/Journal.jsx'));
const Community  = lazy(() => import('./pages/Community.jsx'));
const Settings   = lazy(() => import('./pages/Settings.jsx'));
const CalmMode   = lazy(() => import('./pages/CalmMode.jsx'));
const Assessments= lazy(() => import('./pages/Assessments.jsx'));
const Insights   = lazy(() => import('./pages/Insights.jsx'));
const Resources  = lazy(() => import('./pages/Resources.jsx'));
const Onboarding = lazy(() => import('./pages/Onboarding.jsx'));
const Progress   = lazy(() => import('./pages/Progress.jsx'));

/* ===============================
   Page Loader
=============================== */

function PageLoader() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#f8fbff] via-[#eef2ff] to-[#ffffff] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="ambient-layer">
        <div className="ambient-orb left-[-8rem] top-0 h-80 w-80 bg-brand-500/20 dark:bg-brand-500/10" />
        <div className="ambient-orb right-[-8rem] top-20 h-80 w-80 bg-accent-500/20 dark:bg-accent-500/10" />
        <div className="ambient-orb bottom-[-8rem] left-1/3 h-96 w-96 bg-calm-500/10" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="glass relative z-10 rounded-[34px] px-10 py-10 text-center"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-brand-500 to-accent-500 shadow-2xl shadow-brand-500/25">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="h-9 w-9 rounded-full border-[3px] border-white border-t-transparent"
          />
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          MindCare AI
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          Preparing your wellness experience...
        </p>
      </motion.div>
    </div>
  );
}

/* ===============================
   Protected Route
=============================== */

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" replace />;
}

/* ===============================
   Animated Page Wrapper
=============================== */

function AnimatedPage({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0,  scale: 1      }}
      exit={{    opacity: 0, y: -12               }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen"
    >
      {children}
    </motion.main>
  );
}

/* ===============================
   Main App
=============================== */

export default function App() {
  const location = useLocation();

  // Restore daily reminder notifications on app start
  useEffect(() => {
    import('./services/notifications.js')
      .then(({ restoreReminder }) => restoreReminder())
      .catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900 dark:text-white">

      {/* Ambient background orbs */}
      <div className="ambient-layer">
        <div className="ambient-orb left-[-10rem] top-0    h-96 w-96       bg-brand-500/15  dark:bg-brand-500/10"  />
        <div className="ambient-orb right-[-8rem] top-10   h-[28rem] w-[28rem] bg-accent-500/15 dark:bg-accent-500/10" />
        <div className="ambient-orb bottom-[-10rem] left-1/3 h-[32rem] w-[32rem] bg-calm-500/10"                      />
      </div>

      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>

            {/* ── Public ── */}
            <Route path="/"       element={<AnimatedPage><Landing  /></AnimatedPage>} />
            <Route path="/login"  element={<AnimatedPage><Login    /></AnimatedPage>} />
            <Route path="/signup" element={<AnimatedPage><Signup   /></AnimatedPage>} />

            {/* ── Protected app ── */}
            <Route
              path="/app"
              element={
                <Protected>
                  <AnimatedPage><AppLayout /></AnimatedPage>
                </Protected>
              }
            >
              <Route index                element={<Dashboard   />} />
              <Route path="chat"          element={<Chat        />} />
              <Route path="moods"         element={<MoodTracker />} />
              <Route path="journal"       element={<Journal     />} />
              <Route path="calm"          element={<CalmMode    />} />
              <Route path="assessments"   element={<Assessments />} />
              <Route path="insights"      element={<Insights    />} />
              <Route path="resources"     element={<Resources   />} />
              <Route path="community"     element={<Community   />} />
              <Route path="settings"      element={<Settings    />} />
              <Route path="export"        element={<ExportPDF   />} />
              <Route path="onboarding"    element={<Onboarding  />} />
              <Route path="progress"      element={<Progress    />} />
            </Route>

            {/* ── 404 ── */}
            <Route
              path="*"
              element={
                <div className="flex min-h-screen items-center justify-center px-6">
                  <div className="glass max-w-md rounded-[34px] p-10 text-center">
                    <h1 className="text-7xl font-black text-brand-500">404</h1>
                    <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                      Page not found
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                      The page you're looking for doesn't exist or was moved.
                    </p>
                    <a href="/" className="btn-primary mt-6 inline-flex">
                      Go Home
                    </a>
                  </div>
                </div>
              }
            />

          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}