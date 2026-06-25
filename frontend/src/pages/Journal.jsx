import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen, Edit3, Hash, Lock, Save, Search,
  Sparkles, Tag, Trash2, TrendingUp, X
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '../api/client.js';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import WellnessCard from '../components/ui/WellnessCard.jsx';

const MOOD_OPTIONS = [
  { value: 'great', emoji: '😄', label: 'Great' },
  { value: 'good',  emoji: '🙂', label: 'Good'  },
  { value: 'okay',  emoji: '😐', label: 'Okay'  },
  { value: 'low',   emoji: '😔', label: 'Low'   },
  { value: 'heavy', emoji: '😣', label: 'Heavy' },
];

const DRAFT_KEY = 'mindcare_journal_draft';

function PasswordStrengthBar({ value }) {
  const words = value.trim().split(/\s+/).filter(Boolean).length;
  const pct = Math.min((words / 80) * 100, 100);
  const color = pct < 30 ? 'bg-rose-400' : pct < 65 ? 'bg-amber-400' : 'bg-teal-400';
  const label = pct < 30 ? 'Just starting' : pct < 65 ? 'Building momentum' : 'Deep reflection';
  return (
    <div className="mt-2">
      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
        <span>{words} words</span>
        <span>{label}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}

function EmptyState({ onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-5 rounded-[28px] border-2 border-dashed border-indigo-200/60 bg-indigo-50/40 p-12 text-center dark:border-white/10 dark:bg-white/[0.02]"
    >
      <div className="grid h-20 w-20 place-items-center rounded-[28px] bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-xl shadow-indigo-500/20">
        <BookOpen size={36} aria-hidden />
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">Your journal awaits</h3>
        <p className="mt-2 max-w-xs text-sm leading-7 text-slate-500 dark:text-slate-400">
          One honest sentence is enough to begin. Your words are private and encrypted.
        </p>
      </div>
      <button onClick={onStart} className="btn-primary px-8 py-3">
        Write your first entry →
      </button>
    </motion.div>
  );
}

export default function Journal() {
  const [entries, setEntries]   = useState([]);
  const [search, setSearch]     = useState('');
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState({ title: '', content: '', tags: '', mood: '' });
  const [locked, setLocked]     = useState(false);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading]   = useState(true);
  const autoSaveRef = useRef(null);
  const textareaRef = useRef(null);

  // Load entries
  useEffect(() => {
    api.get('/journals')
      .then(({ data }) => setEntries(data.journals || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Restore draft on mount
  useEffect(() => {
    if (!editing) {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        try { setForm(JSON.parse(draft)); } catch {}
      }
    }
  }, []);

  // Auto-save draft every 3s while typing
  useEffect(() => {
    if (editing) return; // Don't auto-save drafts while editing existing entry
    clearTimeout(autoSaveRef.current);
    if (!form.title && !form.content) return;
    autoSaveRef.current = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 3000);
    return () => clearTimeout(autoSaveRef.current);
  }, [form, editing]);

  const filtered = useMemo(() =>
    entries.filter((e) =>
      `${e.title} ${e.content} ${e.tags?.join(' ')}`.toLowerCase().includes(search.toLowerCase())
    ), [entries, search]);

  const insight = useMemo(() => {
    const text = entries.map((e) => e.content).join(' ').toLowerCase();
    if (!entries.length) return 'Write a few entries and MindCare will surface gentle reflection patterns here.';
    if (text.includes('sleep') || text.includes('tired')) return 'Sleep and energy appear often in your reflections. A short wind-down note may help reveal recovery patterns.';
    if (text.includes('work') || text.includes('study')) return 'Work or study stress is showing up. Try tagging entries by pressure level for clearer trends.';
    if (text.includes('grateful') || text.includes('happy')) return 'Gratitude appears in your writing — a strong predictor of resilience. Keep naming the good things.';
    return 'You are building emotional continuity. Consistent journaling often makes patterns easier to notice over time.';
  }, [entries]);

  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length;

  async function save() {
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const payload = { title: form.title, content: form.content, tags, mood: form.mood || undefined };
    if (!payload.title || !payload.content || saving) return;
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.put(`/journals/${editing}`, payload);
        setEntries(entries.map((e) => (e._id === editing ? data.journal : e)));
      } else {
        const { data } = await api.post('/journals', payload);
        setEntries([data.journal, ...entries]);
        localStorage.removeItem(DRAFT_KEY);
      }
      setEditing(null);
      setForm({ title: '', content: '', tags: '', mood: '' });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    setDeleting(id);
    try {
      await api.delete(`/journals/${id}`);
      setEntries(entries.filter((e) => e._id !== id));
      if (expanded === id) setExpanded(null);
    } finally { setDeleting(''); }
  }

  function edit(entry) {
    setEditing(entry._id);
    setForm({ title: entry.title, content: entry.content, tags: entry.tags?.join(', ') || '', mood: entry.mood || '' });
    textareaRef.current?.focus();
  }

  function clearForm() {
    setEditing(null);
    setForm({ title: '', content: '', tags: '', mood: '' });
    localStorage.removeItem(DRAFT_KEY);
  }

  return (
    <AnimatedPage className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">

      {/* ── Editor panel ── */}
      <section className="grid gap-5">
        <WellnessCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-teal-600 dark:text-teal-300">Markdown journal</p>
              <h2 className="text-2xl font-extrabold">{editing ? 'Edit entry' : 'New reflection'}</h2>
            </div>
            <div className="flex items-center gap-2">
              {draftSaved && (
                <motion.span
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-600 dark:bg-teal-900/30 dark:text-teal-300"
                >
                  <Save size={11} aria-hidden /> Draft saved
                </motion.span>
              )}
              <button
                className={`rounded-full p-3 transition ${locked ? 'bg-teal-500 text-white' : 'bg-slate-100 text-teal-600 dark:bg-white/10 dark:text-teal-300'}`}
                onClick={() => setLocked(!locked)}
                aria-label="Toggle private lock"
              >
                <Lock size={18} aria-hidden />
              </button>
              {(editing || form.title || form.content) && (
                <button
                  className="rounded-full bg-slate-100 p-3 text-slate-500 transition hover:bg-red-50 hover:text-red-500 dark:bg-white/10"
                  onClick={clearForm}
                  aria-label="Clear form"
                >
                  <X size={18} aria-hidden />
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <input
              className="field"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            {/* Mood tag selector */}
            <div>
              <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">How are you feeling right now?</p>
              <div className="flex gap-2 flex-wrap">
                {MOOD_OPTIONS.map(({ value, emoji, label }) => (
                  <button
                    key={value}
                    onClick={() => setForm({ ...form, mood: form.mood === value ? '' : value })}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                      form.mood === value
                        ? 'bg-indigo-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300'
                    }`}
                    aria-pressed={form.mood === value}
                  >
                    {emoji} {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                ref={textareaRef}
                className={`field min-h-56 ${locked ? 'blur-sm transition hover:blur-none focus:blur-none' : ''}`}
                placeholder="Write in markdown... **bold**, *italic*, # Heading"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
              <PasswordStrengthBar value={form.content} />
            </div>

            <div className="relative">
              <Tag size={15} className="absolute left-3 top-3.5 text-slate-400" aria-hidden />
              <input
                className="field pl-9"
                placeholder="Tags: anxiety, gratitude, work..."
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>
          </div>

          <button
            className="btn-primary mt-4 w-full"
            onClick={save}
            disabled={saving || !form.title.trim() || !form.content.trim()}
          >
            {saving
              ? <LoadingSpinner label={editing ? 'Updating...' : 'Creating...'} />
              : editing ? 'Update entry' : 'Save entry'
            }
          </button>
        </WellnessCard>

        {/* AI insight card */}
        <WellnessCard className="bg-gradient-to-br from-white/90 to-teal-50/80 dark:from-white/10 dark:to-teal-950/30">
          <Sparkles className="text-teal-600 dark:text-teal-300" size={20} aria-hidden />
          <h3 className="mt-4 text-lg font-extrabold">AI journaling insight</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{insight}</p>
          {entries.length > 0 && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 dark:bg-white/5">
              <TrendingUp size={16} className="text-indigo-500" aria-hidden />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {entries.length} entries · {entries.reduce((s, e) => s + (e.wordCount ?? 0), 0).toLocaleString()} total words written
              </p>
            </div>
          )}
        </WellnessCard>
      </section>

      {/* ── Entries list ── */}
      <WellnessCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold">Entries <span className="text-slate-400 font-normal text-lg">({filtered.length})</span></h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} aria-hidden />
            <input
              className="field pl-10"
              placeholder="Search entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {loading ? (
            [1,2,3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-[22px] bg-slate-100 dark:bg-white/5" />
            ))
          ) : filtered.length === 0 && !search ? (
            <EmptyState onStart={() => textareaRef.current?.focus()} />
          ) : filtered.length === 0 ? (
            <p className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-white/5">No entries match your search.</p>
          ) : (
            filtered.map((entry) => {
              const isOpen = expanded === entry._id;
              const moodMeta = MOOD_OPTIONS.find((m) => m.value === entry.mood);
              return (
                <motion.article
                  key={entry._id}
                  layout
                  className="overflow-hidden rounded-[24px] bg-slate-50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/8"
                >
                  {/* Header */}
                  <button
                    className="flex w-full items-start justify-between gap-3 p-4 text-left"
                    onClick={() => setExpanded(isOpen ? null : entry._id)}
                    aria-expanded={isOpen}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {moodMeta && <span className="text-base">{moodMeta.emoji}</span>}
                        <h3 className="font-extrabold text-slate-900 dark:text-white truncate">{entry.title}</h3>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">{new Date(entry.updatedAt).toLocaleString()}</p>
                      {entry.tags?.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {entry.tags.map((t) => (
                            <span key={t} className="flex items-center gap-0.5 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                              <Hash size={9} aria-hidden />{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {entry.wordCount > 0 && (
                        <span className="rounded-full bg-slate-200/80 px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                          {entry.wordCount}w
                        </span>
                      )}
                      <button
                        className="rounded-full bg-white p-2 shadow-sm dark:bg-white/10"
                        onClick={(e) => { e.stopPropagation(); edit(entry); }}
                        aria-label="Edit entry"
                      >
                        <Edit3 size={15} aria-hidden />
                      </button>
                      <button
                        className="rounded-full bg-white p-2 shadow-sm text-red-500 dark:bg-white/10"
                        onClick={(e) => { e.stopPropagation(); remove(entry._id); }}
                        disabled={deleting === entry._id}
                        aria-label="Delete entry"
                      >
                        {deleting === entry._id ? <span className="h-4 w-4 block animate-spin rounded-full border-2 border-red-400 border-t-transparent" /> : <Trash2 size={15} aria-hidden />}
                      </button>
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-slate-200/60 px-5 py-4 dark:border-white/8">
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown>{entry.content}</ReactMarkdown>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })
          )}
        </div>
      </WellnessCard>
    </AnimatedPage>
  );
}