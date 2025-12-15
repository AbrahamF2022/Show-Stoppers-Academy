import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Configure CORS first, then Helmet
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : '*';

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Configure Helmet to work with CORS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Disable CSP for API
  })
);

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ service: 'tutoring-hours-api', version: '1.0.0' });
});

app.use('/api', routes);

app.use(errorHandler);

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`Tutoring hours API listening on port ${config.port}`);
  console.log(`CORS origins: ${Array.isArray(corsOrigins) ? corsOrigins.join(', ') : corsOrigins}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
