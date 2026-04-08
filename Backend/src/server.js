require('dotenv').config();
const http = require('http');
const app = require('./app');
const socketService = require('./config/socket');
const notificationScheduler = require('./services/notification-scheduler');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize Socket.io
socketService.init(server);

// Start notification schedulers
notificationScheduler.startAll();

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`✓ Socket.IO initialized`);
  console.log(`✓ Notification schedulers active`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  notificationScheduler.stopAll();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
