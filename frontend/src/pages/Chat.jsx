import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  Brain,
  HeartHandshake,
  Mic,
  Send,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  Wand2
} from 'lucide-react';
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

  const match = voiceMoodRules.find((rule) =>
    rule.terms.some((term) => normalized.includes(term))
  );

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
    {
      role: 'assistant',
      content: 'Hi 👋 I am here to listen. What is on your mind today?',
      createdAt: new Date().toISOString()
    }
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

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [charCount, setCharCount] = useState(0);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    setVoiceSupported('speechSynthesis' in window);
    return () => window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);

    window.addEventListener('online', online);
    window.addEventListener('offline', offline);

    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  useEffect(() => {
    api
      .get('/chat')
      .then(({ data }) => {
        if (data.chat?.messages?.length) setMessages(data.chat.messages);
        if (data.chat?.personality) setPersonality(data.chat.personality);
      })
      .catch(() => {});

    api
      .get('/memory')
      .then(({ data }) => setMemory(data.memory))
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  function speakReply(text, replyMode = mode) {
    if (!voiceEnabled || !('speechSynthesis' in window) || !text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = language;
    utterance.rate =
      replyMode === 'support' ||
      replyMode === 'deep-support' ||
      replyMode === 'crisis'
        ? 0.86
        : 0.96;

    utterance.pitch =
      replyMode === 'casual' || replyMode === 'positive'
        ? 1.05
        : 0.92;

    utterance.volume = 0.9;

    const voices = window.speechSynthesis.getVoices();

    const voice =
      voices.find((item) => item.lang === language) ||
      voices.find((item) =>
        item.lang?.startsWith(language.split('-')[0])
      );

    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  }

  async function send() {
  if (!input.trim() || typing || sending) return;

  if (!isOnline) {
    setMessages((current) => [
      ...current,
      {
        role: 'assistant',
        content:
          '⚠️ Internet connection lost. Please reconnect and try again.',
        createdAt: new Date().toISOString()
      }
    ]);
    return;
  }

  const content = input.trim();
  const lower = content.toLowerCase();

  setInput('');
  setCharCount(0);

  setMessages((current) => [
    ...current,
    {
      role: 'user',
      content,
      createdAt: new Date().toISOString()
    }
  ]);

  setTyping(true);
  setSending(true);

  try {
    let smartReply = null;
    let detectedMode = 'casual';

    // Greetings
    if (
      ['hi', 'hello', 'hey', 'hii', 'yo'].includes(lower)
    ) {
      const replies = [
        'Hey 👋 How has your day been so far?',
        'Hello 🌸 What is on your mind today?',
        'Hi 💜 Feeling okay today?',
        'Hey 😊 Want to talk about something or just chill?'
      ];

      smartReply =
        replies[Math.floor(Math.random() * replies.length)];
    }

    // Sad emotions
    else if (
      lower.includes('sad') ||
      lower.includes('depressed') ||
      lower.includes('lonely') ||
      lower.includes('cry') ||
      lower.includes('hurt')
    ) {
      detectedMode = 'deep-support';

      const replies = [
        'I am really sorry you are feeling this way 💜 What has been hurting you the most lately?',
        'That sounds emotionally exhausting 🌧️ Want to talk more about what happened?',
        'You do not need to handle everything alone 🤍 What has been on your mind recently?'
      ];

      smartReply =
        replies[Math.floor(Math.random() * replies.length)];
    }

    // Anxiety / stress
    else if (
      lower.includes('stress') ||
      lower.includes('anxious') ||
      lower.includes('panic') ||
      lower.includes('overthinking') ||
      lower.includes('worried')
    ) {
      detectedMode = 'support';

      const replies = [
        'Overthinking can drain your energy 🫂 What thoughts keep repeating in your mind?',
        'Take one slow breath 🌿 What is making you feel stressed right now?',
        'You are safe here 💙 What has been worrying you the most today?'
      ];

      smartReply =
        replies[Math.floor(Math.random() * replies.length)];
    }

    // Motivation
    else if (
      lower.includes('study') ||
      lower.includes('motivation') ||
      lower.includes('lazy') ||
      lower.includes('focus')
    ) {
      detectedMode = 'motivation';

      const replies = [
        'You do not need perfect motivation to begin ✨ What small task can you finish right now?',
        'Progress matters more than perfection 🚀 What are you trying to focus on?',
        'Some days feel mentally heavier 🌱 Want help making a simple study routine?'
      ];

      smartReply =
        replies[Math.floor(Math.random() * replies.length)];
    }

    // Happy mood
    else if (
      lower.includes('happy') ||
      lower.includes('good') ||
      lower.includes('great') ||
      lower.includes('better') ||
      lower.includes('excited')
    ) {
      detectedMode = 'positive';

      const replies = [
        'That is wonderful 🌸 What made today feel better?',
        'I am happy to hear that 😊 Want to share the best part of your day?',
        'That positive energy matters ✨ What changed recently?'
      ];

      smartReply =
        replies[Math.floor(Math.random() * replies.length)];
    }

    // Anger
    else if (
      lower.includes('angry') ||
      lower.includes('mad') ||
      lower.includes('frustrated') ||
      lower.includes('annoyed')
    ) {
      detectedMode = 'support';

      const replies = [
        'That sounds frustrating 😔 What happened?',
        'Anger usually hides stress or hurt underneath 💭 Want to talk about it?',
        'I understand 🌧️ What is bothering you the most right now?'
      ];

      smartReply =
        replies[Math.floor(Math.random() * replies.length)];
    }

    // Casual fallback
    else {
      const casualReplies = [
        'Hmm 🤔 Tell me more about that.',
        'That sounds interesting ✨',
        'I am listening 👀',
        'How does that make you feel?',
        'Want to go deeper into that topic?'
      ];

      smartReply =
        casualReplies[
          Math.floor(Math.random() * casualReplies.length)
        ];
    }

    // Smart local reply
    setTimeout(() => {
      const assistantMessage = {
        role: 'assistant',
        content: smartReply,
        createdAt: new Date().toISOString()
      };

      setMessages((current) => [
        ...current,
        assistantMessage
      ]);

      setMode(detectedMode);

      speakReply(smartReply, detectedMode);

      setTyping(false);
      setSending(false);
    }, 800);

  } catch (_error) {
    const fallback =
      'Something went wrong 🌐 Please try again in a moment.';

    setMessages((current) => [
      ...current,
      {
        role: 'assistant',
        content: fallback,
        createdAt: new Date().toISOString()
      }
    ]);

    speakReply(fallback, 'support');

    setTyping(false);
    setSending(false);
  }
}

  function startVoiceInput() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

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

  const activePersonality =
    personalities.find((item) => item.id === personality) ||
    personalities[0];

  const modeLabel =
    {
      casual: 'Casual Companion',
      positive: 'Positive Mode',
      neutral: 'Balanced Mode',
      support: 'Support Mode',
      'deep-support': 'Deep Support',
      motivation: 'Motivation Mode',
      crisis: 'Safety Mode'
    }[mode] || 'Balanced Mode';

  const speechInputSupported =
    'SpeechRecognition' in window ||
    'webkitSpeechRecognition' in window;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 xl:grid-cols-[minmax(0,2fr)_300px]">
      <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white/75 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/50">

        <div className="border-b border-indigo/10 bg-gradient-to-r from-white/95 via-lavender/70 to-teal-50/80 p-4 dark:border-white/10 dark:from-white/10 dark:via-violet/10 dark:to-teal-950/20 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">

            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl bg-indigo/20 blur-xl"
                />

                <motion.div
                  animate={{ rotate: [0, -4, 4, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo to-violet text-white shadow-lg"
                >
                  <Bot size={23} />
                </motion.div>
              </div>

              <div>
                <p className="text-sm font-bold text-indigo dark:text-indigo-200">
                  AI companion
                </p>

                <h2 className="text-2xl font-extrabold">
                  Anonymous support chat
                </h2>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {activePersonality.tone} mode is active.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-indigo/10 bg-white/80 px-3 py-2 text-xs font-bold text-indigo shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-indigo-200">
              <ShieldCheck size={15} />
              {modeLabel} / {provider}
            </div>
          </div>
        </div>

        <div className="flex h-[75vh] min-h-[620px] flex-col">

          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
            <div className="grid gap-4">

              <AnimatePresence initial={false}>
                {messages.map((message, index) => {
                  const isUser = message.role === 'user';

                  return (
                    <motion.div
                      key={`${message.content}-${index}`}
                      layout
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.22 }}
                      className={`flex items-end gap-2 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isUser && (
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist text-indigo dark:bg-white/10 dark:text-indigo-200">
                          <Bot size={16} />
                        </div>
                      )}

                      <div
                        className={`max-w-[92%] rounded-3xl px-5 py-4 text-[15px] leading-7 shadow-sm ${
                          isUser
                            ? 'rounded-tr-md bg-gradient-to-r from-indigo to-violet text-white'
                            : 'rounded-tl-md bg-mist text-slate-800 dark:bg-white/10 dark:text-slate-100'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">
                          {message.content}
                        </p>

                        <p
                          className={`mt-2 text-[11px] font-semibold ${
                            isUser
                              ? 'text-white/70'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-lavender text-indigo">
                      <Bot size={16} />
                    </div>

                    <div className="flex w-fit items-center gap-1 rounded-full bg-mist px-4 py-3">
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          animate={{
                            opacity: [0.3, 1, 0.3],
                            y: [0, -3, 0]
                          }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: dot * 0.15
                          }}
                          className="h-2 w-2 rounded-full bg-indigo"
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
                  className="shrink-0 rounded-full border border-indigo/10 bg-white/70 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-white hover:text-indigo"
                  onClick={() => {
                    setInput(prompt);
                    setCharCount(prompt.length);
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-3 rounded-3xl border border-indigo/10 bg-white/90 p-3 shadow-lg">

              <button
                className={`rounded-full p-3 transition hover:scale-105 ${
                  listening
                    ? 'bg-indigo text-white'
                    : 'bg-mist text-indigo'
                }`}
                aria-label="Voice input"
                onClick={startVoiceInput}
                disabled={!speechInputSupported}
                type="button"
              >
                <Mic size={18} />
              </button>

              <div className="flex-1">
                <textarea
                  className="max-h-40 min-h-16 w-full resize-none bg-transparent px-3 py-4 text-base outline-none placeholder:text-slate-400 dark:text-white"
                  placeholder="Share what feels true right now..."
                  value={input}
                  maxLength={500}
                  onChange={(event) => {
                    setInput(event.target.value);
                    setCharCount(event.target.value.length);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      send();
                    }
                  }}
                />

                <div className="flex items-center justify-between px-3 pb-1">
                  <span className="text-[11px] text-slate-400">
                    {isOnline ? '🟢 Online' : '🔴 Offline'}
                  </span>

                  <span
                    className={`text-[11px] ${
                      charCount > 450
                        ? 'text-red-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {charCount}/500
                  </span>
                </div>
              </div>

              <button
                className={`btn-primary px-5 py-4 transition-all duration-300 ${
                  sending
                    ? 'opacity-70 scale-95'
                    : 'hover:scale-105'
                }`}
                onClick={send}
                disabled={!input.trim() || typing || sending}
                aria-label="Send message"
              >
                {sending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: 'linear'
                    }}
                    className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                  />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between px-2">

              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Press Enter to send
              </p>

              <button
                className={`rounded-2xl border border-indigo/10 p-2 transition hover:scale-105 ${
                  voiceEnabled
                    ? 'bg-indigo text-white'
                    : 'bg-white/70 text-slate-500'
                }`}
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setVoiceEnabled((current) => !current);
                }}
                type="button"
              >
                {voiceEnabled ? (
                  <Volume2 size={17} />
                ) : (
                  <VolumeX size={17} />
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      <aside className="grid h-fit gap-4">

        <div className="panel">
          <Bot className="text-indigo dark:text-indigo-200" />

          <h3 className="mt-4 text-xl font-extrabold">
            Safety boundaries
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            MindCare AI offers emotional support and coping ideas.
            It does not diagnose or replace professional care.
          </p>
        </div>

        {emotion && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel"
          >
            <Sparkles className="text-indigo dark:text-indigo-200" />

            <h3 className="mt-4 text-xl font-extrabold">
              Emotion signal
            </h3>

            <p className="mt-2 text-sm font-bold text-indigo dark:text-indigo-200">
              {emotion.label}
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {emotion.suggestion}
            </p>
          </motion.div>
        )}

        {voiceMood && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel"
          >
            <Mic className="text-indigo dark:text-indigo-200" />

            <h3 className="mt-4 text-xl font-extrabold">
              Voice mood
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-indigo px-3 py-1 text-xs font-bold text-white">
                {voiceMood.mood}
              </span>

              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-600">
                {voiceMood.confidence} confidence
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {voiceMood.suggestion}
            </p>
          </motion.div>
        )}
      </aside>
    </div>
  );
}