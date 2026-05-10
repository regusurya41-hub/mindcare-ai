import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mood: { type: String, required: true, enum: ['great', 'good', 'okay', 'low', 'heavy'] },
    emoji: { type: String, required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    note: { type: String, maxlength: 500 },
    loggedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model('Mood', moodSchema);
