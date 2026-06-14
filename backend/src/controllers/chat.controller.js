import Chat from "../models/chat.model.js";
import Memory from "../models/memory.model.js";

import {
  generateSupportiveReply,
  streamSupportiveReply,
} from "../utils/ai.js";

import { crisisResponse, detectCrisis } from "../utils/crisis.js";
import { detectEmotion } from "../utils/emotion.js";
import { applyMemoryPatch, extractMemoryPatch } from "../utils/memory.js";

/* =========================
   GET CHAT HISTORY
========================= */
export async function getChat(req, res, next) {
  try {
    const chat = await Chat.findOne({ user: req.user._id }).sort({
      updatedAt: -1,
    });

    res.json({
      chat: chat || { messages: [], personality: "friend" },
    });
  } catch (error) {
    next(error);
  }
}

/* =========================
   STREAM CHAT (CHATGPT STYLE)
========================= */
export async function streamChat(req, res, next) {
  try {
    const { message, personality = "friend", language = "en-US" } = req.body;

    const crisis = detectCrisis(message);
    const emotion = detectEmotion(message);

    /* -------------------------
       SSE HEADERS
    ------------------------- */
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    /* -------------------------
       CRISIS SHORT-CIRCUIT
    ------------------------- */
    if (crisis.isCrisis) {
      res.write(
        `data: ${JSON.stringify({
          token: crisisResponse.reply,
          done: true,
          crisis: true,
          resources: crisisResponse.resources,
        })}\n\n`
      );

      return res.end();
    }

    /* -------------------------
       CHAT HISTORY
    ------------------------- */
    let chat = await Chat.findOne({ user: req.user._id }).sort({
      updatedAt: -1,
    });

    if (!chat) {
      chat = await Chat.create({
        user: req.user._id,
        personality,
        messages: [],
      });
    }

    chat.personality = personality;

    const history = chat.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    /* -------------------------
       MEMORY UPDATE
    ------------------------- */
    let memory = await Memory.findOneAndUpdate(
      { user: req.user._id },
      {
        $setOnInsert: {
          user: req.user._id,
          goals: [],
          routines: [],
          patterns: [],
        },
      },
      { new: true, upsert: true }
    );

    const patch = extractMemoryPatch(message, emotion);
    memory = applyMemoryPatch(memory, patch);
    await memory.save();

    /* -------------------------
       SAVE USER MESSAGE
    ------------------------- */
    chat.messages.push({
      role: "user",
      content: message,
      isCrisis: crisis.isCrisis,
    });

    /* -------------------------
       STREAM AI RESPONSE
    ------------------------- */
    const stream = await streamSupportiveReply({
      message,
      personality,
      history,
      memory,
      language,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const token = chunk.choices?.[0]?.delta?.content;

      if (token) {
        fullResponse += token;

        res.write(
          `data: ${JSON.stringify({
            token,
          })}\n\n`
        );
      }
    }

    /* -------------------------
       SAVE AI RESPONSE
    ------------------------- */
    chat.messages.push({
      role: "assistant",
      content: fullResponse,
      isCrisis: false,
    });

    await chat.save();

    /* -------------------------
       END STREAM
    ------------------------- */
    res.write(
      `data: ${JSON.stringify({
        done: true,
        fullResponse,
        emotion,
        memory,
      })}\n\n`
    );

    res.end();
  } catch (error) {
    next(error);
  }
}

/* =========================
   NON-STREAM FALLBACK
========================= */
export async function sendMessage(req, res, next) {
  try {
    const { message, personality = "friend", language = "en-US" } = req.body;

    const crisis = detectCrisis(message);
    const emotion = detectEmotion(message);

    let chat = await Chat.findOne({ user: req.user._id }).sort({
      updatedAt: -1,
    });

    if (!chat) {
      chat = await Chat.create({
        user: req.user._id,
        personality,
        messages: [],
      });
    }

    const history = chat.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let memory = await Memory.findOne({ user: req.user._id });

    memory = applyMemoryPatch(
      memory,
      extractMemoryPatch(message, emotion)
    );

    await memory.save();

    chat.messages.push({
      role: "user",
      content: message,
      isCrisis: crisis.isCrisis,
    });

    const aiResult = crisis.isCrisis
      ? {
          reply: crisisResponse.reply,
          provider: "crisis",
          mode: "crisis",
        }
      : await generateSupportiveReply({
          message,
          personality,
          history,
          language,
          memory,
        });

    chat.messages.push({
      role: "assistant",
      content: aiResult.reply,
      isCrisis: false,
    });

    await chat.save();

    res.json({
      reply: aiResult.reply,
      provider: aiResult.provider,
      mode: aiResult.mode,
      emotion,
      memory,
      crisis: crisis.isCrisis,
      resources: crisis.isCrisis ? crisisResponse.resources : [],
      chat,
    });
  } catch (error) {
    next(error);
  }
}