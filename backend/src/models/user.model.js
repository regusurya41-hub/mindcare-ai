import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import validator from "validator";

const settingsSchema = new mongoose.Schema(
  {
    darkMode: {
      type: Boolean,
      default: false,
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    anonymousCommunity: {
      type: Boolean,
      default: true,
    },
    dataExport: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email address",
      },
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      maxlength: 128,
      select: false,
    },

    avatarColor: {
      type: String,
      default: "#71c9ce",
    },

    settings: {
      type: settingsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.password;
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

/* ===========================
   Virtual ID
=========================== */

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

/* ===========================
   Email Normalization
=========================== */

userSchema.pre("save", function (next) {
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }

  next();
});

/* ===========================
   Password Hashing
=========================== */

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }

    this.password = await bcrypt.hash(this.password, 12);

    next();
  } catch (error) {
    next(error);
  }
});

/* ===========================
   Compare Password
=========================== */

userSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return bcrypt.compare(
    candidatePassword,
    this.password
  );
};

/* ===========================
   Indexes
=========================== */

userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema);

export default User;