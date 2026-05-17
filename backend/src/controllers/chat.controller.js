import Chat from '../models/chat.model.js';
import Memory from '../models/memory.model.js';
import { generateSupportiveReply } from '../utils/ai.js';
import { crisisResponse, detectCrisis } from '../utils/crisis.js';
import { detectEmotion } from '../utils/emotion.js';
import { applyMemoryPatch, extractMemoryPatch } from '../utils/memory.js';

export async function getChat(req, res, next) {
  try {
    const chat = await Chat.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ chat: chat || { messages: [], personality: 'friend' } });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { message, personality = 'friend', language = 'en-US' } = req.body;
    const isCrisis = detectCrisis(message);
    const emotion = detectEmotion(message);
    let chat = await Chat.findOne({ user: req.user._id }).sort({ updatedAt: -1 });

    if (!chat) {
      chat = await Chat.create({ user: req.user._id, personality, messages: [] });
    }

    chat.personality = personality;
    const previousMessages = chat.messages.map((item) => ({ role: item.role, content: item.content }));
    let memory = await Memory.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id, goals: [], routines: [], patterns: [] } },
      { new: true, upsert: true }
    );

    memory = applyMemoryPatch(memory, extractMemoryPatch(message, emotion));
    await memory.save();

    chat.messages.push({ role: 'user', content: message, isCrisis });

    const aiResult = isCrisis
      ? { reply: crisisResponse.reply, provider: 'crisis-safety', mode: 'crisis' }
      : await generateSupportiveReply({ message, personality, history: previousMessages, language, memory });

    chat.messages.push({ role: 'assistant', content: aiResult.reply, isCrisis });
    await chat.save();

    res.json({
      reply: aiResult.reply,
      provider: aiResult.provider,
      mode: aiResult.mode,
      isCrisis,
      emotion,
      memory,
      resources: isCrisis ? crisisResponse.resources : [],
      chat
    });
  } catch (error) {
    next(error);
  }
}
