import { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api/client.js';
import { fallbackMoods } from '../data/demo.js';

const moods = [
  { mood: 'great', emoji: '😄', label: 'Great' },
  { mood: 'good', emoji: '🙂', label: 'Good' },
  { mood: 'okay', emoji: '😐', label: 'Okay' },
  { mood: 'low', emoji: '😔', label: 'Low' },
  { mood: 'heavy', emoji: '😣', label: 'Heavy' }
];

export default function MoodTracker() {
  const [selected, setSelected] = useState(moods[2]);
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState([]);
  const [chart, setChart] = useState(fallbackMoods);

  useEffect(() => {
    api.get('/moods').then(({ data }) => setEntries(data.moods || [])).catch(() => {});
    api.get('/moods/analytics').then(({ data }) => setChart(data.chart?.length ? data.chart : fallbackMoods)).catch(() => {});
  }, []);

  async function logMood() {
    const { data } = await api.post('/moods', { mood: selected.mood, emoji: selected.emoji, note });
    setEntries([data.mood, ...entries]);
    setNote('');
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="panel">
        <p className="text-sm font-bold text-lagoon dark:text-teal-200">Mood tracker</p>
        <h2 className="text-2xl font-extrabold">How are you feeling?</h2>
        <div className="mt-6 grid grid-cols-5 gap-2">
          {moods.map((item) => (
            <button key={item.mood} onClick={() => setSelected(item)} className={`rounded-[24px] p-3 text-center transition ${selected.mood === item.mood ? 'bg-lagoon text-white shadow-lg' : 'bg-mist dark:bg-white/10'}`}>
              <span className="block text-2xl">{item.emoji}</span>
              <span className="mt-2 block text-xs font-bold">{item.label}</span>
            </button>
          ))}
        </div>
        <textarea className="field mt-5 min-h-32" placeholder="Add a short note..." value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="btn-primary mt-4 w-full" onClick={logMood}>Log mood</button>
      </section>
      <section className="panel">
        <h2 className="text-2xl font-extrabold">Weekly analytics</h2>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis domain={[1, 5]} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#0f766e" strokeWidth={3} dot={{ r: 5, fill: '#ef8d7b' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid gap-3">
          {entries.slice(0, 5).map((entry) => (
            <div key={entry._id || entry.createdAt} className="flex items-center justify-between rounded-2xl bg-mist p-3 dark:bg-white/10">
              <span className="text-2xl">{entry.emoji}</span>
              <p className="min-w-0 flex-1 px-3 text-sm">{entry.note || entry.mood}</p>
              <span className="text-xs font-bold text-slate-500">{new Date(entry.loggedAt || entry.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
