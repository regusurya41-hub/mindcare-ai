import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Bot, ChartSpline, HeartPulse, Home, LogOut, Menu, Moon, PenLine, Settings, Sparkles, UsersRound, X } from 'lucide-react';
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

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo to-violet text-white shadow-lg shadow-indigo/20">
          <HeartPulse size={22} />
        </div>
        <div>
          <p className="text-base font-extrabold">MindCare AI</p>
          <p className="text-xs text-slate-500 dark:text-slate-300">Private wellness</p>
        </div>
      </div>
      <nav className="grid gap-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo to-violet text-white shadow-lg shadow-indigo/20'
                  : 'text-slate-600 hover:bg-white/70 dark:text-slate-200 dark:hover:bg-white/10'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-3xl bg-white/70 p-4 dark:bg-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full" style={{ background: user?.avatarColor || '#8b5cf6' }} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{user?.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-300">{user?.email}</p>
          </div>
        </div>
        <button
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10"
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

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { dark, toggleDark } = useTheme();

  return (
    <div className="relative min-h-screen p-3 text-ink dark:text-white lg:p-5">
      <div className="ambient-layer">
        <div className="ambient-orb left-[-7rem] top-24 h-72 w-72 animate-float bg-violet/20 dark:bg-violet/15" />
        <div className="ambient-orb right-[-8rem] top-10 h-80 w-80 animate-slow-pulse bg-lagoon/20 dark:bg-lagoon/10" />
        <div className="ambient-orb bottom-[-10rem] left-1/3 h-96 w-96 animate-float bg-indigo/15 dark:bg-indigo/10" />
      </div>
      <div className="mx-auto flex max-w-7xl gap-5">
        <div className="glass sticky top-5 hidden h-[calc(100vh-40px)] w-72 rounded-[32px] lg:block">
          <Sidebar />
        </div>
        {open && (
          <div className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm lg:hidden">
            <div className="glass h-full w-80 rounded-r-[32px]">
              <button className="absolute right-5 top-5 rounded-full bg-white/80 p-2 dark:bg-white/10" onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={18} />
              </button>
              <Sidebar onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}
        <main className="min-w-0 flex-1">
          <header className="sticky top-3 z-30 mb-5 flex items-center justify-between rounded-3xl border border-white/70 bg-white/65 px-4 py-3 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.08] lg:top-5">
            <button className="rounded-2xl bg-white/80 p-2 transition hover:scale-105 lg:hidden dark:bg-white/10" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div>
              <p className="text-sm font-semibold text-indigo dark:text-indigo-200">Today's check-in</p>
              <h1 className="text-lg font-extrabold leading-tight sm:text-xl">Make one kind move toward yourself.</h1>
            </div>
            <button className="rounded-2xl bg-white/80 p-3 transition hover:scale-105 dark:bg-white/10" onClick={toggleDark} aria-label="Toggle dark mode">
              <Moon size={18} className={dark ? 'fill-white' : ''} />
            </button>
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
