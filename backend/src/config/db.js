import mongoose from "mongoose";

export async function connectDatabase() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is required in environment variables");
    }

    mongoose.set("strictQuery", true);

    await mongoose.connect(uri);

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
}