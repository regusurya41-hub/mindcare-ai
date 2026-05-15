import { motion } from 'framer-motion';
import { Headphones, Pause, Play, RotateCcw, ShieldAlert, Timer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';
import WellnessCard from '../components/ui/WellnessCard.jsx';

const groundingSteps = [
  'Name five things you can see.',
  'Name four things you can feel.',
  'Name three things you can hear.',
  'Name two things you can smell.',
  'Name one thing you can taste.'
];

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function CalmMode() {
  const [minutes, setMinutes] = useState(3);
  const [secondsRemaining, setSecondsRemaining] = useState(3 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);
  const totalSeconds = minutes * 60;
  const progress = totalSeconds ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 0;
  const breathLabel = useMemo(() => {
    if (secondsRemaining === 0) return 'Complete';
    if (minutes <= 2) return 'Reset';
    if (minutes <= 5) return 'Steady';
    return 'Deep calm';
  }, [minutes, secondsRemaining]);

  useEffect(() => {
    if (!isRunning) return undefined;
    const interval = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setIsRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  function chooseMinutes(value) {
    setMinutes(value);
    setSecondsRemaining(value * 60);
    setIsRunning(false);
  }

  function resetTimer() {
    setSecondsRemaining(totalSeconds);
    setIsRunning(false);
  }

  return (
    <AnimatedPage className="grid gap-5">
      <section className="overflow-hidden rounded-[34px] border border-white/70 bg-gradient-to-br from-white/85 via-lavender/70 to-teal-50/80 p-5 shadow-glow backdrop-blur-xl dark:border-white/10 dark:from-white/10 dark:via-violet/10 dark:to-teal-950/20 md:p-7">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-sm font-bold text-indigo dark:text-indigo-200">Calm Mode</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-extrabold leading-tight md:text-5xl">A softer screen for hard moments.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
              Use breathing, grounding, and a working meditation timer when your nervous system needs a quieter place to land.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {[2, 3, 5, 10].map((value) => (
                <button
                  key={value}
                  onClick={() => chooseMinutes(value)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    minutes === value ? 'bg-gradient-to-r from-indigo to-violet text-white shadow-lg shadow-indigo/20' : 'bg-white/75 text-slate-700 hover:bg-white dark:bg-white/10 dark:text-slate-200'
                  }`}
                >
                  {value} min
                </button>
              ))}
            </div>
          </div>
          <div className="grid place-items-center">
            <motion.div
              animate={{ scale: isRunning ? [1, 1.18, 1] : 1, opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 6, repeat: isRunning ? Infinity : 0, ease: 'easeInOut' }}
              className="grid h-64 w-64 place-items-center rounded-full bg-indigo/10 shadow-[0_0_80px_rgba(99,102,241,0.22)] dark:bg-indigo/15"
            >
              <motion.div
                animate={{ scale: isRunning ? [0.82, 1, 0.82] : 1 }}
                transition={{ duration: 6, repeat: isRunning ? Infinity : 0, ease: 'easeInOut' }}
                className="grid h-44 w-44 place-items-center rounded-full bg-white/80 text-center shadow-glow dark:bg-white/10"
              >
                <div>
                  <p className="text-sm font-bold text-indigo dark:text-indigo-200">{breathLabel}</p>
                  <p className="mt-1 text-4xl font-extrabold">{formatTime(secondsRemaining)}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-300">{isRunning ? 'Breathe slowly' : 'Ready'}</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WellnessCard delay={0.04}>
          <Timer className="text-indigo dark:text-indigo-200" />
          <h3 className="mt-4 text-lg font-extrabold">Meditation timer</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{minutes} minutes selected. Start with one breath, not perfection.</p>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-lavender dark:bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo to-violet transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button className="btn-primary" onClick={() => setIsRunning((current) => !current)} disabled={secondsRemaining === 0}>
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? 'Pause' : 'Begin'}
            </button>
            <button className="btn-secondary" onClick={resetTimer}>
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </WellnessCard>
        <WellnessCard delay={0.08}>
          <RotateCcw className="text-indigo dark:text-indigo-200" />
          <h3 className="mt-4 text-lg font-extrabold">Grounding</h3>
          <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-300">{groundingSteps[step]}</p>
          <button className="btn-secondary mt-5 w-full" onClick={() => setStep((current) => (current + 1) % groundingSteps.length)}>Next step</button>
        </WellnessCard>
        <WellnessCard delay={0.12}>
          <Headphones className="text-indigo dark:text-indigo-200" />
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
