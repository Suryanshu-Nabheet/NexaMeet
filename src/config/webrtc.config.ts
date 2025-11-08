/**
 * Production-ready WebRTC Configuration
 * Inspired by Jitsi Meet architecture
 */

export interface ICE ServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
  credentialType?: 'password';
}

export interface WebRTCConfig {
  signalingServerUrl: string;
  iceServers: ICE ServerConfig[];
  connectionTimeout: number;
  iceGatheringTimeout: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  enableTURN: boolean;
  enableSTUN: boolean;
  adaptiveBitrate: boolean;
  maxBitrate: number;
  minBitrate: number;
  preferredCodec: 'vp8' | 'vp9' | 'h264';
}

/**
 * Get production ICE servers with fallback
 * Priority: Custom TURN > Public TURN > STUN
 */
export const getICEServers = (): ICE ServerConfig[] => {
  const servers: ICE ServerConfig[] = [];

  // Custom TURN servers (configure via environment variables)
  const customTURN = import.meta.env.VITE_TURN_SERVER_URL;
  const customTURNUser = import.meta.env.VITE_TURN_USERNAME;
  const customTURNPassword = import.meta.env.VITE_TURN_PASSWORD;

  if (customTURN && customTURNUser && customTURNPassword) {
    servers.push({
      urls: customTURN,
      username: customTURNUser,
      credential: customTURNPassword,
      credentialType: 'password',
    });
  }

  // Public TURN servers (Twilio, Metered, etc.)
  // Add your production TURN server credentials here
  const twilioAccountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
  const twilioAuthToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;

  if (twilioAccountSid && twilioAuthToken) {
    servers.push({
      urls: `turn:global.turn.twilio.com:3478?transport=udp`,
      username: twilioAccountSid,
      credential: twilioAuthToken,
    });
    servers.push({
      urls: `turn:global.turn.twilio.com:3478?transport=tcp`,
      username: twilioAccountSid,
      credential: twilioAuthToken,
    });
  }

  // Metered TURN (free tier available)
  const meteredApiKey = import.meta.env.VITE_METERED_API_KEY;
  if (meteredApiKey) {
    servers.push({
      urls: `turn:a.relay.metered.ca:80`,
      username: meteredApiKey,
      credential: meteredApiKey,
    });
    servers.push({
      urls: `turn:a.relay.metered.ca:443`,
      username: meteredApiKey,
      credential: meteredApiKey,
    });
    servers.push({
      urls: `turn:a.relay.metered.ca:443?transport=tcp`,
      username: meteredApiKey,
      credential: meteredApiKey,
    });
  }

  // STUN servers (fallback for NAT traversal)
  servers.push(
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.stunprotocol.org:3478' }
  );

  return servers;
};

/**
 * Production WebRTC configuration
 */
export const getWebRTCConfig = (): WebRTCConfig => {
  const isProduction = import.meta.env.PROD;
  const signalingUrl = import.meta.env.VITE_SERVER_URL || 
    (isProduction ? 'https://api.nexameet.com' : 'http://localhost:3001');

  return {
    signalingServerUrl: signalingUrl,
    iceServers: getICEServers(),
    connectionTimeout: 30000, // 30 seconds
    iceGatheringTimeout: 10000, // 10 seconds
    maxReconnectAttempts: 5,
    reconnectDelay: 1000,
    enableTURN: true,
    enableSTUN: true,
    adaptiveBitrate: true,
    maxBitrate: 2500000, // 2.5 Mbps for video
    minBitrate: 300000, // 300 kbps minimum
    preferredCodec: 'vp9', // Better compression, fallback to vp8
  };
};

/**
 * Get media constraints based on connection quality
 */
export const getMediaConstraints = (
  quality: 'low' | 'medium' | 'high' = 'high'
): MediaStreamConstraints => {
  const baseConstraints: MediaStreamConstraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
      channelCount: 1,
    },
  };

  switch (quality) {
    case 'low':
      return {
        ...baseConstraints,
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { ideal: 15 },
        },
      };
    case 'medium':
      return {
        ...baseConstraints,
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 24 },
        },
      };
    case 'high':
    default:
      return {
        ...baseConstraints,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      };
  }
};

