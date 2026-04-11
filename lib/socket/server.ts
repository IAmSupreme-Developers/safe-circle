import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export const getSocketIO = (httpServer?: HTTPServer): SocketIOServer => {
  if (!io && httpServer) {
    io = new SocketIOServer(httpServer, {
      path: '',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_APP_URL 
          : '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    console.log('✅ Socket.IO server initialized');
  }

  if (!io) {
    throw new Error('Socket.IO not initialized');
  }

  return io;
};

export const getIO = (): SocketIOServer | null => io;
