require('dotenv').config();
const http = require('http');
const app = require('./app');
const socketService = require('./config/socket');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Initialize Socket.io
socketService.init(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
