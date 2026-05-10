import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, maxlength: 600 },
    displayName: { type: String, default: 'Anonymous' }
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, maxlength: 1200 },
    topic: { type: String, enum: ['support', 'gratitude', 'coping', 'question'], default: 'support' },
    displayName: { type: String, default: 'Anonymous' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String, maxlength: 240 }
      }
    ],
    moderationStatus: { type: String, enum: ['visible', 'review', 'hidden'], default: 'visible' }
  },
  { timestamps: true }
);

export default mongoose.model('Post', postSchema);
