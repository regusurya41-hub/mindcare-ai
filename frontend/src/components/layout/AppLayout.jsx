import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3, Bot, BookOpen, ChartSpline, ClipboardCheck,
  Download, HeartPulse, Home, LifeBuoy, LogOut,
  Menu, Moon, PenLine, Settings, Sparkles,
  SunMedium, Trophy, Users, X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

const NAV_ITEMS = [
  { to: '/app',             label: 'Dashboard',    icon: Home,          group: 'main'    },
  { to: '/app/chat',        label: 'AI Companion', icon: Bot,           group: 'main'    },
  { to: '/app/moods',       label: 'Mood Tracker', icon: ChartSpline,   group: 'main'    },
  { to: '/app/journal',     label: 'Journal',      icon: PenLine,       group: 'main'    },
  { to: '/app/calm',        label: 'Calm Space',   icon: Sparkles,      group: 'main'    },
  { to: '/app/insights',    label: 'Insights',     icon: BarChart3,     group: 'tools'   },
  { to: '/app/assessments', label: 'Assessments',  icon: ClipboardCheck,group: 'tools'   },
  { to: '/app/resources',   label: 'Resources',    icon: LifeBuoy,      group: 'tools'   },
  { to: '/app/community',   label: 'Community',    icon: Users,         group: 'tools'   },
  { to: '/app/progress',    label: 'Progress',     icon: Trophy,        group: 'account' },
  { to: '/app/export',      label: 'Export Data',  icon: Download,      group: 'account' },
  { to: '/app/settings',    label: 'Settings',     icon: Settings,      group: 'account' },
];

const MOBILE_ITEMS = [
  { to: '/app',         label: 'Home',    icon: Home       },
  { to: '/app/chat',    label: 'Chat',    icon: Bot        },
  { to: '/app/moods',   label: 'Moods',   icon: ChartSpline},
  { to: '/app/journal', label: 'Journal', icon: PenLine    },
  { to: '/app/calm',    label: 'Calm',    icon: Sparkles   },
];

function getSmartGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return { label: 'Late night', message: "You're up late. How are you feeling?" };
  if (h < 12) return { label: 'Good morning', message: 'Start with one gentle win today.' };
  if (h < 17) return { label: 'Good afternoon', message: 'Pause, breathe, and choose kindly.' };
  if (h < 21) return { label: 'Good evening', message: "Let the day slow down at your pace." };
  return             { label: 'Night mode', message: "You made it through. Rest well." };
}

function UserAvatar({ user, size = 44 }) {
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full text-sm font-bold text-white shadow-md"
      style={{
        width: size, height: size,
        background: 'linear-gradient(135deg,#6366f1,#a855f7)',
        boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function NavGroup({ title, items, onNavigate }) {
  return (
    <div>
      <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em]"
        style={{ color: 'rgba(148,163,184,0.7)' }}>
        {title}
      </p>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <SideNavItem key={item.to} {...item} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

function SideNavItem({ to, label, icon: Icon, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={to === '/app'}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
          isActive
            ? 'text-white shadow-lg'
            : 'hover:bg-white/10 dark:text-slate-300 dark:hover:text-white text-slate-600 hover:text-slate-900'
        }`
      }
      style={({ isActive }) => isActive ? {
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        boxShadow: '0 4px 16px rgba(99,102,241,0.30)',
      } : {}}
    >
      <Icon size={17} aria-hidden className="shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
}

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const main    = NAV_ITEMS.filter((i) => i.group === 'main');
  const tools   = NAV_ITEMS.filter((i) => i.group === 'tools');
  const account = NAV_ITEMS.filter((i) => i.group === 'account');

  return (
    <aside className="flex h-full flex-col" style={{ padding: '20px 16px' }} aria-label="Main navigation">

      {/* Brand */}
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-white"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 6px 20px rgba(99,102,241,0.35)' }}>
          <HeartPulse size={20} aria-hidden />
        </div>
        <div>
          <p className="text-base font-black tracking-tight text-slate-900 dark:text-white">
            MindCare <span style={{ color: '#6366f1' }}>AI</span>
          </p>
          <p className="text-[11px] text-slate-400">Wellness companion</p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex flex-col gap-5 flex-1 overflow-y-auto" aria-label="App pages">
        <NavGroup title="Main"    items={main}    onNavigate={onNavigate} />
        <NavGroup title="Tools"   items={tools}   onNavigate={onNavigate} />
        <NavGroup title="Account" items={account} onNavigate={onNavigate} />
      </nav>

      {/* User card */}
      <div className="mt-5 rounded-2xl p-3"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {user?.name || 'Guest'}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg,#ef4444,#f43f5e)', boxShadow: '0 4px 14px rgba(239,68,68,0.30)' }}
        >
          <LogOut size={14} aria-hidden /> Sign out
        </button>
      </div>
    </aside>
  );
}

function MobileDrawer({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose} aria-hidden />
          <motion.div key="drawer"
            role="dialog" aria-modal aria-label="Navigation menu"
            initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-72 overflow-hidden rounded-r-[28px] lg:hidden"
            style={{ background: 'rgba(7,11,23,0.97)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(40px)' }}
          >
            <button onClick={onClose} aria-label="Close navigation"
              className="absolute right-4 top-4 z-10 rounded-full p-2 transition hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
              <X size={17} />
            </button>
            <Sidebar onNavigate={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function BottomNav() {
  return (
    <nav aria-label="Mobile navigation"
      className="fixed inset-x-3 bottom-3 z-40 rounded-[22px] p-1.5 lg:hidden"
      style={{ background: 'rgba(7,11,23,0.92)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(30px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
    >
      <div className="grid grid-cols-5 gap-1">
        {MOBILE_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/app'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 rounded-[16px] py-2.5 text-[10px] font-bold transition-all duration-200 ${
                isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`
            }
            style={({ isActive }) => isActive ? {
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
            } : {}}
          >
            <Icon size={17} aria-hidden />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function TopHeader({ onMenuOpen }) {
  const { dark, toggleDark } = useTheme();
  const greeting = getSmartGreeting();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="sticky top-3 z-30 mb-6 flex items-center justify-between gap-4 rounded-2xl px-4 py-3 lg:top-4"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.09)',
        backdropFilter: 'blur(30px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.20)',
      }}
    >
      <div className="flex items-center gap-3">
        <button onClick={onMenuOpen} aria-label="Open navigation"
          className="rounded-xl p-2 transition hover:bg-white/10 lg:hidden"
          style={{ color: 'rgba(255,255,255,0.7)' }}>
          <Menu size={19} />
        </button>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#818cf8' }}>
            {greeting.label}
          </p>
          <h1 className="text-sm font-bold text-white sm:text-base">{greeting.message}</h1>
        </div>
      </div>

      <button onClick={toggleDark} aria-label={dark ? 'Light mode' : 'Dark mode'}
        className="rounded-xl p-2.5 text-white transition-all hover:scale-105"
        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}>
        {dark ? <SunMedium size={17} /> : <Moon size={17} />}
      </button>
    </motion.header>
  );
}

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer  = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <div className="relative min-h-screen pb-24 lg:pb-6" style={{ background: '#070b17' }}>

      {/* Ambient */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle,#6366f1,transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute -right-32 top-1/4 h-[400px] w-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle,#8b5cf6,transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-32 left-1/3 h-[450px] w-[450px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#14b8a6,transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative mx-auto flex max-w-[1400px] gap-5 p-3 lg:p-5" style={{ zIndex: 1 }}>

        {/* Desktop Sidebar */}
        <div className="hidden w-[240px] shrink-0 lg:block">
          <div className="sticky top-5 h-[calc(100vh-40px)] overflow-y-auto overflow-x-hidden rounded-[28px]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(40px)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.30)',
            }}>
            <Sidebar />
          </div>
        </div>

        <MobileDrawer open={drawerOpen} onClose={closeDrawer} />

        {/* Main content */}
        <main id="main-content" className="min-w-0 flex-1">
          <TopHeader onMenuOpen={openDrawer} />
          <div className="space-y-5">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />

      <a href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-20 rounded-xl px-4 py-2 text-sm font-bold text-white transition-transform focus:translate-y-0"
        style={{ background: '#6366f1' }}>
        Skip to content
      </a>
    </div>
  );
}