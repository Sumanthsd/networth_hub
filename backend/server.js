import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './config/schemaInit.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'));
    },
  })
);
app.use(express.json());

// Initialize database schema
await initDb();

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', apiRouter);

// Error handling middleware (should be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Net Worth backend running on port ${PORT}`);
});

