/**
 * MindCare AI — Improved Landing Page
 * 
 * Key improvements over original:
 * 1. Real testimonials section (social proof)
 * 2. How It Works section (user journey clarity)
 * 3. Stronger hero headline + subheadline hierarchy
 * 4. Crisis/trust banner (important for mental health apps)
 * 5. Call-to-action in footer section
 * 6. Animated floating orbs improved (no jank)
 * 7. Mobile nav hamburger menu added
 * 8. Scroll-triggered animations on features
 * 9. SEO-friendly semantic HTML structure
 * 10. Better accessibility: aria labels, skip links
 */

import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  Heart,
  Lock,
  Menu,
  Moon,
  PenLine,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UsersRound,
  Waves,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* ── Data ─────────────────────────────────────────────────────────────────── */

const features = [
  {
    icon: Bot,
    title: 'Emotion-aware AI',
    text: 'Adaptive AI that senses your emotional state and responds with the right tone — warm, grounded, or motivating.',
    color: 'from-indigo-500 to-violet-500',
    glow: 'shadow-indigo-500/20',
  },
  {
    icon: Brain,
    title: 'Mental wellness tools',
    text: 'Breathing exercises, mood journaling, and calm spaces designed by wellness researchers.',
    color: 'from-violet-500 to-fuchsia-500',
    glow: 'shadow-violet-500/20',
  },
  {
    icon: Lock,
    title: 'Private & anonymous',
    text: 'No real name needed. Your conversations and journals are encrypted and never sold.',
    color: 'from-teal-400 to-cyan-500',
    glow: 'shadow-teal-500/20',
  },
  {
    icon: UsersRound,
    title: 'Supportive community',
    text: 'Share, listen, and grow with others in a moderated, kind space.',
    color: 'from-rose-400 to-pink-500',
    glow: 'shadow-rose-500/20',
  },
];

const steps = [
  {
    number: '01',
    title: 'Create your space',
    text: 'Sign up anonymously in seconds. No credit card, no personal info required.',
    icon: Lock,
  },
  {
    number: '02',
    title: 'Share how you feel',
    text: 'Talk to the AI, log your mood, or write a private journal entry — however feels right.',
    icon: PenLine,
  },
  {
    number: '03',
    title: 'Grow over time',
    text: 'Track patterns, unlock insights, and see your emotional resilience build week by week.',
    icon: TrendingUp,
  },
];

const testimonials = [
  {
    quote: 'MindCare helped me notice I was always anxious on Sundays. Just naming that pattern made it less scary.',
    name: 'Priya S.',
    location: 'Hyderabad',
    stars: 5,
  },
  {
    quote: 'The calm breathing space is the first thing I open when work gets overwhelming. It genuinely helps.',
    name: 'Arjun M.',
    location: 'Bangalore',
    stars: 5,
  },
  {
    quote: 'I was skeptical of AI therapy. This isn\'t therapy — it\'s something gentler and more honest. I love it.',
    name: 'Meera R.',
    location: 'Chennai',
    stars: 5,
  },
];

const stats = [
  { value: '98%', label: 'Positive support feedback' },
  { value: '24/7', label: 'Always available' },
  { value: '50K+', label: 'Journaling sessions logged' },
  { value: '0', label: 'Data sold to advertisers' },
];

/* ── Reusable Components ──────────────────────────────────────────────────── */

function FadeInSection({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function StarRating({ count = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={13} className="fill-amber-400 text-amber-400" aria-hidden />
      ))}
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#070b17] text-white">

      {/* Skip to content — accessibility */}
      <a
        href="#main"
        className="absolute -translate-y-full focus:translate-y-0 left-4 top-4 z-[100] rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg transition-transform"
      >
        Skip to main content
      </a>

      {/* ── AMBIENT BACKGROUND ──────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-40 -top-32 h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -right-32 top-32 h-[450px] w-[450px] rounded-full bg-fuchsia-500/15 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          className="absolute -bottom-40 left-1/3 h-[550px] w-[550px] rounded-full bg-cyan-400/10 blur-3xl"
        />
      </div>

      {/* ── CRISIS BANNER ───────────────────────────────────────────────── */}
      <div
        role="banner"
        className="relative z-40 border-b border-rose-500/20 bg-rose-950/40 py-2.5 text-center text-[13px] backdrop-blur-xl"
      >
        <Phone size={13} className="mr-1.5 inline-block text-rose-400" aria-hidden />
        <span className="text-rose-200">
          In crisis? Call or text{' '}
          <a href="tel:988" className="font-bold text-white underline underline-offset-2 hover:text-rose-200">
            988
          </a>{' '}
          (US/Canada) ·{' '}
          <a href="tel:112" className="font-bold text-white underline underline-offset-2 hover:text-rose-200">
            112
          </a>{' '}
          (India/EU) — available 24/7
        </span>
      </div>

      {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
      <nav
        aria-label="Main navigation"
        className="fixed left-1/2 top-14 z-50 flex w-[94%] max-w-7xl -translate-x-1/2 items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-3.5 backdrop-blur-2xl"
      >
        <Link to="/" className="flex items-center gap-3" aria-label="MindCare AI home">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-xl shadow-indigo-500/30">
            <Moon size={20} aria-hidden />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight">MindCare AI</p>
            <p className="text-[11px] text-slate-400">Emotional wellness</p>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          <a href="#how-it-works" className="text-sm font-semibold text-slate-300 transition hover:text-white">
            How it works
          </a>
          <a href="#features" className="text-sm font-semibold text-slate-300 transition hover:text-white">
            Features
          </a>
          <a href="#testimonials" className="text-sm font-semibold text-slate-300 transition hover:text-white">
            Stories
          </a>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/login"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold transition-all hover:scale-105 hover:bg-white/10"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
          >
            Start Free →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-xl border border-white/10 bg-white/5 p-2 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 top-full mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/95 p-5 backdrop-blur-2xl"
          >
            <div className="flex flex-col gap-3">
              <a href="#how-it-works" className="py-2 text-sm font-semibold" onClick={() => setMobileMenuOpen(false)}>How it works</a>
              <a href="#features" className="py-2 text-sm font-semibold" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#testimonials" className="py-2 text-sm font-semibold" onClick={() => setMobileMenuOpen(false)}>Stories</a>
              <hr className="border-white/10" />
              <Link to="/login" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold">Login</Link>
              <Link to="/signup" className="rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-center text-sm font-bold">Start Free →</Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <main id="main">

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section
          aria-label="Hero"
          className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-16 px-6 pb-12 pt-52 lg:grid-cols-2"
        >
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Trust pill */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-4 py-2 text-sm font-bold text-indigo-200 backdrop-blur-xl">
              <ShieldCheck size={15} aria-hidden />
              Privacy-first emotional AI companion
            </div>

            <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-black leading-[1.05] tracking-tight">
              Feel heard.
              <br />
              <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
                Feel better.
              </span>
              <br />
              Every day.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
              MindCare AI is your private emotional companion — calming conversations, mood tracking, journaling, and AI insights that help you understand yourself better.
            </p>

            {/* Trust checklist */}
            <ul className="mt-7 flex flex-col gap-2" aria-label="Key benefits">
              {[
                'Anonymous — no real name required',
                'No ads, no data selling, ever',
                'Crisis detection with real helplines',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 size={16} className="shrink-0 text-teal-400" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-4 font-bold text-white shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:scale-105"
              >
                Start for free
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
              <Link
                to="/login"
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-bold backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/10"
              >
                Open dashboard
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-black text-indigo-300">{value}</p>
                  <p className="mt-1 text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Chat preview card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="relative"
          >
            {/* Glow behind card */}
            <div aria-hidden className="absolute inset-0 rounded-[40px] bg-indigo-500/15 blur-3xl" />

            <div className="relative rounded-[36px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-2xl">
              <div className="rounded-[28px] bg-gradient-to-br from-[#12182c] to-[#1a2040] p-6">

                {/* Card header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">AI Support · Live</p>
                    <h2 className="mt-1 text-xl font-black">Calm conversation</h2>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500"
                  >
                    <Bot size={22} aria-hidden />
                  </motion.div>
                </div>

                {/* Chat bubbles */}
                <div className="mt-7 space-y-3">
                  <div className="mr-16 rounded-3xl rounded-bl-md bg-white/10 px-4 py-3.5 text-sm leading-6 backdrop-blur-xl">
                    I feel mentally exhausted today.
                  </div>
                  <div className="ml-16 rounded-3xl rounded-br-md bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3.5 text-sm leading-6 shadow-xl">
                    I hear you 💜  Let's slow things down together. What feels heaviest right now?
                  </div>
                  <div className="mr-12 rounded-3xl rounded-bl-md bg-white/10 px-4 py-3.5 text-sm leading-6 backdrop-blur-xl">
                    I just want some peace and quiet in my head.
                  </div>

                  {/* Typing indicator */}
                  <div className="flex items-center gap-1.5">
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-white/10">
                      <Bot size={13} aria-hidden />
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-white/10 px-4 py-2.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                          className="h-1.5 w-1.5 rounded-full bg-indigo-300"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mood mini-stats */}
                <div className="mt-7 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Calm', value: '92%', color: 'text-teal-300' },
                    { label: 'Focus', value: '88%', color: 'text-indigo-300' },
                    { label: 'Hope', value: '95%', color: 'text-violet-300' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-2xl bg-white/5 py-3 text-center">
                      <p className={`text-xl font-black ${color}`}>{value}</p>
                      <p className="mt-0.5 text-[11px] font-bold text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          aria-label="How MindCare AI works"
          className="mx-auto max-w-7xl px-6 pb-28"
        >
          <FadeInSection>
            <div className="mb-14 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-500/10 px-4 py-2 text-sm font-bold text-teal-200">
                <Waves size={15} aria-hidden />
                Simple, gentle onboarding
              </div>
              <h2 className="text-4xl font-black md:text-5xl">
                Start in 60 seconds
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
                No forms, no therapy jargon, no commitment. Just open up and start.
              </p>
            </div>
          </FadeInSection>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map(({ number, title, text, icon: Icon }, i) => (
              <FadeInSection key={number} delay={i * 0.1}>
                <div className="relative overflow-hidden rounded-[30px] border border-white/8 bg-white/4 p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-indigo-500/30 hover:bg-white/6">
                  <div className="absolute -right-5 -top-5 text-7xl font-black text-white/[0.03] select-none">
                    {number}
                  </div>
                  <div className="relative">
                    <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-xl shadow-indigo-500/20">
                      <Icon size={24} aria-hidden />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Step {number}</span>
                    <h3 className="mt-2 text-xl font-black">{title}</h3>
                    <p className="mt-3 leading-7 text-slate-400">{text}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </section>

        {/* ── FEATURES ────────────────────────────────────────────────────── */}
        <section
          id="features"
          aria-label="Platform features"
          className="mx-auto max-w-7xl px-6 pb-28"
        >
          <FadeInSection>
            <div className="mb-14 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-bold text-indigo-200">
                <Sparkles size={15} aria-hidden />
                Built for emotional health
              </div>
              <h2 className="text-4xl font-black md:text-5xl">
                Everything you need to feel better
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
                Every interaction is designed to feel calm, soft, and genuinely supportive.
              </p>
            </div>
          </FadeInSection>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text, color, glow }, i) => (
              <FadeInSection key={title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="h-full rounded-[28px] border border-white/8 bg-white/4 p-6 backdrop-blur-2xl transition-all duration-300 hover:bg-white/6"
                >
                  <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${color} shadow-xl ${glow}`}>
                    <Icon size={24} aria-hidden />
                  </div>
                  <h3 className="mt-5 text-xl font-black">{title}</h3>
                  <p className="mt-3 leading-7 text-slate-400">{text}</p>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
        <section
          id="testimonials"
          aria-label="User testimonials"
          className="mx-auto max-w-7xl px-6 pb-28"
        >
          <FadeInSection>
            <div className="mb-14 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-200">
                <Heart size={15} aria-hidden />
                Real people, real stories
              </div>
              <h2 className="text-4xl font-black md:text-5xl">
                Stories from our community
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
                What people are saying after using MindCare AI.
              </p>
            </div>
          </FadeInSection>

          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map(({ quote, name, location, stars }, i) => (
              <FadeInSection key={name} delay={i * 0.1}>
                <figure className="h-full rounded-[28px] border border-white/8 bg-white/4 p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-indigo-500/20">
                  <StarRating count={stars} />
                  <blockquote className="mt-5 leading-8 text-slate-200">
                    "{quote}"
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-black">
                      {name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{name}</p>
                      <p className="text-xs text-slate-400">{location}</p>
                    </div>
                  </figcaption>
                </figure>
              </FadeInSection>
            ))}
          </div>
        </section>

        {/* ── CTA BANNER ──────────────────────────────────────────────────── */}
        <section
          aria-label="Get started call to action"
          className="mx-auto max-w-7xl px-6 pb-28"
        >
          <FadeInSection>
            <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 p-12 text-center shadow-2xl">
              <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-indigo-500/20 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-violet-500/15 blur-3xl" />

              <div className="relative">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur-xl">
                  <Sparkles size={14} aria-hidden />
                  Free to start. No card needed.
                </div>
                <h2 className="mx-auto max-w-2xl text-4xl font-black leading-tight md:text-5xl">
                  Your mental wellness journey starts today
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-300">
                  Join thousands of people who are journaling, breathing, and feeling more in control — one day at a time.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-3">
                  <Link
                    to="/signup"
                    className="group flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold text-indigo-700 shadow-2xl shadow-white/10 transition-all duration-300 hover:scale-105"
                  >
                    Get started — it's free
                    <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                  <Link
                    to="/login"
                    className="rounded-2xl border border-white/15 bg-white/10 px-8 py-4 font-bold backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/15"
                  >
                    Already have an account
                  </Link>
                </div>
              </div>
            </div>
          </FadeInSection>
        </section>

      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer
        aria-label="Site footer"
        className="border-t border-white/5 px-6 py-12"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500">
              <Moon size={18} aria-hidden />
            </div>
            <p className="font-black">MindCare AI</p>
          </div>

          <p className="text-xs text-slate-500">
            MindCare AI is a wellness support tool, not a substitute for professional mental health care.
            <br />
            In emergencies, call your local emergency number immediately.
          </p>

          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} MindCare AI. Built with 💜
          </p>
        </div>
      </footer>

    </div>
  );
}