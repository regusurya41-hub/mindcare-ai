import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "❌ MONGODB_URI is missing. Please add it to your environment variables."
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectDatabase() {
  try {
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      mongoose.set("strictQuery", true);

      cached.promise = mongoose.connect(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
    }

    cached.conn = await cached.promise;

    console.log(
      `✅ MongoDB Connected: ${cached.conn.connection.host}`
    );

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB Error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB Disconnected");
    });

    return cached.conn;
  } catch (error) {
    console.error(
      "❌ Database Connection Failed:",
      error.message
    );

    process.exit(1);
  }
}