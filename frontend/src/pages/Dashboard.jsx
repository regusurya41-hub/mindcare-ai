import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Bot, CalendarCheck, ChartSpline, HeartPulse, PenLine, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import WellnessCard from '../components/ui/WellnessCard.jsx';
import { fallbackMoods, resources } from '../data/demo.js';

const activity = [
  { name: 'Chat', value: 18 },
  { name: 'Mood', value: 7 },
  { name: 'Journal', value: 6 },
  { name: 'Calm', value: 4 }
];

export default function Dashboard() {
  return (
    <AnimatedPage className="grid gap-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Wellness score" value="82" hint="Balanced week" icon={HeartPulse} />
        <StatCard label="Mood average" value="4.0" hint="Weekly trend is steady" icon={ChartSpline} />
        <StatCard label="Journal streak" value="6" hint="Entries this month" icon={PenLine} />
        <StatCard label="AI check-ins" value="18" hint="Private conversations" icon={Bot} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <WellnessCard className="min-h-[360px]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-lagoon dark:text-teal-200">Mood overview</p>
              <h2 className="text-2xl font-extrabold">Your last seven days</h2>
            </div>
            <Link to="/app/moods" className="btn-secondary px-4 py-2">Log mood</Link>
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fallbackMoods}>
                <defs>
                  <linearGradient id="moodFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0f766e" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis domain={[1, 5]} axisLine={false} tickLine={false} width={28} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#0f766e" strokeWidth={3} fill="url(#moodFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </WellnessCard>

        <WellnessCard>
          <Sparkles className="text-lagoon dark:text-teal-200" />
          <h2 className="mt-4 text-2xl font-extrabold">AI suggestion</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Your mood looks steadier after reflection days. Try a two-minute journal entry before your next AI check-in.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link to="/app/journal" className="btn-secondary px-4 py-2">Write</Link>
            <Link to="/app/calm" className="btn-primary px-4 py-2">Calm mode</Link>
          </div>
        </WellnessCard>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <WellnessCard>
          <h2 className="text-2xl font-extrabold">Activity mix</h2>
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} width={28} />
                <Tooltip />
                <Bar dataKey="value" radius={[12, 12, 4, 4]} fill="#ef8d7b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </WellnessCard>

        <WellnessCard>
          <div className="flex items-center gap-3">
            <CalendarCheck className="text-lagoon dark:text-teal-200" />
            <h2 className="text-2xl font-extrabold">Supportive resources</h2>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {resources.map((item) => (
              <div key={item.title} className="rounded-3xl bg-mist p-4 dark:bg-white/10">
                <p className="font-bold">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.detail}</p>
              </div>
            ))}
          </div>
        </WellnessCard>
      </section>
    </AnimatedPage>
  );
}
