import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  ChartSpline,
  Heart,
  Lock,
  Moon,
  PenLine,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound
} from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Bot,
    title: 'Emotion-aware AI',
    text: 'Supportive conversations with crisis-aware emotional safety.'
  },
  {
    icon: ChartSpline,
    title: 'Mood insights',
    text: 'Track patterns, emotional shifts, and mental wellness trends.'
  },
  {
    icon: PenLine,
    title: 'Private journaling',
    text: 'Write thoughts safely with lock mode and reflection support.'
  },
  {
    icon: UsersRound,
    title: 'Anonymous community',
    text: 'Share feelings and connect without revealing identity.'
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f8fbff] via-[#eef2ff] to-[#f5f7ff] text-slate-900 dark:from-[#060816] dark:via-[#0d1328] dark:to-[#10182f] dark:text-white">

      {/* BACKGROUND ORBS */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-10 h-[420px] w-[420px] rounded-full bg-violet-400/20 blur-3xl" />
        <div className="absolute right-[-100px] top-20 h-[400px] w-[400px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-[-180px] left-1/3 h-[450px] w-[450px] rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-4 z-50 mx-auto mt-4 flex w-[95%] max-w-7xl items-center justify-between rounded-3xl border border-white/40 bg-white/60 px-5 py-4 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">
        <Link className="flex items-center gap-3" to="/">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30">
            <Moon size={20} />
          </div>

          <div>
            <h1 className="text-lg font-black tracking-tight">
              MindCare AI
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Emotional wellness companion
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-2xl border border-slate-200 bg-white/70 px-5 py-2 font-semibold transition-all hover:scale-105 hover:bg-white dark:border-white/10 dark:bg-white/10"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-indigo-500/50"
          >
            Start Free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative mx-auto grid min-h-[90vh] max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-2">

        {/* LEFT */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7 }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:text-indigo-200">
            <ShieldCheck size={16} />
            Trusted emotional wellness platform
          </div>

          <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-7xl">
            Feel heard.
            <br />
            Feel calmer.
            <br />
            Feel supported.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            MindCare AI gives you a private emotional wellness space with calming conversations, journaling, mood tracking, and supportive AI guidance.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/signup"
              className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-7 py-4 font-bold text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-indigo-500/50"
            >
              Get Started
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              to="/login"
              className="rounded-2xl border border-slate-200 bg-white/80 px-7 py-4 font-bold transition-all hover:scale-105 hover:bg-white dark:border-white/10 dark:bg-white/10"
            >
              Open Dashboard
            </Link>
          </div>

          {/* TRUST */}
          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Star className="fill-yellow-400 text-yellow-400" size={16} />
              4.9 user experience
            </div>

            <div className="flex items-center gap-2">
              <Lock size={16} />
              Privacy focused
            </div>

            <div className="flex items-center gap-2">
              <Heart className="text-pink-500" size={16} />
              Calm-first design
            </div>
          </div>
        </motion.div>

        {/* RIGHT HERO CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="rounded-[38px] border border-white/50 bg-white/70 p-5 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05]">

            <div className="rounded-[30px] bg-gradient-to-br from-white via-indigo-50 to-violet-50 p-6 dark:from-[#141b34] dark:via-[#1a2140] dark:to-[#181d38]">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-300">
                    Live AI wellness
                  </p>

                  <h2 className="text-2xl font-black">
                    Gentle support chat
                  </h2>
                </div>

                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                  <Bot size={22} />
                </div>
              </div>

              {/* CHAT */}
              <div className="mt-8 space-y-4">

                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mr-10 rounded-3xl rounded-bl-md bg-white/90 p-4 shadow-sm dark:bg-white/10"
                >
                  I feel overwhelmed today.
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="ml-10 rounded-3xl rounded-br-md bg-gradient-to-r from-indigo-500 to-violet-500 p-4 text-white shadow-lg"
                >
                  That sounds heavy. Let us slow things down together.
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mr-16 rounded-3xl rounded-bl-md bg-white/90 p-4 shadow-sm dark:bg-white/10"
                >
                  I just want peace in my mind.
                </motion.div>
              </div>

              {/* STATS */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { label: 'Calm', value: '92%' },
                  { label: 'Focus', value: '88%' },
                  { label: 'Hope', value: '95%' }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl bg-white/80 p-4 text-center shadow-sm dark:bg-white/10"
                  >
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-300">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 pb-24">

        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            <Sparkles size={16} />
            Everything designed for emotional comfort
          </div>

          <h2 className="text-4xl font-black">
            Features that actually help
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
            Built with calming UI, supportive AI, and privacy-first emotional wellness experiences.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }, index) => (
            <motion.div
              key={title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group rounded-[30px] border border-white/50 bg-white/70 p-6 shadow-xl backdrop-blur-2xl transition-all hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.05]"
            >
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
                <Icon size={24} />
              </div>

              <h3 className="mt-5 text-xl font-black">
                {title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                {text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}