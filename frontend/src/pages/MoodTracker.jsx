import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import { Brain, CalendarDays, Flame, Sparkles, TrendingUp } from 'lucide-react';
import { api } from '../api/client.js';
import { fallbackMoods } from '../data/demo.js';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import WellnessCard from '../components/ui/WellnessCard.jsx';

const MOODS = [
  { mood: 'great', emoji: '😄', label: 'Great', score: 5, color: 'bg-emerald-400', prompt: 'What helped you feel lighter today?' },
  { mood: 'good',  emoji: '🙂', label: 'Good',  score: 4, color: 'bg-indigo-400',  prompt: 'What is worth repeating tomorrow?' },
  { mood: 'okay',  emoji: '😐', label: 'Okay',  score: 3, color: 'bg-violet-400',  prompt: 'What needs a little attention?' },
  { mood: 'low',   emoji: '😔', label: 'Low',   score: 2, color: 'bg-amber-400',   prompt: 'What would feel gentle right now?' },
  { mood: 'heavy', emoji: '😣', label: 'Heavy', score: 1, color: 'bg-rose-400',    prompt: 'Who or what can support you today?' },
];

const SCORE_COLORS = { 5: '#34d399', 4: '#818cf8', 3: '#a78bfa', 2: '#fbbf24', 1: '#fb7185' };

// Build a 30-day calendar grid from mood entries
function buildCalendar(entries) {
  const map = {};
  for (const e of entries) {
    const d = (e.loggedAt || e.createdAt)?.slice(0, 10);
    if (d) map[d] = e;
  }
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    days.push({ key, entry: map[key] ?? null, dayNum: date.getDate(), dayName: date.toLocaleDateString('en', { weekday: 'short' }) });
  }
  return days;
}

function computeStreak(entries) {
  const dates = new Set(entries.map((e) => (e.loggedAt || e.createdAt)?.slice(0, 10)));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (dates.has(d.toISOString().slice(0, 10))) streak++;
    else if (i > 0) break;
  }
  return streak;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const score = payload[0]?.value;
  const mood  = MOODS.find((m) => m.score === Math.round(score));
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/95 px-4 py-3 shadow-xl backdrop-blur-xl text-white text-sm">
      <p className="font-bold text-slate-400 text-xs mb-1">{label}</p>
      <p className="font-extrabold">{mood?.emoji} {mood?.label ?? score} <span className="text-slate-400 font-normal">({score}/5)</span></p>
    </div>
  );
};

export default function MoodTracker() {
  const [selected, setSelected] = useState(MOODS[2]);
  const [note, setNote]         = useState('');
  const [entries, setEntries]   = useState([]);
  const [chart, setChart]       = useState(fallbackMoods);
  const [saving, setSaving]     = useState(false);
  const [logged, setLogged]     = useState(false);

  useEffect(() => {
    api.get('/moods').then(({ data }) => setEntries(data.moods || [])).catch(() => {});
    api.get('/moods/analytics').then(({ data }) => setChart(data.chart?.length ? data.chart : fallbackMoods)).catch(() => {});
  }, []);

  const average = useMemo(() => {
    if (!chart.length) return 0;
    return (chart.reduce((s, i) => s + Number(i.score || 0), 0) / chart.length).toFixed(1);
  }, [chart]);

  const streak   = useMemo(() => computeStreak(entries), [entries]);
  const calendar = useMemo(() => buildCalendar(entries), [entries]);

  async function logMood() {
    if (saving) return;
    setSaving(true);
    try {
      const { data } = await api.post('/moods', { mood: selected.mood, emoji: selected.emoji, note });
      const newEntry = data.mood;
      setEntries([newEntry, ...entries]);
      setChart((prev) => [...prev.slice(-6), {
        date: new Date().toISOString().slice(0, 10),
        mood: selected.mood,
        score: selected.score
      }]);
      setNote('');
      setLogged(true);
      setTimeout(() => setLogged(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatedPage className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">

      {/* ── Left: Mood logger ── */}
      <section className="grid gap-5">
        <WellnessCard>
          <p className="text-sm font-bold text-teal-600 dark:text-teal-300">Mood tracker</p>
          <h2 className="mt-1 text-2xl font-extrabold">How are you feeling?</h2>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-1">
            {MOODS.map((item) => (
              <button
                key={item.mood}
                onClick={() => setSelected(item)}
                className={`flex items-center gap-3 rounded-[22px] p-3.5 text-left transition-all duration-200 ${
                  selected.mood === item.mood
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg scale-[1.02]'
                    : 'bg-slate-50 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10'
                }`}
                aria-pressed={selected.mood === item.mood}
              >
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <p className="text-sm font-bold">{item.label}</p>
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 w-3 rounded-full ${i < item.score ? (selected.mood === item.mood ? 'bg-white/80' : item.color) : 'bg-slate-200 dark:bg-white/10'}`}
                      />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <p className="mt-5 text-sm font-semibold italic text-slate-500 dark:text-slate-400">
            💭 {selected.prompt}
          </p>

          <textarea
            className="field mt-3 min-h-28"
            placeholder="Add a short note (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <AnimatePresence>
            {logged && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                role="status"
              >
                ✅ Mood logged! Keep it up.
              </motion.div>
            )}
          </AnimatePresence>

          <button className="btn-primary mt-4 w-full" onClick={logMood} disabled={saving}>
            {saving ? <LoadingSpinner label="Saving..." /> : 'Log mood'}
          </button>
        </WellnessCard>

        {/* Streak + stats */}
        <div className="grid grid-cols-2 gap-3">
          <WellnessCard className="text-center">
            <Flame className="mx-auto text-orange-500" size={28} aria-hidden />
            <p className="mt-2 text-4xl font-black text-orange-500">{streak}</p>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">Day streak 🔥</p>
          </WellnessCard>
          <WellnessCard className="text-center">
            <TrendingUp className="mx-auto text-indigo-500" size={28} aria-hidden />
            <p className="mt-2 text-4xl font-black text-indigo-500">{average}</p>
            <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">Avg score /5</p>
          </WellnessCard>
        </div>

        {/* AI insight */}
        <WellnessCard className="bg-gradient-to-br from-white/90 to-teal-50/80 dark:from-white/10 dark:to-teal-950/30">
          <Brain className="text-teal-600 dark:text-teal-300" size={20} aria-hidden />
          <h3 className="mt-3 text-lg font-extrabold">AI pattern insight</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {Number(average) >= 4
              ? `Strong week! Your average of ${average} suggests positive momentum. Keep noting what's working.`
              : Number(average) >= 3
              ? `Your average of ${average} shows balance. If it dips for two days, try Calm Mode before work.`
              : `Your average of ${average} suggests a tough stretch. The Calm Space and AI chat are here for you.`
            }
          </p>
        </WellnessCard>
      </section>

      {/* ── Right: Charts ── */}
      <section className="grid gap-5">

        {/* Improved area chart */}
        <WellnessCard>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold">Weekly mood trend</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Stress cycles, recovery signals, emotional momentum.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-extrabold text-indigo-600 dark:bg-white/10 dark:text-indigo-300">
              Avg {average} / 5
            </div>
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <YAxis domain={[1, 5]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="score"
                  stroke="#6366f1" strokeWidth={3}
                  fill="url(#moodGrad)"
                  dot={{ r: 5, fill: '#fff', stroke: '#6366f1', strokeWidth: 2.5 }}
                  activeDot={{ r: 8, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </WellnessCard>

        {/* 30-day calendar heatmap */}
        <WellnessCard>
          <div className="flex items-center gap-2 mb-5">
            <CalendarDays className="text-indigo-500" size={20} aria-hidden />
            <h2 className="text-2xl font-extrabold">30-day mood map</h2>
          </div>
          <div className="grid grid-cols-10 gap-1.5" role="list" aria-label="30-day mood calendar">
            {calendar.map(({ key, entry, dayNum, dayName }) => {
              const moodMeta = entry ? MOODS.find((m) => m.mood === entry.mood) : null;
              const bg = moodMeta
                ? `bg-gradient-to-br ${
                    moodMeta.score === 5 ? 'from-emerald-400 to-teal-400' :
                    moodMeta.score === 4 ? 'from-indigo-400 to-violet-400' :
                    moodMeta.score === 3 ? 'from-violet-400 to-fuchsia-400' :
                    moodMeta.score === 2 ? 'from-amber-400 to-orange-400' :
                    'from-rose-400 to-red-400'
                  }`
                : 'bg-slate-100 dark:bg-white/5';
              return (
                <motion.div
                  key={key}
                  role="listitem"
                  whileHover={{ scale: 1.15 }}
                  title={entry ? `${dayName} ${dayNum}: ${moodMeta?.label}` : `${dayName} ${dayNum}: no entry`}
                  className={`relative aspect-square rounded-lg ${bg} flex flex-col items-center justify-center cursor-default`}
                  aria-label={entry ? `${dayName}: ${moodMeta?.label}` : `${dayName}: no entry`}
                >
                  {entry && (
                    <span className="text-[10px] leading-none">{moodMeta?.emoji}</span>
                  )}
                  <span className={`text-[8px] font-bold mt-0.5 ${entry ? 'text-white/80' : 'text-slate-300 dark:text-white/20'}`}>
                    {dayNum}
                  </span>
                </motion.div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            {MOODS.map((m) => (
              <div key={m.mood} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className={`h-3 w-3 rounded-sm ${m.color}`} aria-hidden />
                {m.label}
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="h-3 w-3 rounded-sm bg-slate-200 dark:bg-white/10" aria-hidden />
              No entry
            </div>
          </div>
        </WellnessCard>

        {/* Recent history */}
        <WellnessCard>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-indigo-500" size={20} aria-hidden />
            <h2 className="text-2xl font-extrabold">Recent moods</h2>
          </div>
          <div className="grid gap-2.5">
            {entries.slice(0, 7).map((entry) => {
              const meta = MOODS.find((m) => m.mood === entry.mood);
              return (
                <div
                  key={entry._id || entry.createdAt}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">{entry.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{meta?.label}</p>
                      {entry.note && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{entry.note}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`h-1.5 w-2.5 rounded-full ${i < (meta?.score ?? 0) ? meta.color : 'bg-slate-200 dark:bg-white/10'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">{new Date(entry.loggedAt || entry.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
            {entries.length === 0 && (
              <p className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-white/5">
                No mood entries yet. Start with the feeling closest to now.
              </p>
            )}
          </div>
        </WellnessCard>
      </section>
    </AnimatedPage>
  );
}