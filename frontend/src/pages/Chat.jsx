import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle, Bot, Brain, HeartHandshake,
  Mic, MicOff, Phone, Send, ShieldCheck,
  Sparkles, Volume2, VolumeX, Wand2, X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */

const PERSONALITIES = [
  { id: 'friend', label: 'Friend',      icon: HeartHandshake, desc: 'Warm & validating'   },
  { id: 'guide',  label: 'Calm Guide',  icon: Brain,          desc: 'Grounded reflection'  },
  { id: 'coach',  label: 'Coach',       icon: Wand2,          desc: 'Kind momentum'         },
];

const LANGUAGES = [
  { code: 'en-US', label: 'English'  },
  { code: 'hi-IN', label: 'Hindi'    },
  { code: 'te-IN', label: 'Telugu'   },
  { code: 'ta-IN', label: 'Tamil'    },
  { code: 'kn-IN', label: 'Kannada'  },
  { code: 'es-ES', label: 'Spanish'  },
];

const QUICK_PROMPTS = [
  { label: '😔 Feeling low',        text: 'I have been feeling really low lately.'          },
  { label: '😰 Overthinking',       text: 'I cannot stop overthinking everything.'          },
  { label: '📚 Need motivation',    text: 'I want motivation to study and focus.'           },
  { label: '😤 Feeling stressed',   text: 'I am really stressed and overwhelmed right now.' },
  { label: '💬 Just chat',          text: 'Can we just have a casual conversation?'         },
  { label: '😴 Exhausted',          text: 'I am feeling emotionally drained and tired.'     },
];

const MODE_LABELS = {
  casual:         { label: 'Casual',       color: '#818cf8' },
  positive:       { label: 'Positive',     color: '#34d399' },
  neutral:        { label: 'Balanced',     color: '#94a3b8' },
  support:        { label: 'Support',      color: '#f472b6' },
  'deep-support': { label: 'Deep Support', color: '#c084fc' },
  motivation:     { label: 'Motivation',   color: '#fb923c' },
  crisis:         { label: '⚠️ Safety',   color: '#f87171' },
};

const VOICE_MOODS = [
  { mood: 'Anxious',  color: '#f472b6', terms: ['anxious','panic','worried','nervous','stress','overthinking','scared'] },
  { mood: 'Sad',      color: '#818cf8', terms: ['sad','depressed','lonely','empty','hopeless','crying','hurt'] },
  { mood: 'Tired',    color: '#94a3b8', terms: ['tired','exhausted','sleepy','drained','burnout'] },
  { mood: 'Angry',    color: '#fb923c', terms: ['angry','mad','furious','annoyed','irritated','frustrated'] },
  { mood: 'Happy',    color: '#34d399', terms: ['good','great','happy','better','fine','excited','calm','grateful'] },
];

function detectVoiceMood(text = '') {
  const lower = text.toLowerCase();
  return VOICE_MOODS.find((m) => m.terms.some((t) => lower.includes(t))) || null;
}

/* ─────────────────────────────────────────────
   GLASS CARD (base style via inline)
───────────────────────────────────────────── */

const glass = {
  background:    'rgba(255,255,255,0.04)',
  border:        '1px solid rgba(255,255,255,0.09)',
  backdropFilter:'blur(30px)',
  borderRadius:  20,
};

/* ─────────────────────────────────────────────
   CRISIS BANNER
───────────────────────────────────────────── */

function CrisisBanner({ resources, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      role="alert" aria-live="assertive"
      style={{
        margin: '12px 12px 0',
        borderRadius: 16,
        padding: '14px 16px',
        background: 'rgba(239,68,68,0.12)',
        border: '1px solid rgba(239,68,68,0.25)',
      }}
    >
      <div className="flex items-start gap-3">
        <Phone size={16} style={{ color: '#f87171', flexShrink: 0, marginTop: 2 }} aria-hidden />
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: '#fca5a5' }}>
            We noticed something concerning. You're not alone. 💙
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {(resources?.length ? resources : [
              { label: 'India', value: '112 / iCall: 9152987821' },
              { label: 'US/Canada', value: '988' },
              { label: 'UK', value: '116 123' },
            ]).map((r) => (
              <span key={r.label} className="text-xs" style={{ color: '#fca5a5' }}>
                <span className="font-bold">{r.label}:</span> {r.value}
              </span>
            ))}
          </div>
        </div>
        <button onClick={onDismiss} aria-label="Dismiss" style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   TYPING INDICATOR
───────────────────────────────────────────── */

function TypingDots() {
  return (
    <div className="flex items-center gap-2">
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: 'rgba(99,102,241,0.15)', display: 'grid', placeItems: 'center',
      }}>
        <Bot size={15} style={{ color: '#818cf8' }} aria-hidden />
      </div>
      <div style={{ ...glass, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 5 }}>
        {[0, 1, 2].map((i) => (
          <motion.span key={i}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
            style={{ width: 7, height: 7, borderRadius: '50%', background: '#818cf8', display: 'block' }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────── */

function MessageBubble({ message, isStreaming = false }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}
    >
      {/* AI avatar */}
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'grid', placeItems: 'center',
          boxShadow: '0 4px 12px rgba(99,102,241,0.30)',
        }}>
          <Bot size={15} style={{ color: 'white' }} aria-hidden />
        </div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth: '78%',
        padding: '12px 16px',
        borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
        fontSize: 14,
        lineHeight: 1.7,
        ...(isUser ? {
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(99,102,241,0.30)',
        } : {
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.10)',
          color: 'rgba(255,255,255,0.90)',
        }),
      }}>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.content}
          {isStreaming && (
            <span style={{
              display: 'inline-block', width: 2, height: 14, marginLeft: 3,
              background: '#818cf8', animation: 'blink 1s infinite',
              verticalAlign: 'middle', borderRadius: 1,
            }} aria-hidden />
          )}
        </p>
        <p style={{
          margin: '6px 0 0', fontSize: 10, fontWeight: 600,
          color: isUser ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.30)',
        }}>
          {new Date(message.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   SIDEBAR CARD
───────────────────────────────────────────── */

function SideCard({ children }) {
  return (
    <div style={{ ...glass, padding: 16 }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN CHAT COMPONENT
───────────────────────────────────────────── */

export default function Chat() {
  const [personality, setPersonality]     = useState('friend');
  const [language, setLanguage]           = useState('en-US');
  const [messages, setMessages]           = useState([{
    role: 'assistant',
    content: "Hi 💜 I'm MindCare AI — your private emotional companion. I'm here to listen without judgment. What's on your mind today?",
    createdAt: new Date().toISOString(),
  }]);
  const [input, setInput]                 = useState('');
  const [typing, setTyping]               = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [sending, setSending]             = useState(false);
  const [useStreaming, setUseStreaming]    = useState(true);
  const [voiceEnabled, setVoiceEnabled]   = useState(false);
  const [listening, setListening]         = useState(false);
  const [crisisData, setCrisisData]       = useState(null);
  const [emotion, setEmotion]             = useState(null);
  const [voiceMood, setVoiceMood]         = useState(null);
  const [mode, setMode]                   = useState('casual');
  const [isOnline, setIsOnline]           = useState(navigator.onLine);
  const [showPrompts, setShowPrompts]     = useState(true);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const abortRef  = useRef(null);

  /* ── Setup ── */
  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    api.get('/chat').then(({ data }) => {
      if (data.chat?.messages?.length) {
        setMessages(data.chat.messages);
        setShowPrompts(false);
      }
      if (data.chat?.personality) setPersonality(data.chat.personality);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, streamingText]);

  /* ── Voice synthesis ── */
  function speak(text, replyMode = mode) {
    if (!voiceEnabled || !('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const u   = new SpeechSynthesisUtterance(text);
    u.lang    = language;
    u.rate    = ['support','deep-support','crisis'].includes(replyMode) ? 0.84 : 0.95;
    u.pitch   = ['casual','positive'].includes(replyMode) ? 1.05 : 0.90;
    u.volume  = 0.9;
    const vs  = window.speechSynthesis.getVoices();
    const v   = vs.find((x) => x.lang === language) ?? vs.find((x) => x.lang?.startsWith(language.split('-')[0]));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  }

  /* ── Voice input ── */
  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || listening) return;
    const r = new SR();
    r.lang = language;
    r.continuous = false;
    r.interimResults = false;
    setListening(true);
    r.onresult = (e) => {
      const t = e.results?.[0]?.[0]?.transcript || '';
      if (t) {
        setInput((prev) => `${prev} ${t}`.trim());
        const vm = detectVoiceMood(t);
        if (vm) setVoiceMood(vm);
      }
    };
    r.onend   = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start();
  }

  /* ── Send ── */
  async function send() {
    const content = input.trim();
    if (!content || typing || sending) return;
    if (!isOnline) {
      addAIMessage('⚠️ You appear to be offline. Please reconnect and try again.');
      return;
    }

    setInput('');
    setShowPrompts(false);
    addUserMessage(content);
    setTyping(true);
    setSending(true);

    try {
      if (useStreaming) {
        await sendStream(content);
      } else {
        await sendREST(content);
      }
    } catch (err) {
      if (useStreaming) {
        setUseStreaming(false);
        setTyping(false); setSending(false); setStreamingText('');
        try { await sendREST(content); } catch { addFallback(); }
      } else { addFallback(); }
    }
  }

  function addUserMessage(content) {
    setMessages((p) => [...p, { role: 'user', content, createdAt: new Date().toISOString() }]);
  }

  function addAIMessage(content) {
    setMessages((p) => [...p, { role: 'assistant', content, createdAt: new Date().toISOString() }]);
  }

  function addFallback() {
    addAIMessage("I'm having trouble connecting right now. Please try again in a moment. 🌐");
    setTyping(false); setSending(false); setStreamingText('');
  }

  /* ── SSE streaming ── */
  async function sendStream(content) {
    const token   = localStorage.getItem('mindcare_token');
    const baseUrl = import.meta.env.VITE_API_URL || 'https://mindcare-ai-3.onrender.com/api/v1';
    const ctrl    = new AbortController();
    abortRef.current = ctrl;

    const res = await fetch(`${baseUrl}/chat/stream`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
      body:    JSON.stringify({ message: content, personality, language }),
      signal:  ctrl.signal,
    });

    if (!res.ok) { setUseStreaming(false); throw new Error(`HTTP ${res.status}`); }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buf = '', full = '';
    setTyping(false);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          if (parsed.token) { full += parsed.token; setStreamingText(full); }
          if (parsed.done) {
            const finalText = parsed.fullResponse || full;
            addAIMessage(finalText);
            setStreamingText('');
            if (parsed.emotion) setEmotion(parsed.emotion);
            if (parsed.crisis)  setCrisisData({ resources: parsed.resources ?? [] });
            const m = parsed.mode ?? 'casual';
            setMode(m);
            speak(finalText, m);
          }
        } catch {}
      }
    }
    setSending(false);
  }

  /* ── REST fallback ── */
  async function sendREST(content) {
    const { data } = await api.post('/chat', { message: content, personality, language });
    const reply = data.reply || 'Something went wrong. Please try again.';
    addAIMessage(reply);
    if (data.emotion) setEmotion(data.emotion);
    if (data.crisis)  setCrisisData({ resources: data.resources ?? [] });
    const m = data.mode ?? 'casual';
    setMode(m);
    speak(reply, m);
    setTyping(false); setSending(false);
  }

  /* ── Key handling ── */
  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  /* ── Derived ── */
  const activePerson  = PERSONALITIES.find((p) => p.id === personality) ?? PERSONALITIES[0];
  const modeInfo      = MODE_LABELS[mode] ?? MODE_LABELS.neutral;
  const speechSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */

  return (
    <>
      {/* Blink keyframe */}
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr', maxWidth: 1200, margin: '0 auto' }}
        className="xl:grid-cols-[1fr_280px]">

        {/* ══════════════════════════════
            MAIN CHAT PANEL
        ══════════════════════════════ */}
        <div style={{
          ...glass,
          borderRadius: 28,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>

          {/* ── HEADER ── */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(99,102,241,0.06)',
          }}>
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Animated bot icon */}
                <div style={{ position: 'relative' }}>
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ position: 'absolute', inset: 0, borderRadius: 16, background: 'rgba(99,102,241,0.3)', filter: 'blur(10px)' }}
                  />
                  <motion.div
                    animate={{ rotate: [0, -3, 3, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    style={{
                      position: 'relative', width: 48, height: 48, borderRadius: 16,
                      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                      display: 'grid', placeItems: 'center',
                      boxShadow: '0 6px 20px rgba(99,102,241,0.40)',
                    }}
                  >
                    <Bot size={24} style={{ color: 'white' }} aria-hidden />
                  </motion.div>
                </div>

                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                    MindCare AI · Live
                  </p>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: '2px 0 0', letterSpacing: '-0.02em' }}>
                    Anonymous support chat
                  </h2>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '2px 0 0' }}>
                    {activePerson.desc} · {modeInfo.label}
                  </p>
                </div>
              </div>

              {/* Mode badge + online indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  padding: '5px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                  background: `${modeInfo.color}18`,
                  border: `1px solid ${modeInfo.color}30`,
                  color: modeInfo.color,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <ShieldCheck size={13} aria-hidden />
                  {modeInfo.label}
                </div>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: isOnline ? '#34d399' : '#f87171',
                  boxShadow: isOnline ? '0 0 6px rgba(52,211,153,0.6)' : 'none',
                }} title={isOnline ? 'Online' : 'Offline'} />
              </div>
            </div>

            {/* Personality + Language row */}
            <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {PERSONALITIES.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setPersonality(id)}
                  aria-pressed={personality === id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.2s',
                    ...(personality === id ? {
                      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                      border: 'none', color: 'white',
                      boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                    } : {
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      color: 'rgba(255,255,255,0.60)',
                    }),
                  }}>
                  <Icon size={12} aria-hidden /> {label}
                </button>
              ))}

              <select value={language} onChange={(e) => setLanguage(e.target.value)}
                aria-label="Select language"
                style={{
                  marginLeft: 'auto', padding: '5px 10px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: 'rgba(255,255,255,0.70)', fontSize: 12, fontWeight: 600,
                  outline: 'none', cursor: 'pointer',
                }}>
                {LANGUAGES.map(({ code, label }) => (
                  <option key={code} value={code} style={{ background: '#0f172a' }}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── CRISIS BANNER ── */}
          <AnimatePresence>
            {crisisData && <CrisisBanner resources={crisisData.resources} onDismiss={() => setCrisisData(null)} />}
          </AnimatePresence>

          {/* ── MESSAGES ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 440, maxHeight: '62vh' }}
            aria-live="polite" aria-label="Chat messages">

            {/* Quick prompts — shown only before first message */}
            <AnimatePresence>
              {showPrompts && messages.length <= 1 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 10, fontWeight: 600 }}>
                    Tap a topic to start:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {QUICK_PROMPTS.map(({ label, text }) => (
                      <button key={label} onClick={() => { setInput(text); inputRef.current?.focus(); }}
                        style={{
                          padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.10)',
                          color: 'rgba(255,255,255,0.70)',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.20)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.70)'; }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message list */}
            {messages.map((msg, i) => (
              <MessageBubble key={`${i}-${msg.content.slice(0,10)}`} message={msg} />
            ))}

            {/* Streaming bubble */}
            <AnimatePresence>
              {streamingText && (
                <MessageBubble
                  message={{ role: 'assistant', content: streamingText, createdAt: new Date().toISOString() }}
                  isStreaming
                />
              )}
            </AnimatePresence>

            {/* Typing dots */}
            <AnimatePresence>
              {typing && !streamingText && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <TypingDots />
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={bottomRef} />
          </div>

          {/* ── INPUT AREA ── */}
          <div style={{
            padding: '12px 14px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(0,0,0,0.15)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: 10,
              background: 'rgba(255,255,255,0.06)',
              border: '1.5px solid rgba(255,255,255,0.10)',
              borderRadius: 20, padding: '8px 12px',
              transition: 'border-color 0.2s',
            }}
              onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.50)'}
              onBlurCapture={e  => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'}
            >
              {/* Mic button */}
              {speechSupported && (
                <button onClick={startListening} disabled={listening} aria-label={listening ? 'Listening…' : 'Voice input'}
                  style={{
                    width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                    display: 'grid', placeItems: 'center', cursor: 'pointer', border: 'none',
                    background: listening ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)',
                    color: listening ? '#f87171' : 'rgba(255,255,255,0.50)',
                    transition: 'all 0.2s',
                  }}>
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}

              {/* Text input */}
              <textarea ref={inputRef}
                value={input}
                maxLength={600}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Share what's on your mind… (Enter to send)"
                aria-label="Message input"
                rows={1}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  resize: 'none', fontSize: 14, lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.90)',
                  maxHeight: 120, overflowY: 'auto',
                  padding: '6px 4px',
                  fontFamily: 'inherit',
                }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
              />

              {/* Char count */}
              <span style={{ fontSize: 10, fontWeight: 600, color: input.length > 550 ? '#f87171' : 'rgba(255,255,255,0.25)', flexShrink: 0, alignSelf: 'flex-end', paddingBottom: 8 }}>
                {input.length}/600
              </span>

              {/* Send button */}
              <button onClick={send} disabled={!input.trim() || sending}
                aria-label="Send message"
                style={{
                  width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                  display: 'grid', placeItems: 'center', cursor: 'pointer', border: 'none',
                  background: input.trim() && !sending
                    ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                    : 'rgba(255,255,255,0.06)',
                  color: input.trim() && !sending ? 'white' : 'rgba(255,255,255,0.25)',
                  boxShadow: input.trim() && !sending ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
                  transition: 'all 0.2s',
                }}>
                {sending ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>

            {/* Footer row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, padding: '0 4px' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                Enter to send · Shift+Enter for new line
              </p>
              <button onClick={() => { window.speechSynthesis?.cancel(); setVoiceEnabled(v => !v); }}
                aria-label={voiceEnabled ? 'Disable voice' : 'Enable voice'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', border: 'none',
                  background: voiceEnabled ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)',
                  color: voiceEnabled ? '#818cf8' : 'rgba(255,255,255,0.35)',
                  transition: 'all 0.2s',
                }}>
                {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                {voiceEnabled ? 'Voice on' : 'Voice off'}
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════
            RIGHT SIDEBAR
        ══════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Safety */}
          <SideCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <ShieldCheck size={18} style={{ color: '#818cf8' }} aria-hidden />
              <p style={{ fontWeight: 800, color: 'white', fontSize: 15, margin: 0 }}>Safety boundaries</p>
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.7, color: 'rgba(255,255,255,0.50)', margin: 0 }}>
              MindCare AI offers emotional support and coping ideas. It does not diagnose or replace professional mental health care.
            </p>
          </SideCard>

          {/* Emotion detected */}
          <AnimatePresence>
            {emotion && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <SideCard>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Sparkles size={16} style={{ color: '#c084fc' }} aria-hidden />
                    <p style={{ fontWeight: 800, color: 'white', fontSize: 14, margin: 0 }}>Emotion detected</p>
                  </div>
                  <span style={{
                    display: 'inline-block', padding: '4px 12px', borderRadius: 999,
                    background: 'rgba(192,132,252,0.15)', border: '1px solid rgba(192,132,252,0.25)',
                    color: '#c084fc', fontSize: 12, fontWeight: 700,
                  }}>
                    {typeof emotion === 'string' ? emotion : emotion.label}
                  </span>
                  {emotion.suggestion && (
                    <p style={{ fontSize: 12, lineHeight: 1.7, color: 'rgba(255,255,255,0.50)', marginTop: 8, marginBottom: 0 }}>
                      {emotion.suggestion}
                    </p>
                  )}
                </SideCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice mood */}
          <AnimatePresence>
            {voiceMood && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <SideCard>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Mic size={16} style={{ color: '#818cf8' }} aria-hidden />
                    <p style={{ fontWeight: 800, color: 'white', fontSize: 14, margin: 0 }}>Voice mood</p>
                  </div>
                  <span style={{
                    display: 'inline-block', padding: '4px 12px', borderRadius: 999,
                    background: `${voiceMood.color}18`,
                    border: `1px solid ${voiceMood.color}30`,
                    color: voiceMood.color, fontSize: 12, fontWeight: 700,
                  }}>
                    {voiceMood.mood}
                  </span>
                </SideCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Crisis */}
          <SideCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <AlertTriangle size={16} style={{ color: '#fbbf24' }} aria-hidden />
              <p style={{ fontWeight: 800, color: 'white', fontSize: 14, margin: 0 }}>In crisis?</p>
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.7, color: 'rgba(255,255,255,0.50)', marginBottom: 8 }}>
              If you're in immediate danger, please reach out:
            </p>
            {[
              { country: 'India',     number: '112 / iCall: 9152987821' },
              { country: 'US/Canada', number: '988'                     },
              { country: 'UK',        number: '116 123'                 },
              { country: 'Global',    number: 'findahelpline.com'       },
            ].map(({ country, number }) => (
              <div key={country} style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.60)' }}>{country}: </span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)' }}>{number}</span>
              </div>
            ))}
          </SideCard>

          {/* Tips */}
          <SideCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Brain size={16} style={{ color: '#34d399' }} aria-hidden />
              <p style={{ fontWeight: 800, color: 'white', fontSize: 14, margin: 0 }}>Tips</p>
            </div>
            {[
              'Be specific — the more you share, the better I can help.',
              'Try voice input for a more natural conversation.',
              'Switch personalities to change the response style.',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span style={{ color: '#6366f1', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{i + 1}.</span>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.45)', margin: 0 }}>{tip}</p>
              </div>
            ))}
          </SideCard>

        </div>
      </div>
    </>
  );
}