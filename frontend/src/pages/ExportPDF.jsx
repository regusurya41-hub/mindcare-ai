/**
 * ExportPDF.jsx
 * 
 * Exports the user's journal entries and mood logs as a beautifully formatted PDF,
 * generated entirely in the browser using jsPDF + jspdf-autotable.
 * No server required — all data stays on the client.
 * 
 * To add to the app:
 *  1. npm install jspdf jspdf-autotable  (in frontend/)
 *  2. Add to App.jsx:  <Route path="export" element={<ExportPDF />} />
 *  3. Add to AppLayout NAV_ITEMS: { to: '/app/export', label: 'Export Data', icon: Download }
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  HeartPulse,
  Loader2,
  Lock,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';
import WellnessCard from '../components/ui/WellnessCard.jsx';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

/* ── Mood score → label ────────────────────────────────────────────────────── */

const MOOD_SCORE = { great: 5, good: 4, okay: 3, low: 2, heavy: 1 };
const MOOD_EMOJI = { great: '😄', good: '🙂', okay: '😐', low: '😔', heavy: '😣' };

/* ── PDF generator ─────────────────────────────────────────────────────────── */

async function generatePDF({ journals, moods, user, options }) {
  // Dynamic import keeps the bundle light — only loads when Export page is opened
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  const doc  = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const W    = doc.internal.pageSize.getWidth();
  const H    = doc.internal.pageSize.getHeight();
  const now  = new Date();
  const DATE = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  /* ── Helpers ── */
  const addPage = () => doc.addPage();

  function headerFooter(title) {
    // Header bar
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, W, 14, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('MindCare AI  ·  Personal Wellness Report', 10, 9);
    doc.text(DATE, W - 10, 9, { align: 'right' });

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 160);
    doc.setFont('helvetica', 'normal');
    doc.text('This report is private and generated only for you. Not medical advice.', W / 2, H - 6, { align: 'center' });
    doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, W - 10, H - 6, { align: 'right' });
  }

  /* ══════════════════════════
     PAGE 1 — COVER
  ══════════════════════════ */

  doc.setFillColor(7, 11, 23);
  doc.rect(0, 0, W, H, 'F');

  // Indigo accent blob
  doc.setFillColor(99, 102, 241);
  doc.setGState(new doc.GState({ opacity: 0.15 }));
  doc.ellipse(30, 40, 60, 60, 'F');
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Logo circle
  doc.setFillColor(99, 102, 241);
  doc.circle(W / 2, 80, 18, 'F');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('🌙', W / 2, 84, { align: 'center' });

  // Title
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('MindCare AI', W / 2, 114, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 210);
  doc.text('Personal Wellness Report', W / 2, 124, { align: 'center' });

  // Divider line
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 30, 130, W / 2 + 30, 130);

  // User info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(200, 200, 230);
  doc.text(user?.name || 'Anonymous User', W / 2, 142, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 160);
  doc.text(`Generated on ${DATE}`, W / 2, 150, { align: 'center' });

  // Summary boxes
  const boxes = [
    { label: 'Journal Entries', value: String(journals.length) },
    { label: 'Mood Logs',       value: String(moods.length)    },
    { label: 'Days Tracked',    value: (() => {
      const dates = new Set([...journals.map((j) => j.createdAt?.slice(0,10)), ...moods.map((m) => m.loggedAt?.slice(0,10))]);
      return String(dates.size);
    })() },
  ];
  const bW = 50, bH = 24, bY = 170, gap = 10;
  const startX = (W - (boxes.length * bW + (boxes.length - 1) * gap)) / 2;

  boxes.forEach(({ label, value }, i) => {
    const bX = startX + i * (bW + gap);
    doc.setFillColor(30, 35, 70);
    doc.roundedRect(bX, bY, bW, bH, 4, 4, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(160, 170, 255);
    doc.text(value, bX + bW / 2, bY + 12, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 130, 180);
    doc.text(label, bX + bW / 2, bY + 20, { align: 'center' });
  });

  // Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 120);
  doc.text('This report is private and confidential. MindCare AI is a wellness tool,\nnot a substitute for professional mental health care.', W / 2, H - 30, { align: 'center' });

  /* ══════════════════════════
     PAGE 2 — MOOD SUMMARY
  ══════════════════════════ */

  if (options.includeMoods && moods.length > 0) {
    addPage();
    headerFooter('Mood Log');

    let y = 24;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 60);
    doc.text('Mood History', 14, y);
    y += 6;

    // Mood stats row
    const avgScore = moods.reduce((s, m) => s + (MOOD_SCORE[m.mood] ?? 3), 0) / moods.length;
    const topMood  = Object.entries(
      moods.reduce((acc, m) => { acc[m.mood] = (acc[m.mood] ?? 0) + 1; return acc; }, {})
    ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'okay';

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 120);
    doc.text(`Average score: ${avgScore.toFixed(1)} / 5  ·  Most common mood: ${topMood}  ·  ${moods.length} total entries`, 14, y + 6);
    y += 14;

    // Table
    doc.autoTable({
      startY: y,
      head: [['Date', 'Mood', 'Score', 'Note']],
      body: moods.slice(0, 200).map((m) => [
        m.loggedAt ? new Date(m.loggedAt).toLocaleDateString('en-GB') : '—',
        `${MOOD_EMOJI[m.mood] ?? ''} ${m.mood}`,
        `${MOOD_SCORE[m.mood] ?? '—'} / 5`,
        m.note ? m.note.slice(0, 80) : '—',
      ]),
      styles:      { fontSize: 8, cellPadding: 3 },
      headStyles:  { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 246, 255] },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 'auto' },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: () => headerFooter('Mood Log'),
    });
  }

  /* ══════════════════════════
     PAGE(S) — JOURNAL ENTRIES
  ══════════════════════════ */

  if (options.includeJournals && journals.length > 0) {
    addPage();
    headerFooter('Journal Entries');

    let y = 24;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 60);
    doc.text('Journal Entries', 14, y);
    y += 4;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 120);
    doc.text(`${journals.length} entries · sorted newest first`, 14, y + 6);
    y += 16;

    for (const entry of journals.slice(0, options.maxEntries ?? 50)) {
      if (y > H - 40) {
        addPage();
        headerFooter('Journal Entries');
        y = 24;
      }

      // Entry header
      doc.setFillColor(240, 240, 255);
      doc.roundedRect(14, y, W - 28, 8, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 120);
      doc.text(entry.title?.slice(0, 70) ?? 'Untitled', 18, y + 5.5);

      const entryDate = entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 160);
      doc.text(entryDate, W - 16, y + 5.5, { align: 'right' });
      y += 12;

      // Tags
      if (entry.tags?.length) {
        doc.setFontSize(7);
        doc.setTextColor(99, 102, 241);
        doc.text(`Tags: ${entry.tags.slice(0,6).join(' · ')}`, 18, y);
        y += 5;
      }

      // Content — strip markdown, wrap text
      const cleanContent = (entry.content ?? '')
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`/g, '')
        .replace(/\n{3,}/g, '\n\n');

      const lines = doc.splitTextToSize(cleanContent.slice(0, 2000), W - 32);
      const maxLines = Math.min(lines.length, 30);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 70);
      doc.text(lines.slice(0, maxLines), 18, y);
      y += maxLines * 4.5 + 2;

      if (lines.length > 30) {
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 180);
        doc.text('(entry truncated for export)', 18, y);
        y += 5;
      }

      // Divider
      doc.setDrawColor(210, 210, 230);
      doc.setLineWidth(0.2);
      doc.line(14, y + 2, W - 14, y + 2);
      y += 8;
    }
  }

  doc.save(`mindcare-wellness-report-${now.toISOString().slice(0,10)}.pdf`);
}

/* ── Export Page Component ─────────────────────────────────────────────────── */

export default function ExportPDF() {
  const { user }    = useAuth();
  const [journals, setJournals]   = useState([]);
  const [moods, setMoods]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState('');

  const [options, setOptions] = useState({
    includeMoods:    true,
    includeJournals: true,
    maxEntries:      50,
  });

  useEffect(() => {
    Promise.all([
      api.get('/journals').catch(() => ({ data: { journals: [] } })),
      api.get('/moods').catch(() => ({ data: { moods: [] } })),
    ]).then(([jRes, mRes]) => {
      setJournals(jRes.data.journals ?? []);
      setMoods(mRes.data.moods ?? []);
    }).finally(() => setLoading(false));
  }, []);

  async function handleExport() {
    if (generating) return;
    setGenerating(true);
    setDone(false);
    setError('');
    try {
      await generatePDF({ journals, moods, user, options });
      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch (err) {
      console.error('[ExportPDF]', err);
      setError('Could not generate PDF. Make sure jspdf and jspdf-autotable are installed.');
    } finally {
      setGenerating(false);
    }
  }

  const totalItems = (options.includeMoods ? moods.length : 0) + (options.includeJournals ? Math.min(journals.length, options.maxEntries) : 0);

  return (
    <AnimatedPage className="mx-auto max-w-2xl pb-12">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg">
            <Download size={22} aria-hidden />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Export Your Data</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Download your wellness history as a private PDF</p>
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <WellnessCard className="mb-5">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 shrink-0 text-indigo-500" size={18} aria-hidden />
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Your data stays on your device</p>
            <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
              The PDF is generated entirely in your browser. Nothing is sent to any server. Your journal entries and mood logs are yours alone.
            </p>
          </div>
        </div>
      </WellnessCard>

      {/* Options */}
      <WellnessCard className="mb-5">
        <h2 className="mb-5 text-lg font-black text-slate-900 dark:text-white">Export options</h2>

        <div className="space-y-4">
          {/* Include moods */}
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 transition hover:bg-white dark:border-white/8 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <HeartPulse size={18} className="text-rose-500" aria-hidden />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Mood logs</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{moods.length} entries available</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={options.includeMoods}
                onChange={(e) => setOptions({ ...options, includeMoods: e.target.checked })}
                className="sr-only"
                aria-label="Include mood logs"
              />
              <div className={`h-6 w-11 rounded-full transition-colors ${options.includeMoods ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10'}`}>
                <div className={`mt-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${options.includeMoods ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
              </div>
            </div>
          </label>

          {/* Include journals */}
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 transition hover:bg-white dark:border-white/8 dark:bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <BookOpen size={18} className="text-amber-500" aria-hidden />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Journal entries</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{journals.length} entries available</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={options.includeJournals}
                onChange={(e) => setOptions({ ...options, includeJournals: e.target.checked })}
                className="sr-only"
                aria-label="Include journal entries"
              />
              <div className={`h-6 w-11 rounded-full transition-colors ${options.includeJournals ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10'}`}>
                <div className={`mt-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${options.includeJournals ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
              </div>
            </div>
          </label>

          {/* Max entries */}
          {options.includeJournals && (
            <div className="rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 dark:border-white/8 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-teal-500" aria-hidden />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Max journal entries</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Older entries are included first</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-indigo-500">{options.maxEntries}</span>
              </div>
              <input
                type="range"
                min={10} max={200} step={10}
                value={options.maxEntries}
                onChange={(e) => setOptions({ ...options, maxEntries: Number(e.target.value) })}
                className="mt-3 w-full accent-indigo-500"
                aria-label="Maximum journal entries"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>10</span><span>100</span><span>200</span>
              </div>
            </div>
          )}
        </div>
      </WellnessCard>

      {/* Summary */}
      <WellnessCard className="mb-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Export summary</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Mood entries',   value: options.includeMoods ? moods.length : 0 },
            { label: 'Journal entries',value: options.includeJournals ? Math.min(journals.length, options.maxEntries) : 0 },
            { label: 'Total items',    value: totalItems },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-white/5">
              <p className="text-2xl font-black text-indigo-500">{value}</p>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </WellnessCard>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-950/40 dark:text-rose-300"
            role="alert"
          >
            {error}
            <br />
            <code className="mt-1 block text-xs opacity-70">npm install jspdf jspdf-autotable</code>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export button */}
      <button
        onClick={handleExport}
        disabled={generating || loading || totalItems === 0}
        className={`flex w-full items-center justify-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-xl transition-all duration-300 ${
          done
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/25'
            : 'bg-gradient-to-r from-indigo-500 to-violet-500 shadow-indigo-500/25 hover:scale-[1.02] hover:shadow-indigo-500/40'
        } disabled:cursor-not-allowed disabled:opacity-50`}
        aria-busy={generating}
      >
        {generating ? (
          <><Loader2 size={20} className="animate-spin" aria-hidden /> Generating PDF...</>
        ) : done ? (
          <><CheckCircle2 size={20} aria-hidden /> Downloaded!</>
        ) : (
          <><Download size={20} aria-hidden /> Download Wellness PDF</>
        )}
      </button>

      {totalItems === 0 && !loading && (
        <p className="mt-3 text-center text-sm text-slate-400">
          No data to export yet. Log some moods or write journal entries first.
        </p>
      )}

    </AnimatedPage>
  );
}