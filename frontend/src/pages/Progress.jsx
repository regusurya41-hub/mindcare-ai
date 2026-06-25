import { motion } from 'framer-motion';
import {
  Award, BookOpen, Bot, Flame, HeartPulse,
  Sparkles, Star, Target, Trophy, TrendingUp, Zap, PenLine
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';

/* ── Achievement definitions ── */
function buildAchievements({ journalCount, moodCount, chatCount, streak }) {
  return [
    {
      id: 'first_journal', icon: BookOpen,
      gradient: 'linear-gradient(135deg,#f59e0b,#f97316)',
      shadow: 'rgba(245,158,11,0.35)',
      title: 'First Words', desc: 'Write your first journal entry.',
      unlocked: journalCount >= 1, progress: Math.min(journalCount,1), max: 1,
    },
    {
      id: 'journal_5', icon: PenLine,
      gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      shadow: 'rgba(99,102,241,0.35)',
      title: 'Consistent Reflector', desc: 'Write 5 journal entries.',
      unlocked: journalCount >= 5, progress: Math.min(journalCount,5), max: 5,
    },
    {
      id: 'journal_20', icon: Star,
      gradient: 'linear-gradient(135deg,#8b5cf6,#d946ef)',
      shadow: 'rgba(139,92,246,0.35)',
      title: 'Deep Diver', desc: 'Write 20 journal entries.',
      unlocked: journalCount >= 20, progress: Math.min(journalCount,20), max: 20,
    },
    {
      id: 'mood_1', icon: HeartPulse,
      gradient: 'linear-gradient(135deg,#f43f5e,#e11d48)',
      shadow: 'rgba(244,63,94,0.35)',
      title: 'First Check-in', desc: 'Log your first mood.',
      unlocked: moodCount >= 1, progress: Math.min(moodCount,1), max: 1,
    },
    {
      id: 'mood_10', icon: TrendingUp,
      gradient: 'linear-gradient(135deg,#14b8a6,#06b6d4)',
      shadow: 'rgba(20,184,166,0.35)',
      title: 'Pattern Spotter', desc: 'Log 10 moods.',
      unlocked: moodCount >= 10, progress: Math.min(moodCount,10), max: 10,
    },
    {
      id: 'mood_30', icon: Target,
      gradient: 'linear-gradient(135deg,#10b981,#14b8a6)',
      shadow: 'rgba(16,185,129,0.35)',
      title: 'Mood Master', desc: 'Log 30 moods.',
      unlocked: moodCount >= 30, progress: Math.min(moodCount,30), max: 30,
    },
    {
      id: 'chat_1', icon: Bot,
      gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)',
      shadow: 'rgba(59,130,246,0.35)',
      title: 'First Conversation', desc: 'Send your first AI message.',
      unlocked: chatCount >= 1, progress: Math.min(chatCount,1), max: 1,
    },
    {
      id: 'chat_50', icon: Zap,
      gradient: 'linear-gradient(135deg,#eab308,#f59e0b)',
      shadow: 'rgba(234,179,8,0.35)',
      title: 'Open Book', desc: 'Send 50 messages to the AI.',
      unlocked: chatCount >= 50, progress: Math.min(chatCount,50), max: 50,
    },
    {
      id: 'streak_3', icon: Flame,
      gradient: 'linear-gradient(135deg,#f97316,#ef4444)',
      shadow: 'rgba(249,115,22,0.35)',
      title: 'On a Roll', desc: '3-day mood logging streak.',
      unlocked: streak >= 3, progress: Math.min(streak,3), max: 3,
    },
    {
      id: 'streak_7', icon: Trophy,
      gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
      shadow: 'rgba(245,158,11,0.40)',
      title: 'Week Warrior', desc: '7-day streak — full week!',
      unlocked: streak >= 7, progress: Math.min(streak,7), max: 7,
    },
    {
      id: 'streak_30', icon: Award,
      gradient: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
      shadow: 'rgba(139,92,246,0.40)',
      title: 'Habit Champion', desc: '30-day streak. Extraordinary.',
      unlocked: streak >= 30, progress: Math.min(streak,30), max: 30,
    },
    {
      id: 'all_features', icon: Sparkles,
      gradient: 'linear-gradient(135deg,#d946ef,#f43f5e)',
      shadow: 'rgba(217,70,239,0.35)',
      title: 'Explorer', desc: 'Use journals, moods, and AI chat.',
      unlocked: journalCount >= 1 && moodCount >= 1 && chatCount >= 1,
      progress: (journalCount >= 1 ? 1:0) + (moodCount >= 1 ? 1:0) + (chatCount >= 1 ? 1:0),
      max: 3,
    },
  ];
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 24,
      padding: 20,
      backdropFilter: 'blur(20px)',
      ...style,
    }}>
      {children}
    </div>
  );
}

function AchievementCard({ icon: Icon, gradient, shadow, title, desc, unlocked, progress, max, delay }) {
  const pct = Math.round((progress / max) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.01 }}
      style={{
        background: unlocked ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)',
        border: unlocked ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 16,
        transition: 'all 0.3s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {unlocked && (
        <div aria-hidden style={{
          position: 'absolute', top: -20, right: -20,
          width: 80, height: 80, borderRadius: '50%',
          background: gradient, opacity: 0.12, filter: 'blur(20px)',
          pointerEvents: 'none',
        }} />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: unlocked ? gradient : 'rgba(255,255,255,0.06)',
          boxShadow: unlocked ? `0 6px 20px ${shadow}` : 'none',
          display: 'grid', placeItems: 'center',
          position: 'relative', transition: 'all 0.3s',
        }}>
          <Icon size={22} style={{ color: unlocked ? 'white' : 'rgba(255,255,255,0.25)' }} aria-hidden />
          {unlocked && (
            <div style={{
              position: 'absolute', top: -4, right: -4,
              width: 18, height: 18, borderRadius: '50%',
              background: '#10b981', border: '2px solid #070b17',
              display: 'grid', placeItems: 'center',
            }}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
                <path d="M1.5 4l1.5 1.5 3.5-3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: unlocked ? 'white' : 'rgba(255,255,255,0.35)' }}>
            {title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{desc}</p>

          {/* Progress bar */}
          <div className="mt-2.5">
            <div className="flex justify-between mb-1">
              <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.30)' }}>
                {progress}/{max}
              </span>
              <span className="text-[10px] font-bold" style={{ color: unlocked ? '#10b981' : 'rgba(255,255,255,0.25)' }}>
                {pct}%
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, delay: delay + 0.2, ease: 'easeOut' }}
                style={{
                  height: '100%', borderRadius: 999,
                  background: unlocked ? gradient : 'rgba(255,255,255,0.15)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Progress() {
  const [data, setData]     = useState({ journalCount:0, moodCount:0, chatCount:0, streak:0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/journals').catch(() => ({ data: { journals:[] } })),
      api.get('/moods').catch(()    => ({ data: { moods:[] }    })),
      api.get('/chat').catch(()     => ({ data: { chat:{ messages:[] } } })),
    ]).then(([jRes, mRes, cRes]) => {
      const journals = jRes.data.journals ?? [];
      const moods    = mRes.data.moods    ?? [];
      const messages = cRes.data.chat?.messages?.filter((m) => m.role === 'user') ?? [];

      const dates = new Set(moods.map((m) => (m.loggedAt || m.createdAt)?.slice(0,10)));
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        if (dates.has(d.toISOString().slice(0,10))) streak++;
        else if (i > 0) break;
      }
      setData({ journalCount: journals.length, moodCount: moods.length, chatCount: messages.length, streak });
    }).finally(() => setLoading(false));
  }, []);

  const achievements = useMemo(() => buildAchievements(data), [data]);
  const unlocked     = achievements.filter((a) => a.unlocked).length;
  const overallPct   = Math.round((unlocked / achievements.length) * 100);

  const statCards = [
    { label: 'Journals',     value: data.journalCount, icon: BookOpen,   gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', shadow: 'rgba(245,158,11,0.35)' },
    { label: 'Moods logged', value: data.moodCount,    icon: HeartPulse, gradient: 'linear-gradient(135deg,#f43f5e,#e11d48)', shadow: 'rgba(244,63,94,0.35)'  },
    { label: 'AI messages',  value: data.chatCount,    icon: Bot,        gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', shadow: 'rgba(59,130,246,0.35)'  },
    { label: 'Day streak',   value: data.streak,       icon: Flame,      gradient: 'linear-gradient(135deg,#f97316,#ef4444)', shadow: 'rgba(249,115,22,0.35)'  },
  ];

  return (
    <AnimatedPage className="pb-12 space-y-5">

      {/* ── Hero header ── */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(99,102,241,0.20) 0%,rgba(139,92,246,0.12) 50%,rgba(20,184,166,0.08) 100%)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 28, padding: '28px 28px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position:'absolute',top:-40,left:-40,width:200,height:200,borderRadius:'50%',
          background:'radial-gradient(circle,rgba(99,102,241,0.3),transparent 70%)',filter:'blur(40px)',
          pointerEvents:'none',
        }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Trophy style={{ color: '#fbbf24' }} size={26} aria-hidden />
            <h1 className="text-2xl font-black text-white">Your Progress</h1>
          </div>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.50)' }}>
            Track milestones and celebrate every win.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statCards.map(({ label, value, icon: Icon, gradient, shadow }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 18, padding: '14px 16px',
                backdropFilter: 'blur(20px)',
              }}>
                <div className="grid h-9 w-9 place-items-center rounded-xl mb-2"
                  style={{ background: gradient, boxShadow: `0 4px 14px ${shadow}` }}>
                  <Icon size={18} className="text-white" aria-hidden />
                </div>
                <p className="text-2xl font-black text-white">{loading ? '—' : value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Overall progress ── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-white">Achievements</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>
              {unlocked} of {achievements.length} unlocked
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black" style={{ color: '#6366f1' }}>{overallPct}%</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Complete</p>
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${overallPct}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#d946ef)' }}
          />
        </div>
      </Card>

      {/* ── Achievement grid ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a, i) => (
          <AchievementCard key={a.id} {...a} delay={i * 0.04} />
        ))}
      </div>

    </AnimatedPage>
  );
}