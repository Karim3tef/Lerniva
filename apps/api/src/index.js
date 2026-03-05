import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initSocket } from './realtime/socket.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import env from './config/env.js';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
}));
app.use(cookieParser());

// NOTE: Stripe webhook route uses express.raw() — mount BEFORE express.json()
// This will be added when webhook routes are implemented
// app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', (req, res) => {
  res.json({
    message: 'Lerniva API - Routes will be mounted here',
    version: '1.0.0'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = env.port;
httpServer.listen(PORT, () => {
  console.log(`🚀 Lerniva API server running on port ${PORT}`);
  console.log(`📝 Environment: ${env.nodeEnv}`);
  console.log(`🌐 Frontend URL: ${env.frontendUrl}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
