import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 12000,
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 24,
      },
    ],

    mood: {
      type: String,
      enum: ["great", "good", "okay", "low", "heavy"],
      default: null,
    },

    isPrivate: {
      type: Boolean,
      default: true,
    },

    wordCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ==========================
   Text Search
========================== */

journalSchema.index({
  title: "text",
  content: "text",
  tags: "text",
});

/* ==========================
   User Queries
========================== */

journalSchema.index({
  user: 1,
  createdAt: -1,
});

/* ==========================
   Auto Word Count
========================== */

journalSchema.pre("save", function (next) {
  this.wordCount = this.content
    ? this.content.trim().split(/\s+/).length
    : 0;

  next();
});

const Journal = mongoose.model("Journal", journalSchema);

export default Journal;