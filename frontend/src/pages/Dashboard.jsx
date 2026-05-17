import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import {
  Bot,
  CalendarCheck,
  ChartSpline,
  HeartPulse,
  PenLine,
  Sparkles,
  TrendingUp
} from 'lucide-react';

import { motion } from 'framer-motion';
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

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning 🌤️';
  if (hour < 17) return 'Good afternoon ☁️';
  if (hour < 21) return 'Good evening 🌙';

  return 'Late night reflections ✨';
}

export default function Dashboard() {
  return (
    <AnimatedPage className="grid gap-5">
      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[34px] border border-white/70 bg-gradient-to-br from-indigo via-violet to-indigo p-6 text-white shadow-glow"
      >
        <div className="absolute right-[-70px] top-[-70px] h-52 w-52 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10">
          <p className="text-sm font-semibold text-white/80">
            {getGreeting()}
          </p>

          <h1 className="mt-2 text-4xl font-extrabold leading-tight">
            Welcome back to your
            <br />
            wellness space.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80">
            Track emotions, reflect gently, and build healthier mental
            habits with calm AI support.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/app/chat"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-indigo transition hover:scale-105"
            >
              Open AI Chat
            </Link>

            <Link
              to="/app/journal"
              className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold backdrop-blur-xl transition hover:bg-white/20"
            >
              Write Journal
            </Link>
          </div>
        </div>
      </motion.section>

      {/* STATS */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Wellness score"
          value="82"
          hint="Balanced week"
          icon={HeartPulse}
        />

        <StatCard
          label="Mood average"
          value="4.0"
          hint="Weekly trend is steady"
          icon={ChartSpline}
        />

        <StatCard
          label="Journal streak"
          value="6"
          hint="Entries this month"
          icon={PenLine}
        />

        <StatCard
          label="AI check-ins"
          value="18"
          hint="Private conversations"
          icon={Bot}
        />
      </section>

      {/* CHARTS */}
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        {/* Mood Chart */}
        <WellnessCard className="min-h-[360px]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-lagoon dark:text-teal-200">
                Mood overview
              </p>

              <h2 className="text-2xl font-extrabold">
                Your last seven days
              </h2>
            </div>

            <Link
              to="/app/moods"
              className="btn-secondary px-4 py-2"
            >
              Log mood
            </Link>
          </div>

          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fallbackMoods}>
                <defs>
                  <linearGradient
                    id="moodFill"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#14b8a6"
                      stopOpacity={0.45}
                    />

                    <stop
                      offset="100%"
                      stopColor="#14b8a6"
                      stopOpacity={0.03}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  opacity={0.15}
                />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  domain={[1, 5]}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  fill="url(#moodFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </WellnessCard>

        {/* AI Insight */}
        <WellnessCard className="relative overflow-hidden">
          <div className="absolute right-[-50px] top-[-50px] h-40 w-40 rounded-full bg-violet/10 blur-3xl" />

          <Sparkles className="relative z-10 text-lagoon dark:text-teal-200" />

          <h2 className="relative z-10 mt-4 text-2xl font-extrabold">
            AI suggestion
          </h2>

          <p className="relative z-10 mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Your mood looks steadier after reflection days.
            Try a two-minute journal entry before your next
            AI check-in.
          </p>

          {/* Progress Circle */}
          <div className="relative z-10 mt-6 flex items-center justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-indigo/10">
              <div
                className="absolute inset-0 rounded-full border-[10px] border-transparent border-t-indigo border-r-violet"
                style={{ transform: 'rotate(140deg)' }}
              />

              <div className="text-center">
                <p className="text-3xl font-extrabold text-indigo">
                  82%
                </p>

                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  wellness
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 grid grid-cols-2 gap-3">
            <Link
              to="/app/journal"
              className="btn-secondary px-4 py-2"
            >
              Write
            </Link>

            <Link
              to="/app/calm"
              className="btn-primary px-4 py-2"
            >
              Calm mode
            </Link>
          </div>
        </WellnessCard>
      </section>

      {/* ACTIVITY + RESOURCES */}
      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Activity */}
        <WellnessCard>
          <div className="flex items-center gap-3">
            <TrendingUp className="text-indigo" />

            <h2 className="text-2xl font-extrabold">
              Activity mix
            </h2>
          </div>

          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activity}>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  opacity={0.12}
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  radius={[14, 14, 4, 4]}
                  fill="#8b5cf6"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </WellnessCard>

        {/* Resources */}
        <WellnessCard>
          <div className="flex items-center gap-3">
            <CalendarCheck className="text-lagoon dark:text-teal-200" />

            <h2 className="text-2xl font-extrabold">
              Supportive resources
            </h2>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {resources.map((item) => (
              <motion.div
                whileHover={{
                  y: -4,
                  scale: 1.02
                }}
                key={item.title}
                className="rounded-3xl border border-white/60 bg-mist p-4 shadow-sm transition-all dark:bg-white/10"
              >
                <p className="font-bold">
                  {item.title}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </WellnessCard>
      </section>
    </AnimatedPage>
  );
}