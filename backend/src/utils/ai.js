import OpenAI from "openai";

/* ── Client singleton ── */
let client;

function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

/* ── Personality prompts ── */
const personalities = {
  friend: "You are a warm, caring friend who listens without judgment. Use casual, gentle language. Validate feelings before offering perspective.",
  guide:  "You are a calm mindfulness guide. Use grounded, present-moment language. Encourage breathing, awareness, and self-compassion.",
  coach:  "You are a compassionate motivational coach. Focus on small actionable steps. Encourage agency without adding pressure.",
};

const languageNames = {
  "en-US": "English", "hi-IN": "Hindi", "te-IN": "Telugu",
  "ta-IN": "Tamil",   "kn-IN": "Kannada", "es-ES": "Spanish",
};

/* ── Intent detection ── */
const intentRules = [
  { intent: "greeting",   patterns: [/\b(hi|hello|hey|good morning|good evening|good afternoon)\b/i] },
  { intent: "sadness",    patterns: [/\b(sad|lonely|depressed|hurt|crying|empty|hopeless|worthless|heartbroken|miserable)\b/i] },
  { intent: "anxiety",    patterns: [/\b(anxious|anxiety|panic|worried|worry|nervous|overthinking|scared|afraid|stress|stressed|stressful|tense|dread|fearful)\b/i] },
  { intent: "motivation", patterns: [/\b(lazy|stuck|unmotivated|procrastin|can't start|no motivation|no drive|apathetic)\b/i] },
  { intent: "tired",      patterns: [/\b(tired|exhausted|burnout|burned out|drained|sleepy|no energy|depleted|fatigue)\b/i] },
  { intent: "anger",      patterns: [/\b(angry|mad|furious|rage|irritated|frustrated|annoyed|resentment|bitter|fed up)\b/i] },
  { intent: "lonely",     patterns: [/\b(lonely|alone|isolated|no one|nobody|disconnected|unseen|left out|no friends)\b/i] },
  { intent: "gratitude",  patterns: [/\b(grateful|thankful|happy|better|great|excited|content|peaceful|proud|hopeful)\b/i] },
];

export function classifyMessageTone(message = "") {
  const match = intentRules.find((r) => r.patterns.some((p) => p.test(message)));
  const intent = match?.intent || "fallback";
  const modeMap = {
    greeting: "casual", sadness: "deep-support", anxiety: "support",
    motivation: "motivation", tired: "support", anger: "support",
    lonely: "deep-support", gratitude: "positive", fallback: "neutral",
  };
  return { intent, mode: modeMap[intent] || "neutral" };
}

/* ── Memory formatter ── */
function formatMemory(memory) {
  if (!memory) return "No prior context.";
  return JSON.stringify({
    goals:    memory.goals?.slice(0, 5)    || [],
    routines: memory.routines?.slice(0, 5) || [],
    patterns: memory.patterns?.slice(0, 5) || [],
  });
}

/* ── Response cleaner ── */
function cleanReply(text = "") {
  return text.trim().replace(/\n{3,}/g, "\n\n").slice(0, 2000);
}

/* ── System prompt ── */
function buildSystemPrompt({ personality, mode, intent, language, memory }) {
  return `
You are MindCare AI — a private, compassionate emotional wellness companion.

CRITICAL RULES:
- NEVER give the same response twice in a conversation
- NEVER start your response with "I" — vary your openings
- Keep responses SHORT — 2 to 5 sentences maximum
- Always end with ONE gentle follow-up question
- Be warm and human — never clinical or robotic
- Do NOT diagnose, prescribe, or claim to be a therapist
- If the user seems in crisis, gently encourage professional help

PERSONALITY STYLE: ${personalities[personality] || personalities.friend}
CURRENT EMOTIONAL MODE: ${mode}
DETECTED INTENT: ${intent}
RESPOND IN: ${languageNames[language] || "English"}

USER MEMORY CONTEXT (use subtly if relevant):
${formatMemory(memory)}
`.trim();
}

/* ── Varied local fallbacks (when OpenAI unavailable) ── */
const localReplies = {
  greeting:   ["Hey, really glad you're here. How are you feeling right now?", "Hi there 😊 What's on your mind today?", "Hello! I'm here with you. What would you like to talk about?"],
  sadness:    ["That sounds really painful — I'm here with you. What feels heaviest right now?", "Thank you for trusting me with that. Can you tell me a little more about what's going on?", "I hear you 💙 You don't have to carry this alone. What happened?", "That takes real courage to share. What's been weighing on you most?"],
  anxiety:    ["Let's slow this down together. What's your mind racing about the most?", "That anxious feeling is real, and you don't have to fight it alone. What feels most out of control right now?", "You're safe here. Let's take this one thing at a time — what's the biggest worry today?", "Anxiety can feel so overwhelming. Can you take one slow breath with me first?"],
  motivation: ["Getting started is often the hardest part. What's the smallest possible step you could take right now?", "I hear you — motivation can feel impossible sometimes. What's been blocking you?", "Let's not think about everything at once. What's just one thing you could do in the next 10 minutes?", "You've done hard things before. What usually helps you get unstuck?"],
  tired:      ["It sounds like you really need rest. Is this physical tiredness or emotional too?", "Exhaustion runs deep sometimes. What do you think you need most right now?", "Your body and mind are telling you something important. Have you had a moment to pause today?"],
  anger:      ["That frustration makes complete sense. What happened?", "It's okay to feel angry — sometimes anger is pointing at something important. What set this off?", "I hear the frustration. Let's figure out what's really going on underneath it."],
  lonely:     ["Feeling alone is one of the hardest feelings. Is there anyone you've been able to talk to lately?", "Loneliness is a signal, not a permanent state. What does connection look like for you right now?", "You reached out here, and that matters. What's been making you feel disconnected?"],
  gratitude:  ["That's really wonderful to hear! What made things feel better today?", "I love hearing that 😊 What's been different lately?", "That's a great sign. It's so important to notice the good things — what happened?"],
  fallback:   ["I'm here and I'm listening. What's been on your mind most today?", "Thank you for sharing that with me. Can you tell me a little more?", "That sounds important. How long have you been feeling this way?", "I want to understand better. What would feel most helpful right now — venting, advice, or just being heard?", "I'm here for you. What's going on?"],
};

function localReply(intent) {
  const options = localReplies[intent] || localReplies.fallback;
  return options[Math.floor(Math.random() * options.length)];
}

/* ── Stream (SSE) ── */
export async function streamSupportiveReply({ message, personality = "friend", history = [], memory = null, language = "en-US" }) {
  const openai = getClient();
  if (!openai) throw new Error("OpenAI not configured");

  const { intent, mode } = classifyMessageTone(message);
  const system = buildSystemPrompt({ personality, mode, intent, language, memory });
  const messages = [
    { role: "system", content: system },
    ...history.slice(-8),
    { role: "user", content: message },
  ];

  return openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages,
    temperature: 0.85,
    max_tokens:  350,
    stream:      true,
  });
}

/* ── Non-stream (REST fallback) ── */
export async function generateSupportiveReply({ message, personality = "friend", history = [], language = "en-US", memory = null }) {
  const openai = getClient();
  const { intent, mode } = classifyMessageTone(message);

  if (!openai) {
    console.log(`[AI] No OpenAI key — using local reply · intent: ${intent}`);
    return { reply: localReply(intent), provider: "local", intent, mode };
  }

  const system   = buildSystemPrompt({ personality, mode, intent, language, memory });
  const messages = [
    { role: "system", content: system },
    ...history.slice(-8),
    { role: "user", content: message },
  ];

  try {
    const completion = await Promise.race([
      openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages,
        temperature: 0.85,
        max_tokens:  350,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 15000)),
    ]);

    const reply = cleanReply(completion?.choices?.[0]?.message?.content);
    console.log(`[AI] OpenAI reply sent · intent: ${intent} · mode: ${mode}`);
    return { reply: reply || localReply(intent), provider: "openai", intent, mode };
  } catch (err) {
    console.error("[AI] OpenAI error:", err.message);
    return { reply: localReply(intent), provider: "fallback", intent, mode };
  }
}