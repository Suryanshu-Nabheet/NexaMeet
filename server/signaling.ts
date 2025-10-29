import { WebSocketServer } from 'ws';
import { SignalingMessage } from '../src/types';

interface Client {
  ws: WebSocket;
  meetingId: string;
  participantId: string;
}

class SignalingServer {
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map();
  private meetingRooms: Map<string, Set<string>> = new Map();

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (ws: WebSocket, req: any) => {
      const url = new URL(req.url, 'ws://localhost');
      const meetingId = url.searchParams.get('meetingId');
      const participantId = url.searchParams.get('participantId');

      if (!meetingId || !participantId) {
        ws.close(1008, 'Missing meetingId or participantId');
        return;
      }

      // Store client
      this.clients.set(participantId, { ws, meetingId, participantId });

      // Add to meeting room
      if (!this.meetingRooms.has(meetingId)) {
        this.meetingRooms.set(meetingId, new Set());
      }
      this.meetingRooms.get(meetingId)?.add(participantId);

      // Notify others in the meeting
      this.broadcastToMeeting(meetingId, {
        type: 'participant-joined',
        participantId
      }, participantId);

      // Handle messages
      ws.on('message', (data: string) => {
        try {
          const message: SignalingMessage = JSON.parse(data);
          this.handleMessage(message, participantId);
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        this.handleDisconnection(participantId);
      });
    });
  }

  private handleMessage(message: SignalingMessage, from: string) {
    const client = this.clients.get(from);
    if (!client) return;

    switch (message.type) {
      case 'offer':
      case 'answer':
      case 'ice-candidate':
        // Forward to specific participant
        const targetClient = this.clients.get(message.from);
        if (targetClient) {
          targetClient.ws.send(JSON.stringify({
            ...message,
            from
          }));
        }
        break;
    }
  }

  private handleDisconnection(participantId: string) {
    const client = this.clients.get(participantId);
    if (!client) return;

    const { meetingId } = client;

    // Remove from meeting room
    const meetingRoom = this.meetingRooms.get(meetingId);
    if (meetingRoom) {
      meetingRoom.delete(participantId);
      if (meetingRoom.size === 0) {
        this.meetingRooms.delete(meetingId);
      }
    }

    // Remove client
    this.clients.delete(participantId);

    // Notify others
    this.broadcastToMeeting(meetingId, {
      type: 'participant-left',
      participantId
    });
  }

  private broadcastToMeeting(meetingId: string, message: SignalingMessage, excludeParticipantId?: string) {
    const meetingRoom = this.meetingRooms.get(meetingId);
    if (!meetingRoom) return;

    meetingRoom.forEach(participantId => {
      if (participantId !== excludeParticipantId) {
        const client = this.clients.get(participantId);
        if (client) {
          client.ws.send(JSON.stringify(message));
        }
      }
    });
  }
}

// Start the server
const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
new SignalingServer(port);
console.log(`Signaling server running on port ${port}`); 