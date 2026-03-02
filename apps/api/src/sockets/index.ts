import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';

let io: Server;

export function initSocketServer(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // JWT authentication middleware for Socket.IO
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret) as {
        userId: string;
        role: string;
      };
      (socket as any).userId = decoded.userId;
      (socket as any).userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  // ======================== RIDER NAMESPACE ========================
  const riderNs = io.of('/rider');

  riderNs.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`Rider connected: ${userId}`);

    // Join personal room
    socket.join(`rider:${userId}`);

    socket.on('disconnect', () => {
      console.log(`Rider disconnected: ${userId}`);
    });
  });

  // ======================== DRIVER NAMESPACE ========================
  const driverNs = io.of('/driver');

  driverNs.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`Driver connected: ${userId}`);

    // Join personal room
    socket.join(`driver:${userId}`);

    // Handle location updates
    socket.on('location:update', (data: { lat: number; lng: number; heading?: number }) => {
      // TODO: Store in Redis for real-time tracking
      // Broadcast to rider if on a ride
      socket.emit('location:ack', { timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
      console.log(`Driver disconnected: ${userId}`);
    });
  });

  console.log('⚡ Socket.IO server initialized');
  return io;
}

// ======================== EMIT HELPERS ========================

export function emitToRider(userId: string, event: string, data: unknown) {
  if (io) {
    io.of('/rider').to(`rider:${userId}`).emit(event, data);
  }
}

export function emitToDriver(userId: string, event: string, data: unknown) {
  if (io) {
    io.of('/driver').to(`driver:${userId}`).emit(event, data);
  }
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
