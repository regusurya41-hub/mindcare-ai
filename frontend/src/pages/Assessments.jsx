import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, ClipboardCheck, HeartPulse, RotateCcw, Sparkles } from 'lucide-react';
import { useState } from 'react';

const ASSESSMENTS = [
  {
    id: 'stress',
    title: 'Stress Check',
    desc: 'A gentle check-in for pressure, overload, and recovery needs.',
    icon: '😤',
    color: '#f97316',
    shadow: 'rgba(249,115,22,0.30)',
    questions: [
      { q: 'How often do you feel overwhelmed by your responsibilities?',            options: ['Rarely','Sometimes','Often','Almost always'] },
      { q: 'How well are you sleeping lately?',                                      options: ['Very well','Okay','Poorly','Not at all'] },
      { q: 'Do you feel like you have enough time to rest and recover each day?',    options: ['Yes','Mostly','Rarely','No'] },
      { q: 'How tense or physically tight does your body feel right now?',           options: ['Relaxed','A little tense','Quite tense','Very tense'] },
      { q: 'How often do small things irritate or frustrate you more than usual?',   options: ['Rarely','Sometimes','Often','Very often'] },
    ],
    results: [
      { max: 1.5, label: 'Low stress',      desc: 'You seem to be managing well. Keep your current routines — they\'re working.',             color: '#34d399' },
      { max: 2.5, label: 'Moderate stress', desc: 'Some pressure is building. A short breathing session or walk may help reset.',             color: '#fbbf24' },
      { max: 3.5, label: 'High stress',     desc: 'Your stress levels are elevated. Journaling and the calm space can help you decompress.',  color: '#fb923c' },
      { max: 4.0, label: 'Very high',       desc: 'You\'re carrying a lot right now. Please reach out to someone you trust or use the AI chat.',color: '#f87171' },
    ],
  },
  {
    id: 'anxiety',
    title: 'Anxiety Signals',
    desc: 'Notice worry loops, body tension, and grounding needs without clinical heaviness.',
    icon: '😰',
    color: '#818cf8',
    shadow: 'rgba(129,140,248,0.30)',
    questions: [
      { q: 'How often do you find yourself worrying about things you can\'t control?',options: ['Rarely','Sometimes','Often','Constantly'] },
      { q: 'Do you notice your heart racing, breathing changing, or muscles tensing in stressful situations?', options: ['Rarely','Sometimes','Quite often','Very often'] },
      { q: 'How hard is it to stop a worrying thought once it starts?',              options: ['Easy','Somewhat easy','Difficult','Very difficult'] },
      { q: 'Do you avoid situations because they make you anxious?',                 options: ['No','Occasionally','Fairly often','Yes, often'] },
      { q: 'How rested do you feel mentally after a night\'s sleep?',                options: ['Very rested','Okay','Tired','Exhausted'] },
    ],
    results: [
      { max: 1.5, label: 'Low anxiety',      desc: 'Your anxiety signals are mild. Keep grounding habits like breathing and journaling.',      color: '#34d399' },
      { max: 2.5, label: 'Mild anxiety',     desc: 'Some anxiety is present. The 4-7-8 breathing in Calm Mode can help in the moment.',      color: '#fbbf24' },
      { max: 3.5, label: 'Moderate anxiety', desc: 'Anxiety is affecting your day. Try talking to the AI or a trusted person about it.',      color: '#fb923c' },
      { max: 4.0, label: 'High anxiety',     desc: 'This level of anxiety deserves support. Please consider reaching out to a professional.',  color: '#f87171' },
    ],
  },
  {
    id: 'burnout',
    title: 'Burnout Scan',
    desc: 'Look for exhaustion patterns, emotional depletion, and rest debt.',
    icon: '🔋',
    color: '#f472b6',
    shadow: 'rgba(244,114,182,0.30)',
    questions: [
      { q: 'How often do you feel emotionally drained at the end of the day?',       options: ['Rarely','Sometimes','Often','Almost always'] },
      { q: 'Do you feel detached or cynical about things you used to care about?',   options: ['No','Occasionally','Often','Yes, frequently'] },
      { q: 'How motivated do you feel to do things you used to enjoy?',              options: ['Very motivated','Somewhat','Rarely','Not at all'] },
      { q: 'How often do you feel like no matter how much you do, it\'s never enough?',options: ['Rarely','Sometimes','Often','All the time'] },
      { q: 'How is your ability to concentrate or make decisions lately?',           options: ['Good','Okay','Declining','Very poor'] },
    ],
    results: [
      { max: 1.5, label: 'No burnout signs', desc: 'You seem energised and engaged. Keep protecting your rest and boundaries.',                color: '#34d399' },
      { max: 2.5, label: 'Early warning',    desc: 'Early burnout signs are appearing. Protect your evenings and add more recovery time.',    color: '#fbbf24' },
      { max: 3.5, label: 'Burnout building', desc: 'Burnout is developing. Rest, reduce load, and journal about what\'s draining you most.',  color: '#fb923c' },
      { max: 4.0, label: 'Burnout present',  desc: 'You\'re experiencing significant burnout. Please prioritise rest and talk to someone.',   color: '#f87171' },
    ],
  },
];

const s = {
  card: { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:24, padding:20, backdropFilter:'blur(24px)' },
};

function Assessment({ data, onClose }) {
  const [step, setStep]     = useState(0);
  const [answers, setAnswers] = useState([]);
  const [done, setDone]     = useState(false);

  function answer(idx) {
    const next = [...answers, idx];
    setAnswers(next);
    if (next.length >= data.questions.length) { setDone(true); }
    else setStep(s => s + 1);
  }

  function reset() { setStep(0); setAnswers([]); setDone(false); }

  // Score: average of (0-indexed answer / 3 * 4) → 0-4 range
  const score = done
    ? answers.reduce((s, a) => s + (a / 3) * 4, 0) / answers.length
    : 0;
  const result = done
    ? data.results.find(r => score <= r.max) || data.results[data.results.length - 1]
    : null;

  const q = data.questions[step];
  const progress = ((step) / data.questions.length) * 100;

  return (
    <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
      style={{ ...s.card, position:'relative' }}>

      {/* Close */}
      <button onClick={onClose} style={{ position:'absolute',top:16,right:16,background:'none',border:'none',color:'rgba(255,255,255,0.40)',cursor:'pointer',fontSize:20,lineHeight:1 }}>×</button>

      <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:16 }}>
        <span style={{ fontSize:24 }}>{data.icon}</span>
        <div>
          <h2 style={{ fontWeight:900,color:'white',fontSize:17,margin:0 }}>{data.title}</h2>
          {!done && <p style={{ fontSize:11,color:'rgba(255,255,255,0.40)',margin:'2px 0 0' }}>Question {step+1} of {data.questions.length}</p>}
        </div>
      </div>

      {/* Progress bar */}
      {!done && (
        <div style={{ height:4,borderRadius:999,background:'rgba(255,255,255,0.08)',overflow:'hidden',marginBottom:20 }}>
          <motion.div animate={{ width:`${progress}%` }} style={{ height:'100%',borderRadius:999,background:`linear-gradient(90deg,${data.color},${data.shadow.replace('0.30','1')})` }} transition={{ duration:0.4 }} />
        </div>
      )}

      {/* Question */}
      {!done && (
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-20 }} transition={{ duration:0.22 }}>
            <p style={{ fontSize:15,fontWeight:600,color:'rgba(255,255,255,0.85)',lineHeight:1.7,margin:'0 0 16px' }}>{q.q}</p>
            <div style={{ display:'grid',gap:8 }}>
              {q.options.map((opt, idx) => (
                <button key={opt} onClick={() => answer(idx)}
                  style={{
                    padding:'12px 16px',borderRadius:16,fontSize:13,fontWeight:600,textAlign:'left',
                    cursor:'pointer',transition:'all 0.2s',
                    background:'rgba(255,255,255,0.05)',border:`1.5px solid rgba(255,255,255,0.09)`,color:'rgba(255,255,255,0.70)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background=`${data.color}18`; e.currentTarget.style.borderColor=`${data.color}40`; e.currentTarget.style.color='white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; e.currentTarget.style.color='rgba(255,255,255,0.70)'; }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Result */}
      {done && result && (
        <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}>
          <div style={{ textAlign:'center',padding:'8px 0 16px' }}>
            <div style={{ fontSize:48,marginBottom:10 }}>
              {score <= 1.5 ? '🌿' : score <= 2.5 ? '🌤' : score <= 3.5 ? '⛅' : '🌧'}
            </div>
            <p style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.40)',textTransform:'uppercase',letterSpacing:'0.1em',margin:'0 0 6px' }}>Your result</p>
            <p style={{ fontSize:22,fontWeight:900,color:result.color,margin:'0 0 10px' }}>{result.label}</p>
            <div style={{ background:`${result.color}12`,border:`1px solid ${result.color}25`,borderRadius:16,padding:'14px 16px',marginBottom:16 }}>
              <p style={{ fontSize:14,lineHeight:1.75,color:'rgba(255,255,255,0.70)',margin:0 }}>{result.desc}</p>
            </div>
            {/* Score bar */}
            <div style={{ height:8,borderRadius:999,background:'rgba(255,255,255,0.08)',overflow:'hidden',marginBottom:6 }}>
              <motion.div animate={{ width:`${(score/4)*100}%` }} transition={{ duration:1,ease:'easeOut' }}
                style={{ height:'100%',borderRadius:999,background:result.color }} />
            </div>
            <p style={{ fontSize:11,color:'rgba(255,255,255,0.30)',margin:'0 0 16px' }}>Score: {score.toFixed(1)}/4.0</p>
          </div>
          <button onClick={reset} style={{ width:'100%',padding:'11px',borderRadius:14,fontSize:13,fontWeight:700,cursor:'pointer',border:'none',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.10)',color:'rgba(255,255,255,0.65)',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
            <RotateCcw size={14} /> Take again
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Assessments() {
  const [active, setActive] = useState(null);

  return (
    <div style={{ display:'grid',gap:16,paddingBottom:24 }}>

      {/* Header */}
      <div style={{ ...s.card, background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(244,114,182,0.08))', padding:'24px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6 }}>
          <ClipboardCheck size={22} style={{ color:'#818cf8' }} aria-hidden />
          <h1 style={{ fontSize:'clamp(1.4rem,4vw,2rem)',fontWeight:900,color:'white',margin:0,letterSpacing:'-0.03em' }}>
            Gentle self-checks
          </h1>
        </div>
        <p style={{ fontSize:14,lineHeight:1.7,color:'rgba(255,255,255,0.50)',margin:0 }}>
          Lightweight reflection tools to help you understand patterns. Not diagnoses — just awareness.
        </p>
      </div>

      {/* Active assessment */}
      <AnimatePresence>
        {active && (
          <Assessment key={active} data={ASSESSMENTS.find(a=>a.id===active)} onClose={() => setActive(null)} />
        )}
      </AnimatePresence>

      {/* Assessment cards */}
      {!active && (
        <div style={{ display:'grid',gap:14,gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))' }}>
          {ASSESSMENTS.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.07 }}
              whileHover={{ y:-4 }}
              style={{ ...s.card, cursor:'pointer', position:'relative', overflow:'hidden' }}
              onClick={() => setActive(a.id)}
            >
              <div aria-hidden style={{ position:'absolute',top:-20,right:-20,width:80,height:80,borderRadius:'50%',background:a.color,opacity:0.10,filter:'blur(20px)',pointerEvents:'none' }} />
              <div style={{ fontSize:36,marginBottom:12 }}>{a.icon}</div>
              <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:6 }}>
                <HeartPulse size={15} style={{ color:a.color }} aria-hidden />
                <span style={{ fontSize:11,fontWeight:700,color:a.color,textTransform:'uppercase',letterSpacing:'0.08em' }}>Assessment</span>
              </div>
              <h2 style={{ fontSize:18,fontWeight:800,color:'white',margin:'0 0 6px',letterSpacing:'-0.02em' }}>{a.title}</h2>
              <p style={{ fontSize:13,lineHeight:1.7,color:'rgba(255,255,255,0.50)',margin:'0 0 16px' }}>{a.desc}</p>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                <span style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.30)' }}>{a.questions.length} questions · ~2 min</span>
                <div style={{ display:'flex',alignItems:'center',gap:4,fontSize:12,fontWeight:700,color:a.color }}>
                  Start <ChevronRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Safety card */}
      <div style={{ ...s.card }}>
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:10 }}>
          <Sparkles size={16} style={{ color:'#c084fc' }} aria-hidden />
          <p style={{ fontWeight:800,color:'white',fontSize:14,margin:0 }}>Important reminder</p>
        </div>
        <p style={{ fontSize:13,lineHeight:1.75,color:'rgba(255,255,255,0.50)',margin:0 }}>
          These reflections are not clinical diagnoses. They're designed to help you notice patterns and choose the right self-care tools. If you're struggling significantly, please talk to a mental health professional.
        </p>
        <div style={{ display:'flex',flexWrap:'wrap',gap:8,marginTop:12 }}>
          {[
            { emoji:'✅', text:'Anonymous & private' },
            { emoji:'🔒', text:'Not stored anywhere' },
            { emoji:'💙', text:'Supportive framing only' },
          ].map(({ emoji, text }) => (
            <span key={text} style={{ fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.45)',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.09)',padding:'4px 12px',borderRadius:999 }}>
              {emoji} {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}