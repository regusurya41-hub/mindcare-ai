import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Bot,
  BookOpen,
  ChartSpline,
  ClipboardCheck,
  HeartPulse,
  Home,
  LifeBuoy,
  LogOut,
  Menu,
  Moon,
  PenLine,
  Settings,
  Sparkles,
  SunMedium,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

// ─── Nav items ───────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: '/app',             label: 'Dashboard',   icon: Home          },
  { to: '/app/chat',        label: 'AI Companion', icon: Bot           },
  { to: '/app/moods',       label: 'Mood Tracker', icon: ChartSpline   },
  { to: '/app/journal',     label: 'Journal',      icon: PenLine       },
  { to: '/app/calm',        label: 'Calm Space',   icon: Sparkles      },
  { to: '/app/assessments', label: 'Assessments',  icon: ClipboardCheck},
  { to: '/app/insights',    label: 'Insights',     icon: BarChart3     },
  { to: '/app/resources',   label: 'Resources',    icon: LifeBuoy      },
  { to: '/app/settings',    label: 'Settings',     icon: Settings      },
];

const MOBILE_LABELS = new Set(['Dashboard', 'AI Companion', 'Mood Tracker', 'Calm Space', 'Insights']);
const MOBILE_ITEMS  = NAV_ITEMS.filter(({ label }) => MOBILE_LABELS.has(label));

/** Shorten nav labels for the narrow bottom bar */
const shortenLabel = (label) =>
  label.replace(' Tracker', '').replace('AI ', '').replace(' Space', '');

// ─── Smart greeting ──────────────────────────────────────────────────────────

function getSmartGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return { label: 'Late-night check-in', message: 'Keep the next step soft and simple.'         };
  if (h < 12) return { label: 'Good morning',         message: 'Start with one gentle win today.'            };
  if (h < 17) return { label: 'Good afternoon',       message: 'Pause, breathe, and choose kindly.'          };
  if (h < 21) return { label: 'Good evening',         message: 'Let the day slow down at your pace.'         };
  return             { label: 'Night mode',            message: 'You made it through the day. Rest now.'      };
}

// ─── User avatar ─────────────────────────────────────────────────────────────

function UserAvatar({ user, size = 48 }) {
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'G';

  return (
    <div
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full text-sm font-bold text-white shadow-md"
      style={{
        width:  size,
        height: size,
        background: user?.avatarColor ?? 'linear-gradient(135deg,#6366f1,#a855f7)',
      }}
    >
      {initials}
    </div>
  );
}

// ─── Nav link item ───────────────────────────────────────────────────────────

function SideNavItem({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === '/app'}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm font-semibold',
          'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
          isActive
            ? 'bg-gradient-to-r from-brand-500 via-accent-500 to-fuchsia-500 text-white shadow-lg shadow-brand-500/25'
            : 'text-slate-600 hover:translate-x-0.5 hover:bg-white/70 hover:text-brand-600 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator pill */}
          {isActive && (
            <motion.span
              layoutId="sidebar-active"
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-500 via-accent-500 to-fuchsia-500"
              style={{ zIndex: -1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
          )}
          <Icon
            size={18}
            aria-hidden="true"
            className="shrink-0 transition-transform duration-200 group-hover:scale-110"
          />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  return (
    <aside
      className="flex h-full flex-col p-5"
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div className="mb-8 flex items-center gap-3.5">
        <div className="relative shrink-0">
          <div aria-hidden="true" className="absolute inset-0 rounded-3xl bg-brand-500/25 blur-xl" />
          <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 via-accent-500 to-fuchsia-500 text-white shadow-xl shadow-brand-500/30">
            <HeartPulse size={22} aria-hidden="true" />
          </div>
        </div>
        <div>
          <p className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            MindCare <span className="text-brand-500">AI</span>
          </p>
          <p className="text-[11px] font-medium tracking-wide text-slate-500 dark:text-slate-400">
            AI wellness companion
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav aria-label="App pages" className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <SideNavItem key={item.to} {...item} onClick={onNavigate} />
        ))}
      </nav>

      {/* User card */}
      <div className="mt-auto rounded-[24px] border border-white/50 bg-white/60 p-4 shadow-md backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {user?.name || 'Guest'}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-red-500/20 transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1"
        >
          <LogOut size={15} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

// ─── Mobile drawer ───────────────────────────────────────────────────────────

function MobileDrawer({ open, onClose }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-80 overflow-hidden rounded-r-[32px] border-r border-white/20 bg-white/85 shadow-2xl backdrop-blur-3xl dark:bg-slate-950/90 lg:hidden"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 shadow-sm transition-colors hover:bg-white dark:bg-white/10 dark:hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <X size={17} aria-hidden="true" />
            </button>
            <Sidebar onNavigate={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Bottom nav (mobile) ─────────────────────────────────────────────────────

function BottomNav() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-3 bottom-3 z-40 rounded-[26px] border border-white/60 bg-white/80 p-1.5 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/80 lg:hidden"
    >
      <div className="grid grid-cols-5 gap-1">
        {MOBILE_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            className={({ isActive }) =>
              [
                'flex min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2.5 text-[10px] font-bold transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                isActive
                  ? 'bg-gradient-to-r from-brand-500 via-accent-500 to-fuchsia-500 text-white shadow-lg shadow-brand-500/25'
                  : 'text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white',
              ].join(' ')
            }
          >
            <Icon size={17} aria-hidden="true" />
            <span className="truncate leading-none">{shortenLabel(label)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

// ─── Top header ──────────────────────────────────────────────────────────────

function TopHeader({ onMenuOpen }) {
  const { dark, toggleDark } = useTheme();
  const greeting = getSmartGreeting();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="sticky top-3 z-30 mb-5 flex items-center justify-between gap-4 rounded-[26px] border border-white/60 bg-white/65 px-4 py-3.5 shadow-lg backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] lg:top-5"
    >
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onMenuOpen}
          aria-label="Open navigation menu"
          aria-expanded="false"
          className="rounded-xl bg-white/80 p-2 shadow-sm transition-colors hover:bg-white dark:bg-white/10 dark:hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden"
        >
          <Menu size={19} aria-hidden="true" />
        </button>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-500 dark:text-brand-300">
            {greeting.label}
          </p>
          <h1 className="font-display text-base font-extrabold tracking-tight text-slate-900 sm:text-lg dark:text-white">
            {greeting.message}
          </h1>
        </div>
      </div>

      {/* Dark mode toggle */}
      <button
        type="button"
        onClick={toggleDark}
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 p-2.5 text-white shadow-md shadow-brand-500/25 transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
      >
        {dark ? <SunMedium size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
      </button>
    </motion.header>
  );
}

// ─── Ambient background blobs ─────────────────────────────────────────────────

function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-28 -top-28 h-[420px] w-[420px] animate-breathe rounded-full bg-brand-500/15 blur-3xl" />
      <div className="absolute -right-28 top-[8%] h-[380px] w-[380px] animate-breathe rounded-full bg-fuchsia-500/15 blur-3xl [animation-delay:2s]" />
      <div className="absolute bottom-[-150px] left-1/3 h-[420px] w-[420px] animate-breathe rounded-full bg-calm-500/15 blur-3xl [animation-delay:4s]" />
    </div>
  );
}

// ─── App Layout ───────────────────────────────────────────────────────────────

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer  = useCallback(() => setDrawerOpen(true),  []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <div className="relative min-h-svh pb-24 text-slate-900 dark:text-white lg:p-5 lg:pb-5">
      <AmbientBackground />

      <div className="mx-auto flex max-w-7xl gap-5 p-3 lg:p-0">

        {/* ── Desktop sidebar ─────────────────────────────────────────── */}
        <div className="hidden w-[268px] shrink-0 lg:block" aria-hidden="false">
          <div className="sticky top-5 h-[calc(100svh-40px)] overflow-y-auto overflow-x-hidden rounded-[32px] border border-white/60 bg-white/55 shadow-xl backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.05]">
            <Sidebar />
          </div>
        </div>

        {/* ── Mobile drawer ────────────────────────────────────────────── */}
        <MobileDrawer open={drawerOpen} onClose={closeDrawer} />

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main id="main-content" className="min-w-0 flex-1">
          <TopHeader onMenuOpen={openDrawer} />

          <div className="space-y-5">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── Mobile bottom nav ────────────────────────────────────────── */}
      <BottomNav />

      {/* Skip-to-content link (accessibility) */}
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-20 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
    </div>
  );
}