import { motion } from 'framer-motion';
import { ArrowRight, Bot, ChartSpline, Lock, Moon, PenLine, ShieldCheck, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  { icon: Bot, title: 'Anonymous AI chat', text: 'Supportive conversations with crisis-aware safety boundaries.' },
  { icon: ChartSpline, title: 'Mood analytics', text: 'Track patterns with weekly charts and gentle insights.' },
  { icon: PenLine, title: 'Private journal', text: 'Markdown entries, search, tags, and calm reflection prompts.' },
  { icon: UsersRound, title: 'Anonymous community', text: 'Share, comment, like, and report posts in moderated spaces.' }
];

export default function Landing() {
  return (
    <div className="min-h-screen text-ink dark:text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link className="flex items-center gap-3 font-extrabold" to="/">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lagoon text-white">
            <Moon size={20} />
          </span>
          MindCare AI
        </Link>
        <div className="flex items-center gap-3">
          <Link className="btn-secondary px-4 py-2" to="/login">Login</Link>
          <Link className="btn-primary px-4 py-2" to="/signup">Start free</Link>
        </div>
      </nav>
      <main>
        <section className="mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl items-center gap-10 px-5 pb-16 pt-6 lg:grid-cols-[1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-white/70 px-4 py-2 text-sm font-semibold text-lagoon dark:border-white/10 dark:bg-white/10 dark:text-teal-200">
              <ShieldCheck size={16} />
              Privacy-first emotional wellness
            </div>
            <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-normal md:text-7xl">MindCare AI</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-200">
              A calmer place to check in, reflect, and get supportive AI guidance while keeping emotional safety and privacy at the center.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-primary" to="/signup">Create your space <ArrowRight size={18} /></Link>
              <Link className="btn-secondary" to="/login">Open dashboard</Link>
            </div>
          </motion.div>
          <motion.div className="glass rounded-[36px] p-5" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.65 }}>
            <div className="rounded-[28px] bg-gradient-to-br from-white to-mist p-5 dark:from-white/15 dark:to-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-lagoon dark:text-teal-200">Live wellness board</p>
                  <h2 className="text-2xl font-extrabold">You are not alone here.</h2>
                </div>
                <Lock className="text-lagoon dark:text-teal-200" />
              </div>
              <div className="mt-6 grid gap-3">
                {['I feel overwhelmed today.', 'Let us slow it down together.', 'Try one breath and one next step.'].map((line, index) => (
                  <div key={line} className={`rounded-3xl px-4 py-3 text-sm ${index === 1 ? 'ml-10 bg-lagoon text-white' : 'mr-10 bg-white shadow-sm dark:bg-white/10'}`}>
                    {line}
                  </div>
                ))}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {['Calm', 'Hope', 'Focus'].map((item) => (
                  <div key={item} className="rounded-3xl bg-white/80 p-4 text-center text-sm font-bold dark:bg-white/10">{item}</div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
        <section className="mx-auto max-w-7xl px-5 pb-20">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => (
              <motion.div whileHover={{ y: -6 }} key={title} className="panel">
                <Icon className="text-lagoon dark:text-teal-200" />
                <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {['It feels gentle without feeling childish.', 'The mood charts helped me notice my sleep pattern.', 'The anonymous community made it easier to ask for support.'].map((quote) => (
              <div key={quote} className="rounded-[28px] bg-white/70 p-5 text-sm font-medium shadow-sm dark:bg-white/10">“{quote}”</div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
