import User from '../models/user.model.js';
import { signToken } from '../utils/token.js';

function toAuthResponse(user) {
  const settings = user.settings?.toObject ? user.settings.toObject() : user.settings;

  return {
    token: signToken(user._id),
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor,
      settings
    }
  };
}

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create({ name: name.trim(), email: normalizedEmail, password });
    res.status(201).json(toAuthResponse(user));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json(toAuthResponse(user));
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.json({
    user: {
      id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      avatarColor: req.user.avatarColor,
      settings: req.user.settings
    }
  });
}
