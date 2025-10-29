import React from 'react';
import { X, Mic, MicOff, VideoOff, Video as VideoIcon, Crown, MoreVertical } from 'lucide-react';
import { Button } from '../ui/Button';
import { Participant } from '../../types';

interface ParticipantsListProps {
  participants: Participant[];
  localUserId: string;
  isHost: boolean;
  onClose: () => void;
  onPromoteToHost: (participantId: string) => void;
  onRemoveParticipant: (participantId: string) => void;
  onToggleParticipantAudio: (participantId: string) => void;
  onToggleParticipantVideo: (participantId: string) => void;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  localUserId,
  isHost,
  onClose,
  onPromoteToHost,
  onRemoveParticipant,
  onToggleParticipantAudio,
  onToggleParticipantVideo,
}) => {
  const [showMenu, setShowMenu] = React.useState<string | null>(null);

  return (
    <div className="bg-dark-400 h-full flex flex-col rounded-lg shadow-md border border-dark-300">
      <div className="p-4 border-b border-dark-300 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">
          Participants ({participants.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close participants list"
        >
          <X size={20} />
        </Button>
      </div>
      
      <div className="flex-grow overflow-y-auto p-2">
        <ul className="space-y-1">
          {participants.map((participant) => (
            <li
              key={participant.id}
              className="px-3 py-2 rounded-md hover:bg-dark-300 flex items-center justify-between group"
            >
              <div className="flex items-center flex-1">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center mr-3">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <span className="font-medium text-white truncate">
                      {participant.name}
                    </span>
                    {participant.isHost && (
                      <Crown size={14} className="ml-1 text-yellow-500" />
                    )}
                    {participant.id === localUserId && (
                      <span className="ml-1 text-xs text-gray-400">(You)</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {participant.isAudioEnabled ? (
                  <Mic size={16} className="text-green-500" />
                ) : (
                  <MicOff size={16} className="text-red-500" />
                )}
                
                {participant.isVideoEnabled ? (
                  <VideoIcon size={16} className="text-green-500" />
                ) : (
                  <VideoOff size={16} className="text-red-500" />
                )}

                {isHost && participant.id !== localUserId && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMenu(showMenu === participant.id ? null : participant.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical size={16} />
                    </Button>

                    {showMenu === participant.id && (
                      <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-dark-300 ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onToggleParticipantAudio(participant.id);
                              setShowMenu(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-200"
                          >
                            {participant.isAudioEnabled ? 'Mute' : 'Unmute'}
                          </button>
                          <button
                            onClick={() => {
                              onToggleParticipantVideo(participant.id);
                              setShowMenu(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-200"
                          >
                            {participant.isVideoEnabled ? 'Stop Video' : 'Start Video'}
                          </button>
                          <button
                            onClick={() => {
                              onPromoteToHost(participant.id);
                              setShowMenu(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-200"
                          >
                            Make Host
                          </button>
                          <button
                            onClick={() => {
                              onRemoveParticipant(participant.id);
                              setShowMenu(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-dark-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};