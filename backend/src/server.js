import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";

const PORT = process.env.PORT || 5000;

let server;

async function startServer() {
  try {
    await connectDatabase();

    server = app.listen(PORT, () => {
      console.log(`🚀 MindCare AI API running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();

/* ----------------------------
   Graceful Shutdown
----------------------------- */

process.on("SIGINT", async () => {
  console.log("⚠️ SIGINT received. Shutting down...");

  if (server) {
    server.close(() => {
      console.log("✅ HTTP server closed");
      process.exit(0);
    });
  }
});

process.on("SIGTERM", async () => {
  console.log("⚠️ SIGTERM received. Shutting down...");

  if (server) {
    server.close(() => {
      console.log("✅ HTTP server closed");
      process.exit(0);
    });
  }
});

/* ----------------------------
   Global Error Handlers
----------------------------- */

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});