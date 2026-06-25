import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Brain, CalendarDays, Flame, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api/client.js';
import { fallbackMoods } from '../data/demo.js';

const s = {
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 24, padding: 20,
    backdropFilter: 'blur(24px)',
  },
};

const MOOD_SCORES = { great:5, good:4, okay:3, low:2, heavy:1 };
const MOOD_COLORS = { great:'#34d399', good:'#818cf8', okay:'#a78bfa', low:'#fbbf24', heavy:'#f87171' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'rgba(15,23,42,0.95)',border:'1px solid rgba(255,255,255,0.10)',borderRadius:14,padding:'10px 14px',color:'white',fontSize:13 }}>
      <p style={{ color:'rgba(255,255,255,0.50)',margin:'0 0 4px',fontSize:11 }}>{label}</p>
      <p style={{ fontWeight:700,color:'#818cf8',margin:0 }}>Score: {payload[0].value}/5</p>
    </div>
  );
};

export default function Insights() {
  const [chart, setChart]       = useState(fallbackMoods);
  const [moods, setMoods]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/moods/analytics').catch(() => ({ data:{ chart:[] } })),
      api.get('/moods').catch(() => ({ data:{ moods:[] } })),
    ]).then(([analytics, moodRes]) => {
      if (analytics.data.chart?.length) setChart(analytics.data.chart);
      setMoods(moodRes.data.moods ?? []);
    }).finally(() => setLoading(false));
  }, []);

  // Compute stats from real data
  const avg     = moods.length ? (moods.reduce((s,m) => s + (MOOD_SCORES[m.mood]??3), 0) / moods.length).toFixed(1) : '—';
  const best    = moods.reduce((b,m) => (MOOD_SCORES[m.mood]??0) > (MOOD_SCORES[b?.mood]??0) ? m : b, null);
  const worst   = moods.reduce((w,m) => (MOOD_SCORES[m.mood]??6) < (MOOD_SCORES[w?.mood]??6) ? m : w, null);
  const recent7 = moods.slice(0,7);
  const recent7Avg = recent7.length ? (recent7.reduce((s,m)=>s+(MOOD_SCORES[m.mood]??3),0)/recent7.length).toFixed(1) : '—';
  const trend   = Number(recent7Avg) >= Number(avg) ? 'up' : 'down';

  // Heatmap: last 35 days
  const heatmap = Array.from({ length:35 }, (_,i) => {
    const d = new Date(); d.setDate(d.getDate() - (34-i));
    const key = d.toISOString().slice(0,10);
    const entry = moods.find(m => (m.loggedAt||m.createdAt)?.slice(0,10)===key);
    return { key, entry, day: d.getDate() };
  });

  // Mood distribution
  const dist = Object.entries(
    moods.reduce((acc,m) => { acc[m.mood]=(acc[m.mood]??0)+1; return acc; }, {})
  ).sort((a,b)=>b[1]-a[1]);

  const insightTexts = [
    moods.length < 5
      ? 'Log at least 5 moods to unlock deeper pattern analysis.'
      : Number(avg) >= 4
      ? 'Your average mood score is strong. Consistency is your biggest strength right now.'
      : Number(avg) >= 3
      ? 'You\'re staying balanced. Notice what keeps you at "okay" and what pushes you higher.'
      : 'Your mood has been lower lately. Try a 5-minute journal entry or a calm breathing session.',
    `Recent 7-day average: ${recent7Avg}/5 — ${trend==='up'?'trending positively':'needs some attention'}.`,
    best ? `Your best recorded mood was "${best.mood}" ${best.note ? `— you noted: "${best.note.slice(0,60)}"` : ''}.` : 'Your best moods are yet to be logged.',
  ];

  return (
    <div style={{ display:'grid', gap:16, paddingBottom:24 }}>

      {/* ── Header ── */}
      <div style={{ ...s.card, background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.08))', padding:'24px 24px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6 }}>
          <BarChart3 size={22} style={{ color:'#818cf8' }} aria-hidden />
          <h1 style={{ fontSize:'clamp(1.5rem,4vw,2rem)',fontWeight:900,color:'white',margin:0,letterSpacing:'-0.03em' }}>
            Mind Insights
          </h1>
        </div>
        <p style={{ fontSize:14,lineHeight:1.7,color:'rgba(255,255,255,0.50)',margin:0 }}>
          Emotional trends, mood patterns, and AI-generated observations from your data.
        </p>
      </div>

      {/* ── Stat row ── */}
      <div style={{ display:'grid',gap:12,gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))' }}>
        {[
          { label:'Avg mood score', value:avg,        icon:Brain,    color:'#818cf8' },
          { label:'7-day average',  value:recent7Avg,  icon:trend==='up'?TrendingUp:TrendingDown, color:trend==='up'?'#34d399':'#f87171' },
          { label:'Total logs',     value:moods.length,icon:CalendarDays, color:'#f472b6' },
          { label:'Streak',         value:(() => {
              const dates = new Set(moods.map(m=>(m.loggedAt||m.createdAt)?.slice(0,10)));
              let s=0; const t=new Date();
              for(let i=0;i<365;i++){const d=new Date(t);d.setDate(t.getDate()-i);if(dates.has(d.toISOString().slice(0,10)))s++;else if(i>0)break;}
              return `${s}d`;
            })(), icon:Flame, color:'#fb923c' },
        ].map(({ label, value, icon:Icon, color }) => (
          <div key={label} style={{ ...s.card, textAlign:'center', padding:16 }}>
            <div style={{ width:36,height:36,borderRadius:12,background:`${color}20`,border:`1px solid ${color}30`,display:'grid',placeItems:'center',margin:'0 auto 10px' }}>
              <Icon size={18} style={{ color }} aria-hidden />
            </div>
            <p style={{ fontSize:24,fontWeight:900,color:'white',margin:'0 0 2px' }}>{loading?'—':value}</p>
            <p style={{ fontSize:11,color:'rgba(255,255,255,0.40)',margin:0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Chart + AI prediction ── */}
      <div style={{ display:'grid',gap:14,gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',alignItems:'start' }}>
        <div style={{ ...s.card }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
            <h2 style={{ fontWeight:800,color:'white',fontSize:17,margin:0 }}>Weekly mood trend</h2>
            <span style={{ fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.35)' }}>/5 scale</span>
          </div>
          <div style={{ height:220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top:4,right:4,bottom:0,left:-10 }}>
                <defs>
                  <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill:'rgba(255,255,255,0.35)', fontSize:11 }} />
                <YAxis domain={[1,5]} axisLine={false} tickLine={false} tick={{ fill:'rgba(255,255,255,0.35)', fontSize:11 }} width={22} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} fill="url(#ig)"
                  dot={{ r:4,fill:'#6366f1',stroke:'rgba(255,255,255,0.30)',strokeWidth:2 }}
                  activeDot={{ r:7,fill:'white',stroke:'#6366f1',strokeWidth:2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          {/* AI prediction */}
          <div style={{ ...s.card, background:'rgba(139,92,246,0.10)', border:'1px solid rgba(139,92,246,0.20)' }}>
            <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:10 }}>
              <Brain size={18} style={{ color:'#c084fc' }} aria-hidden />
              <p style={{ fontWeight:800,color:'white',fontSize:15,margin:0 }}>AI prediction</p>
            </div>
            <p style={{ fontSize:13,lineHeight:1.8,color:'rgba(255,255,255,0.60)',margin:0 }}>
              {Number(avg)>=4
                ? 'Your emotional baseline is strong this week. Keep journaling — it\'s clearly helping.'
                : Number(avg)>=3
                ? 'Stress risk is moderate. A calm session before evening work may prevent emotional overload.'
                : 'Your emotional load seems heavy. Even one journal entry today can break the cycle.'}
            </p>
          </div>

          {/* Mood distribution */}
          {dist.length > 0 && (
            <div style={s.card}>
              <p style={{ fontWeight:800,color:'white',fontSize:14,margin:'0 0 12px' }}>Mood distribution</p>
              {dist.map(([mood, count]) => (
                <div key={mood} style={{ marginBottom:8 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:3 }}>
                    <span style={{ fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.60)',textTransform:'capitalize' }}>{mood}</span>
                    <span style={{ fontSize:12,fontWeight:700,color:MOOD_COLORS[mood]||'#818cf8' }}>{count}</span>
                  </div>
                  <div style={{ height:5,borderRadius:999,background:'rgba(255,255,255,0.07)',overflow:'hidden' }}>
                    <motion.div
                      initial={{ width:0 }} animate={{ width:`${(count/moods.length)*100}%` }}
                      transition={{ duration:0.8,ease:'easeOut' }}
                      style={{ height:'100%',borderRadius:999,background:MOOD_COLORS[mood]||'#818cf8' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Heatmap ── */}
      <div style={s.card}>
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
          <CalendarDays size={18} style={{ color:'#818cf8' }} aria-hidden />
          <p style={{ fontWeight:800,color:'white',fontSize:15,margin:0 }}>35-day emotional heatmap</p>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:5 }} role="list" aria-label="35 day mood calendar">
          {heatmap.map(({ key, entry, day }) => {
            const color = entry ? (MOOD_COLORS[entry.mood]||'#818cf8') : null;
            return (
              <motion.div key={key} role="listitem"
                whileHover={{ scale:1.15 }}
                title={entry ? `Day ${day}: ${entry.mood}` : `Day ${day}: no entry`}
                style={{
                  aspectRatio:'1',borderRadius:8,display:'grid',placeItems:'center',
                  background: color ? `${color}28` : 'rgba(255,255,255,0.04)',
                  border: color ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.06)',
                  cursor:'default',fontSize:9,fontWeight:700,
                  color: color || 'rgba(255,255,255,0.20)',
                }}>
                {day}
              </motion.div>
            );
          })}
        </div>
        {/* Legend */}
        <div style={{ display:'flex',flexWrap:'wrap',gap:12,marginTop:12 }}>
          {Object.entries(MOOD_COLORS).map(([mood,color]) => (
            <div key={mood} style={{ display:'flex',alignItems:'center',gap:5 }}>
              <div style={{ width:10,height:10,borderRadius:3,background:color }} />
              <span style={{ fontSize:11,color:'rgba(255,255,255,0.40)',textTransform:'capitalize' }}>{mood}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI Insight cards ── */}
      <div style={{ display:'grid',gap:12,gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))' }}>
        {insightTexts.map((text, i) => (
          <motion.div key={i} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.08 }}
            style={s.card}>
            <Sparkles size={16} style={{ color:'#c084fc' }} aria-hidden />
            <p style={{ fontSize:13,lineHeight:1.8,color:'rgba(255,255,255,0.65)',marginTop:10,marginBottom:0 }}>{text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}