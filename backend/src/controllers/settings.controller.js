import User from '../models/user.model.js';

export async function updateSettings(req, res, next) {
  try {
    const currentSettings = req.user.settings?.toObject ? req.user.settings.toObject() : req.user.settings || {};
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { settings: { ...currentSettings, ...req.body } } },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    next(error);
  }
}
