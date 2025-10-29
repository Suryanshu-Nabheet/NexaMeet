import React from 'react';
import { motion } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaHandPaper, FaDesktop } from 'react-icons/fa';
import { useMeeting } from '../hooks/useMeeting';

interface ParticipantSidebarProps {
  isOpen: boolean;
  meetingId: string;
  participantId: string;
}

const ParticipantSidebar: React.FC<ParticipantSidebarProps> = ({ isOpen, meetingId, participantId }) => {
  const { participants, localParticipant } = useMeeting(meetingId, participantId);

  return (
    <motion.div
      initial={false}
      animate={{
        width: isOpen ? '100%' : 0,
        opacity: isOpen ? 1 : 0
      }}
      className="h-full overflow-hidden"
    >
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Participants ({participants.size})</h2>
        <div className="space-y-2">
          {/* Local participant */}
          {localParticipant && (
            <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {localParticipant.name?.charAt(0).toUpperCase() || 'Y'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-100">{localParticipant.name || 'You'}</p>
                  {localParticipant.isHost && (
                    <p className="text-xs text-blue-400">Host</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {localParticipant.isAudioEnabled ? (
                  <FaMicrophone className="w-4 h-4 text-green-500" />
                ) : (
                  <FaMicrophoneSlash className="w-4 h-4 text-red-500" />
                )}
                {localParticipant.isVideoEnabled ? (
                  <FaVideo className="w-4 h-4 text-green-500" />
                ) : (
                  <FaVideoSlash className="w-4 h-4 text-red-500" />
                )}
                {localParticipant.isScreenSharing && (
                  <FaDesktop className="w-4 h-4 text-blue-500" />
                )}
                {localParticipant.isHandRaised && (
                  <FaHandPaper className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            </div>
          )}

          {/* Other participants */}
          {Array.from(participants.values())
            .filter(p => p.id !== participantId)
            .map(participant => (
              <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {participant.name?.charAt(0).toUpperCase() || 'P'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-100">{participant.name || 'Participant'}</p>
                    {participant.isHost && (
                      <p className="text-xs text-blue-400">Host</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {participant.isAudioEnabled ? (
                    <FaMicrophone className="w-4 h-4 text-green-500" />
                  ) : (
                    <FaMicrophoneSlash className="w-4 h-4 text-red-500" />
                  )}
                  {participant.isVideoEnabled ? (
                    <FaVideo className="w-4 h-4 text-green-500" />
                  ) : (
                    <FaVideoSlash className="w-4 h-4 text-red-500" />
                  )}
                  {participant.isScreenSharing && (
                    <FaDesktop className="w-4 h-4 text-blue-500" />
                  )}
                  {participant.isHandRaised && (
                    <FaHandPaper className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ParticipantSidebar; 