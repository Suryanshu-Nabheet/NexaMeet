import React, { useRef, useEffect, useState } from 'react';
import { MicOff, VideoOff, Hand } from 'lucide-react';
import { ConnectionQuality } from '../../types';
import { motion } from 'framer-motion';

type LayoutType = 'grid' | 'focus' | 'presentation';

interface Participant {
  id: string;
  name: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised: boolean;
  isSharingScreen?: boolean;
}

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  localUser: {
    id: string;
    name: string;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    isHandRaised: boolean;
  };
  participants: Participant[];
  emojiReactions?: { [participantId: string]: { emoji: string; timestamp: number } };
  layout: LayoutType;
  connectionQualities: ConnectionQuality[];
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  remoteStreams,
  localUser,
  participants,
  emojiReactions = {},
  layout,
  connectionQualities,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [currentLayout, setCurrentLayout] = useState<LayoutType>(layout);
  const totalParticipants = remoteStreams.size + 1;
  
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  
  useEffect(() => {
    if (totalParticipants <= 2) {
      setCurrentLayout('focus');
    } else if (totalParticipants <= 4) {
      setCurrentLayout('grid');
    } else {
      setCurrentLayout('presentation');
    }
  }, [totalParticipants]);

  const renderEmojiReaction = (participantId: string) => {
    const reaction = emojiReactions[participantId];
    if (!reaction) return null;

    return (
      <motion.div
        key={reaction.timestamp}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {reaction.emoji}
      </motion.div>
    );
  };
  
  const renderParticipantVideo = (participant: Participant, stream: MediaStream | null) => {
    const connectionQuality = connectionQualities.find(q => q.participantId === participant.id);
    const qualityClass = connectionQuality ? `connection-${connectionQuality.quality}` : '';

    return (
      <div key={participant.id} className="relative aspect-video bg-dark-400 rounded-lg overflow-hidden">
        {stream ? (
          <video
            ref={video => {
              if (video) {
                video.srcObject = stream;
              }
            }}
            autoPlay
            playsInline
            muted={participant.id === localUser.id}
            className={`w-full h-full object-cover ${qualityClass}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-dark-300">
            <span className="text-white text-lg">{participant.name}</span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-dark-400/80 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">{participant.name}</span>
              {participant.isHandRaised && (
                <Hand size={16} className="text-yellow-400" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              {!participant.isAudioEnabled && (
                <MicOff size={16} className="text-red-400" />
              )}
              {!participant.isVideoEnabled && (
                <VideoOff size={16} className="text-red-400" />
              )}
            </div>
          </div>
        </div>

        {renderEmojiReaction(participant.id)}
      </div>
    );
  };
  
  const renderGrid = () => {
    const allParticipants = [localUser, ...participants];
    const gridClass = `grid gap-4 ${
      allParticipants.length <= 2
        ? 'grid-cols-1'
        : allParticipants.length <= 4
        ? 'grid-cols-2'
        : allParticipants.length <= 9
        ? 'grid-cols-3'
        : 'grid-cols-4'
    }`;

    return (
      <div className={gridClass}>
        {allParticipants.map(participant => {
          const stream = participant.id === localUser.id
            ? localStream
            : remoteStreams.get(participant.id) || null;
          return renderParticipantVideo(participant, stream);
        })}
      </div>
    );
  };

  const renderFocus = () => {
    const mainParticipant = participants[0] || localUser;
    const mainStream = mainParticipant.id === localUser.id
      ? localStream
      : remoteStreams.get(mainParticipant.id) || null;

    return (
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          {renderParticipantVideo(mainParticipant, mainStream)}
        </div>
        <div className="col-span-1 grid grid-rows-3 gap-4">
          {[localUser, ...participants.filter(p => p.id !== mainParticipant.id)].map(participant => {
            const stream = participant.id === localUser.id
              ? localStream
              : remoteStreams.get(participant.id) || null;
            return (
              <div key={participant.id} className="relative aspect-video bg-dark-400 rounded-lg overflow-hidden">
                {renderParticipantVideo(participant, stream)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPresentation = () => {
    const presenter = participants.find(p => p.isSharingScreen) || localUser;
    const presenterStream = presenter.id === localUser.id
      ? localStream
      : remoteStreams.get(presenter.id) || null;

    return (
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          {renderParticipantVideo(presenter, presenterStream)}
        </div>
        <div className="col-span-1 grid grid-rows-3 gap-4">
          {[localUser, ...participants.filter(p => p.id !== presenter.id)].map(participant => {
            const stream = participant.id === localUser.id
              ? localStream
              : remoteStreams.get(participant.id) || null;
            return (
              <div key={participant.id} className="relative aspect-video bg-dark-400 rounded-lg overflow-hidden">
                {renderParticipantVideo(participant, stream)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 h-full w-full">
      {currentLayout === 'grid' && renderGrid()}
      {currentLayout === 'focus' && renderFocus()}
      {currentLayout === 'presentation' && renderPresentation()}
    </div>
  );
};