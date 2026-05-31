import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },

    isCrisis: {
      type: Boolean,
      default: false,
    },

    emotion: {
      type: String,
      default: null,
    },

    provider: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    _id: true,
  }
);

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    personality: {
      type: String,
      enum: ["friend", "guide", "coach"],
      default: "friend",
    },

    messages: {
      type: [messageSchema],
      default: [],
    },

    lastMessageAt: {
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

chatSchema.index({ user: 1 });
chatSchema.index({ updatedAt: -1 });
chatSchema.index({ lastMessageAt: -1 });

/* ==========================
   Middleware
========================== */

chatSchema.pre("save", function (next) {
  this.lastMessageAt = new Date();
  next();
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;