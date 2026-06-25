import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Pause, Play, RotateCcw, ShieldAlert, Timer, Wind } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const GROUNDING = [
  { step: 1, label: 'See',   instruction: 'Name 5 things you can see right now.',  color: '#818cf8' },
  { step: 2, label: 'Touch', instruction: 'Name 4 things you can physically feel.', color: '#34d399' },
  { step: 3, label: 'Hear',  instruction: 'Name 3 sounds you can hear around you.', color: '#f472b6' },
  { step: 4, label: 'Smell', instruction: 'Name 2 things you can smell.',           color: '#fb923c' },
  { step: 5, label: 'Taste', instruction: 'Name 1 thing you can taste right now.',  color: '#fbbf24' },
];

const BREATH_PHASES = [
  { label: 'Breathe in',  duration: 4, color: '#6366f1' },
  { label: 'Hold',        duration: 4, color: '#8b5cf6' },
  { label: 'Breathe out', duration: 6, color: '#14b8a6' },
  { label: 'Hold',        duration: 2, color: '#818cf8' },
];

function fmt(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const card = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 24,
  backdropFilter: 'blur(24px)',
  padding: 20,
};

export default function CalmMode() {
  const [minutes, setMinutes]       = useState(3);
  const [remaining, setRemaining]   = useState(3 * 60);
  const [running, setRunning]       = useState(false);
  const [groundStep, setGroundStep] = useState(0);
  const [breathPhase, setBreathPhase] = useState(0);
  const [breathTick, setBreathTick] = useState(0);
  const [breathActive, setBreathActive] = useState(false);

  const total    = minutes * 60;
  const progress = total ? ((total - remaining) / total) * 100 : 0;

  // Meditation timer
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(id); setRunning(false); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // Breath guide timer
  useEffect(() => {
    if (!breathActive) return;
    const phase = BREATH_PHASES[breathPhase];
    const id = setInterval(() => {
      setBreathTick((t) => {
        if (t + 1 >= phase.duration) {
          setBreathPhase((p) => (p + 1) % BREATH_PHASES.length);
          return 0;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [breathActive, breathPhase]);

  function pick(m) {
    setMinutes(m);
    setRemaining(m * 60);
    setRunning(false);
  }

  const phase = BREATH_PHASES[breathPhase];
  const breathPct = ((breathTick / phase.duration) * 100);

  return (
    <div style={{ display: 'grid', gap: 16, paddingBottom: 24 }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(99,102,241,0.15) 0%,rgba(139,92,246,0.10) 50%,rgba(20,184,166,0.08) 100%)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 28, padding: '28px 24px',
        position: 'relative', overflow: 'hidden',
        display: 'grid', gap: 32,
        gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
        alignItems: 'center',
      }}>
        {/* Glow */}
        <div aria-hidden style={{ position:'absolute',top:-60,right:-60,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,0.25),transparent 70%)',filter:'blur(40px)',pointerEvents:'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
            <Wind size={20} style={{ color: '#818cf8' }} aria-hidden />
            <p style={{ fontSize:12,fontWeight:700,color:'#818cf8',textTransform:'uppercase',letterSpacing:'0.08em',margin:0 }}>Calm Mode</p>
          </div>
          <h1 style={{ fontSize:'clamp(1.6rem,4vw,2.8rem)',fontWeight:800,color:'white',lineHeight:1.15,margin:'0 0 12px',letterSpacing:'-0.03em' }}>
            A softer space for hard moments.
          </h1>
          <p style={{ fontSize:14,lineHeight:1.8,color:'rgba(255,255,255,0.55)',margin:'0 0 20px' }}>
            Breathing, grounding, and meditation — when your nervous system needs somewhere calm to land.
          </p>
          {/* Duration picker */}
          <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
            {[2,3,5,10].map((m) => (
              <button key={m} onClick={() => pick(m)}
                style={{
                  padding:'7px 18px', borderRadius:999, fontSize:13, fontWeight:700, cursor:'pointer', border:'none',
                  ...(minutes===m
                    ? { background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', boxShadow:'0 4px 16px rgba(99,102,241,0.35)' }
                    : { background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.65)' }
                  ),
                }}>
                {m} min
              </button>
            ))}
          </div>
        </div>

        {/* Breathing orb */}
        <div style={{ display:'grid',placeItems:'center', position:'relative',zIndex:1 }}>
          <motion.div
            animate={{ scale: running ? [1, 1.20, 1] : 1, opacity: running ? [0.6, 1, 0.6] : 0.7 }}
            transition={{ duration: 6, repeat: running ? Infinity : 0, ease: 'easeInOut' }}
            style={{
              width: 220, height: 220, borderRadius: '50%',
              background: 'radial-gradient(circle,rgba(99,102,241,0.25),rgba(139,92,246,0.10) 60%,transparent 80%)',
              display:'grid', placeItems:'center',
            }}
          >
            <motion.div
              animate={{ scale: running ? [0.80, 1, 0.80] : 1 }}
              transition={{ duration: 6, repeat: running ? Infinity : 0, ease: 'easeInOut' }}
              style={{
                width: 150, height: 150, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(20px)',
                display: 'grid', placeItems: 'center', textAlign: 'center',
              }}
            >
              <div>
                <p style={{ fontSize:13,fontWeight:700,color:'#818cf8',margin:'0 0 4px' }}>
                  {remaining === 0 ? '✓ Done' : running ? 'Breathe slowly' : 'Ready'}
                </p>
                <p style={{ fontSize:36,fontWeight:900,color:'white',margin:'0 0 4px',letterSpacing:'-0.04em' }}>
                  {fmt(remaining)}
                </p>
                <p style={{ fontSize:11,color:'rgba(255,255,255,0.35)',margin:0 }}>{minutes} min session</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── 4 TOOL CARDS ── */}
      <div style={{ display:'grid',gap:14,gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))' }}>

        {/* Meditation timer */}
        <div style={card}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
            <div style={{ width:38,height:38,borderRadius:12,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'grid',placeItems:'center',boxShadow:'0 4px 14px rgba(99,102,241,0.35)' }}>
              <Timer size={18} style={{ color:'white' }} aria-hidden />
            </div>
            <p style={{ fontWeight:800,color:'white',fontSize:15,margin:0 }}>Meditation timer</p>
          </div>
          <p style={{ fontSize:13,lineHeight:1.7,color:'rgba(255,255,255,0.50)',margin:'0 0 14px' }}>
            {minutes} min selected. Start with one breath, not perfection.
          </p>
          {/* Progress bar */}
          <div style={{ height:6,borderRadius:999,background:'rgba(255,255,255,0.08)',overflow:'hidden',marginBottom:14 }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              style={{ height:'100%',borderRadius:999,background:'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
            <button onClick={() => setRunning(r => !r)} disabled={remaining===0}
              style={{
                display:'flex',alignItems:'center',justifyContent:'center',gap:6,
                padding:'10px 0',borderRadius:14,fontSize:13,fontWeight:700,cursor:'pointer',border:'none',
                background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',
                boxShadow:'0 4px 14px rgba(99,102,241,0.30)',
                opacity: remaining===0 ? 0.4 : 1,
              }}>
              {running ? <Pause size={15} /> : <Play size={15} />}
              {running ? 'Pause' : 'Begin'}
            </button>
            <button onClick={() => { setRemaining(total); setRunning(false); }}
              style={{
                display:'flex',alignItems:'center',justifyContent:'center',gap:6,
                padding:'10px 0',borderRadius:14,fontSize:13,fontWeight:700,cursor:'pointer',
                background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.10)',color:'rgba(255,255,255,0.70)',
              }}>
              <RotateCcw size={15} /> Reset
            </button>
          </div>
        </div>

        {/* Breath guide */}
        <div style={card}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
            <div style={{ width:38,height:38,borderRadius:12,background:'linear-gradient(135deg,#14b8a6,#06b6d4)',display:'grid',placeItems:'center',boxShadow:'0 4px 14px rgba(20,184,166,0.30)' }}>
              <Wind size={18} style={{ color:'white' }} aria-hidden />
            </div>
            <p style={{ fontWeight:800,color:'white',fontSize:15,margin:0 }}>Breath guide</p>
          </div>
          <div style={{ textAlign:'center',padding:'12px 0' }}>
            <AnimatePresence mode="wait">
              <motion.p key={breathPhase}
                initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }}
                style={{ fontSize:20,fontWeight:800,color:phase.color,margin:'0 0 6px' }}>
                {phase.label}
              </motion.p>
            </AnimatePresence>
            <p style={{ fontSize:13,color:'rgba(255,255,255,0.40)',margin:'0 0 12px' }}>
              {breathActive ? `${phase.duration - breathTick}s remaining` : 'Press start to begin'}
            </p>
            <div style={{ height:4,borderRadius:999,background:'rgba(255,255,255,0.08)',overflow:'hidden',margin:'0 0 14px' }}>
              <motion.div
                style={{ height:'100%',borderRadius:999,background:phase.color }}
                animate={{ width: breathActive ? `${breathPct}%` : '0%' }}
                transition={{ duration:0.5 }}
              />
            </div>
          </div>
          <button onClick={() => { setBreathActive(a => !a); setBreathPhase(0); setBreathTick(0); }}
            style={{
              width:'100%',padding:'10px 0',borderRadius:14,fontSize:13,fontWeight:700,cursor:'pointer',border:'none',
              background: breathActive ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg,#14b8a6,#06b6d4)',
              color: breathActive ? 'rgba(255,255,255,0.70)' : 'white',
              border: breathActive ? '1px solid rgba(255,255,255,0.10)' : 'none',
              boxShadow: breathActive ? 'none' : '0 4px 14px rgba(20,184,166,0.25)',
            }}>
            {breathActive ? 'Stop' : 'Start 4-7-8 breathing'}
          </button>
        </div>

        {/* Grounding 5-4-3-2-1 */}
        <div style={card}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
            <div style={{ width:38,height:38,borderRadius:12,background:'linear-gradient(135deg,#f59e0b,#f97316)',display:'grid',placeItems:'center',boxShadow:'0 4px 14px rgba(245,158,11,0.30)' }}>
              <RotateCcw size={18} style={{ color:'white' }} aria-hidden />
            </div>
            <p style={{ fontWeight:800,color:'white',fontSize:15,margin:0 }}>5-4-3-2-1 Grounding</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={groundStep}
              initial={{ opacity:0,x:16 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-16 }}
              transition={{ duration:0.25 }}>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:10 }}>
                {GROUNDING.map((g,i) => (
                  <div key={g.step} style={{
                    width:28,height:28,borderRadius:'50%',fontSize:12,fontWeight:800,
                    display:'grid',placeItems:'center',flexShrink:0,
                    background: i===groundStep ? g.color : 'rgba(255,255,255,0.08)',
                    color: i===groundStep ? 'white' : 'rgba(255,255,255,0.25)',
                    transition:'all 0.2s',
                  }}>{g.step}</div>
                ))}
              </div>
              <p style={{ fontSize:16,fontWeight:700,color:GROUNDING[groundStep].color,margin:'0 0 6px' }}>
                {GROUNDING[groundStep].label}
              </p>
              <p style={{ fontSize:13,lineHeight:1.7,color:'rgba(255,255,255,0.55)',margin:'0 0 14px' }}>
                {GROUNDING[groundStep].instruction}
              </p>
            </motion.div>
          </AnimatePresence>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
            <button onClick={() => setGroundStep(s => Math.max(0,s-1))} disabled={groundStep===0}
              style={{ padding:'9px',borderRadius:12,fontSize:13,fontWeight:700,cursor:'pointer',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.10)',color:'rgba(255,255,255,0.55)',opacity:groundStep===0?0.3:1 }}>
              ← Back
            </button>
            <button onClick={() => setGroundStep(s => (s+1)%GROUNDING.length)}
              style={{ padding:'9px',borderRadius:12,fontSize:13,fontWeight:700,cursor:'pointer',background:'linear-gradient(135deg,#f59e0b,#f97316)',border:'none',color:'white' }}>
              Next →
            </button>
          </div>
        </div>

        {/* Crisis */}
        <div style={{ ...card, background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.20)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
            <div style={{ width:38,height:38,borderRadius:12,background:'linear-gradient(135deg,#ef4444,#f43f5e)',display:'grid',placeItems:'center',boxShadow:'0 4px 14px rgba(239,68,68,0.30)' }}>
              <ShieldAlert size={18} style={{ color:'white' }} aria-hidden />
            </div>
            <p style={{ fontWeight:800,color:'#fca5a5',fontSize:15,margin:0 }}>Panic support</p>
          </div>
          <p style={{ fontSize:13,lineHeight:1.7,color:'rgba(252,165,165,0.70)',margin:'0 0 14px' }}>
            If you feel unsafe or are in immediate danger, please reach out to someone you trust or call emergency services.
          </p>
          <a href="tel:112" style={{
            display:'flex',alignItems:'center',justifyContent:'center',gap:6,
            padding:'10px 0',borderRadius:14,fontSize:13,fontWeight:700,textDecoration:'none',
            background:'linear-gradient(135deg,#ef4444,#f43f5e)',color:'white',
            boxShadow:'0 4px 14px rgba(239,68,68,0.30)',
          }}>
            📞 Call 112 (India/EU)
          </a>
          <a href="tel:988" style={{
            display:'flex',alignItems:'center',justifyContent:'center',gap:6,
            padding:'9px 0',borderRadius:14,fontSize:13,fontWeight:700,textDecoration:'none',
            marginTop:8,
            background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.25)',color:'#fca5a5',
          }}>
            📞 Call 988 (US/Canada)
          </a>
        </div>
      </div>

      {/* ── AMBIENT SOUND PLACEHOLDER ── */}
      <div style={card}>
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:12 }}>
          <Headphones size={18} style={{ color:'#818cf8' }} aria-hidden />
          <p style={{ fontWeight:800,color:'white',fontSize:15,margin:0 }}>Ambient sound</p>
        </div>
        <div style={{ display:'grid',gap:8,gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))' }}>
          {['🌧 Rain','🌊 Ocean','🌿 Forest','🔥 Fireplace','🌬 Wind','🎵 Soft piano'].map((s) => (
            <button key={s}
              style={{
                padding:'10px 8px',borderRadius:14,fontSize:12,fontWeight:700,cursor:'pointer',
                background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.09)',
                color:'rgba(255,255,255,0.55)', transition:'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.15)'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='rgba(99,102,241,0.30)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; }}
            >
              {s}
            </button>
          ))}
        </div>
        <p style={{ fontSize:11,color:'rgba(255,255,255,0.25)',margin:'10px 0 0' }}>
          Sound files can be added to /public/sounds/ — wire each button to an Audio() instance.
        </p>
      </div>
    </div>
  );
}