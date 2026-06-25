import { motion } from 'framer-motion';
import { BookOpen, ExternalLink, Headphones, Heart, LifeBuoy, Moon, PhoneCall, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';

const TOOLS = [
  { icon: Waves,     title: 'Breathing Library',  desc: 'Box breathing, long-exhale reset, panic grounding — guided techniques for every moment.',   link: '/app/calm',    cta: 'Open Calm Space', gradient:'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  { icon: Headphones,title: 'Sound Space',        desc: 'Rain, ocean, forest, and soft piano loops. Set the right ambient tone for your mood.',      link: '/app/calm',    cta: 'Open Calm Space', gradient:'linear-gradient(135deg,#14b8a6,#06b6d4)' },
  { icon: Moon,      title: 'Night Reflection',   desc: 'Wind-down prompts for sleep, closure, and emotional unloading before bed.',                  link: '/app/journal', cta: 'Open Journal',    gradient:'linear-gradient(135deg,#8b5cf6,#d946ef)' },
  { icon: BookOpen,  title: 'Support Guides',     desc: 'Plain-language guides for stress, loneliness, motivation, burnout, and relationship health.', link: '/app/journal', cta: 'Read & Reflect',  gradient:'linear-gradient(135deg,#f59e0b,#f97316)' },
];

const CRISIS = [
  { country: 'India',     lines: ['iCall: 9152987821', 'Vandrevala: 1860-2662-345', 'AASRA: 9820466627'] },
  { country: 'US/Canada', lines: ['988 Suicide & Crisis Lifeline', 'Crisis Text: Text HOME to 741741'] },
  { country: 'UK',        lines: ['Samaritans: 116 123', 'Mind: 0300 123 3393'] },
  { country: 'Global',    lines: ['findahelpline.com', 'befrienders.org'] },
];

const READS = [
  { title: 'Understanding anxiety',    body: 'Anxiety is your nervous system trying to protect you. Learning to work with it — not fight it — is the key shift.' },
  { title: 'The 5-minute journal',     body: 'Research shows 5 minutes of daily journaling measurably reduces cortisol and improves emotional clarity within 2 weeks.' },
  { title: 'Sleep and mental health',  body: 'Even one night of poor sleep affects mood, focus, and emotional regulation. Consistency matters more than duration.' },
  { title: 'Why breathing works',      body: 'Slow exhalation activates the vagus nerve, shifting your body from fight-or-flight to rest-and-digest within 60 seconds.' },
  { title: 'Loneliness vs. aloneness', body: 'Loneliness is a signal, not a permanent state. Small moments of genuine connection — even brief — have outsized impact.' },
  { title: 'The burnout checklist',    body: 'Burnout shows up as cynicism, exhaustion, and detachment. Noticing it early is the fastest path to recovery.' },
];

const s = {
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 24, padding: 20,
    backdropFilter: 'blur(24px)',
  },
};

export default function Resources() {
  return (
    <div style={{ display:'grid', gap:16, paddingBottom:24 }}>

      {/* Header */}
      <div style={{ ...s.card, background:'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(20,184,166,0.08))', padding:'24px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:6 }}>
          <LifeBuoy size={22} style={{ color:'#818cf8' }} aria-hidden />
          <h1 style={{ fontSize:'clamp(1.5rem,4vw,2rem)',fontWeight:900,color:'white',margin:0,letterSpacing:'-0.03em' }}>
            Wellness Resources
          </h1>
        </div>
        <p style={{ fontSize:14,lineHeight:1.7,color:'rgba(255,255,255,0.50)',margin:0 }}>
          Short, supportive tools you can reach for without feeling like you've entered a clinical portal.
        </p>
      </div>

      {/* Tool cards */}
      <div style={{ display:'grid',gap:14,gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))' }}>
        {TOOLS.map(({ icon:Icon, title, desc, link, cta, gradient }, i) => (
          <motion.div key={title}
            initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.07 }}
            whileHover={{ y:-4 }}
            style={{ ...s.card, display:'flex', flexDirection:'column' }}>
            <div style={{ width:44,height:44,borderRadius:14,background:gradient,display:'grid',placeItems:'center',marginBottom:14,boxShadow:`0 6px 20px rgba(0,0,0,0.25)` }}>
              <Icon size={20} style={{ color:'white' }} aria-hidden />
            </div>
            <p style={{ fontWeight:800,color:'white',fontSize:16,margin:'0 0 6px' }}>{title}</p>
            <p style={{ fontSize:13,lineHeight:1.7,color:'rgba(255,255,255,0.50)',margin:'0 0 16px',flex:1 }}>{desc}</p>
            <Link to={link} style={{
              display:'flex',alignItems:'center',justifyContent:'center',gap:6,
              padding:'9px',borderRadius:14,fontSize:12,fontWeight:700,textDecoration:'none',
              background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.10)',color:'rgba(255,255,255,0.70)',
              transition:'all 0.2s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(99,102,241,0.20)';e.currentTarget.style.color='white';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.07)';e.currentTarget.style.color='rgba(255,255,255,0.70)';}}
            >
              {cta} →
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Short reads */}
      <div style={s.card}>
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:16 }}>
          <BookOpen size={18} style={{ color:'#818cf8' }} aria-hidden />
          <p style={{ fontWeight:800,color:'white',fontSize:15,margin:0 }}>Short reads</p>
        </div>
        <div style={{ display:'grid',gap:12,gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))' }}>
          {READS.map(({ title, body }, i) => (
            <motion.div key={title}
              initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.06 }}
              style={{ background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:14 }}>
              <p style={{ fontWeight:700,color:'white',fontSize:13,margin:'0 0 6px' }}>{title}</p>
              <p style={{ fontSize:12,lineHeight:1.8,color:'rgba(255,255,255,0.45)',margin:0 }}>{body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Crisis lines */}
      <div style={{ ...s.card, background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.18)' }}>
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
          <PhoneCall size={18} style={{ color:'#f87171' }} aria-hidden />
          <p style={{ fontWeight:800,color:'#fca5a5',fontSize:15,margin:0 }}>Crisis helplines</p>
        </div>
        <p style={{ fontSize:13,color:'rgba(252,165,165,0.60)',margin:'0 0 14px' }}>
          If you or someone you know is in crisis, please reach out. These are free, confidential, and available 24/7.
        </p>
        <div style={{ display:'grid',gap:12,gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))' }}>
          {CRISIS.map(({ country, lines }) => (
            <div key={country} style={{ background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.15)',borderRadius:16,padding:14 }}>
              <p style={{ fontWeight:700,color:'#fca5a5',fontSize:13,margin:'0 0 8px' }}>{country}</p>
              {lines.map((l) => (
                <p key={l} style={{ fontSize:12,color:'rgba(252,165,165,0.65)',margin:'0 0 4px' }}>{l}</p>
              ))}
            </div>
          ))}
        </div>
        <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer"
          style={{
            display:'inline-flex',alignItems:'center',gap:6,marginTop:14,
            fontSize:12,fontWeight:700,color:'#f87171',textDecoration:'none',
          }}>
          <ExternalLink size={13} /> Find a helpline in your country →
        </a>
      </div>

      {/* Self-care actions */}
      <div style={s.card}>
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:14 }}>
          <Heart size={18} style={{ color:'#f472b6' }} aria-hidden />
          <p style={{ fontWeight:800,color:'white',fontSize:15,margin:0 }}>Right now, you could…</p>
        </div>
        <div style={{ display:'grid',gap:8,gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))' }}>
          {[
            { emoji:'🫁', action:'Take 3 slow breaths',  link:'/app/calm'    },
            { emoji:'📝', action:'Write one sentence',   link:'/app/journal'  },
            { emoji:'🎯', action:'Log your mood',        link:'/app/moods'    },
            { emoji:'💬', action:'Talk to the AI',       link:'/app/chat'     },
            { emoji:'📊', action:'Check your progress',  link:'/app/progress' },
            { emoji:'⬇️', action:'Export your data',    link:'/app/export'   },
          ].map(({ emoji, action, link }) => (
            <Link key={action} to={link} style={{
              display:'flex',alignItems:'center',gap:10,
              padding:'11px 14px',borderRadius:16,textDecoration:'none',
              background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',
              color:'rgba(255,255,255,0.65)',fontSize:13,fontWeight:600,
              transition:'all 0.2s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(99,102,241,0.15)';e.currentTarget.style.color='white';e.currentTarget.style.borderColor='rgba(99,102,241,0.30)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='rgba(255,255,255,0.65)';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)';}}
            >
              <span style={{ fontSize:18 }}>{emoji}</span>
              {action}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}