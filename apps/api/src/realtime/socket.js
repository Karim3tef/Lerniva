import { Server } from 'socket.io';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

const { Client } = pg;

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.frontendUrl,
      credentials: true,
    },
  });

  // JWT authentication for Socket.io connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('غير مصرح'));
    }

    try {
      const payload = jwt.verify(token, env.jwt.secret);
      socket.user = payload; // { id, email, role }
      next();
    } catch (err) {
      next(new Error('انتهت صلاحية الجلسة'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`User connected via Socket.io: ${userId}`);

    // Join user-specific room
    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  // PostgreSQL LISTEN for realtime notifications
  const pgClient = new Client({
    connectionString: env.database.url,
  });

  pgClient.connect().then(() => {
    console.log('PostgreSQL LISTEN client connected');

    // Listen to notification channels
    pgClient.query('LISTEN new_notification');
    pgClient.query('LISTEN enrollment_update');

    pgClient.on('notification', (msg) => {
      try {
        const payload = JSON.parse(msg.payload);

        if (msg.channel === 'new_notification') {
          // Send notification to specific user
          io.to(`user:${payload.user_id}`).emit('notification', payload);
        }

        if (msg.channel === 'enrollment_update') {
          // Send enrollment update to student
          io.to(`user:${payload.student_id}`).emit('enrollment_update', payload);
        }
      } catch (err) {
        console.error('Error processing PostgreSQL notification:', err);
      }
    });

    pgClient.on('error', (err) => {
      console.error('PostgreSQL LISTEN client error:', err);
    });
  }).catch(err => {
    console.error('Failed to connect PostgreSQL LISTEN client:', err);
  });
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}
