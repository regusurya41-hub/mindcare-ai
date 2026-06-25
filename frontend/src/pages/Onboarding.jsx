/**
 * Onboarding.jsx — First-time user welcome flow
 *
 * How to wire it up in App.jsx:
 * 1. Import: const Onboarding = lazy(() => import('./pages/Onboarding.jsx'));
 * 2. Add route inside Protected: <Route path="onboarding" element={<Onboarding />} />
 * 3. In Signup.jsx after successful signup: navigate('/app/onboarding')
 */
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Bot, Brain, Check, HeartPulse,
  Lock, Moon, PenLine, Waves
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const STEPS = [
  {
    id: 'welcome',
    icon: HeartPulse,
    gradient: 'from-indigo-500 to-violet-500',
    title: (name) => `Welcome, ${name || 'friend'} 💜`,
    subtitle: 'Your private space for emotional wellness starts now.',
    body: 'MindCare AI is designed to help you feel heard, track your emotional patterns, and build mental resilience — one day at a time.',
    cta: "Let's get started",
  },
  {
    id: 'privacy',
    icon: Lock,
    gradient: 'from-teal-500 to-cyan-500',
    title: () => 'Your privacy is sacred',
    subtitle: 'Anonymous. Encrypted. Never sold.',
    body: 'Your journal entries, mood logs, and conversations are yours alone. We never use your data for ads, never sell it, and never share it.',
    bullets: ['End-to-end encryption on all entries', 'No real name required, ever', 'Delete your data anytime, instantly'],
    cta: 'I understand',
  },
  {
    id: 'features',
    icon: Waves,
    gradient: 'from-violet-500 to-fuchsia-500',
    title: () => 'What you can do here',
    subtitle: 'Five tools. One calm space.',
    features: [
      { icon: Bot,     label: 'AI Companion', text: 'Real conversations, real support.'          },
      { icon: Waves,   label: 'Calm Space',   text: 'Breathing and grounding exercises.'          },
      { icon: PenLine, label: 'Journal',      text: 'Private, markdown-powered reflections.'      },
      { icon: Brain,   label: 'Mood Tracker', text: 'Track patterns and spot trends.'             },
      { icon: Moon,    label: 'Insights',     text: 'AI-generated emotional analytics.'           },
    ],
    cta: 'Looks great',
  },
  {
    id: 'goal',
    icon: Brain,
    gradient: 'from-rose-500 to-pink-500',
    title: () => 'What brings you here?',
    subtitle: "We'll personalise your experience.",
    goals: [
      'Reduce stress and anxiety',
      'Improve my mood day-to-day',
      'Build better emotional habits',
      'Process difficult feelings',
      'Just explore — no specific goal',
    ],
    cta: 'Set my intention',
  },
  {
    id: 'ready',
    icon: Check,
    gradient: 'from-emerald-500 to-teal-500',
    title: () => "You're all set! 🎉",
    subtitle: 'Your wellness journey begins.',
    body: 'Start wherever feels right. The AI Companion is available 24/7, and your first journal entry is one tap away.',
    cta: 'Open my dashboard',
    final: true,
  },
];

const variants = {
  enter:  { opacity: 0, x: 40,  scale: 0.96 },
  center: { opacity: 1, x: 0,   scale: 1    },
  exit:   { opacity: 0, x: -40, scale: 0.96 },
};

export default function Onboarding() {
  const { user }        = useAuth();
  const navigate        = useNavigate();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState('');

  // ── Guard: skip onboarding if already completed ──────────────────────────
  useEffect(() => {
    if (localStorage.getItem('mindcare_onboarded') === '1') {
      navigate('/app');
    }
  }, [navigate]);

  const current = STEPS[step];
  const Icon    = current.icon;
  const isLast  = step === STEPS.length - 1;

  function next() {
    if (isLast) {
      if (goal) localStorage.setItem('mindcare_goal', goal);
      localStorage.setItem('mindcare_onboarded', '1');
      navigate('/app');
    } else {
      setStep((s) => s + 1);
    }
  }

  function skip() {
    localStorage.setItem('mindcare_onboarded', '1');
    navigate('/app');
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-6">

      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">

        {/* Progress dots */}
        <div
          className="mb-8 flex justify-center gap-2"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemax={STEPS.length}
          aria-label={`Step ${step + 1} of ${STEPS.length}`}
        >
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-white' : i < step ? 'w-2 bg-white/50' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="rounded-[36px] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-2xl sm:p-10"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`mx-auto grid h-20 w-20 place-items-center rounded-[28px] bg-gradient-to-br ${current.gradient} shadow-2xl`}
            >
              <Icon size={38} className="text-white" aria-hidden />
            </motion.div>

            {/* Title + body */}
            <div className="mt-7 text-center text-white">
              <h1 className="text-3xl font-black leading-tight">
                {current.title(user?.name?.split(' ')[0])}
              </h1>
              <p className="mt-2 text-base font-semibold text-white/60">{current.subtitle}</p>
              {current.body && (
                <p className="mt-5 text-sm leading-7 text-white/70">{current.body}</p>
              )}
            </div>

            {/* Privacy bullets */}
            {current.bullets && (
              <ul className="mt-6 space-y-3">
                {current.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80"
                  >
                    <Check size={16} className="shrink-0 text-teal-400" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {/* Feature list */}
            {current.features && (
              <div className="mt-6 grid gap-2.5">
                {current.features.map(({ icon: FIcon, label, text }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10">
                      <FIcon size={17} className="text-white/80" aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{label}</p>
                      <p className="text-xs text-white/50">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Goal selector */}
            {current.goals && (
              <div className="mt-6 grid gap-2">
                {current.goals.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    aria-pressed={goal === g}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-bold transition-all ${
                      goal === g
                        ? 'bg-white text-indigo-700 shadow-lg'
                        : 'border border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {g}
                    {goal === g && <Check size={16} className="text-indigo-500" aria-hidden />}
                  </button>
                ))}
              </div>
            )}

            {/* CTA button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={next}
              disabled={current.goals && !goal}
              className={`mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black transition-all disabled:opacity-40 ${
                isLast
                  ? `bg-gradient-to-r ${current.gradient} text-white shadow-xl`
                  : 'bg-white text-slate-900 shadow-xl'
              }`}
            >
              {current.cta}
              {!isLast && <ArrowRight size={18} aria-hidden />}
            </motion.button>

            {/* Skip link */}
            {!isLast && (
              <button
                onClick={skip}
                className="mt-4 w-full text-center text-xs font-semibold text-white/30 transition hover:text-white/60"
              >
                Skip for now
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        <p className="mt-6 text-center text-xs text-white/20">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  );
}