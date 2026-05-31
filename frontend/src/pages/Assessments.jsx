import { ClipboardCheck, HeartPulse, ShieldCheck, Sparkles } from 'lucide-react';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';
import WellnessCard from '../components/ui/WellnessCard.jsx';

const assessments = [
  { title: 'Stress Check', detail: 'A gentle check-in for pressure, overload, and recovery needs.', status: 'Ready' },
  { title: 'Anxiety Signals', detail: 'Notice worry loops, body tension, and grounding needs without clinical heaviness.', status: 'Ready' },
  { title: 'Burnout Scan', detail: 'Look for exhaustion patterns, emotional depletion, and rest debt.', status: 'Soon' }
];

export default function Assessments() {
  return (
    <AnimatedPage className="grid gap-5">
      <section className="panel overflow-hidden bg-gradient-to-br from-white/90 to-lavender/70 dark:from-white/10 dark:to-violet/10">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="text-indigo dark:text-indigo-200" />
          <p className="text-sm font-bold text-indigo dark:text-indigo-200">Assessments</p>
        </div>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Gentle self-checks, not labels.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
          Lightweight reflection tools help users understand patterns while keeping the experience supportive and non-clinical.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {assessments.map((item) => (
          <WellnessCard key={item.title}>
            <HeartPulse className="text-indigo dark:text-indigo-200" />
            <h2 className="mt-4 text-xl font-black tracking-tight">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.detail}</p>
            <span className="mt-5 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-indigo dark:bg-white/10 dark:text-indigo-200">{item.status}</span>
          </WellnessCard>
        ))}
      </section>

      <WellnessCard>
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-indigo dark:text-indigo-200" />
          <h2 className="text-2xl font-black tracking-tight">Safety-first framing</h2>
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          These screens should never diagnose. They should help users notice what they feel, choose coping tools, and seek real support when needed.
        </p>
      </WellnessCard>
    </AnimatedPage>
  );
}
