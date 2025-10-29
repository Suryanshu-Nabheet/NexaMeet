import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Participant {
  id: string;
  name: string;
  isHost: boolean;
}

interface WaitingRoomProps {
  participants: Participant[];
  onAdmitParticipant: (participantId: string) => void;
  onRejectParticipant: (participantId: string) => void;
  isHost: boolean;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  participants,
  onAdmitParticipant,
  onRejectParticipant,
  isHost,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParticipants = participants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-dark-400 rounded-lg p-6 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Waiting Room</h2>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search participants..."
          className="w-full px-4 py-2 bg-dark-300 text-white rounded-lg border border-gray-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredParticipants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between bg-dark-300 p-4 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {participant.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{participant.name}</p>
                {participant.isHost && (
                  <span className="text-xs text-primary-400">Host</span>
                )}
              </div>
            </div>

            {isHost && !participant.isHost && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onAdmitParticipant(participant.id)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                  Admit
                </button>
                <button
                  onClick={() => onRejectParticipant(participant.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                  Reject
                </button>
            </div>
            )}
          </div>
        ))}

        {filteredParticipants.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No participants found
          </div>
        )}
      </div>
    </div>
  );
};