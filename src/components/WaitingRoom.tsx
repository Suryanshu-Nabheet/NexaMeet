import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { waitingRoomService, WaitingParticipant } from '../services/waitingRoom';
import { meetingService } from '../services/meeting';

interface WaitingRoomProps {
  meetingId: string;
  isHost: boolean;
  onApproved: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ meetingId, isHost, onApproved }) => {
  const [participants, setParticipants] = useState<WaitingParticipant[]>([]);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    if (isHost) {
      // Host view: Subscribe to waiting room updates
      const unsubscribe = waitingRoomService.subscribeToWaitingRoom(meetingId, (updatedParticipants) => {
        setParticipants(updatedParticipants);
      });

      return () => unsubscribe();
    } else {
      // Participant view: Check status
      const unsubscribe = waitingRoomService.subscribeToWaitingRoom(meetingId, (updatedParticipants) => {
        const participant = updatedParticipants.find(p => p.id === localStorage.getItem('participant_id'));
        if (participant) {
          setStatus(participant.status);
          if (participant.status === 'approved') {
            onApproved();
          }
        }
      });

      return () => unsubscribe();
    }
  }, [meetingId, isHost, onApproved]);

  const handleApprove = async (participantId: string) => {
    await waitingRoomService.approveParticipant(meetingId, participantId);
  };

  const handleReject = async (participantId: string) => {
    await waitingRoomService.rejectParticipant(meetingId, participantId);
  };

  if (isHost) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 p-8 rounded-xl w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-white">Waiting Room</h2>
          <div className="space-y-4">
            {participants.length === 0 ? (
              <p className="text-gray-400 text-center">No participants waiting</p>
            ) : (
              participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between bg-gray-800 p-4 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{participant.name}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(participant.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(participant.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(participant.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 p-8 rounded-xl w-full max-w-md text-center"
      >
        <h2 className="text-2xl font-bold mb-6 text-white">Waiting for Host Approval</h2>
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-400">
            {status === 'pending' && 'Please wait while the host reviews your request...'}
            {status === 'rejected' && 'Your request to join has been rejected.'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default WaitingRoom; 