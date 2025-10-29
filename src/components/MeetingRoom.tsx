import React, { useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { MeetingLayout } from './MeetingLayout';
import { useMeeting } from '../hooks/useMeeting';
import { motion } from 'framer-motion';
// import { Participant } from '../types'; // Removed unused import

// Add this type declaration at the top of the file if not already global
declare global {
  interface HTMLVideoElement {
    srcObject: MediaStream | null;
  }
}

interface LocationState {
  participantId: string;
  meetingTitle: string;
  participantName: string;
  isHost: boolean;
}

const MeetingRoom: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const { 
    localParticipant,
    otherParticipants,
    isLoading,
    error
  } = useMeeting(meetingId || '', state?.participantId || '', state?.isHost || false);

  // Map to hold video refs for all participants
  const participantVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    if (!state?.participantId || !state?.meetingTitle || !state?.participantName) {
      navigate('/');
    }
  }, [state, navigate]);

  // Effect to assign streams to video elements
  useEffect(() => {
    // Combine local and other participants for easy iteration
    const allParticipants = localParticipant ? [localParticipant, ...Array.from(otherParticipants.values())] : [...Array.from(otherParticipants.values())];

    allParticipants.forEach(participant => {
      const videoElement = participantVideoRefs.current.get(participant.id);
      if (videoElement && participant.stream) {
        console.log(`Assigning stream for participant ${participant.id}`);
        videoElement.srcObject = participant.stream;
      } else if (videoElement && !participant.stream) {
         console.log(`Stream is null for participant ${participant.id}, removing srcObject.`);
         videoElement.srcObject = null;
      }
    });

    // Clean up refs for participants who left
    const currentParticipantIds = new Set(allParticipants.map(p => p.id));
    Array.from(participantVideoRefs.current.keys()).forEach(participantId => {
      if (!currentParticipantIds.has(participantId)) {
        console.log(`Cleaning up ref for participant ${participantId}`);
        participantVideoRefs.current.delete(participantId);
      }
    });

  }, [localParticipant, otherParticipants]); // Depend on localParticipant and otherParticipants

  if (!meetingId || !state?.participantId || !state?.meetingTitle || !state?.participantName) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Connecting to meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-4">
          <p className="text-red-500 text-lg mb-4">Error: {error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Combine local and other participants for rendering
  const allParticipants = localParticipant ? [localParticipant, ...Array.from(otherParticipants.values())] : [...Array.from(otherParticipants.values())];

  return (
    <MeetingLayout 
      meetingId={meetingId} 
      participantId={state.participantId}
      // meetingTitle={state.meetingTitle} // MeetingLayout gets title from useMeeting
    >
      {/* This div will be the {children} in MeetingLayout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 auto-rows-fr">
        {allParticipants.map(participant => (
          <div key={participant.id} className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <video
              ref={videoElement => {
                if (videoElement) {
                  participantVideoRefs.current.set(participant.id, videoElement);
                  // Assign stream immediately if available
                  if (participant.stream) {
                    console.log(`Assigning stream in ref callback for participant ${participant.id}`);
                    videoElement.srcObject = participant.stream;
                  }
                } else {
                  // Clean up ref when element is unmounted
                  console.log(`Cleaning up ref in ref callback for participant ${participant.id}`);
                  participantVideoRefs.current.delete(participant.id);
                }
              }}
              autoPlay
              playsInline
              muted={participant.id === localParticipant?.id} // Mute local video
              className={`w-full h-full ${participant.isScreenSharing ? 'object-contain' : 'object-cover'}`}
            />
            {/* Placeholder if video is not enabled and not screen sharing */}
            {!participant.isVideoEnabled && !participant.isScreenSharing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-600">
                    {participant.name?.charAt(0).toUpperCase() || 'P'}
                  </span>
                </div>
              </div>
            )}
            {/* Overlay for participant name and status */}
            <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-2">
              <span>{participant.id === localParticipant?.id ? `${participant.name} (You)` : participant.name || 'Participant'}</span>
              {!participant.isAudioEnabled && <span className="text-red-400">🎤</span>}
              {!participant.isVideoEnabled && !participant.isScreenSharing && <span className="text-red-400">📹</span>}
              {participant.isHandRaised && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-yellow-400"
                >
                  ✋
                </motion.div>
              )}
              {participant.isScreenSharing && <span className="text-blue-400">🖥️</span>}
            </div>
          </div>
        ))}
      </div>
    </MeetingLayout>
  );
};

export default MeetingRoom; 