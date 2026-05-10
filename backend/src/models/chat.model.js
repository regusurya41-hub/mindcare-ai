import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true, maxlength: 4000 },
    isCrisis: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const chatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    personality: { type: String, enum: ['friend', 'guide', 'coach'], default: 'friend' },
    messages: [messageSchema]
  },
  { timestamps: true }
);

export default mongoose.model('Chat', chatSchema);
