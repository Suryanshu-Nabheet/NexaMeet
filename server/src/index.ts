import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { MonitoringService } from './monitoring';
import { SecurityService } from './security';

// WebRTC types
interface RTCSessionDescriptionInit {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp?: string;
}

interface RTCIceCandidateInit {
  candidate?: string;
  sdpMLineIndex?: number | null;
  sdpMid?: string | null;
}

interface ParticipantSocketData {
  meetingId: string;
  participantId: string;
  participantName: string;
  isHost: boolean;
}

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

// Add connection logging middleware with security
io.use(securityService.socketRateLimitMiddleware());
io.use((socket: Socket, next: (err?: Error) => void) => {
  const { meetingId, participantId, participantName, isHost } = socket.handshake.query;
  
  // Validate inputs
  if (!meetingId || !participantId) {
    console.error('Invalid connection attempt:', socket.handshake.query);
    monitoringService.recordError(new Error('Missing required parameters'), 'socket-connection');
    return next(new Error('Missing required parameters'));
  }

  // Validate format
  if (!securityService.validateMeetingId(meetingId as string)) {
    monitoringService.recordError(new Error('Invalid meeting ID format'), 'socket-connection');
    return next(new Error('Invalid meeting ID format'));
  }

  if (!securityService.validateParticipantId(participantId as string)) {
    monitoringService.recordError(new Error('Invalid participant ID format'), 'socket-connection');
    return next(new Error('Invalid participant ID format'));
  }

  console.log('New socket connection attempt:', {
    id: socket.id,
    meetingId,
    participantId,
    participantName,
    isHost,
    address: socket.handshake.address
  });

  // Store participant data in socket
  let isHostValue = false;
  if (Array.isArray(isHost)) {
    isHostValue = isHost[0] === 'true';
  } else if (typeof isHost === 'string') {
    isHostValue = isHost === 'true';
  } else if (typeof isHost === 'boolean') {
    isHostValue = isHost;
  }
  
  socket.data = {
    meetingId: meetingId as string,
    participantId: participantId as string,
    participantName: (participantName as string) || 'Participant',
    isHost: isHostValue
  };

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

// Initialize services
const monitoringService = new MonitoringService(io);
const securityService = new SecurityService(
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10)
);

// Configure Express middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply security middleware
if (process.env.RATE_LIMIT_ENABLED !== 'false') {
  app.use(securityService.rateLimitMiddleware());
}

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
  const healthStatus = monitoringService.getHealthStatus();
  const serverInfo = {
    status: healthStatus.status,
    timestamp: new Date().toISOString(),
    port: PORT,
    uptime: process.uptime(),
    metrics: healthStatus.metrics,
    issues: healthStatus.issues,
    cors: {
      origin: corsOptions.origin,
      methods: corsOptions.methods
    }
  };
  const statusCode = healthStatus.status === 'unhealthy' ? 503 : 200;
  res.status(statusCode).json(serverInfo);
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json(monitoringService.getMetrics());
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
io.on('connection', (socket: Socket) => {
  console.log('New client connected:', socket.id);

  // Handle connection - participant data is already stored in middleware
  const socketData = socket.data as ParticipantSocketData | undefined;
  const { meetingId, participantId, participantName, isHost } = socketData || {};
  
  if (!meetingId || !participantId) {
    console.error('Missing participant data on connection');
    socket.disconnect();
    return;
  }

  console.log(`Participant ${participantName} (${participantId}) connecting to meeting ${meetingId}`);
  
  // Join the meeting room
  socket.join(meetingId);

  // Get existing participants in the room
  const roomParticipants = Array.from(io.sockets.adapter.rooms.get(meetingId) || [])
    .map(socketId => {
      const s = io.sockets.sockets.get(socketId) as Socket | undefined;
      return s?.data as ParticipantSocketData | undefined;
    })
    .filter((data): data is ParticipantSocketData => Boolean(data));

  // Notify others in the meeting about new participant
  socket.to(meetingId).emit('participant-joined', {
    participantId,
    participantName,
    state: {
      isHost: isHost || false,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      isHandRaised: false,
      isAdmitted: true
    }
  });

  // Send list of existing participants to the new participant
  roomParticipants.forEach(existingParticipant => {
    if (existingParticipant && existingParticipant.participantId !== participantId) {
      socket.emit('participant-joined', {
        participantId: existingParticipant.participantId,
        participantName: existingParticipant.participantName,
        state: {
          isHost: existingParticipant.isHost || false,
          isAudioEnabled: true,
          isVideoEnabled: true,
          isScreenSharing: false,
          isHandRaised: false,
          isAdmitted: true
        }
      });
    }
  });

  // WebRTC Signaling: Handle offer
  socket.on('offer', (data: { to: string; offer: RTCSessionDescriptionInit }) => {
    try {
      const { to, offer } = data;
      const socketData = socket.data as ParticipantSocketData | undefined;
      const { participantId: from } = socketData || {};
      
      if (!from || !to) {
        console.error('Missing participant IDs in offer');
        return;
      }

      console.log(`Offer from ${from} to ${to}`);
      
      // Find the target socket
      const targetSocket = Array.from(io.sockets.sockets.values())
        .find((s: Socket) => {
          const data = s.data as ParticipantSocketData | undefined;
          return data?.participantId === to && data?.meetingId === socketData?.meetingId;
        }) as Socket | undefined;
      
      if (targetSocket) {
        targetSocket.emit('offer', { from, offer });
      } else {
        console.error(`Target participant ${to} not found`);
        socket.emit('error', { message: `Participant ${to} not found` });
      }
    } catch (error) {
      console.error('Error handling offer:', error);
      socket.emit('error', { message: 'Failed to handle offer' });
    }
  });

  // WebRTC Signaling: Handle answer
  socket.on('answer', (data: { to: string; answer: RTCSessionDescriptionInit }) => {
    try {
      const { to, answer } = data;
      const socketData = socket.data as ParticipantSocketData | undefined;
      const { participantId: from } = socketData || {};
      
      if (!from || !to) {
        console.error('Missing participant IDs in answer');
        return;
      }

      console.log(`Answer from ${from} to ${to}`);
      
      // Find the target socket
      const targetSocket = Array.from(io.sockets.sockets.values())
        .find((s: Socket) => {
          const data = s.data as ParticipantSocketData | undefined;
          return data?.participantId === to && data?.meetingId === socketData?.meetingId;
        }) as Socket | undefined;
      
      if (targetSocket) {
        targetSocket.emit('answer', { from, answer });
      } else {
        console.error(`Target participant ${to} not found`);
        socket.emit('error', { message: `Participant ${to} not found` });
      }
    } catch (error) {
      console.error('Error handling answer:', error);
      socket.emit('error', { message: 'Failed to handle answer' });
    }
  });

  // WebRTC Signaling: Handle ICE candidate
  socket.on('ice-candidate', (data: { to: string; candidate: RTCIceCandidateInit }) => {
    try {
      const { to, candidate } = data;
      const socketData = socket.data as ParticipantSocketData | undefined;
      const { participantId: from } = socketData || {};
      
      if (!from || !to) {
        console.error('Missing participant IDs in ice-candidate');
        return;
      }

      console.log(`ICE candidate from ${from} to ${to}`);
      
      // Find the target socket
      const targetSocket = Array.from(io.sockets.sockets.values())
        .find((s: Socket) => {
          const data = s.data as ParticipantSocketData | undefined;
          return data?.participantId === to && data?.meetingId === socketData?.meetingId;
        }) as Socket | undefined;
      
      if (targetSocket) {
        targetSocket.emit('ice-candidate', { from, candidate });
      } else {
        console.error(`Target participant ${to} not found`);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  });

  // Handle participant updates
  socket.on('participant-update', (data: { participantId: string; updates: Record<string, unknown> }) => {
    try {
      const { participantId, updates } = data;
      const socketData = socket.data as ParticipantSocketData | undefined;
      const { meetingId } = socketData || {};
      
      if (!meetingId) {
        console.error('Missing meeting ID in participant-update');
        return;
      }

      console.log(`Participant update from ${participantId} in meeting ${meetingId}`);
      
      // Broadcast to all participants in the meeting except the sender
      socket.to(meetingId).emit('participant-updated', {
        participantId,
        updates
      });
    } catch (error) {
      console.error('Error handling participant-update:', error);
    }
  });

  // Handle meeting state updates
  socket.on('meeting-state-update', (data: { state: string; data: Record<string, unknown> }) => {
    try {
      const socketData = socket.data as ParticipantSocketData | undefined;
      const { meetingId } = socketData || {};
      
      if (!meetingId) {
        console.error('Missing meeting ID in meeting-state-update');
        return;
      }

      console.log(`Meeting state update in meeting ${meetingId}`);
      
      // Broadcast to all participants in the meeting
      io.to(meetingId).emit('meeting-state-updated', data);
    } catch (error) {
      console.error('Error handling meeting-state-update:', error);
    }
  });

  // Handle remove participant (host only)
  socket.on('remove-participant', (data: { participantId: string; meetingId: string }) => {
    try {
      const { participantId, meetingId: targetMeetingId } = data;
      const socketData = socket.data as ParticipantSocketData | undefined;
      const { participantId: requesterId, meetingId, isHost } = socketData || {};
      
      if (!isHost) {
        socket.emit('error', { message: 'Only host can remove participants' });
        return;
      }

      if (meetingId !== targetMeetingId) {
        socket.emit('error', { message: 'Invalid meeting ID' });
        return;
      }

      console.log(`Host ${requesterId} removing participant ${participantId} from meeting ${meetingId}`);
      
      // Find and disconnect the target participant
      const targetSocket = Array.from(io.sockets.sockets.values())
        .find((s: Socket) => {
          const data = s.data as ParticipantSocketData | undefined;
          return data?.participantId === participantId && data?.meetingId === meetingId;
        }) as Socket | undefined;
      
      if (targetSocket) {
        targetSocket.emit('removed-from-meeting', { reason: 'Removed by host' });
        targetSocket.disconnect();
      }
      
      // Notify others
      socket.to(meetingId).emit('participant-left', { participantId });
    } catch (error) {
      console.error('Error handling remove-participant:', error);
      socket.emit('error', { message: 'Failed to remove participant' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const data = socket.data as ParticipantSocketData | undefined;
    const { meetingId, participantId } = data || {};
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