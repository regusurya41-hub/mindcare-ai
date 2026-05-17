import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    goals: [{ type: String, maxlength: 160 }],
    routines: [{ type: String, maxlength: 160 }],
    patterns: [{ type: String, maxlength: 180 }]
  },
  { timestamps: true }
);

export default mongoose.model('Memory', memorySchema);
