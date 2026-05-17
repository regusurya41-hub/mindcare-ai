import Memory from '../models/memory.model.js';

export async function getMemory(req, res, next) {
  try {
    const memory = await Memory.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id, goals: [], routines: [], patterns: [] } },
      { new: true, upsert: true }
    );

    res.json({ memory });
  } catch (error) {
    next(error);
  }
}

export async function updateMemory(req, res, next) {
  try {
    const allowed = ['goals', 'routines', 'patterns'];
    const update = allowed.reduce((acc, key) => {
      if (Array.isArray(req.body[key])) acc[key] = req.body[key].slice(0, 8);
      return acc;
    }, {});

    const memory = await Memory.findOneAndUpdate(
      { user: req.user._id },
      { $set: update, $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ memory });
  } catch (error) {
    next(error);
  }
}
