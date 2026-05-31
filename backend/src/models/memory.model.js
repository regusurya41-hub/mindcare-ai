import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    goals: [
      {
        type: String,
        trim: true,
        maxlength: 160,
      },
    ],

    routines: [
      {
        type: String,
        trim: true,
        maxlength: 160,
      },
    ],

    patterns: [
      {
        type: String,
        trim: true,
        maxlength: 180,
      },
    ],

    lastUpdatedByAI: {
      type: Date,
      default: Date.now,
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

memorySchema.index({ user: 1 });

/* ==========================
   Limits
========================== */

memorySchema.pre("save", function (next) {
  this.goals = this.goals.slice(0, 50);
  this.routines = this.routines.slice(0, 50);
  this.patterns = this.patterns.slice(0, 100);

  this.lastUpdatedByAI = new Date();

  next();
});

const Memory = mongoose.model("Memory", memorySchema);

export default Memory;