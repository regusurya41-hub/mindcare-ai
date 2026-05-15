import Chat from '../models/chat.model.js';
import { generateSupportiveReply } from '../utils/ai.js';
import { crisisResponse, detectCrisis } from '../utils/crisis.js';
import { detectEmotion } from '../utils/emotion.js';

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
    const { message, personality = 'friend' } = req.body;
    const isCrisis = detectCrisis(message);
    const emotion = detectEmotion(message);
    let chat = await Chat.findOne({ user: req.user._id }).sort({ updatedAt: -1 });

    if (!chat) {
      chat = await Chat.create({ user: req.user._id, personality, messages: [] });
    }

    chat.personality = personality;
    chat.messages.push({ role: 'user', content: message, isCrisis });

    const aiResult = isCrisis
      ? { reply: crisisResponse.reply, provider: 'crisis-safety' }
      : await generateSupportiveReply({ message, personality, history: chat.messages });

    chat.messages.push({ role: 'assistant', content: aiResult.reply, isCrisis });
    await chat.save();

    res.json({
      reply: aiResult.reply,
      provider: aiResult.provider,
      isCrisis,
      emotion,
      resources: isCrisis ? crisisResponse.resources : [],
      chat
    });
  } catch (error) {
    next(error);
  }
}
