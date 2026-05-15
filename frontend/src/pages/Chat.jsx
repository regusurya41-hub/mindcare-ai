import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Brain, HeartHandshake, Mic, Send, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/client.js';

const personalities = [
  { id: 'friend', label: 'Friendly Friend', icon: HeartHandshake, tone: 'Warm validation' },
  { id: 'guide', label: 'Calm Guide', icon: Brain, tone: 'Grounded reflection' },
  { id: 'coach', label: 'Motivational Coach', icon: Wand2, tone: 'Kind momentum' }
];

const messageVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 }
};

const quickPrompts = [
  'I feel anxious and need grounding.',
  'Help me reflect on my day.',
  'Give me a gentle motivation boost.',
  'I need a two-minute calming exercise.'
];

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
  const bottomRef = useRef(null);
  const recognition = useMemo(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const instance = new SpeechRecognition();
    instance.continuous = false;
    instance.interimResults = false;
    instance.lang = 'en-US';
    return instance;
  }, []);

  useEffect(() => {
    api
      .get('/chat')
      .then(({ data }) => {
        if (data.chat?.messages?.length) setMessages(data.chat.messages);
        if (data.chat?.personality) setPersonality(data.chat.personality);
      })
      .catch(() => {});
  }, []);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, typing]);

  async function send() {
    if (!input.trim() || typing) return;
    const content = input.trim();
    setInput('');
    setMessages((current) => [...current, { role: 'user', content, createdAt: new Date().toISOString() }]);
    setTyping(true);

    try {
      const { data } = await api.post('/chat', { message: content, personality });
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: data.reply, isCrisis: data.isCrisis, createdAt: new Date().toISOString() }
      ]);
      setResources(data.resources || []);
      setEmotion(data.emotion || null);
      setProvider(data.provider || 'local');
    } catch (_error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'I had trouble connecting. Try again in a moment, and if this is urgent, contact local emergency support now.',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setTyping(false);
    }
  }

  function startVoiceInput() {
    if (!recognition || listening) return;
    setListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) setInput((current) => `${current} ${transcript}`.trim());
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
  }

  const activePersonality = personalities.find((item) => item.id === personality) || personalities[0];

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white/75 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50">
        <div className="border-b border-indigo/10 bg-gradient-to-r from-white/95 via-lavender/70 to-teal-50/80 p-4 dark:border-white/10 dark:from-white/10 dark:via-violet/10 dark:to-teal-950/20 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, -4, 4, 0], scale: [1, 1.04, 1] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo to-violet text-white shadow-lg shadow-indigo/20"
              >
                <Bot size={23} />
              </motion.div>
              <div>
                <p className="text-sm font-bold text-indigo dark:text-indigo-200">AI companion</p>
                <h2 className="text-2xl font-extrabold">Anonymous support chat</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{activePersonality.tone} mode is active.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-indigo/10 bg-white/80 px-3 py-2 text-xs font-bold text-indigo shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-indigo-200">
              <ShieldCheck size={15} />
              {provider === 'openai' ? 'OpenAI active' : provider === 'crisis-safety' ? 'Safety mode' : 'Smart fallback'}
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

        <div className="flex h-[calc(100vh-320px)] min-h-[430px] flex-col">
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
                        <div
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                            message.isCrisis
                              ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-200'
                              : 'bg-mist text-lagoon dark:bg-white/10 dark:text-teal-200'
                          }`}
                        >
                          <Bot size={16} />
                        </div>
                      )}
                      <div
                        className={`max-w-[88%] rounded-[26px] px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[76%] ${
                          isUser
                            ? 'rounded-br-md bg-lagoon text-white shadow-teal-900/15'
                            : message.isCrisis
                              ? 'rounded-bl-md border border-red-200 bg-red-50 text-red-950 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-100'
                              : 'rounded-bl-md bg-mist text-slate-800 dark:bg-white/10 dark:text-slate-100'
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
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-mist text-lagoon dark:bg-white/10 dark:text-teal-200">
                      <Bot size={16} />
                    </div>
                    <div className="flex w-fit items-center gap-1 rounded-full bg-mist px-4 py-3 dark:bg-white/10">
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }}
                          className="h-2 w-2 rounded-full bg-lagoon dark:bg-teal-200"
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
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
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
            <div className="flex items-end gap-3 rounded-[28px] border border-indigo/10 bg-white/90 p-2 shadow-sm dark:border-white/10 dark:bg-white/10">
              <button
                className={`rounded-full p-3 transition hover:scale-105 dark:bg-white/10 ${listening ? 'bg-indigo text-white' : 'bg-mist text-indigo dark:text-indigo-200'}`}
                aria-label="Voice input"
                onClick={startVoiceInput}
                type="button"
              >
                <Mic size={18} />
              </button>
              <textarea
                className="max-h-32 min-h-12 min-w-0 flex-1 resize-none bg-transparent px-2 py-3 text-sm outline-none placeholder:text-slate-400 dark:text-white"
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
              <button className="btn-primary px-4 py-3" onClick={send} disabled={!input.trim() || typing} aria-label="Send message">
                <Send size={18} />
              </button>
            </div>
            <p className="mt-3 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">Press Enter to send. Use Shift Enter for a new line.</p>
          </div>
        </div>
      </section>

      <aside className="grid h-fit gap-4">
        <div className="panel">
          <Bot className="text-lagoon dark:text-teal-200" />
          <h3 className="mt-4 text-xl font-extrabold">Safety boundaries</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            MindCare AI offers emotional support and coping ideas. It does not diagnose, prescribe, or replace professional care.
          </p>
        </div>

        {emotion && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel bg-gradient-to-br from-white/90 to-teal-50/80 dark:from-white/10 dark:to-teal-950/30">
            <Sparkles className="text-lagoon dark:text-teal-200" />
            <h3 className="mt-4 text-xl font-extrabold">Emotion signal</h3>
            <p className="mt-2 text-sm font-bold text-lagoon dark:text-teal-200">{emotion.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{emotion.suggestion}</p>
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
