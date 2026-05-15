import { motion } from 'framer-motion';
import { ArrowRight, Bot, ChartSpline, Lock, Moon, PenLine, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { icon: Bot, title: 'Emotion-aware AI', text: 'Supportive conversations with crisis-aware safety boundaries.' },
  { icon: ChartSpline, title: 'Mood patterns', text: 'Track cycles with soft analytics and weekly emotional trends.' },
  { icon: PenLine, title: 'Reflection journal', text: 'Markdown entries, private lock mode, tags, and AI-style insights.' },
  { icon: UsersRound, title: 'Anonymous support', text: 'Share, comment, like, and report posts in moderated spaces.' }
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden text-ink dark:text-white">
      <div className="ambient-layer">
        <div className="ambient-orb left-[-10rem] top-20 h-96 w-96 animate-float bg-violet/25 dark:bg-violet/15" />
        <div className="ambient-orb right-[-9rem] top-6 h-96 w-96 animate-slow-pulse bg-lagoon/20 dark:bg-lagoon/10" />
        <div className="ambient-orb bottom-[-12rem] left-1/3 h-[30rem] w-[30rem] animate-float bg-indigo/15 dark:bg-indigo/10" />
      </div>

      <nav className="sticky top-4 z-40 mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-7xl items-center justify-between rounded-3xl border border-white/70 bg-white/65 px-4 py-3 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.08]">
        <Link className="flex items-center gap-3 font-extrabold" to="/">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo to-violet text-white shadow-lg shadow-indigo/20">
            <Moon size={20} />
          </span>
          MindCare AI
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link className="btn-secondary px-4 py-2" to="/login">Login</Link>
          <Link className="btn-primary px-4 py-2" to="/signup">Start free</Link>
        </div>
      </nav>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl items-center gap-10 px-5 pb-16 pt-10 lg:grid-cols-[1fr_0.9fr]">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.6 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo/10 bg-white/70 px-4 py-2 text-sm font-semibold text-indigo shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:text-indigo-200">
              <ShieldCheck size={16} />
              Privacy-first emotional wellness
            </div>
            <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-normal md:text-7xl">
              Your safe space for emotional wellness.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-200">
              MindCare AI helps you check in, reflect, calm your body, and get supportive guidance without making the experience feel clinical.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-primary" to="/signup">Create your space <ArrowRight size={18} /></Link>
              <Link className="btn-secondary" to="/login">Open dashboard</Link>
            </div>
          </motion.div>

          <motion.div className="glass rounded-[36px] p-4 sm:p-5" initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <div className="rounded-[30px] bg-gradient-to-br from-white/95 via-lavender/70 to-teal-50/80 p-5 dark:from-white/15 dark:via-violet/10 dark:to-teal-950/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-indigo dark:text-indigo-200">Live wellness board</p>
                  <h2 className="text-2xl font-extrabold">You are not alone here.</h2>
                </div>
                <Lock className="text-indigo dark:text-indigo-200" />
              </div>
              <div className="mt-6 grid gap-3">
                {['I feel overwhelmed today.', 'Let us slow it down together.', 'Try one breath and one next step.'].map((line, index) => (
                  <motion.div
                    key={line}
                    initial={{ opacity: 0, x: index === 1 ? 18 : -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.12 }}
                    className={`rounded-3xl px-4 py-3 text-sm shadow-sm ${
                      index === 1 ? 'ml-8 bg-gradient-to-r from-indigo to-violet text-white sm:ml-12' : 'mr-8 bg-white/85 dark:bg-white/10 sm:mr-12'
                    }`}
                  >
                    {line}
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {['Calm', 'Hope', 'Focus'].map((item) => (
                  <div key={item} className="rounded-3xl bg-white/75 p-4 text-center text-sm font-bold shadow-sm dark:bg-white/10">{item}</div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20">
          <div className="mb-6 flex items-center gap-2 text-sm font-bold text-indigo dark:text-indigo-200">
            <Sparkles size={16} />
            Built to feel calm, modern, and emotionally safe
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ y: -6, scale: 1.01 }}
                key={title}
                className="panel"
              >
                <Icon className="text-indigo dark:text-indigo-200" />
                <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {['It feels gentle without feeling childish.', 'The mood charts helped me notice my sleep pattern.', 'The anonymous community made it easier to ask for support.'].map((quote) => (
              <div key={quote} className="rounded-3xl border border-white/70 bg-white/65 p-5 text-sm font-medium shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08]">
                "{quote}"
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
