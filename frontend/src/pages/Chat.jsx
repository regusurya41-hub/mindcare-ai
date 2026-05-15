import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Brain, HeartHandshake, Mic, Send, ShieldCheck, Sparkles, Volume2, VolumeX, Wand2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';

const personalities = [
  { id: 'friend', label: 'Friendly Friend', icon: HeartHandshake, tone: 'Warm validation' },
  { id: 'guide', label: 'Calm Guide', icon: Brain, tone: 'Grounded reflection' },
  { id: 'coach', label: 'Motivational Coach', icon: Wand2, tone: 'Kind momentum' }
];

const quickPrompts = [
  'Help me stop overthinking.',
  'I want motivation to study.',
  'I feel emotionally tired.',
  'Can we just chat casually?'
];

const languageOptions = [
  { code: 'en-US', label: 'English' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'es-ES', label: 'Spanish' }
];

const voiceMoodRules = [
  {
    mood: 'Anxious',
    tone: 'support',
    confidence: 'High',
    suggestion: 'Try a slow exhale and a grounding prompt before sending.',
    terms: ['anxious', 'panic', 'worried', 'nervous', 'stress', 'stressed', 'scared', 'overthinking']
  },
  {
    mood: 'Low',
    tone: 'deep-support',
    confidence: 'High',
    suggestion: 'You may need gentler support. Consider telling MindCare what feels heaviest.',
    terms: ['sad', 'depressed', 'lonely', 'empty', 'hopeless', 'crying', 'hurt', 'worthless']
  },
  {
    mood: 'Tired',
    tone: 'support',
    confidence: 'Medium',
    suggestion: 'A short reset or rest-focused response may fit better than productivity advice.',
    terms: ['tired', 'exhausted', 'sleepy', 'drained', 'burnout', 'burned out']
  },
  {
    mood: 'Angry',
    tone: 'support',
    confidence: 'Medium',
    suggestion: 'It may help to name the boundary or unfairness underneath the anger.',
    terms: ['angry', 'mad', 'furious', 'annoyed', 'irritated']
  },
  {
    mood: 'Positive',
    tone: 'positive',
    confidence: 'Medium',
    suggestion: 'This sounds lighter. MindCare can help you notice what made today better.',
    terms: ['good', 'great', 'happy', 'better', 'fine', 'excited', 'calm']
  }
];

function detectVoiceMood(transcript = '') {
  const normalized = transcript.toLowerCase();
  const match = voiceMoodRules.find((rule) => rule.terms.some((term) => normalized.includes(term)));

  if (match) return match;

  return {
    mood: 'Neutral',
    tone: 'casual',
    confidence: 'Low',
    suggestion: 'No strong emotional signal detected. You can keep this casual or add more detail.'
  };
}

const messageVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 }
};

export default function Chat() {
  const [personality, setPersonality] = useState('friend');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi. I am here to listen. What is on your mind today?', createdAt: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [resources, setResources] = useState([]);
  const [emotion, setEmotion] = useState(null);
  const [listening, setListening] = useState(false);
  const [provider, setProvider] = useState('local');
  const [mode, setMode] = useState('casual');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [language, setLanguage] = useState('en-US');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceMood, setVoiceMood] = useState(null);
  const [memory, setMemory] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    setVoiceSupported('speechSynthesis' in window);
    return () => window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    api
      .get('/chat')
      .then(({ data }) => {
        if (data.chat?.messages?.length) setMessages(data.chat.messages);
        if (data.chat?.personality) setPersonality(data.chat.personality);
      })
      .catch(() => {});
    api.get('/memory').then(({ data }) => setMemory(data.memory)).catch(() => {});
  }, []);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, typing]);

  function speakReply(text, replyMode = mode) {
    if (!voiceEnabled || !('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = replyMode === 'support' || replyMode === 'deep-support' || replyMode === 'crisis' ? 0.86 : 0.96;
    utterance.pitch = replyMode === 'casual' || replyMode === 'positive' ? 1.05 : 0.92;
    utterance.volume = 0.9;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((item) => item.lang === language) || voices.find((item) => item.lang?.startsWith(language.split('-')[0]));
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  }

  async function send() {
    if (!input.trim() || typing) return;
    const content = input.trim();
    setInput('');
    setMessages((current) => [...current, { role: 'user', content, createdAt: new Date().toISOString() }]);
    setTyping(true);

    try {
      const { data } = await api.post('/chat', { message: content, personality, language });
      const assistantMessage = { role: 'assistant', content: data.reply, isCrisis: data.isCrisis, createdAt: new Date().toISOString() };
      setMessages((current) => [...current, assistantMessage]);
      setResources(data.resources || []);
      setEmotion(data.emotion || null);
      setProvider(data.provider || 'local');
      setMode(data.mode || 'casual');
      setMemory(data.memory || null);
      speakReply(data.reply, data.mode || 'casual');
    } catch (_error) {
      const fallback = 'I had trouble connecting. Try again in a moment, and if this is urgent, contact local emergency support now.';
      setMessages((current) => [...current, { role: 'assistant', content: fallback, createdAt: new Date().toISOString() }]);
      speakReply(fallback, 'support');
    } finally {
      setTyping(false);
    }
  }

  function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || listening) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setInput((current) => `${current} ${transcript}`.trim());
        setVoiceMood(detectVoiceMood(transcript));
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
  }

  const activePersonality = personalities.find((item) => item.id === personality) || personalities[0];
  const modeLabel = {
    casual: 'Casual Companion',
    positive: 'Positive Mode',
    neutral: 'Balanced Mode',
    support: 'Support Mode',
    'deep-support': 'Deep Support',
    motivation: 'Motivation Mode',
    crisis: 'Safety Mode'
  }[mode] || 'Balanced Mode';
  const avatarState = {
    casual: { label: 'Open', className: 'from-indigo to-violet', pulse: 'bg-indigo/20' },
    positive: { label: 'Bright', className: 'from-violet to-lagoon', pulse: 'bg-lagoon/20' },
    neutral: { label: 'Balanced', className: 'from-indigo to-violet', pulse: 'bg-indigo/20' },
    support: { label: 'Supportive', className: 'from-lagoon to-indigo', pulse: 'bg-lagoon/20' },
    'deep-support': { label: 'Gentle', className: 'from-violet to-indigo', pulse: 'bg-violet/20' },
    motivation: { label: 'Focused', className: 'from-indigo to-lagoon', pulse: 'bg-indigo/20' },
    crisis: { label: 'Safety', className: 'from-red-500 to-violet', pulse: 'bg-red-200/60' }
  }[mode] || { label: 'Balanced', className: 'from-indigo to-violet', pulse: 'bg-indigo/20' };

  const speechInputSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 xl:grid-cols-[minmax(0,2fr)_300px] 2xl:max-w-7xl 2xl:grid-cols-[minmax(0,2.2fr)_310px]">
      <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white/75 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50">
        <div className="border-b border-indigo/10 bg-gradient-to-r from-white/95 via-lavender/70 to-teal-50/80 p-4 dark:border-white/10 dark:from-white/10 dark:via-violet/10 dark:to-teal-950/20 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: mode === 'deep-support' || mode === 'support' ? 5 : 3.8, repeat: Infinity, ease: 'easeInOut' }}
                  className={`absolute inset-0 rounded-2xl blur-xl ${avatarState.pulse}`}
                />
                <motion.div
                  animate={{ rotate: [0, -4, 4, 0], scale: [1, 1.04, 1] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
                  className={`relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${avatarState.className} text-white shadow-lg shadow-indigo/20`}
                >
                  <Bot size={23} />
                </motion.div>
              </div>
              <div>
                <p className="text-sm font-bold text-indigo dark:text-indigo-200">AI companion</p>
                <h2 className="text-2xl font-extrabold">Anonymous support chat</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{activePersonality.tone} mode is active. Avatar state: {avatarState.label}.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-indigo/10 bg-white/80 px-3 py-2 text-xs font-bold text-indigo shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-indigo-200">
              <ShieldCheck size={15} />
              {modeLabel} / {provider === 'openai' ? 'OpenAI' : provider === 'crisis-safety' ? 'Safety' : 'Local'}
            </div>
          </div>

          <div className="mt-5 grid gap-2 rounded-[26px] bg-white/70 p-2 dark:bg-white/10 sm:grid-cols-3">
            {personalities.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`flex items-center justify-center gap-2 rounded-[20px] px-3 py-3 text-xs font-extrabold transition ${
                    personality === item.id
                      ? 'bg-gradient-to-r from-indigo to-violet text-white shadow-lg shadow-indigo/20'
                      : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-white/10'
                  }`}
                  onClick={() => setPersonality(item.id)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex h-[75vh] min-h-[620px] flex-col max-lg:min-h-[70vh]">
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
            <div className="grid gap-4">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => {
                  const isUser = message.role === 'user';
                  return (
                    <motion.div
                      layout
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      key={`${message.content}-${index}`}
                      className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${message.isCrisis ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-200' : 'bg-mist text-indigo dark:bg-white/10 dark:text-indigo-200'}`}>
                          <Bot size={16} />
                        </div>
                      )}
                      <div
                        className={`max-w-[92%] rounded-3xl px-5 py-4 text-[15px] leading-7 shadow-sm sm:max-w-[82%] lg:max-w-[76%] ${
                          isUser
                            ? 'rounded-tr-md bg-gradient-to-r from-indigo to-violet text-white shadow-indigo/20'
                            : message.isCrisis
                              ? 'rounded-tl-md border border-red-200 bg-red-50 text-red-950 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-100'
                              : 'rounded-tl-md bg-mist text-slate-800 dark:bg-white/10 dark:text-slate-100'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className={`mt-2 text-[11px] font-semibold ${isUser ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
                          {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <AnimatePresence>
                {typing && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-lavender text-indigo dark:bg-white/10 dark:text-indigo-200">
                      <Bot size={16} />
                    </div>
                    <div className="flex w-fit items-center gap-1 rounded-full bg-mist px-4 py-3 dark:bg-white/10">
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }}
                          className="h-2 w-2 rounded-full bg-indigo dark:bg-indigo-200"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-indigo/10 bg-white/65 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40 sm:p-4">
            <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    className="shrink-0 rounded-full border border-indigo/10 bg-white/70 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-indigo dark:border-white/10 dark:bg-white/10 dark:text-slate-300"
                    onClick={() => setInput(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <select
                  className="rounded-2xl border border-indigo/10 bg-white/80 px-3 py-2 text-xs font-bold text-slate-700 outline-none dark:border-white/10 dark:bg-white/10 dark:text-white"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  aria-label="Voice language"
                >
                  {languageOptions.map((item) => (
                    <option key={item.code} value={item.code}>{item.label}</option>
                  ))}
                </select>
                <button
                  className={`rounded-2xl border border-indigo/10 p-2 transition hover:scale-105 dark:border-white/10 ${voiceEnabled ? 'bg-indigo text-white' : 'bg-white/70 text-slate-500 dark:bg-white/10'}`}
                  onClick={() => {
                    window.speechSynthesis?.cancel();
                    setVoiceEnabled((current) => !current);
                  }}
                  aria-label="Toggle AI voice replies"
                  type="button"
                >
                  {voiceEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
                </button>
              </div>
            </div>

            <div className="flex items-end gap-3 rounded-3xl border border-indigo/10 bg-white/90 p-3 shadow-lg shadow-indigo/10 dark:border-white/10 dark:bg-white/10">
              <button
                className={`rounded-full p-3 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/10 ${listening ? 'bg-indigo text-white' : 'bg-mist text-indigo dark:text-indigo-200'}`}
                aria-label="Voice input"
                onClick={startVoiceInput}
                disabled={!speechInputSupported}
                type="button"
              >
                <Mic size={18} />
              </button>
              <textarea
                className="max-h-40 min-h-16 min-w-0 flex-1 resize-none bg-transparent px-3 py-4 text-base outline-none placeholder:text-slate-400 dark:text-white"
                placeholder="Share what feels true right now..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    send();
                  }
                }}
              />
              <button className="btn-primary px-5 py-4" onClick={send} disabled={!input.trim() || typing} aria-label="Send message">
                <Send size={18} />
              </button>
            </div>
            <p className="mt-3 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              Press Enter to send. Voice input and AI speech use the selected language{voiceSupported ? '.' : ' when supported by your browser.'}
            </p>
          </div>
        </div>
      </section>

      <aside className="grid h-fit gap-4">
        <div className="panel">
          <Bot className="text-indigo dark:text-indigo-200" />
          <h3 className="mt-4 text-xl font-extrabold">Safety boundaries</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            MindCare AI offers emotional support and coping ideas. It does not diagnose, prescribe, or replace professional care.
          </p>
        </div>

        {emotion && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel bg-gradient-to-br from-white/90 to-teal-50/80 dark:from-white/10 dark:to-teal-950/30">
            <Sparkles className="text-indigo dark:text-indigo-200" />
            <h3 className="mt-4 text-xl font-extrabold">Emotion signal</h3>
            <p className="mt-2 text-sm font-bold text-indigo dark:text-indigo-200">{emotion.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{emotion.suggestion}</p>
          </motion.div>
        )}

        {voiceMood && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel bg-gradient-to-br from-white/90 to-lavender/70 dark:from-white/10 dark:to-violet/10">
            <Mic className="text-indigo dark:text-indigo-200" />
            <h3 className="mt-4 text-xl font-extrabold">Voice mood</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-indigo px-3 py-1 text-xs font-bold text-white">{voiceMood.mood}</span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-200">{voiceMood.confidence} confidence</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{voiceMood.suggestion}</p>
          </motion.div>
        )}

        {memory && (memory.goals?.length > 0 || memory.routines?.length > 0 || memory.patterns?.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel">
            <Sparkles className="text-indigo dark:text-indigo-200" />
            <h3 className="mt-4 text-xl font-extrabold">Memory</h3>
            <div className="mt-3 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
              {memory.goals?.slice(0, 2).map((item) => (
                <p key={item} className="rounded-2xl bg-lavender/70 px-3 py-2 dark:bg-white/10">Goal: {item}</p>
              ))}
              {memory.routines?.slice(0, 2).map((item) => (
                <p key={item} className="rounded-2xl bg-white/70 px-3 py-2 dark:bg-white/10">Routine: {item}</p>
              ))}
              {memory.patterns?.slice(0, 2).map((item) => (
                <p key={item} className="rounded-2xl bg-white/70 px-3 py-2 dark:bg-white/10">Pattern: {item}</p>
              ))}
            </div>
          </motion.div>
        )}

        {resources.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel border-red-200 bg-red-50/90 dark:border-red-900/50 dark:bg-red-950/25">
            <p className="flex items-center gap-2 text-sm font-extrabold text-red-700 dark:text-red-200">
              <Sparkles size={16} /> Crisis resources
            </p>
            <div className="mt-4 grid gap-3">
              {resources.map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/80 p-3 text-sm dark:bg-white/10">
                  <p className="font-bold">{item.label}</p>
                  <p className="mt-1 text-red-800 dark:text-red-100">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </aside>
    </div>
  );
}
