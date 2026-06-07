import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import moodRoutes from "./routes/mood.routes.js";
import journalRoutes from "./routes/journal.routes.js";
import communityRoutes from "./routes/community.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import memoryRoutes from "./routes/memory.routes.js";

import {
  errorHandler,
  notFound,
} from "./middleware/error.middleware.js";

const app = express();

/* ==========================================
   Trust Proxy
========================================== */

app.set("trust proxy", 1);

/* ==========================================
   Security
========================================== */

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/* ==========================================
   Compression
========================================== */

app.use(compression());

/* ==========================================
   CORS
========================================== */

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(
          `CORS blocked for origin: ${origin}`
        )
      );
    },
    credentials: true,
  })
);

/* ==========================================
   Body Parser
========================================== */

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

/* ==========================================
   Logger
========================================== */

app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

/* ==========================================
   Rate Limiting
========================================== */

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "AI request limit exceeded.",
  },
});

app.use(globalLimiter);

/* ==========================================
   Root Route
========================================== */

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "MindCare AI API",
    version: "1.0.0",
    status: "running",
  });
});

/* ==========================================
   API Prefix
========================================== */

const API_PREFIX = "/api/v1";

/* ==========================================
   Health Check
========================================== */

app.get(`${API_PREFIX}/health`, (_req, res) => {
  res.status(200).json({
    success: true,
    service: "MindCare AI API",
    version: "1.0.0",
    environment:
      process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/* ==========================================
   Routes
========================================== */

app.use(
  `${API_PREFIX}/auth`,
  authRoutes
);

app.use(
  `${API_PREFIX}/chat`,
  aiLimiter,
  chatRoutes
);

app.use(
  `${API_PREFIX}/moods`,
  moodRoutes
);

app.use(
  `${API_PREFIX}/journals`,
  journalRoutes
);

app.use(
  `${API_PREFIX}/community`,
  communityRoutes
);

app.use(
  `${API_PREFIX}/settings`,
  settingsRoutes
);

app.use(
  `${API_PREFIX}/memory`,
  memoryRoutes
);

/* ==========================================
   404 Handler
========================================== */

app.use(notFound);

/* ==========================================
   Global Error Handler
========================================== */

app.use(errorHandler);

export default app;