import { useEffect, useState, useCallback, useRef } from 'react';
import { WebRTCService } from '../services/webrtc';
import { Participant, ParticipantMap, MeetingState } from '../types';
import { toast } from 'react-hot-toast';

interface UseMeetingReturn {
  webrtcService: WebRTCService | null;
  participants: ParticipantMap;
  localParticipant: Participant | null;
  otherParticipants: Participant[];
  error: Error | null;
  isLoading: boolean;
  toggleAudio: (enabled: boolean) => Promise<void>;
  toggleVideo: (enabled: boolean) => Promise<void>;
  toggleScreenShare: (enabled: boolean) => Promise<boolean>;
  toggleRecording: (enabled: boolean) => void;
  muteParticipant: (participantId: string) => void;
  unmuteParticipant: (participantId: string) => void;
  removeParticipant: (participantId: string) => void;
  getLocalParticipantStream: () => MediaStream | null;
  updateMeetingState: (newState: Partial<MeetingState>) => void;
  meetingState: MeetingState | undefined;
  toggleHand: () => void;
  toggleChat: (enabled: boolean) => void;
  endMeeting: () => void;
  acceptParticipant: (participantId: string) => void;
  rejectParticipant: (participantId: string) => void;
  createMeeting: (name: string) => Promise<string>;
  joinMeeting: (meetingCode: string, participantName?: string) => Promise<void>;
}

export const useMeeting = (meetingId: string | null, participantId: string | null, isHost: boolean = false): UseMeetingReturn => {
  const [webrtcService, setWebrtcService] = useState<WebRTCService | null>(null);
  const [participants, setParticipants] = useState<ParticipantMap>(new Map());
  const [localParticipant, setLocalParticipant] = useState<Participant | null>(null);
  const [otherParticipants, setOtherParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [meetingState, setMeetingState] = useState<MeetingState | undefined>(undefined);
  const serviceRef = useRef<WebRTCService | null>(null);

  const currentMeetingId = meetingId;
  const currentParticipantId = participantId;

  // Effect to initialize the WebRTC service
  useEffect(() => {
    console.log('useMeeting: [Effect Init] Triggered', { currentMeetingId, currentParticipantId, isInitialized });

    if (!currentMeetingId || !currentParticipantId || isInitialized) {
      if (!currentMeetingId || !currentParticipantId) {
         console.log('useMeeting: [Effect Init] Meeting or participant ID not available, skipping service initialization.');
      } else if (isInitialized) {
         console.log('useMeeting: [Effect Init] Service already initialized, skipping.');
      }
      setIsLoading(false);
      return;
    }

    console.log('useMeeting: [Effect Init] Starting initialization process...');
    setIsInitialized(true); // Mark as initialization attempted
    setIsLoading(true); // Set loading state when starting initialization

    console.log('useMeeting: [Effect Init] Instantiating WebRTC service...');
    const service = new WebRTCService(
      currentMeetingId as string,
      currentParticipantId as string,
      (updatedParticipants) => {
        console.log('useMeeting: [Service Callback] Participants updated:', Array.from(updatedParticipants.entries()));
        setParticipants(new Map(updatedParticipants));
      },
      (err) => {
        console.error('useMeeting: [Service Callback] Error received:', err);
        setError(err);
        if (!(err.message.includes('Failed to connect to server') || err.message.includes('Disconnected from server'))) {
             toast.error(err.message);
        }
        setIsLoading(false);
      },
      (participantData) => {
        console.log('useMeeting: [Service Callback] Participant joined:', participantData);
      },
      (data) => {
        console.log('useMeeting: [Service Callback] Participant left:', data);
      },
      isHost
    );

    service.onMeetingStateUpdate((updatedState) => {
        console.log('useMeeting: [Service Callback] Meeting state updated:', updatedState);
        setMeetingState({ ...updatedState });
    });

    serviceRef.current = service;
    setWebrtcService(service);

    const initializeStreamAndConnect = async () => {
        console.log('useMeeting: [Init Stream/Connect] Attempting to initialize local stream and connect...');
         try {
            await service.initializeLocalStream();
            console.log('useMeeting: [Init Stream/Connect] initializeLocalStream resolved.');
         } catch (err) {
            console.error('useMeeting: [Init Stream/Connect] Error during initialization or connection:', err);
            setError(err as Error);
            toast.error('Failed to access camera and microphone. Please check permissions.');
            setIsLoading(false);
         }
    };

    initializeStreamAndConnect();

    return () => {
      console.log('useMeeting: [Effect Init] Cleaning up WebRTC service...');
      serviceRef.current?.disconnect();
      serviceRef.current = null;
      setWebrtcService(null);
      setIsInitialized(false);
      console.log('useMeeting: [Effect Init] Cleanup complete.');
    };

  }, [currentMeetingId, currentParticipantId, isHost]);

  // Effect to handle participants state updates and set local/other participants
  useEffect(() => {
    console.log('useMeeting: [Effect Participants] Participants state updated.', { participantsSize: participants.size, currentParticipantId });

    const local = participants.get(currentParticipantId || '');
    console.log('useMeeting: [Effect Participants] Derived local participant:', local);
    console.log('useMeeting: [Effect Participants] Local participant stream status:', local?.stream ? 'Stream is available' : 'Stream is null or undefined');
    setLocalParticipant(local || null);

    const others = Array.from(participants.values()).filter(
      (p) => p.id !== currentParticipantId
    );
    console.log('useMeeting: [Effect Participants] Derived other participants (', others.length, '):', others);
    others.forEach(p => {
        console.log(`useMeeting: [Effect Participants] Participant ${p.id} (${p.name}) stream status: ${p.stream ? 'Stream is available' : 'Stream is null or undefined'}`);
    });
    setOtherParticipants(others);

    // Logic to stop loading
    console.log('useMeeting: [Effect Participants] Checking isLoading status.', { isLoading, isInitialized, localStreamStatus: local?.stream ? 'Available' : 'Null', errorStatus: error ? 'Present' : 'Null', participantsSize: participants.size, meetingStateStatus: meetingState ? 'Available' : 'Undefined' });

    // Stop loading if local stream is available AND meeting state is initialized,
    // OR if there's an error, OR if participants have arrived (even if local stream/meeting state pending)
    const anyParticipantHasStream = others.some(p => p.stream !== null);

    if (isLoading && isInitialized) {
         if ( (local?.stream !== undefined || error !== null || participants.size > (currentParticipantId ? 1 : 0) || anyParticipantHasStream) && meetingState !== undefined) {
            console.log('useMeeting: [Effect Participants] Stopping loading.');
            setIsLoading(false);
        } else {
           console.log('useMeeting: [Effect Participants] Keeping loading (waiting for stream, error, other participants, or meeting state).');
        }
    } else if (isLoading && !isInitialized && (!currentMeetingId || !currentParticipantId)) {
        console.log('useMeeting: [Effect Participants] Stopping loading due to missing IDs and no initialization.');
        setIsLoading(false);
    } else if (!isLoading) {
        console.log('useMeeting: [Effect Participants] Already stopped loading.');
    }

  }, [participants, currentParticipantId, isInitialized, error, isLoading, currentMeetingId, meetingState]);

  useEffect(() => {
    if (error) {
      console.error('useMeeting: [Effect Error] Error state updated:', error);
    } else {
      console.log('useMeeting: [Effect Error] Error state cleared.');
    }
  }, [error]);

  useEffect(() => {
    console.log('useMeeting: [Effect Local Participant] Local participant state updated.', localParticipant);
  }, [localParticipant]);

  useEffect(() => {
    console.log('useMeeting: [Effect Other Participants] Other participants state updated.', otherParticipants);
  }, [otherParticipants]);

  useEffect(() => {
     console.log('useMeeting: [Effect Loading] isLoading state updated:', isLoading);
  }, [isLoading]);

  useEffect(() => {
      console.log('useMeeting: [Effect Initialized] isInitialized state updated:', isInitialized);
  }, [isInitialized]);

  // --- Exposed Functions (using webrtcService) ---

  const toggleAudio = useCallback(async (enabled: boolean) => {
    console.log('useMeeting: toggleAudio called:', enabled);
    if (webrtcService && currentParticipantId) {
      console.log('useMeeting: Calling service.toggleAudio');
      await webrtcService.toggleAudio(enabled);
    } else {
      console.warn('useMeeting: Cannot toggle audio - service not ready or no participant ID.');
    }
  }, [webrtcService, currentParticipantId]);

  const toggleVideo = useCallback(async (enabled: boolean) => {
    console.log('useMeeting: toggleVideo called:', enabled);
    if (webrtcService && currentParticipantId) {
      console.log('useMeeting: Calling service.toggleVideo');
      await webrtcService.toggleVideo(enabled);
    } else {
       console.warn('useMeeting: Cannot toggle video - service not ready or no participant ID.');
    }
  }, [webrtcService, currentParticipantId]);

  const toggleScreenShare = useCallback(async (enabled: boolean) => {
    console.log('useMeeting: toggleScreenShare called:', enabled);
    if (webrtcService && currentParticipantId) {
      console.log('useMeeting: Calling service.toggleScreenShare');
      const success = await webrtcService.toggleScreenShare(enabled);
      console.log('useMeeting: service.toggleScreenShare returned:', success);
      return success;
    }
    console.warn('useMeeting: Cannot toggle screen share - service not ready or no participant ID.');
    return false; // Return false if service not available or no participantId
  }, [webrtcService, currentParticipantId]);

  const toggleRecording = useCallback((enabled: boolean) => {
    console.log('useMeeting: toggleRecording called:', enabled);
    if (webrtcService && currentParticipantId) {
      console.log('useMeeting: Calling service.toggleRecording');
      webrtcService.toggleRecording(enabled);
    } else {
       console.warn('useMeeting: Cannot toggle recording - service not ready or no participant ID.');
    }
  }, [webrtcService, currentParticipantId]);

  const toggleHand = useCallback(() => {
    console.log('useMeeting: toggleHand called.');
    if (webrtcService && currentParticipantId && localParticipant) {
        const newState = !localParticipant.isHandRaised; // Derive state from local participant
        console.log('useMeeting: Calling service.signalParticipantUpdate for hand raise:', newState);
        webrtcService.signalParticipantUpdate(currentParticipantId, { isHandRaised: newState });
    } else {
        console.warn('useMeeting: Cannot toggle hand: WebRTCService not available or no local participant');
    }
  }, [webrtcService, currentParticipantId, localParticipant]);

  const toggleChat = useCallback((enabled: boolean) => {
    console.log('useMeeting: toggleChat called:', enabled);
    if (webrtcService) {
        console.log('useMeeting: Calling service.toggleChat');
        webrtcService.toggleChat(enabled);
    } else {
        console.warn('useMeeting: Cannot toggle chat: WebRTCService not available');
    }
  }, [webrtcService]);

  const endMeeting = useCallback(() => {
    console.log('useMeeting: endMeeting called.');
    if (webrtcService) {
      console.log('useMeeting: Calling service.disconnect');
      webrtcService.disconnect();
    } else {
      console.warn('useMeeting: Cannot end meeting: WebRTCService not available.');
    }
  }, [webrtcService]);

  const muteParticipant = useCallback((participantId: string) => {
    console.warn(`useMeeting: muteParticipant(${participantId}) not fully implemented.`);
    if (webrtcService) {
      webrtcService.muteParticipant(participantId);
    }
  }, [webrtcService]);

  const unmuteParticipant = useCallback((participantId: string) => {
    console.warn(`useMeeting: unmuteParticipant(${participantId}) not fully implemented.`);
    if (webrtcService) {
      webrtcService.unmuteParticipant(participantId);
    }
  }, [webrtcService]);

  const removeParticipant = useCallback((participantId: string) => {
    console.warn(`useMeeting: removeParticipant(${participantId}) not fully implemented.`);
    if (webrtcService) {
      webrtcService.removeParticipantServer(participantId);
    }
  }, [webrtcService]);

   const acceptParticipant = useCallback((participantId: string) => {
        console.warn(`useMeeting: acceptParticipant(${participantId}) not implemented.`);
        // Implementation needed in WebRTCService
    }, []);

    const rejectParticipant = useCallback((participantId: string) => {
        console.warn(`useMeeting: rejectParticipant(${participantId}) not implemented.`);
        // Implementation needed in WebRTCService
    }, []);

     const createMeeting = useCallback(async (_name: string) => {
        console.warn(`useMeeting: createMeeting not implemented in hook. Should be done before entering meeting.`);
        return Promise.resolve(''); // Placeholder
     }, []);

    const joinMeeting = useCallback(async (_meetingCode: string, _participantName?: string) => {
        console.warn(`useMeeting: joinMeeting not implemented in hook. Should be done before entering meeting.`);
        // Implementation needed
    }, []);

    const getLocalParticipantStream = useCallback(() => {
        console.warn('useMeeting: getLocalParticipantStream might not be needed. Access stream via localParticipant object.');
        return localParticipant?.stream || null;
    }, [localParticipant]);

    const updateMeetingState = useCallback((newState: Partial<MeetingState>) => {
        console.log('useMeeting: updateMeetingState called:', newState);
        if (webrtcService) {
            webrtcService.updateMeetingState(newState);
        }
    }, [webrtcService]);

  return {
    webrtcService,
    participants,
    localParticipant,
    otherParticipants,
    error,
    isLoading,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleRecording,
    muteParticipant,
    unmuteParticipant,
    removeParticipant,
    getLocalParticipantStream,
    updateMeetingState,
    meetingState,
    toggleHand,
    toggleChat,
    endMeeting,
    acceptParticipant,
    rejectParticipant,
    createMeeting,
    joinMeeting,
  };
};