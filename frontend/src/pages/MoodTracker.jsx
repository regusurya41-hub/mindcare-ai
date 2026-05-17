import { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Brain, Sparkles } from 'lucide-react';
import { api } from '../api/client.js';
import { fallbackMoods } from '../data/demo.js';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import WellnessCard from '../components/ui/WellnessCard.jsx';

const moods = [
  { mood: 'great', emoji: '😄', label: 'Great', prompt: 'What helped you feel lighter?' },
  { mood: 'good', emoji: '🙂', label: 'Good', prompt: 'What is worth repeating?' },
  { mood: 'okay', emoji: '😐', label: 'Okay', prompt: 'What needs a little attention?' },
  { mood: 'low', emoji: '😔', label: 'Low', prompt: 'What would feel gentle right now?' },
  { mood: 'heavy', emoji: '😣', label: 'Heavy', prompt: 'Who or what can support you today?' }
];

export default function MoodTracker() {
  const [selected, setSelected] = useState(moods[2]);
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState([]);
  const [chart, setChart] = useState(fallbackMoods);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/moods').then(({ data }) => setEntries(data.moods || [])).catch(() => {});
    api.get('/moods/analytics').then(({ data }) => setChart(data.chart?.length ? data.chart : fallbackMoods)).catch(() => {});
  }, []);

  const average = useMemo(() => {
    if (!chart.length) return 0;
    return (chart.reduce((sum, item) => sum + Number(item.score || 0), 0) / chart.length).toFixed(1);
  }, [chart]);

  async function logMood() {
    if (saving) return;
    setSaving(true);
    try {
      const { data } = await api.post('/moods', { mood: selected.mood, emoji: selected.emoji, note });
      setEntries([data.mood, ...entries]);
      setNote('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatedPage className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
      <section className="grid gap-5">
        <WellnessCard>
          <p className="text-sm font-bold text-lagoon dark:text-teal-200">Mood tracker</p>
          <h2 className="mt-1 text-2xl font-extrabold">How are you feeling?</h2>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-1">
            {moods.map((item) => (
              <button
                key={item.mood}
                onClick={() => setSelected(item)}
                className={`flex items-center gap-3 rounded-[24px] p-3 text-left transition ${
                  selected.mood === item.mood ? 'bg-lagoon text-white shadow-lg shadow-teal-900/15' : 'bg-mist hover:bg-white dark:bg-white/10 dark:hover:bg-white/15'
                }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-sm font-bold">{item.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-600 dark:text-slate-300">{selected.prompt}</p>
          <textarea className="field mt-3 min-h-32" placeholder="Add a short note..." value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn-primary mt-4 w-full" onClick={logMood} disabled={saving}>{saving ? <LoadingSpinner label="Saving..." /> : 'Log mood'}</button>
        </WellnessCard>

        <WellnessCard className="bg-gradient-to-br from-white/90 to-teal-50/80 dark:from-white/10 dark:to-teal-950/30">
          <Brain className="text-lagoon dark:text-teal-200" />
          <h3 className="mt-4 text-lg font-extrabold">AI pattern insight</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Your average is {average}. If it dips for two days, try Calm Mode before starting work or study.
          </p>
        </WellnessCard>
      </section>

      <section className="grid gap-5">
        <WellnessCard>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold">Weekly analytics</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">Mood cycles, stress patterns, and recovery signals.</p>
            </div>
            <div className="rounded-full bg-mist px-4 py-2 text-sm font-extrabold text-lagoon dark:bg-white/10 dark:text-teal-200">
              Avg {average}
            </div>
          </div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis domain={[1, 5]} axisLine={false} tickLine={false} width={28} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#0f766e" strokeWidth={3} dot={{ r: 5, fill: '#ef8d7b' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </WellnessCard>

        <WellnessCard>
          <div className="flex items-center gap-2">
            <Sparkles className="text-lagoon dark:text-teal-200" />
            <h2 className="text-2xl font-extrabold">Mood history</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {entries.slice(0, 7).map((entry) => (
              <div key={entry._id || entry.createdAt} className="flex flex-col gap-3 rounded-2xl bg-mist p-4 dark:bg-white/10 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-2xl">{entry.emoji}</span>
                  <p className="min-w-0 text-sm">{entry.note || entry.mood}</p>
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{new Date(entry.loggedAt || entry.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
            {entries.length === 0 && <p className="rounded-3xl bg-mist p-5 text-sm text-slate-600 dark:bg-white/10 dark:text-slate-300">No mood entries yet. Start with the closest feeling, not the perfect one.</p>}
          </div>
        </WellnessCard>
      </section>
    </AnimatedPage>
  );
}
