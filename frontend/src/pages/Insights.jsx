import { BarChart3, Brain, CalendarDays, Sparkles } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';
import WellnessCard from '../components/ui/WellnessCard.jsx';
import { fallbackMoods } from '../data/demo.js';

const insightCards = [
  'You feel calmer after journaling consistently.',
  'Late-night check-ins may be linked with heavier mood notes.',
  'Breathing sessions appear before steadier mood days.'
];

export default function Insights() {
  return (
    <AnimatedPage className="grid gap-5">
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <WellnessCard>
          <div className="flex items-center gap-3">
            <BarChart3 className="text-indigo dark:text-indigo-200" />
            <h1 className="text-3xl font-black tracking-tight">Mind Stats</h1>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Emotional trends, recovery signals, and AI-generated pattern cards.</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fallbackMoods}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis domain={[1, 5]} axisLine={false} tickLine={false} width={28} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fill="#8b5cf633" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </WellnessCard>

        <WellnessCard className="bg-gradient-to-br from-white/90 to-lavender/70 dark:from-white/10 dark:to-violet/10">
          <Brain className="text-indigo dark:text-indigo-200" />
          <h2 className="mt-4 text-2xl font-black tracking-tight">AI prediction</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Stress risk is moderate this week. A calm session before evening work may prevent emotional overload.
          </p>
        </WellnessCard>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {insightCards.map((item) => (
          <WellnessCard key={item}>
            <Sparkles className="text-indigo dark:text-indigo-200" />
            <p className="mt-4 text-sm font-semibold leading-7 text-slate-700 dark:text-slate-200">{item}</p>
          </WellnessCard>
        ))}
      </section>

      <WellnessCard>
        <div className="flex items-center gap-3">
          <CalendarDays className="text-indigo dark:text-indigo-200" />
          <h2 className="text-2xl font-black tracking-tight">Emotional heatmap</h2>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, index) => (
            <div key={index} className={`h-8 rounded-xl ${index % 5 === 0 ? 'bg-violet' : index % 3 === 0 ? 'bg-indigo' : 'bg-lagoon/70'}`} />
          ))}
        </div>
      </WellnessCard>
    </AnimatedPage>
  );
}
