import { Edit3, Lock, Search, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '../api/client.js';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';
import WellnessCard from '../components/ui/WellnessCard.jsx';

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', tags: '' });
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    api.get('/journals').then(({ data }) => setEntries(data.journals || [])).catch(() => {});
  }, []);

  const filtered = useMemo(() => entries.filter((entry) => `${entry.title} ${entry.content} ${entry.tags?.join(' ')}`.toLowerCase().includes(search.toLowerCase())), [entries, search]);
  const insight = useMemo(() => {
    const text = entries.map((entry) => entry.content).join(' ').toLowerCase();
    if (!entries.length) return 'Write a few entries and MindCare will surface gentle reflection patterns here.';
    if (text.includes('sleep') || text.includes('tired')) return 'Sleep and energy appear in your reflections. A short wind-down note may help reveal patterns.';
    if (text.includes('work') || text.includes('study')) return 'Work or study stress is showing up. Try tagging entries by pressure level for clearer trends.';
    return 'You are building emotional continuity. Consistent journaling often makes patterns easier to notice.';
  }, [entries]);

  async function save() {
    const payload = { title: form.title, content: form.content, tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean) };
    if (!payload.title || !payload.content) return;
    if (editing) {
      const { data } = await api.put(`/journals/${editing}`, payload);
      setEntries(entries.map((entry) => (entry._id === editing ? data.journal : entry)));
    } else {
      const { data } = await api.post('/journals', payload);
      setEntries([data.journal, ...entries]);
    }
    setEditing(null);
    setForm({ title: '', content: '', tags: '' });
  }

  async function remove(id) {
    await api.delete(`/journals/${id}`);
    setEntries(entries.filter((entry) => entry._id !== id));
  }

  function edit(entry) {
    setEditing(entry._id);
    setForm({ title: entry.title, content: entry.content, tags: entry.tags?.join(', ') || '' });
  }

  return (
    <AnimatedPage className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="grid gap-5">
      <WellnessCard>
        <p className="text-sm font-bold text-lagoon dark:text-teal-200">Markdown journal</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold">{editing ? 'Edit entry' : 'New reflection'}</h2>
          <button className={`rounded-full p-3 transition ${locked ? 'bg-lagoon text-white' : 'bg-mist text-lagoon dark:bg-white/10 dark:text-teal-200'}`} onClick={() => setLocked(!locked)} aria-label="Toggle private lock">
            <Lock size={18} />
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          <input className="field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className={`field min-h-56 ${locked ? 'blur-sm transition hover:blur-none focus:blur-none' : ''}`} placeholder="Write in markdown..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          <input className="field" placeholder="Tags, separated by commas" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </div>
        <button className="btn-primary mt-4 w-full" onClick={save}>{editing ? 'Update entry' : 'Create entry'}</button>
      </WellnessCard>
      <WellnessCard className="bg-gradient-to-br from-white/90 to-teal-50/80 dark:from-white/10 dark:to-teal-950/30">
        <Sparkles className="text-lagoon dark:text-teal-200" />
        <h3 className="mt-4 text-lg font-extrabold">AI journaling insight</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{insight}</p>
      </WellnessCard>
      </section>
      <WellnessCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold">Entries</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input className="field pl-10" placeholder="Search entries" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="mt-5 grid gap-4">
          {filtered.map((entry) => (
            <article key={entry._id} className="rounded-[26px] bg-mist p-4 dark:bg-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold">{entry.title}</h3>
                  <p className="text-xs font-semibold text-slate-500">{new Date(entry.updatedAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-full bg-white/80 p-2 dark:bg-white/10" onClick={() => edit(entry)} aria-label="Edit entry"><Edit3 size={16} /></button>
                  <button className="rounded-full bg-white/80 p-2 text-red-600 dark:bg-white/10" onClick={() => remove(entry._id)} aria-label="Delete entry"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="prose prose-sm mt-3 max-w-none dark:prose-invert">
                <ReactMarkdown>{entry.content}</ReactMarkdown>
              </div>
            </article>
          ))}
          {filtered.length === 0 && <p className="rounded-3xl bg-mist p-5 text-sm text-slate-600 dark:bg-white/10 dark:text-slate-300">No entries yet. Start with one honest sentence.</p>}
        </div>
      </WellnessCard>
    </AnimatedPage>
  );
}
