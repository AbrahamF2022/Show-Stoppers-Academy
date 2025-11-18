import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : '*',
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ service: 'tutoring-hours-api', version: '1.0.0' });
});

app.use('/api', routes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Tutoring hours API listening on port ${config.port}`);
});
