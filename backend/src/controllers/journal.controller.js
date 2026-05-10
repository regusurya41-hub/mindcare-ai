import Journal from '../models/journal.model.js';

export async function listJournals(req, res, next) {
  try {
    const query = { user: req.user._id };
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const journals = await Journal.find(query).sort({ updatedAt: -1 });
    res.json({ journals });
  } catch (error) {
    next(error);
  }
}

export async function createJournal(req, res, next) {
  try {
    const journal = await Journal.create({ ...req.body, user: req.user._id });
    res.status(201).json({ journal });
  } catch (error) {
    next(error);
  }
}

export async function updateJournal(req, res, next) {
  try {
    const journal = await Journal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!journal) return res.status(404).json({ message: 'Journal not found' });
    res.json({ journal });
  } catch (error) {
    next(error);
  }
}

export async function deleteJournal(req, res, next) {
  try {
    const journal = await Journal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!journal) return res.status(404).json({ message: 'Journal not found' });
    res.json({ message: 'Journal deleted' });
  } catch (error) {
    next(error);
  }
}
