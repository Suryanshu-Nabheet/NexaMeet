import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface Client {
  id: string;
  meetingId: string;
  ws: WebSocket;
}

interface SignalingMessage {
  type: 'join' | 'offer' | 'answer' | 'ice-candidate' | 'participant-joined' | 'participant-left';
  meetingId?: string;
  participantId?: string;
  to?: string;
  from?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export class SignalingServer {
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map();
  private meetingRooms: Map<string, Set<string>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      let clientId = '';
      let meetingId = '';

      ws.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data.toString()) as SignalingMessage;

          switch (data.type) {
            case 'join':
              if (data.participantId && data.meetingId) {
                clientId = data.participantId;
                meetingId = data.meetingId;
                
                // Add client to meeting room
                if (!this.meetingRooms.has(meetingId)) {
                  this.meetingRooms.set(meetingId, new Set());
                }
                this.meetingRooms.get(meetingId)?.add(clientId);
                
                // Store client
                this.clients.set(clientId, { id: clientId, meetingId, ws });
                
                // Notify other participants
                this.broadcastToRoom(meetingId, {
                  type: 'participant-joined',
                  participantId: clientId
                }, clientId);
              }
              break;

            case 'offer':
            case 'answer':
            case 'ice-candidate':
              if (data.to) {
                const targetClient = this.clients.get(data.to);
                if (targetClient) {
                  targetClient.ws.send(JSON.stringify({
                    ...data,
                    from: clientId
                  }));
                }
              }
              break;
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      });

      ws.addEventListener('close', () => {
        if (clientId && meetingId) {
          // Remove client from meeting room
          this.meetingRooms.get(meetingId)?.delete(clientId);
          this.clients.delete(clientId);

          // Notify other participants
          this.broadcastToRoom(meetingId, {
            type: 'participant-left',
            participantId: clientId
          });
        }
      });
    });
  }

  private broadcastToRoom(meetingId: string, message: SignalingMessage, excludeClientId?: string) {
    const room = this.meetingRooms.get(meetingId);
    if (room) {
      room.forEach(clientId => {
        if (clientId !== excludeClientId) {
          const client = this.clients.get(clientId);
          if (client) {
            client.ws.send(JSON.stringify(message));
          }
        }
      });
    }
  }
} 