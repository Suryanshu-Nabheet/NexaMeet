import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);

// Get port from environment variable or use default
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Configure CORS for all origins in development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'http://localhost:5173'  // Restrict in production
    : '*',  // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'http://localhost:5173'
      : '*',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  cookie: {
    name: 'io',
    path: '/',
    httpOnly: true,
    sameSite: 'lax'
  },
  path: '/socket.io',
  serveClient: false,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e8,
  allowUpgrades: true,
  perMessageDeflate: {
    threshold: 2048
  },
  httpCompression: {
    threshold: 2048
  }
});

// Add connection logging middleware
io.use((socket, next) => {
  const { meetingId, participantId } = socket.handshake.query;
  
  if (!meetingId || !participantId) {
    console.error('Invalid connection attempt:', socket.handshake.query);
    return next(new Error('Missing required parameters'));
  }

  console.log('New socket connection attempt:', {
    id: socket.id,
    meetingId,
    participantId,
    address: socket.handshake.address
  });

  // Check if participant is already connected
  const room = rooms.get(meetingId as string);
  if (room && room.has(participantId as string)) {
    console.log('Participant already connected, updating socket ID');
    // Update existing participant's socket ID
    const participant = room.get(participantId as string);
    if (participant) {
      participant.socketId = socket.id;
      room.set(participantId as string, participant);
    }
  }

  next();
});

// Store active rooms and their participants
interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  socketId?: string;
}

const rooms = new Map<string, Map<string, Participant>>();

// Configure Express middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message
  });
  next(err); // Pass error to next middleware
});

// Health check endpoint with detailed response
app.get('/health', (req, res) => {
  const serverInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT,
    rooms: rooms.size,
    totalParticipants: Array.from(rooms.values()).reduce((acc, room) => acc + room.size, 0),
    uptime: process.uptime(),
    cors: {
      origin: corsOptions.origin,
      methods: corsOptions.methods
    }
  };
  console.log('Health check:', serverInfo);
  res.json(serverInfo);
});

// Create a new meeting with validation
app.post('/api/meetings', (req, res) => {
  try {
    console.log('Creating new meeting...');
    const meetingId = uuidv4();
    const hostId = uuidv4();
    const meetingCode = meetingId.slice(0, 8).toUpperCase();
    
    console.log('Generated IDs:', { meetingId, hostId, meetingCode });
    
    // Create room with host
    const room = new Map();
    room.set(hostId, {
      id: hostId,
      name: 'Host',
      isHost: true
    });
    
    rooms.set(meetingId, room);
    console.log('Room created:', { meetingId, participants: Array.from(room.entries()) });
    
    res.json({
      id: meetingId,
      hostId,
      meetingCode
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ 
      error: 'Failed to create meeting',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Join a meeting with validation
app.post('/api/meetings/:meetingCode/join', (req, res) => {
  try {
    const { meetingCode } = req.params;
    const { name } = req.body;
    
    if (!meetingCode) {
      return res.status(400).json({ error: 'Meeting code is required' });
    }
    
    if (!name) {
      return res.status(400).json({ error: 'Participant name is required' });
    }
    
    console.log('Joining meeting:', { meetingCode, name });
    
    // Find meeting by code
    const meetingId = Array.from(rooms.keys()).find(id => id.slice(0, 8).toUpperCase() === meetingCode);
    if (!meetingId) {
      console.error('Meeting not found:', meetingCode);
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    const participantId = uuidv4();
    const room = rooms.get(meetingId)!;
    
    // Add participant to room
    room.set(participantId, {
      id: participantId,
      name: name || 'Participant',
      isHost: false
    });
    
    console.log('Participant added:', { meetingId, participantId, name });
    
    res.json({
      success: true,
      meetingId,
      participantId,
      meetingCode
    });
  } catch (error) {
    console.error('Error joining meeting:', error);
    res.status(500).json({ 
      error: 'Failed to join meeting',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get meeting status with validation
app.get('/api/meetings/:meetingId', (req, res) => {
  try {
    const { meetingId } = req.params;
    
    if (!meetingId) {
      return res.status(400).json({ error: 'Meeting ID is required' });
    }
    
    console.log('Getting meeting status:', meetingId);
    
    const room = rooms.get(meetingId);
    if (!room) {
      console.error('Meeting not found:', meetingId);
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    const participants = Array.from(room.values());
    console.log('Meeting participants:', participants);
    
    res.json({
      id: meetingId,
      meetingCode: meetingId.slice(0, 8).toUpperCase(),
      participants
    });
  } catch (error) {
    console.error('Error getting meeting status:', error);
    res.status(500).json({ 
      error: 'Failed to get meeting status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-meeting', async (data) => {
    try {
      const { meetingId, participantId, participantName, state } = data;
      console.log(`Participant ${participantName} (${participantId}) joining meeting ${meetingId}`);
      
      // Join the meeting room
      socket.join(meetingId);
      
      // Store participant info
      socket.data = {
        meetingId,
        participantId,
        participantName,
        state
      };

      // Notify others in the meeting
      socket.to(meetingId).emit('participant-joined', {
        participantId,
        participantName,
        state
      });

      // Send acknowledgment
      socket.emit('join-meeting-success', {
        meetingId,
        participantId,
        participantName
      });
    } catch (error) {
      console.error('Error in join-meeting:', error);
      socket.emit('error', { message: 'Failed to join meeting' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const { meetingId, participantId } = socket.data || {};
    if (meetingId && participantId) {
      socket.to(meetingId).emit('participant-left', { participantId });
    }
  });
});

// Start the server with error handling
httpServer.listen(PORT, '0.0.0.0', () => {
  const address = httpServer.address();
  const actualPort = typeof address === 'object' && address ? address.port : PORT;
  console.log('=================================');
  console.log(`Server started successfully!`);
  console.log(`Server listening on http://localhost:${actualPort}`);
  console.log(`Health check: http://localhost:${actualPort}/health`);
  console.log('=================================');
});

// Handle server errors
httpServer.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please free up the port or use a different one.`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
}); 