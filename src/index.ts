import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import healthCheckRouter from './routes/healthCheck';
import ordersRouter from './routes/orders';

// Initialize the Express app
const app = express();

// Middlewares
app.use(helmet()); // Basic security headers
app.use(express.json()); // Parse incoming JSON requests
app.use(morgan('combined')); // HTTP logger
app.use(cors());

// Routes
app.use('/api', healthCheckRouter); // Health check endpoint
app.use('/api/v1/orders', ordersRouter); // orders endpoint

// Centralized Error Handling Middleware
app.use((err: Error, _req: Request, res: Response) => {
  console.error('Unhandled error:', err);
  res.status(500).json(
    {
      errors: [
        {
          status: 500,
          source: { pointer: '' },
          title: 'Internal Server Error',
          detail: 'Something went wrong. Please try again later.',
        },
      ],
    },
  );
});

// Graceful Shutdown Handling
const server = app.listen(process.env.APP_PORT || 3000, () => {
  console.log(`Server running at http://localhost:${process.env.APP_PORT}`);
});

// Handling shutdown signals
const onServerClose = () => {
  console.log('Server shut down gracefully.');
  process.exit(0);
};

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(onServerClose);
});

process.on('SIGTERM', () => {
  console.log('Received termination signal, closing server...');
  server.close(onServerClose);
});
