import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Brain,
  Heart,
  Lock,
  Moon,
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
    text: 'Smart emotional support that adapts to your mood and feelings.'
  },
  {
    icon: Brain,
    title: 'Mental wellness',
    text: 'Guided calming conversations for stress and anxiety relief.'
  },
  {
    icon: Lock,
    title: 'Private & secure',
    text: 'Your chats and journals stay protected and anonymous.'
  },
  {
    icon: UsersRound,
    title: 'Supportive community',
    text: 'Connect with people in a safe and positive environment.'
  }
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b17] text-white">

      {/* PREMIUM BACKGROUND */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute left-[-150px] top-[-120px] h-[450px] w-[450px] rounded-full bg-indigo-500/25 blur-3xl" />

        <div className="absolute right-[-120px] top-[120px] h-[420px] w-[420px] rounded-full bg-fuchsia-500/20 blur-3xl" />

        <div className="absolute bottom-[-180px] left-[25%] h-[500px] w-[500px] rounded-full bg-cyan-400/15 blur-3xl" />

      </div>

      {/* NAVBAR */}

      <nav className="fixed left-1/2 top-5 z-50 flex w-[94%] max-w-7xl -translate-x-1/2 items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-2xl">

        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-2xl shadow-indigo-500/30">
            <Moon size={22} />
          </div>

          <div>
            <h1 className="text-xl font-black tracking-tight">
              MindCare AI
            </h1>

            <p className="text-xs text-slate-400">
              Emotional wellness platform
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">

          <Link
            to="/login"
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2 font-semibold transition-all duration-300 hover:scale-105 hover:bg-white/10"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 font-bold text-white shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:scale-105"
          >
            Start Free
          </Link>

        </div>
      </nav>

      {/* HERO */}

      <section className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-20 px-6 pt-36 lg:grid-cols-2">

        {/* LEFT */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-bold text-indigo-200 backdrop-blur-xl">
            <ShieldCheck size={16} />
            Trusted emotional AI companion
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">

            Your safe space
            <br />

            for mental
            <br />

            wellness.

          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            MindCare AI helps you relax, journal, chat, track moods,
            and feel emotionally supported through calming AI-powered experiences.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <Link
              to="/signup"
              className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-4 font-bold text-white shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:scale-105"
            >
              Get Started

              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              to="/login"
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-bold backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/10"
            >
              Open Dashboard
            </Link>

          </div>

          {/* STATS */}

          <div className="mt-12 flex flex-wrap gap-8">

            <div>
              <h2 className="text-4xl font-black text-indigo-300">
                98%
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Positive support feedback
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-black text-violet-300">
                24/7
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                AI emotional companion
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-black text-cyan-300">
                Secure
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Anonymous conversations
              </p>
            </div>

          </div>

        </motion.div>

        {/* RIGHT SIDE */}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
          className="relative"
        >

          <div className="rounded-[38px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-2xl">

            <div className="rounded-[32px] bg-gradient-to-br from-[#12182c] to-[#1b2140] p-6">

              {/* HEADER */}

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-bold text-indigo-300">
                    Live AI Support
                  </p>

                  <h2 className="text-2xl font-black">
                    Calm conversation
                  </h2>
                </div>

                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500">
                  <Bot size={24} />
                </div>

              </div>

              {/* CHAT */}

              <div className="mt-8 space-y-4">

                <div className="mr-14 rounded-3xl rounded-bl-md bg-white/10 p-4 backdrop-blur-xl">
                  I feel mentally exhausted today.
                </div>

                <div className="ml-14 rounded-3xl rounded-br-md bg-gradient-to-r from-indigo-500 to-violet-500 p-4 text-white shadow-xl">
                  I understand 💜  
                  Let us slow down and breathe together for a moment.
                </div>

                <div className="mr-20 rounded-3xl rounded-bl-md bg-white/10 p-4 backdrop-blur-xl">
                  I just want peace in my head.
                </div>

              </div>

              {/* MINI STATS */}

              <div className="mt-8 grid grid-cols-3 gap-3">

                {[
                  {
                    label: 'Calm',
                    value: '92%'
                  },
                  {
                    label: 'Focus',
                    value: '88%'
                  },
                  {
                    label: 'Hope',
                    value: '95%'
                  }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl bg-white/5 p-4 text-center backdrop-blur-xl"
                  >
                    <h3 className="text-2xl font-black text-indigo-300">
                      {item.value}
                    </h3>

                    <p className="mt-1 text-xs font-bold text-slate-400">
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

      <section className="mx-auto max-w-7xl px-6 pb-28">

        <div className="mb-14 text-center">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-bold text-indigo-200">
            <Sparkles size={16} />
            Premium wellness experience
          </div>

          <h2 className="text-4xl font-black md:text-5xl">
            Designed to make you feel better
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            Every screen, animation, and interaction is built to feel calm, soft, and emotionally supportive.
          </p>

        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {features.map(({ icon: Icon, title, text }) => (
            <motion.div
              whileHover={{ y: -8 }}
              key={title}
              className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.07]"
            >

              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-xl shadow-indigo-500/20">
                <Icon size={24} />
              </div>

              <h3 className="mt-5 text-xl font-black">
                {title}
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                {text}
              </p>

            </motion.div>
          ))}

        </div>

      </section>

    </div>
  );
}