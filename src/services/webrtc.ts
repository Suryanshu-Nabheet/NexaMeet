import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { Participant, ParticipantMap, MeetingState, ChatMessage } from '../types';

interface WebRTCConfig {
  signalingServerUrl: string;
  iceServers: RTCIceServer[];
}

interface DataChannelMessage {
  type: 'participant-update' | 'chat-message' | 'meeting-state';
  payload: Partial<Participant> | { message: string; sender: string; timestamp: number } | { state: string; data: MeetingState };
}

interface ParticipantData {
  participantId: string;
  participantName: string;
  state: Partial<Participant>;
}

export class WebRTCService {
  private socket: Socket | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private config: WebRTCConfig = {
    signalingServerUrl: import.meta.env.VITE_SERVER_URL || 'http://localhost:3001',
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ]
  };
  private meetingId: string;
  private participantId: string;
  private onTrackCallback: ((stream: MediaStream, participantId: string) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private iceGatheringTimeout: number = 10000; // 10 seconds
  private maxIceCandidates: number = 10;
  private connectionCheckInterval: NodeJS.Timeout | null = null;
  private participants: Map<string, Participant> = new Map();
  private isConnecting: boolean = false;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private onParticipantsUpdate: (participants: ParticipantMap) => void;
  private onError: (error: Error) => void;
  private isRecording: boolean = false;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingStartTime: number | null = null;
  private recordingTimer: NodeJS.Timeout | null = null;
  private onRecordingStateChange: ((isRecording: boolean, duration?: number) => void) | null = null;
  private participantUpdateCallback: ((participantId: string, updates: Partial<Participant>) => void) | null = null;
  private meetingState: MeetingState = {
    isActive: true,
    isRecording: false,
    isChatEnabled: true,
    isHandRaiseEnabled: true,
    isScreenSharingEnabled: true,
    isAudioEnabled: true,
    isVideoEnabled: true,
    title: 'Untitled Meeting'
  };
  private onParticipantJoined: ((data: ParticipantData) => void) | undefined;
  private onParticipantLeft: ((data: { participantId: string }) => void) | undefined;
  private onMeetingStateUpdateCallback: ((state: MeetingState) => void) | null = null;
  private onChatMessage: ((message: ChatMessage) => void) | null = null;

  // Added private property for local participant state
  private localParticipantState: Partial<Participant> = {};

  constructor(
    meetingId: string,
    participantId: string,
    onParticipantsUpdate: (participants: ParticipantMap) => void,
    onError: (error: Error) => void,
    onParticipantJoined?: (data: ParticipantData) => void,
    onParticipantLeft?: (data: { participantId: string }) => void,
    isHost: boolean = false
  ) {
    console.log('WebRTCService constructor called with:', { meetingId, participantId });
    console.log('Server URL:', this.config.signalingServerUrl);
    
    this.meetingId = meetingId;
    this.participantId = participantId;
    this.onParticipantsUpdate = onParticipantsUpdate;
    this.onError = onError;
    this.peerConnections = new Map();
    this.dataChannels = new Map();
    
    console.log('WebRTCService: Initializing participants map with local participant.');
    const userName = localStorage.getItem('userName');
    if (!userName) {
      console.warn('WebRTCService: No user name found in localStorage');
    }
    const initialLocalParticipant: Participant = {
      id: this.participantId,
      name: userName || 'Participant',
      isHost: isHost,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isScreenSharing: false,
      isHandRaised: false,
      isAdmitted: true,
      stream: null
    };
    this.localParticipantState = { ...initialLocalParticipant };
    this.participants.set(this.participantId, initialLocalParticipant);
    console.log('WebRTCService: Local participant added to map:', initialLocalParticipant);
    this.onParticipantsUpdate(this.participants);

    this.onParticipantJoined = onParticipantJoined;
    this.onParticipantLeft = onParticipantLeft;

    // Initialize stream and then connect
    // The hook will call initializeLocalStream which calls connectToSignalingServer
  }

  public async initializeLocalStream(): Promise<void> {
    console.log('WebRTCService: Attempting to initialize local stream...');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('WebRTCService: Media devices API not supported.');
        throw new Error('Media devices API is not supported in this browser');
      }

      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.warn('WebRTCService: Not in a secure context or localhost. getUserMedia might fail.');
      }

      console.log('WebRTCService: Requesting media stream (video: true, audio: true)...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      console.log('WebRTCService: Local stream successfully obtained:', stream);
      this.localStream = stream;

      console.log('WebRTCService: Updating local participant with stream and state.');
      const updatedLocalParticipantState = {
        ...this.localParticipantState,
        stream: stream,
        isAudioEnabled: stream.getAudioTracks().some(track => track.enabled),
        isVideoEnabled: stream.getVideoTracks().some(track => track.enabled),
      };
      this.localParticipantState = updatedLocalParticipantState;
      this.updateParticipant(this.participantId, updatedLocalParticipantState); // Use updateParticipant to manage map and notify

      console.log('WebRTCService: Local stream initialized. Proceeding to connect.');
      // Connect to signaling server after stream is initialized
      this.connectToSignalingServer();

    } catch (error) {
      console.error('WebRTCService: Error initializing local stream:', error);
      // Update local participant state to reflect media failure
      const updatedLocalParticipantState = {
        ...this.localParticipantState,
        isAudioEnabled: false,
        isVideoEnabled: false,
        stream: null
      };
      this.localParticipantState = updatedLocalParticipantState;
      this.updateParticipant(this.participantId, updatedLocalParticipantState); // Use updateParticipant to manage map and notify

      this.handleError(new Error('Failed to access camera and microphone. Please check permissions.'));
    }
  }

  private connectToSignalingServer() {
    console.log('WebRTCService: connectToSignalingServer called.', { isConnecting: this.isConnecting, socketExists: !!this.socket });
    if (this.isConnecting || (this.socket && this.socket.connected)) {
      console.log('WebRTCService: Already attempting to connect or already connected. Skipping.');
      return;
    }

    if (this.socket && !this.socket.connected && !this.isConnecting) {
      console.log('WebRTCService: Cleaning up existing non-connected socket before new connection.');
      this.disconnect();
    }

    this.isConnecting = true;
    const serverUrl = this.config.signalingServerUrl;
    console.log('WebRTCService: Connecting to signaling server at:', serverUrl);

    try {
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 20000,
        autoConnect: true,
        path: '/socket.io',
        forceNew: true,
        withCredentials: true,
        query: {
          meetingId: this.meetingId,
          participantId: this.participantId,
          participantName: this.localParticipantState.name || 'Anonymous',
          isHost: String(this.localParticipantState.isHost || false)
        }
      });

      this.socket.on('connect_error', (error: Error) => {
        console.error('WebRTCService: Socket connection error:', error);
      });

      this.socket.on('connect', () => {
        console.log('WebRTCService: Socket connected successfully!');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebRTCService: Socket disconnected:', reason);
        this.isConnecting = false;
      });

      this.socket.on('participant-joined', async (data: ParticipantData) => {
        console.log('WebRTCService: Participant joined:', data);
        const { participantId, participantName, state } = data;

        if (participantId === this.participantId) {
          console.log('WebRTCService: Received participant-joined for local participant, updating state from server.', state);
          this.localParticipantState = { ...this.localParticipantState, ...state, name: participantName };
          this.updateParticipant(this.participantId, this.localParticipantState);
        } else if (!this.participants.has(participantId)) {
          console.log('WebRTCService: Adding new remote participant:', participantId);
          const newParticipant: Participant = {
            id: participantId,
            name: participantName || 'Participant',
            isHost: state.isHost ?? false,
            isAudioEnabled: state.isAudioEnabled ?? true,
            isVideoEnabled: state.isVideoEnabled ?? true,
            isScreenSharing: state.isScreenSharing ?? false,
            isHandRaised: state.isHandRaised ?? false,
            isAdmitted: state.isAdmitted ?? true,
            stream: null,
          };
          this.participants.set(participantId, newParticipant);
          console.log('WebRTCService: Added new remote participant to map:', newParticipant);
          this.onParticipantsUpdate(this.participants);

          // Determine who should initiate the connection
          // Host always initiates, otherwise the participant with the lexicographically smaller ID
          const isInitiator = this.localParticipantState.isHost || 
            (!state.isHost && this.participantId < participantId);
          
          if (isInitiator) {
            console.log(`WebRTCService: Initiating peer connection and creating offer for ${participantId}.`);
            await this.createPeerConnection(participantId, true);
          } else {
            console.log(`WebRTCService: Creating peer connection for ${participantId} (will await offer).`);
            await this.createPeerConnection(participantId, false);
          }

          if (this.onParticipantJoined) {
            this.onParticipantJoined(data);
          }
        } else {
          console.log('WebRTCService: Participant already in map, updating state from join message:', participantId, state);
          this.updateParticipant(participantId, state);
        }
      });

      this.socket.on('participant-left', (data: { participantId: string }) => {
        console.log('WebRTCService: Participant left:', data);
        this.removeParticipant(data.participantId);
        if (this.onParticipantLeft) {
          this.onParticipantLeft(data);
        }
      });

      this.socket.on('offer', async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
        console.log('WebRTCService: Received offer from:', data.from);
        await this.handleOffer(data.from, data.offer);
      });

      this.socket.on('answer', async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
        console.log('WebRTCService: Received answer from:', data.from);
        await this.handleAnswer(data.from, data.answer);
      });

      this.socket.on('ice-candidate', async (data: { from: string; candidate: RTCIceCandidateInit }) => {
        console.log('WebRTCService: Received ICE candidate from:', data.from);
        await this.handleIceCandidate(data.from, data.candidate);
      });

      this.socket.on('participant-updated', (data: { participantId: string; updates: Partial<Participant> }) => {
        console.log('WebRTCService: Participant updated via signaling:', data);
        this.updateParticipant(data.participantId, data.updates);
      });

      this.socket.on('meeting-state-updated', (data: { state: string; data: MeetingState }) => {
        console.log('WebRTCService: Meeting state updated via signaling:', data);
        if (data.data) {
          console.log('WebRTCService: Updating local meeting state from signaled data.', data.data);
          this.meetingState = { ...this.meetingState, ...data.data };
        } else {
          console.warn('WebRTCService: Received meeting-state-updated signal with missing data payload:', data);
        }
      });

      this.socket.on('error', (error: Error) => {
        console.error('WebRTCService: Socket error event:', error);
      });

      console.log('WebRTCService: Socket configured and connecting...');

    } catch (error) {
      console.error('WebRTCService: Error during socket connection setup:', error);
      this.handleError(error as Error);
      this.isConnecting = false;
    }
  }

  private async createPeerConnection(participantId: string, createOffer: boolean): Promise<RTCPeerConnection> {
    console.log('WebRTCService: createPeerConnection called for participant:', participantId, 'createOffer:', createOffer);
    try {
      const configuration: RTCConfiguration = {
        iceServers: this.config.iceServers
      };

      const peerConnection = new RTCPeerConnection(configuration);
      this.peerConnections.set(participantId, peerConnection);
      console.log('WebRTCService: Peer connection created and set for:', participantId);

      if (this.localStream) {
        console.log('WebRTCService: Adding local stream tracks to peer connection for:', participantId);
        this.localStream.getTracks().forEach(track => {
          console.log('WebRTCService: Adding track (kind:', track.kind, ', id:', track.id, ', enabled:', track.enabled, ') to peer connection for', participantId);
          peerConnection.addTrack(track, this.localStream!);
        });
      } else {
        console.warn('WebRTCService: createPeerConnection called but localStream is null for:', participantId);
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.socket) {
          console.log('WebRTCService: ICE candidate gathered for', participantId, ':', event.candidate);
          this.socket.emit('ice-candidate', {
            to: participantId,
            candidate: event.candidate
          });
        } else if (!event.candidate) {
          console.log('WebRTCService: ICE gathering complete for', participantId);
        }
      };

      peerConnection.onconnectionstatechange = () => {
        console.log(`WebRTCService: Connection state with ${participantId}:`, peerConnection.connectionState);
        if (peerConnection.connectionState === 'failed') {
          this.handleError(new Error(`Connection failed with ${participantId}`));
        } else if (peerConnection.connectionState === 'connected') {
          console.log(`WebRTCService: Connection established with ${participantId}`);
        }
      };

      peerConnection.ontrack = (event) => {
        const stream = event.streams[0];
        const track = event.track;
        console.log('WebRTCService: Received track (kind:', track.kind, ', id:', track.id, ', enabled:', track.enabled, ') from', participantId, '. Stream:', stream);
        console.log('WebRTCService: Calling updateParticipant with received stream for', participantId);
        this.updateParticipant(participantId, { stream: stream });
      };

      if (createOffer) {
        const dataChannel = peerConnection.createDataChannel('updates');
        this.dataChannels.set(participantId, dataChannel);
        dataChannel.onmessage = (event) => {
          console.log('WebRTCService: Data channel message from', participantId, ':', event.data);
          try {
            const message: DataChannelMessage = JSON.parse(event.data);
            if (message.type === 'participant-update') {
              if(this.participantUpdateCallback) {
                console.log('WebRTCService: Calling participantUpdateCallback with payload:', message.payload);
                this.participantUpdateCallback(participantId, message.payload as Partial<Participant>);
              }
            } else if (message.type === 'chat-message') {
              console.log('WebRTCService: Chat message received:', message.payload);
            } else if (message.type === 'meeting-state') {
              console.log('WebRTCService: Meeting state message received:', message.payload);
              const meetingStatePayload = message.payload as { state: string; data: MeetingState };
              if (meetingStatePayload && meetingStatePayload.data) {
                this.meetingState = { ...this.meetingState, ...meetingStatePayload.data };
                console.log('WebRTCService: Updated local meeting state from data channel message.', this.meetingState);
              } else {
                console.warn('WebRTCService: Received meeting-state message with unexpected payload structure:', message.payload);
              }
            }
          } catch (e) {
            console.error('WebRTCService: Failed to parse data channel message:', e);
          }
        };
        dataChannel.onopen = () => console.log('WebRTCService: Data channel opened with', participantId);
        dataChannel.onclose = () => console.log('WebRTCService: Data channel closed with', participantId);
        dataChannel.onerror = (error) => console.error('WebRTCService: Data channel error with', participantId, ':', error);
      } else {
        peerConnection.ondatachannel = (event) => {
          console.log('WebRTCService: Received data channel from', participantId);
          const dataChannel = event.channel;
          this.dataChannels.set(participantId, dataChannel);

          dataChannel.onmessage = (event) => {
            console.log('WebRTCService: Data channel message from', participantId, ':', event.data);
            try {
              const message: DataChannelMessage = JSON.parse(event.data);
              if (message.type === 'participant-update') {
                if(this.participantUpdateCallback) {
                  console.log('WebRTCService: Calling participantUpdateCallback with payload:', message.payload);
                  this.participantUpdateCallback(participantId, message.payload as Partial<Participant>);
                }
              } else if (message.type === 'chat-message') {
                console.log('WebRTCService: Chat message received:', message.payload);
              } else if (message.type === 'meeting-state') {
                console.log('WebRTCService: Meeting state message received:', message.payload);
                const meetingStatePayload = message.payload as { state: string; data: MeetingState };
                if (meetingStatePayload && meetingStatePayload.data) {
                  this.meetingState = { ...this.meetingState, ...meetingStatePayload.data };
                  console.log('WebRTCService: Updated local meeting state from data channel message.', this.meetingState);
                } else {
                  console.warn('WebRTCService: Received meeting-state message with unexpected payload structure:', message.payload);
                }
              }
            } catch (e) {
              console.error('WebRTCService: Failed to parse data channel message:', e);
            }
          };
          dataChannel.onopen = () => console.log('WebRTCService: Data channel opened with', participantId);
          dataChannel.onclose = () => console.log('WebRTCService: Data channel closed with', participantId);
          dataChannel.onerror = (error) => console.error('WebRTCService: Data channel error with', participantId, ':', error);
        };
      }

      if(createOffer && this.socket) {
        console.log('WebRTCService: Creating offer for', participantId);
        const offer = await peerConnection.createOffer();
        console.log('WebRTCService: Set local description (offer) for', participantId);
        await peerConnection.setLocalDescription(offer);
        console.log('WebRTCService: Emitting offer to', participantId);
        this.socket.emit('offer', {
          to: participantId,
          offer
        });
      }

      return peerConnection;
    } catch (error) {
      console.error('WebRTCService: Error creating peer connection:', error);
      this.handleError(new Error('Failed to create peer connection'));
      throw error;
    }
  }

  private async handleOffer(from: string, offer: RTCSessionDescriptionInit) {
    console.log('WebRTCService: handleOffer called from:', from);
    try {
      let peerConnection = this.peerConnections.get(from);
      
      // Create peer connection if it doesn't exist (answerer side)
      if (!peerConnection) {
        console.log('WebRTCService: Creating peer connection for incoming offer from', from);
        peerConnection = await this.createPeerConnection(from, false);
      }
      
      if (peerConnection && this.socket) {
        console.log('WebRTCService: Setting remote description (offer) for', from);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        console.log('WebRTCService: Creating answer for', from);
        const answer = await peerConnection.createAnswer();
        console.log('WebRTCService: Set local description (answer) for', from);
        await peerConnection.setLocalDescription(answer);
        console.log('WebRTCService: Emitting answer to', from);
        this.socket.emit('answer', {
          to: from,
          answer
        });
      }
    } catch (error) {
      console.error('WebRTCService: Error handling offer:', error);
      this.handleError(error instanceof Error ? error : new Error('Failed to handle offer'));
    }
  }

  private async handleAnswer(from: string, answer: RTCSessionDescriptionInit) {
    console.log('WebRTCService: handleAnswer called from:', from);
    try {
      const peerConnection = this.peerConnections.get(from);
      if (peerConnection instanceof RTCPeerConnection) {
        console.log('WebRTCService: Setting remote description (answer) for', from);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('WebRTCService: Error handling answer:', error);
      this.handleError(new Error('Failed to handle answer'));
    }
  }

  private async handleIceCandidate(from: string, candidate: RTCIceCandidateInit) {
    console.log('WebRTCService: handleIceCandidate called from:', from);
    try {
      const peerConnection = this.peerConnections.get(from);
      if (peerConnection instanceof RTCPeerConnection) {
        console.log('WebRTCService: Adding ICE candidate for', from);
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('WebRTCService: Error handling ICE candidate:', error);
      this.handleError(new Error('Failed to handle ICE candidate'));
    }
  }

  private updateParticipant(participantId: string, update: Partial<Participant>) {
    console.log('WebRTCService: Updating participant:', participantId, 'with updates:', update);
    const existingParticipant = this.participants.get(participantId);
    if (existingParticipant) {
      console.log('WebRTCService: Participant found, merging updates.');
      const updatedParticipant: Participant = {
        ...existingParticipant,
        ...update,
        id: participantId,
        name: update.name || existingParticipant.name || 'Participant',
        isHost: update.isHost ?? existingParticipant.isHost,
        isAudioEnabled: update.isAudioEnabled ?? existingParticipant.isAudioEnabled,
        isVideoEnabled: update.isVideoEnabled ?? existingParticipant.isVideoEnabled,
        isScreenSharing: update.isScreenSharing ?? existingParticipant.isScreenSharing,
        isHandRaised: update.isHandRaised ?? existingParticipant.isHandRaised,
        isAdmitted: update.isAdmitted ?? existingParticipant.isAdmitted,
        stream: update.stream !== undefined ? update.stream : existingParticipant.stream
      };
      this.participants.set(participantId, updatedParticipant);
      console.log('WebRTCService: Updated participants map:', Array.from(this.participants.entries()));
      this.onParticipantsUpdate(this.participants);
    } else {
      console.warn('WebRTCService: updateParticipant called for unknown participantId:', participantId, '. Creating new entry (may be incomplete).');
      const newParticipant: Participant = {
        id: participantId,
        name: update.name || 'Participant',
        isHost: update.isHost ?? false,
        isAudioEnabled: update.isAudioEnabled ?? true,
        isVideoEnabled: update.isVideoEnabled ?? true,
        isScreenSharing: update.isScreenSharing ?? false,
        isHandRaised: update.isHandRaised ?? false,
        isAdmitted: update.isAdmitted ?? true,
        stream: update.stream ?? null
      };
      this.participants.set(participantId, newParticipant);
      console.log('WebRTCService: Added new participant during update:', newParticipant);
      this.onParticipantsUpdate(this.participants);
    }
  }

  private removeParticipant(participantId: string) {
    console.log('WebRTCService: Removing participant:', participantId);
    const peerConnection = this.peerConnections.get(participantId);
    if (peerConnection) {
      console.log('WebRTCService: Closing peer connection for:', participantId);
      peerConnection.close();
      this.peerConnections.delete(participantId);
      console.log('WebRTCService: Peer connection deleted for:', participantId);
    }
    if (this.participants.has(participantId)) {
      console.log('WebRTCService: Deleting participant from map:', participantId);
      this.participants.delete(participantId);
      console.log('WebRTCService: Participant deleted from map:', participantId);
      this.onParticipantsUpdate(this.participants);
    } else {
      console.warn('WebRTCService: removeParticipant called for participant not in map:', participantId);
    }
  }

  public async toggleScreenShare(enabled: boolean): Promise<boolean> {
    console.log('WebRTCService: toggleScreenShare called:', enabled);
    try {
      if (enabled) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          throw new Error('Screen sharing is not supported in this browser');
        }

        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'monitor',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          } as MediaTrackConstraints,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100
          }
        });

        // Handle screen share stop
        screenStream.getVideoTracks()[0].onended = () => {
          console.log('WebRTCService: Screen share ended by user');
          this.toggleScreenShare(false);
        };

        this.screenStream = screenStream;
        
        // Update local participant state
        this.updateParticipant(this.participantId, {
          isScreenSharing: true,
          stream: screenStream
        });

        // Send screen stream to all peers
        for (const [peerId, peerConnection] of this.peerConnections.entries()) {
          try {
            const senders = peerConnection.getSenders();
            const videoSender = senders.find(sender => sender.track?.kind === 'video');
            
            if (videoSender) {
              console.log(`WebRTCService: Replacing video track for peer ${peerId}`);
              await videoSender.replaceTrack(screenStream.getVideoTracks()[0]);
            } else {
              console.log(`WebRTCService: Adding new video track for peer ${peerId}`);
              screenStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, screenStream);
              });
            }

            // Notify peers about screen share state
            this.signalParticipantUpdate(this.participantId, {
              isScreenSharing: true,
              stream: screenStream
            });
          } catch (error) {
            console.error(`WebRTCService: Error updating peer ${peerId} with screen share:`, error);
            toast.error('Failed to share screen with some participants');
          }
        }

        toast.success('Screen sharing started');
        return true;
      } else {
        await this.stopScreenSharing();
        return true;
      }
    } catch (error) {
      console.error('WebRTCService: Error toggling screen share:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to toggle screen sharing');
      return false;
    }
  }

  private async stopScreenSharing(): Promise<void> {
    try {
        // Stop screen sharing
        if (this.screenStream) {
          this.screenStream.getTracks().forEach(track => {
            track.stop();
          });
          this.screenStream = null;
        }

        // Update local participant state
        this.updateParticipant(this.participantId, {
          isScreenSharing: false,
          stream: this.localStream
        });

        // Restore video track for all peers
        if (this.localStream) {
          for (const [peerId, peerConnection] of this.peerConnections.entries()) {
            try {
              const senders = peerConnection.getSenders();
              const videoSender = senders.find(sender => sender.track?.kind === 'video');
              
              if (videoSender && this.localStream.getVideoTracks().length > 0) {
                console.log(`WebRTCService: Restoring video track for peer ${peerId}`);
                await videoSender.replaceTrack(this.localStream.getVideoTracks()[0]);
              }

              // Notify peers about screen share state
              this.signalParticipantUpdate(this.participantId, {
                isScreenSharing: false,
                stream: this.localStream
              });
            } catch (error) {
              console.error(`WebRTCService: Error restoring video track for peer ${peerId}:`, error);
            toast.error('Failed to restore video for some participants');
            }
          }
        }

        toast.success('Screen sharing stopped');
    } catch (error) {
      console.error('WebRTCService: Error stopping screen share:', error);
      toast.error('Failed to stop screen sharing');
      throw error;
    }
  }

  public async toggleAudio(enabled: boolean): Promise<void> {
    console.log('WebRTCService: toggleAudio called:', enabled);
    try {
      if (this.localStream) {
        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = enabled;
          
          // Update local participant state
          this.updateParticipant(this.participantId, {
            isAudioEnabled: enabled
          });

          // Notify peers about audio state change
          this.signalParticipantUpdate(this.participantId, {
            isAudioEnabled: enabled
          });
        }
      } else if (!enabled) {
        // If we're trying to enable audio but don't have a stream, initialize it
        await this.initializeLocalStream();
      }
    } catch (error) {
      console.error('WebRTCService: Error toggling audio:', error);
      this.handleError(error as Error);
    }
  }

  public async toggleVideo(enabled: boolean): Promise<void> {
    console.log('WebRTCService: toggleVideo called:', enabled);
    try {
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = enabled;
          
          // Update local participant state
          this.updateParticipant(this.participantId, {
            isVideoEnabled: enabled
          });

          // Notify peers about video state change
          this.signalParticipantUpdate(this.participantId, {
            isVideoEnabled: enabled
          });
        }
      } else if (!enabled) {
        // If we're trying to enable video but don't have a stream, initialize it
        await this.initializeLocalStream();
      }
    } catch (error) {
      console.error('WebRTCService: Error toggling video:', error);
      this.handleError(error as Error);
    }
  }

  public getLocalStream(): MediaStream | null {
    console.log('WebRTCService: getLocalStream called, returning:', this.localStream);
    return this.localStream;
  }

  public disconnect(): void {
    console.log('WebRTCService: Disconnecting...');
    this.peerConnections.forEach(pc => {
      console.log('WebRTCService: Closing peer connection:', pc);
      pc.close();
    });
    this.peerConnections.clear();
    console.log('WebRTCService: All peer connections closed and cleared.');

    if (this.localStream) {
      console.log('WebRTCService: Stopping local stream tracks...');
      this.localStream.getTracks().forEach(track => {
        console.log('WebRTCService: Stopping track:', track);
        track.stop();
      });
      this.localStream = null;
      console.log('WebRTCService: Local stream tracks stopped and stream set to null.');
    }

    if (this.screenStream) {
      console.log('WebRTCService: Stopping screen stream tracks...');
      this.screenStream.getTracks().forEach(track => {
        console.log('WebRTCService: Stopping screen track:', track);
        track.stop();
      });
      this.screenStream = null;
      console.log('WebRTCService: Screen stream tracks stopped and stream set to null.');
    }

    this.dataChannels.forEach(dc => {
      console.log('WebRTCService: Closing data channel:', dc);
      dc.close();
    });
    this.dataChannels.clear();
    console.log('WebRTCService: All data channels closed and cleared.');

    if (this.socket && this.socket.connected) {
      console.log('WebRTCService: Disconnecting socket.');
      this.socket.disconnect();
      console.log('WebRTCService: Socket disconnect called.');
    }
    this.socket = null;

    this.participants.clear();
    console.log('WebRTCService: Participants map cleared.');
    this.onParticipantsUpdate(this.participants);

    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.connectionTimeout) clearTimeout(this.connectionTimeout);
    if (this.connectionCheckInterval) clearInterval(this.connectionCheckInterval);

    this.cleanupRecording();

    console.log('WebRTCService: Disconnection complete.');
  }

  public setOnTrack(callback: (stream: MediaStream, participantId: string) => void): void {
    console.log('WebRTCService: setOnTrack callback registered.');
    this.onTrackCallback = callback;
  }

  public setOnError(callback: (error: Error) => void): void {
    console.log('WebRTCService: setOnError callback registered.');
    this.onError = callback;
  }

  public onParticipantUpdate(callback: (participantId: string, updates: Partial<Participant>) => void): void {
    console.log('WebRTCService: onParticipantUpdate callback registered.');
    this.participantUpdateCallback = callback;
  }

  public async handleError(error: Error): Promise<void> {
    console.error('WebRTCService: handleError called:', error);
    if (this.onError) {
      this.onError(error);
    } else {
      console.error('WebRTCService: handleError called but no onError callback registered.');
      toast.error(error.message || 'An unknown WebRTC error occurred.');
    }
  }

  public setRecordingStateChangeCallback(callback: (isRecording: boolean, duration?: number) => void) {
    this.onRecordingStateChange = callback;
  }

  public toggleRecording(enabled: boolean): void {
    console.log(`WebRTCService: toggleRecording called with ${enabled}`);
    
    if (enabled) {
      if (!this.localStream) {
        toast.error('Cannot start recording: no video stream available');
        return;
      }

      try {
        // Create a combined stream with both local video and screen share if available
        const streamsToRecord = [this.localStream];
        if (this.screenStream) {
          streamsToRecord.push(this.screenStream);
        }

        const combinedStream = new MediaStream();
        streamsToRecord.forEach(stream => {
          stream.getTracks().forEach(track => {
            combinedStream.addTrack(track);
          });
        });

        const mimeTypes = [
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm',
          'video/mp4',
        ];
        const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

        if (!supportedMimeType) {
          toast.error('Recording is not supported in your browser');
          return;
        }

        this.recordedChunks = [];
        this.mediaRecorder = new MediaRecorder(combinedStream, {
          mimeType: supportedMimeType,
          videoBitsPerSecond: 5000000, // Increased bitrate for better quality
          audioBitsPerSecond: 128000
        });

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
            console.log('Recording chunk received:', event.data.size, 'bytes');
          }
        };

        this.mediaRecorder.onstop = () => {
          console.log('Recording stopped, processing chunks:', this.recordedChunks.length);
          const blob = new Blob(this.recordedChunks, { type: supportedMimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          a.download = `meeting-recording-${timestamp}.${supportedMimeType.split('/')[1].split(';')[0]}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('Recording saved successfully!');
          
          // Cleanup
          this.cleanupRecording();
        };

        this.mediaRecorder.onerror = (event) => {
          console.error('MediaRecorder error:', event);
          toast.error('Recording failed');
          this.cleanupRecording();
        };

        // Start recording
        this.mediaRecorder.start(1000); // Collect data every second
        this.isRecording = true;
        this.recordingStartTime = Date.now();
        
        // Start recording timer
        this.recordingTimer = setInterval(() => {
          if (this.onRecordingStateChange && this.recordingStartTime) {
            const duration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
            this.onRecordingStateChange(true, duration);
          }
        }, 1000);

        // Update meeting state
        this.updateMeetingState({ isRecording: true });

        toast.success('Recording started');
      } catch (error) {
        console.error('Error starting recording:', error);
        toast.error('Failed to start recording');
        this.cleanupRecording();
      }
    } else {
      this.stopRecording();
    }
  }

  private stopRecording(): void {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      this.isRecording = false;
      this.updateMeetingState({ isRecording: false });
      
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer);
        this.recordingTimer = null;
      }
      
      if (this.onRecordingStateChange) {
        this.onRecordingStateChange(false);
    }
    }
  }

  private cleanupRecording(): void {
    this.stopRecording();
    this.recordedChunks = [];
    this.mediaRecorder = null;
  }

  public getMeetingState() {
    console.log('WebRTCService: getMeetingState called, returning:', this.meetingState);
    return { ...this.meetingState };
  }

  public updateMeetingState(newState: Partial<MeetingState>) {
    console.log('WebRTCService: updateMeetingState called with:', newState);
    this.meetingState = { ...this.meetingState, ...newState };
    console.log('WebRTCService: Broadcasting updated meeting state.');
    this.broadcastMeetingState();
    // Call the registered callback
    if (this.onMeetingStateUpdateCallback) {
      this.onMeetingStateUpdateCallback(this.meetingState);
    }
  }

  // Method to register a callback for meeting state updates
  public onMeetingStateUpdate(callback: (state: MeetingState) => void): void {
    console.log('WebRTCService: onMeetingStateUpdate callback registered.');
    this.onMeetingStateUpdateCallback = callback;
  }

  sendDataChannelMessage(participantId: string, message: DataChannelMessage): void {
    console.log('WebRTCService: sendDataChannelMessage called for', participantId, ':', message);
    const dataChannel = this.dataChannels.get(participantId);
    if (dataChannel && dataChannel.readyState === 'open') {
      try {
        console.log('WebRTCService: Sending data channel message.');
        dataChannel.send(JSON.stringify(message));
      } catch (error) {
        console.error('WebRTCService: Error sending data channel message to', participantId, ':', error);
      }
    } else {
      console.warn('WebRTCService: Data channel not open with', participantId, '. Cannot send message:', message);
    }
  }

  public signalParticipantUpdate(participantId: string, updates: Partial<Participant>): void {
    console.log('WebRTCService: signalParticipantUpdate called:', { participantId, updates });
    try {
      // Update local state
      this.updateParticipant(participantId, updates);

      // Send update to all peers through data channels
      const message: DataChannelMessage = {
        type: 'participant-update',
        payload: updates
      };

      for (const dataChannel of this.dataChannels.values()) {
        if (dataChannel.readyState === 'open') {
          dataChannel.send(JSON.stringify(message));
        }
      }

      // Also send through signaling server for reliability
      if (this.socket && this.socket.connected) {
        this.socket.emit('participant-update', {
          participantId,
          updates
        });
      }
    } catch (error) {
      console.error('WebRTCService: Error signaling participant update:', error);
      this.handleError(error as Error);
    }
  }

  private broadcastMeetingState() {
    console.log('WebRTCService: broadcastMeetingState called.');
    const message: DataChannelMessage = {
      type: 'meeting-state',
      payload: { state: 'updated', data: this.meetingState }
    };
    this.peerConnections.forEach((_, peerId) => {
      if (peerId !== this.participantId) {
        console.log('WebRTCService: Sending meeting state broadcast to:', peerId);
        this.sendDataChannelMessage(peerId, message);
      }
    });
  }

  private sendLocalTracks(participantId: string) {
    console.log('WebRTCService: sendLocalTracks called for', participantId);
    const peerConnection = this.peerConnections.get(participantId);
    if (peerConnection && this.localStream) {
      console.log('WebRTCService: Adding local stream tracks to peer connection for sending:', participantId);
      this.localStream.getTracks().forEach(track => {
        console.log('WebRTCService: Adding track (kind:', track.kind, ') for sending to', participantId);
        const sender = peerConnection.getSenders().find(s => s.track === track);
        if (!sender) {
          try {
            peerConnection.addTrack(track, this.localStream!);
            console.log('WebRTCService: Successfully added track for sending to', participantId);
          } catch (error) {
            console.error('WebRTCService: Error adding track for sending to', participantId, ':', error);
          }
        } else {
          console.log('WebRTCService: Sender already exists for track, skipping addTrack for', participantId);
        }
      });
    } else {
      console.warn('WebRTCService: Cannot send local tracks: peer connection not found or local stream null for', participantId);
    }
  }

  // Implement methods needed by UseMeetingReturn interface (placeholders for now)
  public muteParticipant(participantId: string): void {
    console.warn(`WebRTCService: muteParticipant not fully implemented for ${participantId}`);
    // Should signal to server/participant to mute
  }

  public unmuteParticipant(participantId: string): void {
    console.warn(`WebRTCService: unmuteParticipant not fully implemented for ${participantId}`);
    // Should signal to server/participant to unmute
  }

  public removeParticipantServer(participantId: string): void {
    console.warn(`WebRTCService: removeParticipantServer not fully implemented for ${participantId}`);
    // Should signal to server to remove participant
    // Placeholder implementation:
    if (this.socket && this.socket.connected) {
      console.log(`WebRTCService: Signaling server to remove participant ${participantId}`);
      this.socket.emit('remove-participant', { participantId, meetingId: this.meetingId });
    }
    // Client-side removal is handled by the 'participant-left' socket event
  }

  public async toggleHandRaise(enabled: boolean): Promise<void> {
    console.log('WebRTCService: toggleHandRaise called:', enabled);
    try {
      // Update local participant state
      this.updateParticipant(this.participantId, {
        isHandRaised: enabled
      });

      // Notify peers about hand raise state change
      this.signalParticipantUpdate(this.participantId, {
        isHandRaised: enabled
      });

      // Update meeting state to track hand raises
      const currentHandRaises = this.meetingState.handRaisedParticipants || new Set();
      if (enabled) {
        currentHandRaises.add(this.participantId);
      } else {
        currentHandRaises.delete(this.participantId);
      }
      this.updateMeetingState({ handRaisedParticipants: currentHandRaises });

      // Show toast notification
      toast.success(enabled ? 'Hand raised' : 'Hand lowered');
    } catch (error) {
      console.error('WebRTCService: Error toggling hand raise:', error);
      this.handleError(error as Error);
    }
  }

  public setChatMessageCallback(callback: (message: ChatMessage) => void) {
    this.onChatMessage = callback;
  }

  public sendChatMessage(content: string): void {
    if (!this.localParticipantState) {
      toast.error('Cannot send message: not connected to meeting');
      return;
    }

    const message: ChatMessage = {
      senderId: this.participantId,
      senderName: this.localParticipantState.name || 'Unknown',
      content,
      timestamp: Date.now()
    };

    // Send message to all peers through data channels
    let messageSent = false;
    for (const [peerId, dataChannel] of this.dataChannels.entries()) {
      if (dataChannel.readyState === 'open') {
        try {
          const messageData = {
            type: 'chat-message',
            payload: message
          };
          dataChannel.send(JSON.stringify(messageData));
          messageSent = true;
        } catch (error) {
          console.error(`Error sending message to peer ${peerId}:`, error);
        }
      }
    }

    if (!messageSent) {
      toast.error('Failed to send message: no active connections');
      return;
    }

    // Also trigger the callback for local display
    if (this.onChatMessage) {
      this.onChatMessage(message);
    }

    // Update meeting state with latest message
    this.updateMeetingState({
      lastChatMessage: message
    });
  }

  private handleDataChannelMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      
      if (message.type === 'chat' && this.onChatMessage) {
        this.onChatMessage(message.data);
      }
    } catch (error) {
      console.error('Error handling data channel message:', error);
    }
  }

  private setupDataChannel(peerId: string, dataChannel: RTCDataChannel): void {
    dataChannel.onmessage = (event) => this.handleDataChannelMessage(event);
    dataChannel.onerror = (error) => {
      console.error(`Data channel error for peer ${peerId}:`, error);
      toast.error('Connection error occurred');
    };
    dataChannel.onclose = () => {
      console.log(`Data channel closed for peer ${peerId}`);
      this.dataChannels.delete(peerId);
    };
    this.dataChannels.set(peerId, dataChannel);
  }
}