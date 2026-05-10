import Mood from '../models/mood.model.js';

const scoreByMood = {
  great: 5,
  good: 4,
  okay: 3,
  low: 2,
  heavy: 1
};

export async function listMoods(req, res, next) {
  try {
    const moods = await Mood.find({ user: req.user._id }).sort({ loggedAt: -1 }).limit(60);
    res.json({ moods });
  } catch (error) {
    next(error);
  }
}

export async function createMood(req, res, next) {
  try {
    const { mood, emoji, note } = req.body;
    const entry = await Mood.create({
      user: req.user._id,
      mood,
      emoji,
      note,
      score: scoreByMood[mood]
    });

    res.status(201).json({ mood: entry });
  } catch (error) {
    next(error);
  }
}

export async function moodAnalytics(req, res, next) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const moods = await Mood.find({ user: req.user._id, loggedAt: { $gte: since } }).sort({ loggedAt: 1 });
    const average = moods.length ? moods.reduce((sum, item) => sum + item.score, 0) / moods.length : 0;

    res.json({
      average: Number(average.toFixed(1)),
      count: moods.length,
      chart: moods.map((item) => ({
        date: item.loggedAt.toISOString().slice(0, 10),
        mood: item.mood,
        score: item.score
      }))
    });
  } catch (error) {
    next(error);
  }
}
