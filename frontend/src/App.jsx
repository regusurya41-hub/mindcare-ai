import { lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Navigate,
  Route,
  Routes,
  useLocation
} from 'react-router-dom';

import { useAuth } from './context/AuthContext.jsx';
import AppLayout from './components/layout/AppLayout.jsx';

// Lazy pages
const Landing = lazy(() => import('./pages/Landing.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Chat = lazy(() => import('./pages/Chat.jsx'));
const MoodTracker = lazy(() => import('./pages/MoodTracker.jsx'));
const Journal = lazy(() => import('./pages/Journal.jsx'));
const Community = lazy(() => import('./pages/Community.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const CalmMode = lazy(() => import('./pages/CalmMode.jsx'));

function PageLoader() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-white">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-120px] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo to-violet shadow-2xl shadow-indigo-500/30">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>

        <h2 className="mt-6 text-2xl font-extrabold">
          MindCare AI
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Loading your wellness space...
        </p>
      </motion.div>
    </div>
  );
}

function Protected({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return user ? (
    children
  ) : (
    <Navigate
      to="/login"
      replace
    />
  );
}

function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{
        duration: 0.35,
        ease: 'easeOut'
      }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes
          location={location}
          key={location.pathname}
        >
          <Route
            path="/"
            element={
              <AnimatedPage>
                <Landing />
              </AnimatedPage>
            }
          />

          <Route
            path="/login"
            element={
              <AnimatedPage>
                <Login />
              </AnimatedPage>
            }
          />

          <Route
            path="/signup"
            element={
              <AnimatedPage>
                <Signup />
              </AnimatedPage>
            }
          />

          <Route
            path="/app"
            element={
              <Protected>
                <AnimatedPage>
                  <AppLayout />
                </AnimatedPage>
              </Protected>
            }
          >
            <Route
              index
              element={<Dashboard />}
            />

            <Route
              path="chat"
              element={<Chat />}
            />

            <Route
              path="moods"
              element={<MoodTracker />}
            />

            <Route
              path="journal"
              element={<Journal />}
            />

            <Route
              path="calm"
              element={<CalmMode />}
            />

            <Route
              path="community"
              element={<Community />}
            />

            <Route
              path="settings"
              element={<Settings />}
            />
          </Route>

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}