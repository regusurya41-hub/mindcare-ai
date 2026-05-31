import User from "../models/user.model.js";
import { signToken } from "../utils/token.js";

/* ================================
   Helpers
================================ */

const normalizeEmail = (email) =>
  email?.toLowerCase().trim();

const buildAuthResponse = (user) => ({
  success: true,
  token: signToken(user._id),
  user: {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatarColor: user.avatarColor,
    settings: user.settings,
  },
});

/* ================================
   Signup
================================ */

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    return res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    next(error);
  }
}

/* ================================
   Login
================================ */

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return res.status(200).json(buildAuthResponse(user));
  } catch (error) {
    next(error);
  }
}

/* ================================
   Current User
================================ */

export async function me(req, res) {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      avatarColor: req.user.avatarColor,
      settings: req.user.settings,
    },
  });
}