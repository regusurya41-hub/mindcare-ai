import { motion } from 'framer-motion';
import { Headphones, Play, RotateCcw, ShieldAlert, Timer } from 'lucide-react';
import { useMemo, useState } from 'react';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';
import WellnessCard from '../components/ui/WellnessCard.jsx';

const groundingSteps = [
  'Name five things you can see.',
  'Name four things you can feel.',
  'Name three things you can hear.',
  'Name two things you can smell.',
  'Name one thing you can taste.'
];

export default function CalmMode() {
  const [minutes, setMinutes] = useState(3);
  const [step, setStep] = useState(0);
  const breathLabel = useMemo(() => (minutes <= 2 ? 'Reset' : minutes <= 5 ? 'Steady' : 'Deep calm'), [minutes]);

  return (
    <AnimatedPage className="grid gap-5">
      <section className="overflow-hidden rounded-[34px] border border-white/70 bg-gradient-to-br from-white/85 via-mist/80 to-teal-50/80 p-5 shadow-glow backdrop-blur-xl dark:border-white/10 dark:from-white/10 dark:via-teal-950/20 dark:to-slate-950/30 md:p-7">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-sm font-bold text-lagoon dark:text-teal-200">Calm Mode</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-extrabold leading-tight md:text-5xl">A softer screen for hard moments.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
              Use breathing, grounding, and a short timer when your nervous system needs a quieter place to land.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {[2, 3, 5, 10].map((value) => (
                <button
                  key={value}
                  onClick={() => setMinutes(value)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    minutes === value ? 'bg-lagoon text-white shadow-lg shadow-teal-900/15' : 'bg-white/75 text-slate-700 hover:bg-white dark:bg-white/10 dark:text-slate-200'
                  }`}
                >
                  {value} min
                </button>
              ))}
            </div>
          </div>
          <div className="grid place-items-center">
            <motion.div
              animate={{ scale: [1, 1.18, 1], opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="grid h-64 w-64 place-items-center rounded-full bg-lagoon/15 shadow-[0_0_80px_rgba(15,118,110,0.22)] dark:bg-teal-300/10"
            >
              <motion.div
                animate={{ scale: [0.82, 1, 0.82] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="grid h-44 w-44 place-items-center rounded-full bg-white/80 text-center shadow-glow dark:bg-white/10"
              >
                <div>
                  <p className="text-sm font-bold text-lagoon dark:text-teal-200">{breathLabel}</p>
                  <p className="mt-1 text-3xl font-extrabold">Breathe</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WellnessCard delay={0.04}>
          <Timer className="text-lagoon dark:text-teal-200" />
          <h3 className="mt-4 text-lg font-extrabold">Meditation timer</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{minutes} minutes selected. Start with one breath, not perfection.</p>
          <button className="btn-primary mt-5 w-full"><Play size={16} /> Begin</button>
        </WellnessCard>
        <WellnessCard delay={0.08}>
          <RotateCcw className="text-lagoon dark:text-teal-200" />
          <h3 className="mt-4 text-lg font-extrabold">Grounding</h3>
          <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-300">{groundingSteps[step]}</p>
          <button className="btn-secondary mt-5 w-full" onClick={() => setStep((current) => (current + 1) % groundingSteps.length)}>Next step</button>
        </WellnessCard>
        <WellnessCard delay={0.12}>
          <Headphones className="text-lagoon dark:text-teal-200" />
          <h3 className="mt-4 text-lg font-extrabold">Ambient sound</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Rain, soft noise, and ocean loops can be added as local assets later.</p>
          <button className="btn-secondary mt-5 w-full">Preview quiet mode</button>
        </WellnessCard>
        <WellnessCard delay={0.16} className="border-red-200 bg-red-50/80 dark:border-red-900/50 dark:bg-red-950/20">
          <ShieldAlert className="text-red-700 dark:text-red-200" />
          <h3 className="mt-4 text-lg font-extrabold">Panic support</h3>
          <p className="mt-2 text-sm leading-6 text-red-800 dark:text-red-100">If you may be unsafe, contact emergency services or someone trusted now.</p>
          <a className="btn-primary mt-5 w-full bg-red-700 hover:bg-red-800" href="tel:112">Call help</a>
        </WellnessCard>
      </section>
    </AnimatedPage>
  );
}
