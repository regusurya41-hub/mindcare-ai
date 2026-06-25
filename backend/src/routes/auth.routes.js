import express from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";

import { signup, login, me } from "../controllers/auth.controller.js";
import { protect }           from "../middleware/auth.middleware.js";
import { validate }          from "../middleware/validate.middleware.js";

const router = express.Router();

/* ── Rate limiters ── */

const authLimiter = rateLimit({
  windowMs:    15 * 60 * 1000, // 15 minutes
  max:         10,              // max 10 attempts per window
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: "Too many attempts. Please wait 15 minutes and try again." },
  skip: (req) => process.env.NODE_ENV === "development",
});

const signupLimiter = rateLimit({
  windowMs:    60 * 60 * 1000, // 1 hour
  max:         5,               // max 5 signups per hour per IP
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: "Too many accounts created. Please try again in an hour." },
  skip: (req) => process.env.NODE_ENV === "development",
});

/* ── Signup ── */

router.post(
  "/signup",
  signupLimiter,
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
      .matches(/[A-Za-z]/).withMessage("Password must contain at least one letter")
      .matches(/[0-9]/).withMessage("Password must contain at least one number"),
  ],
  validate,
  signup
);

/* ── Login ── */

router.post(
  "/login",
  authLimiter,
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

/* ── Me ── */

router.get("/me", protect, me);

/* ── Health ── */

router.get("/status", (_req, res) => {
  res.status(200).json({ success: true, service: "Auth Service", message: "Auth routes working" });
});

export default router;