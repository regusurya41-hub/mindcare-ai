import OpenAI from "openai";

/* =========================
   CLIENT
========================= */

let client;

function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return client;
}

/* =========================
   CONFIG
========================= */

const personalities = {
  friend:
    "You sound like a warm, validating friend. Be gentle, concise, and practical.",
  guide:
    "You sound like a calm mindfulness guide. Use grounding language and steady pacing.",
  coach:
    "You sound like a compassionate motivational coach. Encourage agency without pressure.",
};

const languageNames = {
  "en-US": "English",
  "hi-IN": "Hindi",
  "te-IN": "Telugu",
  "ta-IN": "Tamil",
  "kn-IN": "Kannada",
  "es-ES": "Spanish",
};

/* =========================
   INTENT + TONE
========================= */

const intentRules = [
  { intent: "greeting", patterns: [/\b(hi|hello|hey)\b/i] },
  { intent: "sadness", patterns: [/\b(sad|lonely|depressed|hurt)\b/i] },
  { intent: "anxiety", patterns: [/\b(anxious|panic|stress|worried)\b/i] },
  { intent: "motivation", patterns: [/\b(lazy|stuck|unmotivated)\b/i] },
];

function detectIntent(message) {
  const match = intentRules.find((r) =>
    r.patterns.some((p) => p.test(message))
  );
  return match?.intent || "fallback";
}

const toneByIntent = {
  greeting: "casual",
  sadness: "support",
  anxiety: "support",
  motivation: "motivation",
  fallback: "neutral",
};

export function classifyMessageTone(message = "") {
  const intent = detectIntent(message);

  return {
    intent,
    mode: toneByIntent[intent] || "neutral",
  };
}

/* =========================
   MEMORY FORMATTER (SAFE)
========================= */

function formatMemory(memory) {
  if (!memory) return "";

  return {
    goals: memory.goals?.slice(0, 5) || [],
    routines: memory.routines?.slice(0, 5) || [],
    patterns: memory.patterns?.slice(0, 5) || [],
  };
}

/* =========================
   SAFE RESPONSE CLEANER
========================= */

function cleanReply(text = "") {
  return text
    .trim()
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, 2000);
}

/* =========================
   PROMPT BUILDER
========================= */

function buildSystemPrompt({
  personality,
  mode,
  intent,
  language,
  memory,
}) {
  return `
You are MindCare AI, an emotional support assistant.

Rules:
- Be human, warm, and simple
- Avoid medical diagnosis
- Keep responses short (2–6 lines)
- Focus on one idea at a time
- Be emotionally aware, not robotic

Personality: ${personality}
Mode: ${mode}
Intent: ${intent}
Language: ${languageNames[language] || "English"}

Memory (use only if relevant):
${JSON.stringify(formatMemory(memory))}

Style:
${personalities[personality] || personalities.friend}
`.trim();
}

/* =========================
   NON-STREAM (FALLBACK)
========================= */

function localReply(intent) {
  const map = {
    greeting: "Hey, I’m here with you.",
    sadness: "I’m here. What feels heavy right now?",
    anxiety: "Let’s slow this down together.",
    fallback: "I’m listening. Tell me more.",
  };

  return map[intent] || map.fallback;
}

/* =========================
   STREAM FUNCTION (CHATGPT MODE)
========================= */

export async function streamSupportiveReply({
  message,
  personality = "friend",
  history = [],
  memory = null,
  language = "en-US",
}) {
  const openai = getClient();

  if (!openai) throw new Error("OpenAI not configured");

  const { intent, mode } = classifyMessageTone(message);

  const system = buildSystemPrompt({
    personality,
    mode,
    intent,
    language,
    memory,
  });

  const messages = [
    { role: "system", content: system },
    ...history.slice(-6),
    { role: "user", content: message },
  ];

  return openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages,
    temperature: 0.7,
    max_tokens: 300,
    stream: true,
  });
}

/* =========================
   NORMAL RESPONSE (NON-STREAM)
========================= */

export async function generateSupportiveReply({
  message,
  personality = "friend",
  history = [],
  language = "en-US",
  memory = null,
}) {
  const openai = getClient();
  const { intent, mode } = classifyMessageTone(message);

  if (!openai) {
    return {
      reply: localReply(intent),
      provider: "local",
      intent,
      mode,
    };
  }

  const system = buildSystemPrompt({
    personality,
    mode,
    intent,
    language,
    memory,
  });

  const messages = [
    { role: "system", content: system },
    ...history.slice(-6),
    { role: "user", content: message },
  ];

  try {
    const completion = await Promise.race([
      openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 300,
      }),

      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 15000)
      ),
    ]);

    const reply = cleanReply(
      completion?.choices?.[0]?.message?.content
    );

    return {
      reply: reply || localReply(intent),
      provider: "openai",
      intent,
      mode,
    };
  } catch (err) {
    console.error("AI error:", err.message);

    return {
      reply: localReply(intent),
      provider: "fallback",
      intent,
      mode,
    };
  }
}