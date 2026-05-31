import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 600,
    },

    displayName: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "Anonymous",
    },
  },
  {
    timestamps: true,
    _id: true,
  }
);

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 240,
    },
  },
  {
    _id: false,
  }
);

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },

    topic: {
      type: String,
      enum: [
        "support",
        "gratitude",
        "coping",
        "question",
      ],
      default: "support",
      index: true,
    },

    displayName: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "Anonymous",
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    likeCount: {
      type: Number,
      default: 0,
    },

    commentCount: {
      type: Number,
      default: 0,
    },

    comments: {
      type: [commentSchema],
      default: [],
    },

    reports: {
      type: [reportSchema],
      default: [],
    },

    moderationStatus: {
      type: String,
      enum: [
        "visible",
        "review",
        "hidden",
      ],
      default: "visible",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ==========================
   Feed Indexes
========================== */

postSchema.index({
  topic: 1,
  createdAt: -1,
});

postSchema.index({
  moderationStatus: 1,
  createdAt: -1,
});

postSchema.index({
  user: 1,
  createdAt: -1,
});

/* ==========================
   Auto Counters
========================== */

postSchema.pre("save", function (next) {
  this.likeCount = this.likes.length;
  this.commentCount = this.comments.length;
  next();
});

const Post = mongoose.model("Post", postSchema);

export default Post;