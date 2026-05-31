import express from "express";
import { body } from "express-validator";

import { getChat, sendMessage, streamChat } from "../controllers/chat.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

/* =========================
   AUTH GATE
========================= */
router.use(protect);

/* =========================
   GET CHAT HISTORY
========================= */
router.get("/", getChat);

/* =========================
   CLASSIC CHAT (NON-STREAM)
   (Backward compatibility)
========================= */
router.post(
  "/",
  [
    body("message")
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage("Message is required"),

    body("personality")
      .optional()
      .isIn(["friend", "guide", "coach"]),

    body("language")
      .optional()
      .isLength({ min: 2, max: 12 })
      .withMessage("Invalid language"),
  ],
  validate,
  sendMessage
);

/* =========================
   🔥 CHATGPT-STYLE STREAMING
========================= */
router.post(
  "/stream",
  [
    body("message")
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage("Message is required"),

    body("personality")
      .optional()
      .isIn(["friend", "guide", "coach"]),

    body("language")
      .optional()
      .isLength({ min: 2, max: 12 })
      .withMessage("Invalid language"),
  ],
  validate,
  streamChat
);

export default router;