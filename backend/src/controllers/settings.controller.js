import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';

/* ── helpers ── */
const safeUser = (user) => ({
  id:           user._id.toString(),
  name:         user.name,
  email:        user.email,
  avatarColor:  user.avatarColor,
  settings:     user.settings,
  createdAt:    user.createdAt,
});

/* ── PATCH /settings  — toggle prefs ── */
export async function updateSettings(req, res, next) {
  try {
    const cur  = req.user.settings?.toObject?.() ?? req.user.settings ?? {};
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { settings: { ...cur, ...req.body } } },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, user: safeUser(user) });
  } catch (err) { next(err); }
}

/* ── PATCH /settings/profile  — update name & email ── */
export async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.body;
    if (!name?.trim() || name.trim().length < 2)
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ success: false, message: 'Valid email required.' });

    const normalizedEmail = email.toLowerCase().trim();

    // Check email not taken by another user
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing && existing._id.toString() !== req.user._id.toString())
      return res.status(409).json({ success: false, message: 'That email is already in use.' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name: name.trim(), email: normalizedEmail } },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, user: safeUser(user) });
  } catch (err) { next(err); }
}

/* ── PATCH /settings/password ── */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Both current and new password are required.' });
    if (newPassword.length < 8)
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword))
      return res.status(400).json({ success: false, message: 'New password must contain letters and numbers.' });

    const user = await User.findById(req.user._id).select('+password');
    const ok   = await user.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });

    user.password = newPassword; // pre-save hook hashes it
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) { next(err); }
}

/* ── DELETE /settings/account ── */
export async function deleteAccount(req, res, next) {
  try {
    const { password } = req.body;
    if (!password)
      return res.status(400).json({ success: false, message: 'Password is required to delete your account.' });

    const user = await User.findById(req.user._id).select('+password');
    const ok   = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ success: false, message: 'Incorrect password.' });

    await User.findByIdAndDelete(req.user._id);

    // Also delete associated data (best-effort)
    try {
      const { default: Chat }      = await import('../models/chat.model.js');
      const { default: Journal }   = await import('../models/journal.model.js');
      const { default: Mood }      = await import('../models/mood.model.js');
      const { default: Memory }    = await import('../models/memory.model.js');
      await Promise.all([
        Chat.deleteMany({ user: req.user._id }),
        Journal.deleteMany({ user: req.user._id }),
        Mood.deleteMany({ user: req.user._id }),
        Memory.deleteMany({ user: req.user._id }),
      ]);
    } catch {}

    res.json({ success: true, message: 'Account deleted.' });
  } catch (err) { next(err); }
}

/* ── GET /settings/export — export all user data ── */
export async function exportData(req, res, next) {
  try {
    const [Chat, Journal, Mood] = await Promise.all([
      import('../models/chat.model.js').then(m => m.default),
      import('../models/journal.model.js').then(m => m.default),
      import('../models/mood.model.js').then(m => m.default),
    ]);

    const [chat, journals, moods] = await Promise.all([
      Chat.findOne({ user: req.user._id }).select('-__v'),
      Journal.find({ user: req.user._id }).select('-__v').sort('-createdAt'),
      Mood.find({ user: req.user._id }).select('-__v').sort('-createdAt'),
    ]);

    res.json({
      success:   true,
      exportedAt: new Date().toISOString(),
      user: {
        name:      req.user.name,
        email:     req.user.email,
        joinedAt:  req.user.createdAt,
      },
      data: {
        chatMessages: chat?.messages ?? [],
        journals,
        moods,
      },
    });
  } catch (err) { next(err); }
}