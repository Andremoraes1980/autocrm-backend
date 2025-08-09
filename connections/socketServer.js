// backend/connections/socketServer.js
const { Server } = require('socket.io');

module.exports = function createSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: [
        "https://autocrmleads.vercel.app",
        "https://autocrmleads.com.br",
        "https://www.autocrmleads.com.br",
        "http://localhost:5173"
      ],
      methods: ["GET", "POST", "OPTIONS"],
      credentials: true
    }
  });
  return io;
};
