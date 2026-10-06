import express, { Router } from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';

export const app = express();

// Global Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin === ENV.FRONTEND_URL ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Router Setup
const apiRouter = Router();

// Routes
apiRouter.use('/auth', authRoutes);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'auth-api', timestamp: new Date().toISOString() });
});

// Mount API router
app.use('/api', apiRouter);

// Root Service Discovery Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Skinova Authentication & User Management API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      auth: '/api/auth',
      health: '/api/health',
    },
  });
});

// Centralized Error Handler Middleware
app.use(errorHandler);

// Connect to MongoDB and start HTTP Server
let server: any;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    server = app.listen(ENV.PORT, () => {
      console.log(`=========================================`);
      console.log(`Skinova Auth API Running`);
      console.log(`Port: ${ENV.PORT}`);
      console.log(`Mode: ${ENV.NODE_ENV}`);
      console.log(`API Base: http://localhost:${ENV.PORT}/api/auth`);
      console.log(`=========================================`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[PORT CONFLICT]: Port ${ENV.PORT} is already in use by an existing process.`);
        console.error(`Solution: Terminate the process on port ${ENV.PORT} or set PORT in .env to another number.\n`);
        process.exit(1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  } catch (err: any) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server and MongoDB connection...');
  if (server) {
    server.close(async () => {
      await disconnectDB();
      console.log('Server and MongoDB connection closed cleanly.');
      process.exit(0);
    });
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  if (server) {
    server.close(async () => {
      await disconnectDB();
      console.log('Server and MongoDB connection closed cleanly.');
      process.exit(0);
    });
  }
});

export default app;
