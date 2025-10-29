import { useEffect, useRef, useState, useCallback } from 'react';
import { WebRTCService } from '../services/webrtc';
import { toast } from 'react-hot-toast';

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  stream: MediaStream | null;
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isLoading: boolean;
  error: Error | null;
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
}

export const useWebRTC = (meetingId: string, participantId: string): UseWebRTCReturn => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const webrtcRef = useRef<WebRTCService | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout>();

  const handleError = useCallback((error: Error) => {
    console.error('WebRTC error:', error);
    setError(error);
    toast.error(error.message);
    setIsLoading(false);
  }, []);

  const handleParticipantsUpdate = useCallback((participants: Map<string, Participant>) => {
    const remoteStreamsMap = new Map<string, MediaStream>();
    participants.forEach((participant, id) => {
      if (id !== 'local' && participant.stream) {
        remoteStreamsMap.set(id, participant.stream);
      }
    });
    setRemoteStreams(remoteStreamsMap);
  }, []);

  useEffect(() => {
    const initializeWebRTC = async () => {
    try {
        setIsLoading(true);
      setError(null);

        // Set connection timeout
        connectionTimeoutRef.current = setTimeout(() => {
          handleError(new Error('Connection timeout. Please check your internet connection and try again.'));
        }, 30000); // 30 seconds timeout

        // Check if mediaDevices API is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Media devices API is not supported in this browser');
        }

        // Check if we're in a secure context
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          throw new Error('Camera and microphone access requires a secure context (HTTPS)');
        }

        // Initialize WebRTC service
        const webrtc = new WebRTCService(meetingId, participantId, handleParticipantsUpdate);
        await webrtc.initializeLocalStream();

        // Get local stream
        const stream = webrtc.getLocalStream();
        if (stream) {
          setLocalStream(stream);
          setIsAudioEnabled(stream.getAudioTracks()[0]?.enabled ?? true);
          setIsVideoEnabled(stream.getVideoTracks()[0]?.enabled ?? true);
        }

        webrtcRef.current = webrtc;
        clearTimeout(connectionTimeoutRef.current);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize WebRTC:', error);
        handleError(error instanceof Error ? error : new Error('Failed to initialize WebRTC'));
      }
    };

    if (meetingId && participantId) {
      initializeWebRTC();
    }

    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (webrtcRef.current) {
        webrtcRef.current.disconnect();
      }
    };
  }, [meetingId, participantId, handleParticipantsUpdate, handleError]);

  const toggleAudio = useCallback(async () => {
    try {
      if (webrtcRef.current) {
        await webrtcRef.current.toggleAudio(!isAudioEnabled);
        setIsAudioEnabled(!isAudioEnabled);
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to toggle audio'));
    }
  }, [isAudioEnabled, handleError]);

  const toggleVideo = useCallback(async () => {
    try {
      if (webrtcRef.current) {
        await webrtcRef.current.toggleVideo(!isVideoEnabled);
        setIsVideoEnabled(!isVideoEnabled);
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to toggle video'));
    }
  }, [isVideoEnabled, handleError]);
  
  const toggleScreenShare = useCallback(async () => {
    try {
      if (webrtcRef.current) {
        const success = await webrtcRef.current.toggleScreenShare(!isScreenSharing);
        if (success) {
          setIsScreenSharing(!isScreenSharing);
        }
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to toggle screen sharing'));
    }
  }, [isScreenSharing, handleError]);
  
  return {
    localStream,
    remoteStreams,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    isLoading,
    error,
    toggleAudio,
    toggleVideo,
    toggleScreenShare
  };
};