import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    content: { type: String, required: true, maxlength: 12000 },
    tags: [{ type: String, trim: true, maxlength: 24 }]
  },
  { timestamps: true }
);

journalSchema.index({ title: 'text', content: 'text', tags: 'text' });

export default mongoose.model('Journal', journalSchema);
