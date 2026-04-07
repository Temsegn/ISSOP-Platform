const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  init(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
      },
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error('Authentication error: Token missing'));

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      const userId = socket.user.id;
      this.connectedUsers.set(userId, socket.id);
      
      // Join a private room for this user
      socket.join(`user_${userId}`);
      console.log(`User connected: ${userId} (Socket: ${socket.id})`);

      // Join role-based rooms
      if (socket.user.role === 'ADMIN' || socket.user.role === 'SUPERADMIN') {
        socket.join('admins');
        if (socket.user.area) {
          socket.join(`admin_area_${socket.user.area}`);
        }
      }

      socket.on('disconnect', () => {
        this.connectedUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
      });
    });
  }

  /**
   * Emit to a specific user
   */
  emitToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit(event, data);
    }
  }

  /**
   * Emit to a specific room (e.g., 'admins' or 'admin_area_Central')
   */
  emitToRoom(room, event, data) {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }

  /**
   * Emit to all connected users
   */
  emitAll(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

const socketService = new SocketService();
module.exports = socketService;
