import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Bot, CalendarCheck, ChartSpline, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/ui/StatCard.jsx';
import { fallbackMoods, resources } from '../data/demo.js';

export default function Dashboard() {
  return (
    <div className="grid gap-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Mood average" value="4.0" hint="Weekly trend is steady" icon={ChartSpline} />
        <StatCard label="Journal streak" value="6" hint="Entries this month" icon={PenLine} />
        <StatCard label="AI check-ins" value="18" hint="Private conversations" icon={Bot} />
        <StatCard label="Mindful minutes" value="42" hint="Breathing and grounding" icon={CalendarCheck} />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="panel min-h-[360px]">
          <div className="flex items-center justify-between">
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
                <YAxis domain={[1, 5]} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#0f766e" strokeWidth={3} fill="url(#moodFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel">
          <h2 className="text-2xl font-extrabold">Supportive resources</h2>
          <div className="mt-5 grid gap-3">
            {resources.map((item) => (
              <div key={item.title} className="rounded-3xl bg-mist p-4 dark:bg-white/10">
                <p className="font-bold">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
              </div>
            ))}
          </div>
          <Link to="/app/chat" className="btn-primary mt-5 w-full">Talk with MindCare AI</Link>
        </div>
      </section>
    </div>
  );
}
