import Chat   from '../models/chat.model.js';
import Memory from '../models/memory.model.js';

import { generateSupportiveReply, streamSupportiveReply, classifyMessageTone } from '../utils/ai.js';
import { detectCrisis, buildCrisisReply, crisisResources }                     from '../utils/crisis.js';
import { detectEmotion }                                                        from '../utils/emotion.js';
import { applyMemoryPatch, extractMemoryPatch }                                 from '../utils/memory.js';

/* ── helpers ── */
async function getOrCreateChat(userId, personality) {
  let chat = await Chat.findOne({ user: userId }).sort({ updatedAt: -1 });
  if (!chat) chat = await Chat.create({ user: userId, personality, messages: [] });
  return chat;
}

async function getOrCreateMemory(userId) {
  return Memory.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, goals: [], routines: [], patterns: [] } },
    { new: true, upsert: true }
  );
}

/* ═══════════════════════════════════════
   GET /chat — load chat history
═══════════════════════════════════════ */
export async function getChat(req, res, next) {
  try {
    const chat = await Chat.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ chat: chat || { messages: [], personality: 'friend' } });
  } catch (err) { next(err); }
}

/* ═══════════════════════════════════════
   POST /chat/stream — SSE streaming
═══════════════════════════════════════ */
export async function streamChat(req, res, next) {
  try {
    const { message, personality = 'friend', language = 'en-US' } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const crisis  = detectCrisis(message);
    const emotion = detectEmotion(message);
    const { mode } = classifyMessageTone(message);

    /* SSE headers */
    res.setHeader('Content-Type',  'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection',    'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

    /* Crisis short-circuit */
    if (crisis.isCrisis) {
      const reply = buildCrisisReply(crisis.severity);
      send({ token: reply, done: true, fullResponse: reply, crisis: true, resources: crisisResources, mode: 'crisis', emotion });
      return res.end();
    }

    /* Load chat + memory */
    const chat   = await getOrCreateChat(req.user._id, personality);
    chat.personality = personality;
    const history = chat.messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));

    let memory = await getOrCreateMemory(req.user._id);
    const patch = extractMemoryPatch(message, emotion);
    memory = applyMemoryPatch(memory, patch);
    await memory.save();

    /* Save user message */
    chat.messages.push({ role: 'user', content: message, isCrisis: false });

    /* Stream from OpenAI */
    let fullResponse = '';
    try {
      const stream = await streamSupportiveReply({ message, personality, history, memory, language });

      for await (const chunk of stream) {
        const token = chunk.choices?.[0]?.delta?.content;
        if (token) {
          fullResponse += token;
          send({ token });
        }
      }
    } catch (streamErr) {
      /* OpenAI unavailable — use local reply */
      console.error('[Chat/stream] OpenAI error:', streamErr.message);
      const { reply } = await generateSupportiveReply({ message, personality, history, language, memory });
      fullResponse = reply;
      send({ token: reply });
    }

    /* Save AI message */
    chat.messages.push({ role: 'assistant', content: fullResponse, isCrisis: false });
    await chat.save();

    /* End stream */
    send({ done: true, fullResponse, emotion, mode, crisis: false, resources: [] });
    res.end();

  } catch (err) {
    console.error('[Chat/stream] Fatal:', err.message);
    try {
      res.write(`data: ${JSON.stringify({ token: "I'm here with you — something went wrong on my end. Please try again.", done: true, fullResponse: '', crisis: false })}\n\n`);
      res.end();
    } catch {}
  }
}

/* ═══════════════════════════════════════
   POST /chat — non-stream fallback
═══════════════════════════════════════ */
export async function sendMessage(req, res, next) {
  try {
    const { message, personality = 'friend', language = 'en-US' } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const crisis  = detectCrisis(message);
    const emotion = detectEmotion(message);

    const chat    = await getOrCreateChat(req.user._id, personality);
    const history = chat.messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));

    let memory = await getOrCreateMemory(req.user._id);
    memory = applyMemoryPatch(memory, extractMemoryPatch(message, emotion));
    await memory.save();

    chat.messages.push({ role: 'user', content: message, isCrisis: crisis.isCrisis });

    const aiResult = crisis.isCrisis
      ? { reply: buildCrisisReply(crisis.severity), provider: 'crisis', mode: 'crisis' }
      : await generateSupportiveReply({ message, personality, history, language, memory });

    console.log(`[Chat] provider: ${aiResult.provider} · mode: ${aiResult.mode}`);

    chat.messages.push({ role: 'assistant', content: aiResult.reply, isCrisis: false });
    await chat.save();

    res.json({
      reply:     aiResult.reply,
      provider:  aiResult.provider,
      mode:      aiResult.mode,
      emotion,
      crisis:    crisis.isCrisis,
      resources: crisis.isCrisis ? crisisResources : [],
    });

  } catch (err) { next(err); }
}