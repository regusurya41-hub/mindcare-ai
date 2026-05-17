import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import moodRoutes from './routes/mood.routes.js';
import journalRoutes from './routes/journal.routes.js';
import communityRoutes from './routes/community.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import memoryRoutes from './routes/memory.routes.js';

import { errorHandler, notFound } from './middleware/error.middleware.js';

const app = express();

// Trust proxy (important for deployment)
app.set('trust proxy', 1);

// Allowed origins
const allowedOrigins = (
  process.env.CLIENT_URL ||
  'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim());

// Security middleware
app.use(helmet());

// Compression
app.use(compression());

// CORS
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Logger
app.use(
  morgan(
    process.env.NODE_ENV === 'production'
      ? 'combined'
      : 'dev'
  )
);

// Rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// Health route
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'MindCare AI API'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/memory', memoryRoutes);

// Serve frontend in production only
if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  app.use(
    express.static(
      path.join(__dirname, '../../frontend/dist')
    )
  );

  app.get('*', (_req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        '../../frontend/dist/index.html'
      )
    );
  });
}

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;