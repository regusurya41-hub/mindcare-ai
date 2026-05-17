import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Bot,
  ChartSpline,
  HeartPulse,
  Home,
  LogOut,
  Menu,
  Moon,
  PenLine,
  Settings,
  Sparkles,
  SunMedium,
  UsersRound,
  X
} from 'lucide-react';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

const items = [
  { to: '/app', label: 'Dashboard', icon: Home },
  { to: '/app/chat', label: 'AI Chat', icon: Bot },
  { to: '/app/moods', label: 'Mood', icon: ChartSpline },
  { to: '/app/journal', label: 'Journal', icon: PenLine },
  { to: '/app/calm', label: 'Calm Mode', icon: Sparkles },
  { to: '/app/community', label: 'Community', icon: UsersRound },
  { to: '/app/settings', label: 'Settings', icon: Settings }
];

const mobileItems = items.filter((item) =>
  ['Dashboard', 'AI Chat', 'Mood', 'Calm Mode', 'Settings'].includes(item.label)
);

function getSmartGreeting() {
  const hour = new Date().getHours();

  if (hour < 5) {
    return {
      label: 'Late night check-in',
      message: 'Keep things soft and simple right now.'
    };
  }

  if (hour < 12) {
    return {
      label: 'Good morning',
      message: 'Start with one kind step toward yourself.'
    };
  }

  if (hour < 17) {
    return {
      label: 'Good afternoon',
      message: 'Pause, breathe, and reset gently.'
    };
  }

  if (hour < 21) {
    return {
      label: 'Good evening',
      message: 'Let the day slow down at your pace.'
    };
  }

  return {
    label: 'Night mode',
    message: 'Hope your evening feels gentle today.'
  };
}

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="flex h-full flex-col gap-6 p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo to-violet text-white shadow-xl shadow-indigo/30">
          <HeartPulse size={22} />
        </div>

        <div>
          <p className="text-lg font-extrabold">
            MindCare AI
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-300">
            Private wellness
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="grid gap-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo to-violet text-white shadow-xl shadow-indigo/25'
                  : 'text-slate-600 hover:bg-white/70 dark:text-slate-200 dark:hover:bg-white/10'
              }`
            }
          >
            <Icon
              size={18}
              className="transition-transform duration-300 group-hover:scale-110"
            />

            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Card */}
      <div className="mt-auto rounded-3xl border border-white/60 bg-white/70 p-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
        <div className="flex items-center gap-3">
          <div
            className="h-11 w-11 rounded-full shadow-lg"
            style={{
              background:
                user?.avatarColor ||
                'linear-gradient(135deg,#6366f1,#8b5cf6)'
            }}
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-bold">
              {user?.name || 'Guest'}
            </p>

            <p className="truncate text-xs text-slate-500 dark:text-slate-300">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo/10 px-3 py-3 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] hover:bg-white/80 dark:border-white/10 dark:hover:bg-white/10"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-3xl border border-white/70 bg-white/75 p-2 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/70 lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {mobileItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo to-violet text-white shadow-lg shadow-indigo/20'
                  : 'text-slate-500 dark:text-slate-300'
              }`
            }
          >
            <Icon size={18} />

            <span className="truncate">
              {label === 'Calm Mode'
                ? 'Calm'
                : label.replace('AI ', '')}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function AppLayout() {
  const [open, setOpen] = useState(false);

  const { dark, toggleDark } = useTheme();

  const greeting = getSmartGreeting();

  return (
    <div className="relative min-h-screen p-3 pb-24 text-ink dark:text-white lg:p-5">
      {/* Background */}
      <div className="ambient-layer">
        <div className="ambient-orb left-[-7rem] top-24 h-72 w-72 animate-float bg-violet/20 dark:bg-violet/15" />

        <div className="ambient-orb right-[-8rem] top-10 h-80 w-80 animate-slow-pulse bg-lagoon/20 dark:bg-lagoon/10" />

        <div className="ambient-orb bottom-[-10rem] left-1/3 h-96 w-96 animate-float bg-indigo/15 dark:bg-indigo/10" />
      </div>

      <div className="mx-auto flex max-w-7xl gap-5">
        {/* Desktop Sidebar */}
        <div className="glass sticky top-5 hidden h-[calc(100vh-40px)] w-72 rounded-[32px] lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden"
            >
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: 'spring', damping: 24 }}
                className="glass relative h-full w-80 rounded-r-[32px]"
              >
                <button
                  className="absolute right-5 top-5 rounded-full bg-white/80 p-2 dark:bg-white/10"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>

                <Sidebar onNavigate={() => setOpen(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-3 z-30 mb-5 flex items-center justify-between rounded-3xl border border-white/70 bg-white/65 px-4 py-3 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.08] lg:top-5"
          >
            <button
              className="rounded-2xl bg-white/80 p-2 transition hover:scale-105 lg:hidden dark:bg-white/10"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-sm font-semibold text-indigo dark:text-indigo-200">
                {greeting.label}
              </p>

              <h1 className="text-lg font-extrabold leading-tight tracking-tight sm:text-xl">
                {greeting.message}
              </h1>
            </div>

            <button
              className="rounded-2xl bg-white/80 p-3 transition-all duration-300 hover:scale-105 dark:bg-white/10"
              onClick={toggleDark}
              aria-label="Toggle dark mode"
            >
              {dark ? (
                <SunMedium size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>
          </motion.header>

          {/* Page */}
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}