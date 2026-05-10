import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    darkMode: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true },
    anonymousCommunity: { type: Boolean, default: true },
    dataExport: { type: Boolean, default: false }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    avatarColor: { type: String, default: '#71c9ce' },
    settings: { type: settingsSchema, default: () => ({}) }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('User', userSchema);
