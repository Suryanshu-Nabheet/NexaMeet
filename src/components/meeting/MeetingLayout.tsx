import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Pin, PinOff, Crown, Shield, Users, Settings, Monitor } from 'lucide-react';
import { Button } from '../ui/Button';

interface Participant {
  id: string;
  name: string;
  stream: MediaStream;
  isHost: boolean;
  isPinned: boolean;
  isAdmitted: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised: boolean;
}

interface MeetingLayoutProps {
  participants: Participant[];
  isHost: boolean;
  isScreenSharing: boolean;
  screenShareStream?: MediaStream;
  onPinParticipant: (participantId: string) => void;
  onStreamChange: (type: 'audio' | 'video' | 'screen', stream: MediaStream | null) => void;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

const HostLayout: React.FC<{
  participants: Participant[];
  isScreenSharing: boolean;
  screenShareStream?: MediaStream;
  onPinParticipant: (participantId: string) => void;
}> = ({ participants, isScreenSharing, screenShareStream, onPinParticipant }) => {
  const [hoveredParticipant, setHoveredParticipant] = useState<string | null>(null);
  const controls = useAnimation();
  const mainParticipant = participants.find(p => p.isPinned) || participants[0];
  const otherParticipants = participants.filter(p => p.id !== mainParticipant?.id);

  useEffect(() => {
    controls.start("animate");
  }, [controls]);

  const handleVideoRef = (video: HTMLVideoElement | null, stream: MediaStream | undefined) => {
    if (video && stream) {
      video.srcObject = stream;
      video.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="relative w-full h-full bg-gray-900 flex flex-col"
    >
      {/* Top Bar */}
      <motion.div
        variants={fadeInUp}
        className="h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border-b border-blue-500/30 z-10"
      >
        <div className="flex items-center justify-between px-6 h-full">
          <motion.div
            variants={scaleIn}
            className="flex items-center space-x-4"
          >
            <div className="text-white font-medium text-xl">NexaMeet</div>
            {isScreenSharing && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2 rounded-full"
              >
                <Crown size={18} className="text-yellow-500" />
                <span className="text-yellow-500 text-sm font-medium">Host Controls</span>
              </motion.div>
            )}
          </motion.div>
          <motion.div
            variants={scaleIn}
            className="flex items-center space-x-6"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 bg-blue-500/20 px-4 py-2 rounded-full"
            >
              <Users size={18} className="text-white" />
              <span className="text-white text-sm">{participants.length} Participants</span>
            </motion.div>
            {isScreenSharing && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 bg-blue-500/20 px-4 py-2 rounded-full"
              >
                <Shield size={18} className="text-white" />
                <span className="text-white text-sm">Meeting ID: {Math.random().toString(36).substring(7)}</span>
              </motion.div>
            )}
            {isScreenSharing && (
              <motion.div whileHover={{ scale: 1.1, rotate: 90 }} transition={{ type: "spring", stiffness: 300 }}>
                <Button variant="ghost" size="sm" className="text-white hover:text-primary-400">
                  <Settings size={18} />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Screen */}
        <motion.div
          variants={scaleIn}
          className="flex-1 relative bg-gray-900"
        >
          <AnimatePresence mode="wait">
            {isScreenSharing && screenShareStream ? (
              <motion.div
                key="screen-share"
                variants={scaleIn}
                className="w-full h-full"
              >
                <video
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain bg-black rounded-lg"
                  ref={video => handleVideoRef(video, screenShareStream)}
                />
                <motion.div
                  variants={fadeInUp}
                  className="absolute top-4 right-4 bg-gradient-to-r from-blue-500/80 to-purple-500/80 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm flex items-center space-x-2"
                >
                  <Monitor size={16} />
                  <span>Screen Share</span>
                </motion.div>
              </motion.div>
            ) : mainParticipant ? (
              <motion.div
                key={mainParticipant.id}
                variants={scaleIn}
                className="w-full h-full relative group"
                onMouseEnter={() => setHoveredParticipant(mainParticipant.id)}
                onMouseLeave={() => setHoveredParticipant(null)}
              >
                <video
                  autoPlay
                  playsInline
                  muted={mainParticipant.id === 'self'}
                  className="w-full h-full object-cover rounded-lg"
                  ref={video => handleVideoRef(video, mainParticipant.stream)}
                />
                <AnimatePresence>
                  {hoveredParticipant === mainParticipant.id && (
                    <motion.div
                      variants={fadeInUp}
                      className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-500/80 to-purple-500/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center space-x-2"
                    >
                      <span className="text-white font-medium">{mainParticipant.name}</span>
                      {mainParticipant.isHost && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center space-x-1"
                        >
                          <Crown size={16} className="text-yellow-500" />
                          <span className="text-yellow-500">Host</span>
                        </motion.div>
                      )}
                      {!mainParticipant.isVideoEnabled && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center space-x-1"
                        >
                          <span className="text-red-500">Video Off</span>
                        </motion.div>
                      )}
                      {!mainParticipant.isAudioEnabled && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center space-x-1"
                        >
                          <span className="text-red-500">Muted</span>
                        </motion.div>
                      )}
                      {mainParticipant.isHandRaised && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center space-x-1"
                        >
                          <span className="text-yellow-500">✋ Hand Raised</span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="no-participant"
                variants={scaleIn}
                className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg"
              >
                <span className="text-gray-400">No participants connected</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Vertical Participant List */}
        <motion.div
          variants={fadeInUp}
          className="w-80 bg-gradient-to-b from-blue-500/20 to-purple-500/20 backdrop-blur-md border-l border-blue-500/30 overflow-y-auto"
        >
          <div className="p-4">
            <motion.div
              variants={scaleIn}
              className="text-white font-medium text-lg mb-4 px-2"
            >
              Participants ({participants.length})
            </motion.div>
            <div className="space-y-4">
              {otherParticipants.map(participant => (
                <motion.div
                  key={participant.id}
                  variants={scaleIn}
                  className="relative aspect-video rounded-lg overflow-hidden group"
                  onMouseEnter={() => setHoveredParticipant(participant.id)}
                  onMouseLeave={() => setHoveredParticipant(null)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <video
                    autoPlay
                    playsInline
                    muted={participant.id === 'self'}
                    className="w-full h-full object-cover"
                    ref={video => handleVideoRef(video, participant.stream)}
                  />
                  <AnimatePresence>
                    {hoveredParticipant === participant.id && (
                      <motion.div
                        variants={fadeInUp}
                        className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{participant.name}</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => onPinParticipant(participant.id)}
                            className="text-white hover:text-blue-400"
                          >
                            {participant.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                          </motion.button>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          {participant.isHost && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex items-center space-x-1"
                            >
                              <Crown size={16} className="text-yellow-500" />
                              <span className="text-yellow-500 text-sm">Host</span>
                            </motion.div>
                          )}
                          {!participant.isVideoEnabled && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex items-center space-x-1"
                            >
                              <span className="text-red-500 text-sm">Video Off</span>
                            </motion.div>
                          )}
                          {!participant.isAudioEnabled && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex items-center space-x-1"
                            >
                              <span className="text-red-500 text-sm">Muted</span>
                            </motion.div>
                          )}
                          {participant.isHandRaised && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex items-center space-x-1"
                            >
                              <span className="text-yellow-500 text-sm">✋ Hand Raised</span>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const ParticipantLayout: React.FC<{
  participants: Participant[];
  isScreenSharing: boolean;
  screenShareStream?: MediaStream;
  onPinParticipant: (participantId: string) => void;
}> = ({ participants, isScreenSharing, screenShareStream, onPinParticipant }) => {
  const [hoveredParticipant, setHoveredParticipant] = useState<string | null>(null);
  const controls = useAnimation();
  const mainParticipant = participants.find(p => p.isPinned) || participants[0];
  const otherParticipants = participants.filter(p => p.id !== mainParticipant?.id);

  useEffect(() => {
    controls.start("animate");
  }, [controls]);

  const handleVideoRef = (video: HTMLVideoElement | null, stream: MediaStream | undefined) => {
    if (video && stream) {
      video.srcObject = stream;
      video.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      className="relative w-full h-full bg-gray-900 flex flex-col"
    >
      {/* Top Bar */}
      <motion.div
        variants={fadeInUp}
        className="h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border-b border-blue-500/30 z-10"
      >
        <div className="flex items-center justify-between px-6 h-full">
          <motion.div
            variants={scaleIn}
            className="flex items-center space-x-4"
          >
            <div className="text-white font-medium text-xl">NexaMeet</div>
          </motion.div>
          <motion.div
            variants={scaleIn}
            className="flex items-center space-x-6"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 bg-blue-500/20 px-4 py-2 rounded-full"
            >
              <Users size={18} className="text-white" />
              <span className="text-white text-sm">{participants.length} Participants</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Screen */}
        <motion.div
          variants={scaleIn}
          className="flex-1 relative bg-gray-900"
        >
          <AnimatePresence mode="wait">
            {isScreenSharing && screenShareStream ? (
              <motion.div
                key="screen-share"
                variants={scaleIn}
                className="w-full h-full"
              >
                <video
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain bg-black rounded-lg"
                  ref={video => handleVideoRef(video, screenShareStream)}
                />
                <motion.div
                  variants={fadeInUp}
                  className="absolute top-4 right-4 bg-gradient-to-r from-blue-500/80 to-purple-500/80 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm flex items-center space-x-2"
                >
                  <Monitor size={16} />
                  <span>Screen Share</span>
                </motion.div>
              </motion.div>
            ) : mainParticipant ? (
              <motion.div
                key={mainParticipant.id}
                variants={scaleIn}
                className="w-full h-full relative group"
                onMouseEnter={() => setHoveredParticipant(mainParticipant.id)}
                onMouseLeave={() => setHoveredParticipant(null)}
              >
                <video
                  autoPlay
                  playsInline
                  muted={mainParticipant.id === 'self'}
                  className="w-full h-full object-cover rounded-lg"
                  ref={video => handleVideoRef(video, mainParticipant.stream)}
                />
                <AnimatePresence>
                  {hoveredParticipant === mainParticipant.id && (
                    <motion.div
                      variants={fadeInUp}
                      className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-500/80 to-purple-500/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center space-x-2"
                    >
                      <span className="text-white font-medium">{mainParticipant.name}</span>
                      {mainParticipant.isHost && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center space-x-1"
                        >
                          <Crown size={16} className="text-yellow-500" />
                          <span className="text-yellow-500">Host</span>
                        </motion.div>
                      )}
                      {!mainParticipant.isVideoEnabled && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center space-x-1"
                        >
                          <span className="text-red-500">Video Off</span>
                        </motion.div>
                      )}
                      {!mainParticipant.isAudioEnabled && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center space-x-1"
                        >
                          <span className="text-red-500">Muted</span>
                        </motion.div>
                      )}
                      {mainParticipant.isHandRaised && (
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center space-x-1"
                        >
                          <span className="text-yellow-500">✋ Hand Raised</span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>

        {/* Vertical Participant List */}
        <motion.div
          variants={fadeInUp}
          className="w-80 bg-gradient-to-b from-blue-500/20 to-purple-500/20 backdrop-blur-md border-l border-blue-500/30 overflow-y-auto"
        >
          <div className="p-4">
            <motion.div
              variants={scaleIn}
              className="text-white font-medium text-lg mb-4 px-2"
            >
              Participants ({participants.length})
            </motion.div>
            <div className="space-y-4">
              {otherParticipants.map(participant => (
                <motion.div
                  key={participant.id}
                  variants={scaleIn}
                  className="relative aspect-video rounded-lg overflow-hidden group"
                  onMouseEnter={() => setHoveredParticipant(participant.id)}
                  onMouseLeave={() => setHoveredParticipant(null)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <video
                    autoPlay
                    playsInline
                    muted={participant.id === 'self'}
                    className="w-full h-full object-cover"
                    ref={video => handleVideoRef(video, participant.stream)}
                  />
                  <AnimatePresence>
                    {hoveredParticipant === participant.id && (
                      <motion.div
                        variants={fadeInUp}
                        className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">{participant.name}</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => onPinParticipant(participant.id)}
                            className="text-white hover:text-blue-400"
                          >
                            {participant.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                          </motion.button>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          {participant.isHost && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex items-center space-x-1"
                            >
                              <Crown size={16} className="text-yellow-500" />
                              <span className="text-yellow-500 text-sm">Host</span>
                            </motion.div>
                          )}
                          {!participant.isVideoEnabled && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex items-center space-x-1"
                            >
                              <span className="text-red-500 text-sm">Video Off</span>
                            </motion.div>
                          )}
                          {!participant.isAudioEnabled && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex items-center space-x-1"
                            >
                              <span className="text-red-500 text-sm">Muted</span>
                            </motion.div>
                          )}
                          {participant.isHandRaised && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex items-center space-x-1"
                            >
                              <span className="text-yellow-500 text-sm">✋ Hand Raised</span>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export const MeetingLayout: React.FC<MeetingLayoutProps> = ({
  participants,
  isHost,
  isScreenSharing,
  screenShareStream,
  onPinParticipant,
  onStreamChange,
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      onStreamChange('video', stream);
      onStreamChange('audio', stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  }, [onStreamChange]);

  useEffect(() => {
    initializeMedia();
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [initializeMedia, localStream]);

  return isHost ? (
    <HostLayout
      participants={participants}
      isScreenSharing={isScreenSharing}
      screenShareStream={screenShareStream}
      onPinParticipant={onPinParticipant}
    />
  ) : (
    <ParticipantLayout
      participants={participants}
      isScreenSharing={isScreenSharing}
      screenShareStream={screenShareStream}
      onPinParticipant={onPinParticipant}
    />
  );
}; 