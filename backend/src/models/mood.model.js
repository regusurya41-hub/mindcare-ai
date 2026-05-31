import mongoose from "mongoose";

const MOODS = [
  "great",
  "good",
  "okay",
  "low",
  "heavy",
];

const moodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    mood: {
      type: String,
      required: true,
      enum: MOODS,
      trim: true,
    },

    emoji: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10,
    },

    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },

    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    loggedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ==========================
   Indexes
========================== */

moodSchema.index({ user: 1, loggedAt: -1 });
moodSchema.index({ user: 1, createdAt: -1 });

const Mood = mongoose.model("Mood", moodSchema);

export default Mood;