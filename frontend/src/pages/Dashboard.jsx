import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
  Activity, ArrowUpRight, Bot, Brain, CalendarCheck, Coffee,
  HeartPulse, Moon, PenLine, RefreshCcw, ShieldCheck, Smile,
  Sparkles, TrendingUp, Waves,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';
import WellnessCard from '../components/ui/WellnessCard.jsx';
import { fallbackMoods, resources } from '../data/demo.js';
import { generateMoodInsights } from '../services/aiInsights.js';
import { api } from '../api/client.js';

/* ── Static quick-action data ──────────────────────────────────────────────── */

const QUICK_ACTIONS = [
  { title: 'Daily Reflection',  text: "Write today's emotional thoughts.",           icon: PenLine,    to: '/app/journal'   },
  { title: 'Mood Reset',        text: 'Quick AI-guided emotional rebalancing.',       icon: RefreshCcw, to: '/app/chat'      },
  { title: 'Positive Growth',   text: 'Track improvement patterns over time.',        icon: TrendingUp, to: '/app/insights'  },
];

const TIMELINE_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const MOOD_META = {
  great: { emoji: '😄', label: 'Great',   bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-400' },
  good:  { emoji: '🙂', label: 'Good',    bg: 'bg-indigo-100  dark:bg-indigo-900/40',   text: 'text-indigo-600  dark:text-indigo-400'  },
  okay:  { emoji: '😐', label: 'Okay',    bg: 'bg-violet-100  dark:bg-violet-900/40',   text: 'text-violet-600  dark:text-violet-400'  },
  low:   { emoji: '😔', label: 'Low',     bg: 'bg-cyan-100    dark:bg-cyan-900/40',     text: 'text-cyan-600    dark:text-cyan-400'    },
  heavy: { emoji: '😣', label: 'Heavy',   bg: 'bg-rose-100    dark:bg-rose-900/40',     text: 'text-rose-600    dark:text-rose-400'    },
};

/* ── Sub-components ────────────────────────────────────────────────────────── */

function WellnessRing({ value = 0 }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (value / 100) * circumference;

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative">
        <svg width="160" height="160" viewBox="0 0 120 120" role="img" aria-label={`Wellness score: ${value} out of 100`}>
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#6366f1" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-100 dark:text-white/5" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none"
            stroke="url(#ringGrad)" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            transform="rotate(-90 60 60)"
          />
          <text x="60" y="56" textAnchor="middle" fontSize="22" fontWeight="800" fontFamily="inherit" fill="#6366f1" className="dark:fill-indigo-300">{value}</text>
          <text x="60" y="72" textAnchor="middle" fontSize="8"  fontWeight="600" letterSpacing="1.5" fontFamily="inherit" fill="#94a3b8">SCORE</text>
        </svg>
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-full" style={{ boxShadow: '0 0 40px rgba(99,102,241,0.2)' }} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Wellness Score</p>
    </motion.div>
  );
}

function ActivityBar({ name, value, max, color, delay = 0 }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className="w-14 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">{name}</span>
      <div className="flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5" style={{ height: 8 }}>
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={inView ? { width: `${max > 0 ? (value / max) * 100 : 0}%` } : {}}
          transition={{ duration: 1, ease: 'easeOut', delay }}
        />
      </div>
      <span className="w-6 text-xs font-bold text-slate-700 dark:text-slate-200">{value}</span>
    </div>
  );
}

function Shimmer({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 dark:bg-white/10 ${className}`} />;
}

const MoodTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/95 px-4 py-3 shadow-xl backdrop-blur-xl">
      <p className="mb-1 text-xs font-bold text-slate-400">{label}</p>
      <p className="text-sm font-bold text-white">Score: <span className="text-indigo-300">{payload[0].value}</span></p>
    </div>
  );
};

/* ── Stat card with real/loading states ───────────────────────────────────── */

function StatCard({ title, value, sub, trend, trendUp, icon: Icon, iconBg, iconColor, loading, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-[28px] border border-slate-200/60 bg-white/80 p-5 shadow-md backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_16px_48px_rgba(99,102,241,0.18)] dark:border-white/8 dark:bg-white/[0.04]"
    >
      <div aria-hidden className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-indigo-400/10 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</p>
          {loading ? (
            <Shimmer className="mt-2.5 h-10 w-20" />
          ) : (
            <h2 className="mt-2.5 text-4xl font-black tracking-tight text-slate-900 dark:text-white">{value}</h2>
          )}
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>
          {!loading && (
            <span className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              trendUp
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400'
            }`}>
              {trend}
            </span>
          )}
        </div>
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${iconBg} ${iconColor} shadow-sm`}>
          <Icon size={22} aria-hidden />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Dashboard ────────────────────────────────────────────────────────── */

export default function Dashboard() {
  const { user }    = useAuth();
  const [insights, setInsights]   = useState(null);
  const [moodChart, setMoodChart] = useState(fallbackMoods);
  const [stats, setStats]         = useState(null);   // null = loading
  const [timeline, setTimeline]   = useState([]);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning ☀️' : hour < 18 ? 'Good Afternoon 🌤️' : 'Good Evening 🌙';

  /* ── Fetch real data ─────────────────────────────────────────────────────── */

  useEffect(() => {
    // Mood analytics (chart + real average)
    api.get('/moods/analytics')
      .then(({ data }) => {
        if (data.chart?.length) setMoodChart(data.chart);

        // Build weekly timeline from last 7 mood entries
        const weekMoods = data.chart?.slice(-7) ?? [];
        const builtTimeline = TIMELINE_LABELS.map((day, i) => {
          const entry = weekMoods[i];
          const meta  = entry ? (MOOD_META[entry.mood] ?? MOOD_META.okay) : MOOD_META.okay;
          return { day, mood: meta.label, emoji: meta.emoji, bg: meta.bg, text: meta.text };
        });
        setTimeline(builtTimeline);

        // Derive stats from real API data
        const avgScore  = data.average ?? 0;
        const wellScore = Math.round((avgScore / 5) * 100);
        const moodCount = data.count ?? 0;

        // Chat + journal counts — parallel requests
        Promise.all([
          api.get('/journals').catch(() => ({ data: { journals: [] } })),
          api.get('/chat').catch(() => ({ data: { chat: { messages: [] } } })),
        ]).then(([journalRes, chatRes]) => {
          const journalCount = journalRes.data.journals?.length ?? 0;
          const chatMessages = chatRes.data.chat?.messages?.filter((m) => m.role === 'user').length ?? 0;

          // Calculate streak: consecutive days with journal entries
          const journals   = journalRes.data.journals ?? [];
          const today      = new Date();
          let   streak     = 0;
          for (let i = 0; i < 30; i++) {
            const day = new Date(today);
            day.setDate(today.getDate() - i);
            const dayStr = day.toISOString().slice(0, 10);
            const hasEntry = journals.some((j) => j.createdAt?.slice(0, 10) === dayStr);
            if (hasEntry) streak++;
            else if (i > 0) break;
          }

          setStats({
            wellScore,
            moodCount,
            journalCount,
            chatMessages,
            streak,
            activityBars: [
              { name: 'Chat',    value: chatMessages, max: Math.max(chatMessages, 18), color: 'from-indigo-500 to-violet-500'  },
              { name: 'Mood',    value: moodCount,    max: Math.max(moodCount, 18),    color: 'from-teal-400 to-indigo-500'    },
              { name: 'Journal', value: journalCount, max: Math.max(journalCount, 18), color: 'from-amber-400 to-rose-400'     },
            ],
          });
        });
      })
      .catch(() => {
        // Graceful fallback if API is down
        setStats({
          wellScore: 0, moodCount: 0, journalCount: 0, chatMessages: 0, streak: 0,
          activityBars: [
            { name: 'Chat',    value: 0, max: 18, color: 'from-indigo-500 to-violet-500' },
            { name: 'Mood',    value: 0, max: 18, color: 'from-teal-400 to-indigo-500'   },
            { name: 'Journal', value: 0, max: 18, color: 'from-amber-400 to-rose-400'    },
          ],
        });
        setTimeline(TIMELINE_LABELS.map((day) => ({ day, ...MOOD_META.okay })));
      });

    // AI Insights
    api.get('/moods')
      .then(({ data }) => generateMoodInsights(data.moods?.length ? data.moods : fallbackMoods))
      .then(setInsights)
      .catch(() => setInsights({
        stressLevel: 'Moderate',
        summary:     'Your mood patterns indicate manageable stress. Journaling has been a key stabilizer.',
        sleepImpact: 'Your sleep consistency is improving emotional resilience. Aim for 7–8 hours.',
        journalEffect:'Regular journaling correlates with better emotional regulation.',
      }));
  }, []);

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  });

  const loading = stats === null;

  /* ── Derived stat cards config ───────────────────────────────────────────── */

  const STATS_CONFIG = [
    {
      title: 'Mind Balance',
      value: loading ? '—' : `${stats.wellScore}%`,
      sub: 'Based on your mood logs',
      trend: loading ? '' : stats.wellScore >= 60 ? '↑ Above baseline' : '↓ Below baseline',
      trendUp: !loading && stats.wellScore >= 60,
      icon: HeartPulse, iconBg: 'bg-rose-100 dark:bg-rose-900/30', iconColor: 'text-rose-500',
    },
    {
      title: 'Moods Logged',
      value: loading ? '—' : String(stats.moodCount),
      sub: 'Last 7 days',
      trend: loading ? '' : stats.moodCount > 0 ? `${stats.moodCount} check-ins` : 'Log your first mood',
      trendUp: !loading && stats.moodCount > 0,
      icon: Waves, iconBg: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-500',
    },
    {
      title: 'Journal Entries',
      value: loading ? '—' : String(stats.journalCount),
      sub: 'Total reflections',
      trend: loading ? '' : stats.streak > 1 ? `🔥 ${stats.streak}-day streak` : 'Start a streak today',
      trendUp: !loading && stats.streak > 1,
      icon: PenLine, iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-500',
    },
    {
      title: 'AI Conversations',
      value: loading ? '—' : String(stats.chatMessages),
      sub: 'Messages exchanged',
      trend: loading ? '' : stats.chatMessages > 0 ? '● Active' : 'Start chatting',
      trendUp: !loading && stats.chatMessages > 0,
      icon: Brain, iconBg: 'bg-indigo-100 dark:bg-indigo-900/30', iconColor: 'text-indigo-500',
    },
  ];

  /* ── Render ──────────────────────────────────────────────────────────────── */

  return (
    <AnimatedPage className="grid gap-7 pb-12">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <motion.section
        {...fadeUp(0)}
        className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-8 text-white shadow-2xl"
      >
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-xl">
              <Sparkles size={13} aria-hidden /> AI Emotional Intelligence
            </div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-indigo-300/80">{greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</p>
            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl">
              Your mental wellness,{' '}
              <span className="bg-gradient-to-r from-indigo-300 to-teal-300 bg-clip-text text-transparent">beautifully</span>{' '}
              understood.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/60">
              Smart emotional tracking, AI-powered mood prediction, wellness insights, and calm-focused guidance — all in one place.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/app/chat"  className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-indigo-700 shadow-xl transition-all hover:scale-[1.03]">
                <Bot size={16} aria-hidden /> Open AI Companion
              </Link>
              <Link to="/app/calm" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-bold backdrop-blur-xl transition-all hover:scale-[1.03] hover:bg-white/20">
                <Waves size={16} aria-hidden /> Start Calm Space
              </Link>
            </div>
          </div>

          <div className="hidden justify-center lg:flex">
            <motion.div
              animate={{ y: [0, -14, 0], scale: [1, 1.03, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <motion.div
                aria-hidden
                animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-violet-500/25 blur-3xl"
              />
              <div className="relative grid h-56 w-56 place-items-center rounded-full border border-white/10 bg-white/8 shadow-[0_0_80px_rgba(139,92,246,0.3)] backdrop-blur-2xl">
                <Bot size={80} aria-hidden />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ── REAL STATS ────────────────────────────────────────────────────── */}
      <section aria-label="Your wellness metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS_CONFIG.map((item, i) => (
          <StatCard key={item.title} {...item} loading={loading} delay={i * 0.07} />
        ))}
      </section>

      {/* ── CHARTS ────────────────────────────────────────────────────────── */}
      <section aria-label="Mood and wellness charts" className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <WellnessCard className="min-h-[400px] transition-shadow duration-300 hover:shadow-[0_16px_48px_rgba(99,102,241,0.18)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">Emotional analytics</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">Weekly mood trends</h2>
            </div>
            <Activity className="text-indigo-400" size={20} aria-hidden />
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodChart} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <YAxis domain={[1, 5]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<MoodTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fill="url(#moodFill)"
                  dot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#fff', stroke: '#6366f1', strokeWidth: 2.5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </WellnessCard>

        <WellnessCard className="relative overflow-hidden transition-shadow duration-300 hover:shadow-[0_16px_48px_rgba(99,102,241,0.18)]">
          <div aria-hidden className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="relative z-10">
            <ShieldCheck className="text-indigo-500" size={22} aria-hidden />
            <h2 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">Wellness Score</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {loading ? 'Calculating from your data...' : stats.wellScore > 0 ? 'Based on your recent mood logs.' : 'Log moods to see your score.'}
            </p>
          </div>
          <div className="relative z-10 mt-6 flex justify-center">
            <WellnessRing value={loading ? 0 : stats.wellScore} />
          </div>
        </WellnessCard>
      </section>

      {/* ── AI INSIGHTS ───────────────────────────────────────────────────── */}
      <section aria-label="AI mood predictions">
        <div className="mb-5 flex items-center gap-2.5">
          <Brain className="text-indigo-500" size={20} aria-hidden />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">AI Mood Predictions</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { icon: TrendingUp, iconClass: 'text-rose-500',  title: 'Stress Level',  value: insights?.stressLevel, valueClass: 'text-rose-500', body: insights?.summary       },
            { icon: Moon,       iconClass: 'text-indigo-500',title: 'Sleep Impact',  value: null,                                               body: insights?.sleepImpact   },
            { icon: PenLine,    iconClass: 'text-teal-500',  title: 'Journal Effect',value: null,                                               body: insights?.journalEffect  },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.title} {...fadeUp(i * 0.08)} whileHover={{ y: -4 }}>
                <WellnessCard className="h-full transition-shadow duration-300 hover:shadow-[0_16px_48px_rgba(99,102,241,0.15)]">
                  <Icon className={card.iconClass} size={22} aria-hidden />
                  <h3 className="mt-3.5 text-xl font-black text-slate-900 dark:text-white">{card.title}</h3>
                  {insights ? (
                    <>
                      {card.value && <p className={`mt-3 text-3xl font-black ${card.valueClass}`}>{card.value}</p>}
                      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{card.body}</p>
                    </>
                  ) : (
                    <Shimmer className="mt-4 h-20" />
                  )}
                </WellnessCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── ACTIVITY + TIMELINE ───────────────────────────────────────────── */}
      <section aria-label="Activity and emotional timeline" className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <WellnessCard className="transition-shadow duration-300 hover:shadow-[0_16px_48px_rgba(99,102,241,0.15)]">
          <div className="flex items-center gap-2.5">
            <Coffee className="text-indigo-500" size={20} aria-hidden />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Activity Balance</h2>
          </div>
          <div className="mt-7 flex flex-col gap-5">
            {loading
              ? [1,2,3].map((i) => <Shimmer key={i} className="h-6" />)
              : stats.activityBars.map((item, i) => <ActivityBar key={item.name} {...item} delay={i * 0.1} />)
            }
          </div>
        </WellnessCard>

        <WellnessCard className="transition-shadow duration-300 hover:shadow-[0_16px_48px_rgba(99,102,241,0.15)]">
          <div className="flex items-center gap-2.5">
            <CalendarCheck className="text-indigo-500" size={20} aria-hidden />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Emotional Timeline</h2>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2">
            {(timeline.length ? timeline : TIMELINE_LABELS.map((day) => ({ day, ...MOOD_META.okay }))).map((item, i) => (
              <motion.div
                key={item.day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4, scale: 1.04 }}
                className="rounded-2xl border border-slate-200/60 bg-white/80 p-3 text-center shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-indigo-300/40 hover:shadow-[0_10px_30px_rgba(99,102,241,0.18)] dark:border-white/8 dark:bg-white/[0.04]"
              >
                <div className={`mx-auto grid h-10 w-10 place-items-center rounded-xl text-lg ${item.bg}`} aria-hidden>
                  {item.emoji}
                </div>
                <p className="mt-2.5 text-[11px] font-black text-slate-800 dark:text-white">{item.day}</p>
                <p className="mt-0.5 text-[9px] text-slate-400 dark:text-slate-500">{item.mood}</p>
              </motion.div>
            ))}
          </div>
        </WellnessCard>
      </section>

      {/* ── CALM + RESOURCES ──────────────────────────────────────────────── */}
      <section aria-label="Calm tools and support shortcuts" className="grid gap-5 xl:grid-cols-[0.65fr_1.35fr]">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-500/15 blur-3xl" />
          <div className="relative z-10 flex h-full flex-col">
            <Waves className="text-teal-400" size={24} aria-hidden />
            <h2 className="mt-4 text-2xl font-black">Calm Breathing</h2>
            <p className="mt-3 text-sm leading-7 text-white/55">A quick breathing reset can reduce emotional overload and improve focus within minutes.</p>
            <Link to="/app/calm" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-indigo-500/40">
              Open Calm Space <ArrowUpRight size={15} aria-hidden />
            </Link>
          </div>
        </div>

        <WellnessCard className="transition-shadow duration-300 hover:shadow-[0_16px_48px_rgba(99,102,241,0.15)]">
          <div className="flex items-center gap-2.5">
            <Smile className="text-indigo-500" size={20} aria-hidden />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Support Shortcuts</h2>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {resources.map((item) => (
              <motion.div key={item.title} whileHover={{ y: -4, scale: 1.02 }}
                className="rounded-[22px] border border-slate-200/60 bg-slate-50/80 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-indigo-300/40 hover:shadow-[0_12px_32px_rgba(99,102,241,0.15)] dark:border-white/8 dark:bg-white/[0.04]">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </WellnessCard>
      </section>

      {/* ── QUICK ACTIONS ─────────────────────────────────────────────────── */}
      <section aria-label="Quick action shortcuts" className="grid gap-4 md:grid-cols-3">
        {QUICK_ACTIONS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.title} {...fadeUp(i * 0.07)} whileHover={{ y: -5 }}>
              <Link to={item.to} className="group block rounded-[28px] border border-slate-200/60 bg-white/80 p-5 shadow-md backdrop-blur-xl transition-all duration-300 hover:border-indigo-300/40 hover:shadow-[0_16px_48px_rgba(99,102,241,0.2)] dark:border-white/8 dark:bg-white/[0.04]">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                  <Icon size={22} aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.text}</p>
              </Link>
            </motion.div>
          );
        })}
      </section>

      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
        Powered by AI Wellness Engine
      </p>
    </AnimatedPage>
  );
}