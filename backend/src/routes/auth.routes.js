import express from "express";
import { body } from "express-validator";

import {
  signup,
  login,
  me,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

/* =====================================
   Signup
===================================== */

router.post(
  "/signup",
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage(
        "Name must be at least 2 characters"
      ),

    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),

    body("password")
      .isLength({ min: 8 })
      .withMessage(
        "Password must be at least 8 characters"
      )
      .matches(/[A-Za-z]/)
      .withMessage(
        "Password must contain at least one letter"
      )
      .matches(/[0-9]/)
      .withMessage(
        "Password must contain at least one number"
      ),
  ],
  validate,
  signup
);

/* =====================================
   Login
===================================== */

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email required"),

    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  validate,
  login
);

/* =====================================
   Current User
===================================== */

router.get(
  "/me",
  protect,
  me
);

/* =====================================
   Health Check
===================================== */

router.get(
  "/status",
  (_req, res) => {
    res.status(200).json({
      success: true,
      service: "Auth Service",
      message: "Auth routes working",
    });
  }
);

export default router;