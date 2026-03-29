import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { initDb } from './config/schemaInit.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 4000;
const missingEnv = [];
if (!process.env.DATABASE_URL) {
  missingEnv.push('DATABASE_URL');
}
if (!process.env.CLERK_SECRET_KEY) {
  missingEnv.push('CLERK_SECRET_KEY');
}
if (!process.env.CLERK_PUBLISHABLE_KEY) {
  missingEnv.push('CLERK_PUBLISHABLE_KEY');
}
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (missingEnv.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnv.join(', ')}. ` +
      'Update backend/.env before starting the API.'
  );
}

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
app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    authorizedParties: allowedOrigins,
  })
);

try {
  await initDb();
} catch (error) {
  console.error('Failed to initialize the database.');
  console.error(
    'Check that backend/.env has a valid Postgres DATABASE_URL and that the database is reachable.'
  );
  throw error;
}

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', apiRouter);

// Error handling middleware (should be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Net Worth backend running on port ${PORT}`);
});

