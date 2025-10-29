"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalingServer = void 0;
const ws_1 = require("ws");
class SignalingServer {
    constructor(server) {
        this.clients = new Map();
        this.meetingRooms = new Map();
        this.wss = new ws_1.WebSocketServer({ server });
        this.setupWebSocketServer();
    }
    setupWebSocketServer() {
        this.wss.on('connection', (ws) => {
            let clientId = '';
            let meetingId = '';
            ws.addEventListener('message', (event) => {
                try {
                    const data = JSON.parse(event.data.toString());
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
                }
                catch (error) {
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
    broadcastToRoom(meetingId, message, excludeClientId) {
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
exports.SignalingServer = SignalingServer;
