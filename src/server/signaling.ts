import { WebSocketServer } from 'ws';
import { Server } from 'http';

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave';
  from: string;
  to?: string;
  data: any;
}

export class SignalingServer {
  private wss: WebSocketServer;
  private rooms: Map<string, Set<WebSocket>> = new Map();
  private clients: Map<WebSocket, string> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New client connected');

      ws.on('message', (message: string) => {
        try {
          const data: SignalingMessage = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });

      ws.on('close', () => {
        const clientId = this.clients.get(ws);
        if (clientId) {
          // Remove client from all rooms
          this.rooms.forEach((clients, roomId) => {
            if (clients.has(ws)) {
              clients.delete(ws);
              // Notify other participants
              this.broadcastToRoom(roomId, {
                type: 'leave',
                from: clientId,
                data: { roomId }
              }, ws);
            }
          });
          this.clients.delete(ws);
        }
      });
    });
  }

  private handleMessage(ws: WebSocket, message: SignalingMessage) {
    switch (message.type) {
      case 'join':
        this.handleJoin(ws, message);
        break;
      case 'offer':
      case 'answer':
      case 'ice-candidate':
        this.handleSignaling(ws, message);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private handleJoin(ws: WebSocket, message: SignalingMessage) {
    const { from, data } = message;
    const { roomId } = data;

    // Store client ID
    this.clients.set(ws, from);

    // Add client to room
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)?.add(ws);

    // Notify other participants in the room
    this.broadcastToRoom(roomId, {
      type: 'join',
      from,
      data: { roomId }
    }, ws);

    // Send list of current participants to the new client
    const participants = Array.from(this.rooms.get(roomId) || [])
      .map(client => this.clients.get(client))
      .filter(id => id !== from);

    ws.send(JSON.stringify({
      type: 'participants',
      from: 'server',
      data: { participants }
    }));
  }

  private handleSignaling(ws: WebSocket, message: SignalingMessage) {
    const { to, type, from, data } = message;
    if (!to) return;

    // Find target client
    const targetClient = Array.from(this.clients.entries())
      .find(([_, clientId]) => clientId === to)?.[0];

    if (targetClient) {
      targetClient.send(JSON.stringify({
        type,
        from,
        data
      }));
    }
  }

  private broadcastToRoom(roomId: string, message: SignalingMessage, exclude?: WebSocket) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    room.forEach(client => {
      if (client !== exclude && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }
} 