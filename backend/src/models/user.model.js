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
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide a valid email",
      },
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
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
  }
);

/* ==========================
   Password Hashing
========================== */

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }

    const salt = await bcrypt.genSalt(12);

    this.password = await bcrypt.hash(
      this.password,
      salt
    );

    next();
  } catch (error) {
    next(error);
  }
});

/* ==========================
   Compare Password
========================== */

userSchema.methods.comparePassword =
  async function (candidatePassword) {
    return bcrypt.compare(
      candidatePassword,
      this.password
    );
  };

/* ==========================
   Virtual ID
========================== */

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

/* ==========================
   Remove Sensitive Data
========================== */

userSchema.methods.toJSON = function () {
  const user = this.toObject();

  delete user.password;
  delete user._id;

  return user;
};

const User = mongoose.model(
  "User",
  userSchema
);

export default User;