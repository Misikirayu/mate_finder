import { Server as SocketIOServer } from 'socket.io';

export const runtime = 'nodejs';

const SocketHandler = async (req, res) => {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    const io = new SocketIOServer(res.socket.server);

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('join-chat', (userId) => {
        console.log('User joined chat:', userId);
        socket.join(`user-${userId}`);
      });

      socket.on('send-message', (message) => {
        console.log('Broadcasting message:', message);
        // Broadcast to all connected clients
        io.emit('receive-message', message);
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default SocketHandler; 