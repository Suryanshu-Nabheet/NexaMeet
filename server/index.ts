import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Configure Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// Store active rooms and their participants
const rooms = new Map<string, Set<string>>();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle room joining
  socket.on('join-room', (roomId: string, userId: string) => {
    console.log(`User ${userId} joining room ${roomId}`);
    
    // Add user to room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId)?.add(userId);
    
    // Join socket room
    socket.join(roomId);
    
    // Notify others in room
    socket.to(roomId).emit('user-connected', userId);
    
    // Send list of connected users to new participant
    const connectedUsers = Array.from(rooms.get(roomId) || []);
    socket.emit('room-users', connectedUsers);
  });

  // Handle WebRTC signaling
  socket.on('signal', (data: { userId: string, signal: any, to: string }) => {
    console.log(`Signal from ${data.userId} to ${data.to}`);
    io.to(data.to).emit('signal', {
      userId: data.userId,
      signal: data.signal
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Remove user from all rooms
    rooms.forEach((users, roomId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        socket.to(roomId).emit('user-disconnected', socket.id);
        
        // Clean up empty rooms
        if (users.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Error handling for HTTP server
httpServer.on('error', (error) => {
  console.error('Server error:', error);
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
}); 