import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop, FaHandPaper, FaComments, FaPhoneSlash, FaRecordVinyl } from 'react-icons/fa';

interface ControlBarProps {
  isHost: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  isHandRaised: boolean;
  isChatOpen: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onToggleHand: () => void;
  onToggleChat: () => void;
  onEndMeeting: () => void;
}

const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

const containerVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 }
};

const ControlBar: React.FC<ControlBarProps> = ({
  isHost,
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  isRecording,
  isHandRaised,
  isChatOpen,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRecording,
  onToggleHand,
  onToggleChat,
  onEndMeeting
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleAudio = async () => {
    if (!isProcessing) {
      setIsProcessing(true);
      try {
        await onToggleAudio();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleToggleVideo = async () => {
    if (!isProcessing) {
      setIsProcessing(true);
      try {
        await onToggleVideo();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleToggleScreenShare = async () => {
    if (!isProcessing) {
      setIsProcessing(true);
      try {
        await onToggleScreenShare();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleToggleRecording = async () => {
    if (!isProcessing) {
      setIsProcessing(true);
      try {
        await onToggleRecording();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleToggleHand = async () => {
    if (!isProcessing) {
      setIsProcessing(true);
      try {
        await onToggleHand();
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex items-center justify-center space-x-6"
    >
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={handleToggleAudio}
        disabled={isProcessing}
        className={`p-4 rounded-full transition-all duration-300 ${
          isAudioEnabled
            ? 'bg-gray-700/80 hover:bg-gray-600/80'
            : 'bg-red-500/90 hover:bg-red-600/90'
        } text-white relative group backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50`}
      >
        {isAudioEnabled ? (
          <FaMicrophone className="w-5 h-5" />
        ) : (
          <FaMicrophoneSlash className="w-5 h-5" />
        )}
        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800/90 text-white px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm border border-gray-700/50">
          {isAudioEnabled ? 'Mute' : 'Unmute'}
        </span>
      </motion.button>

      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={handleToggleVideo}
        disabled={isProcessing}
        className={`p-4 rounded-full transition-all duration-300 ${
          isVideoEnabled
            ? 'bg-gray-700/80 hover:bg-gray-600/80'
            : 'bg-red-500/90 hover:bg-red-600/90'
        } text-white relative group backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50`}
      >
        {isVideoEnabled ? (
          <FaVideo className="w-5 h-5" />
        ) : (
          <FaVideoSlash className="w-5 h-5" />
        )}
        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800/90 text-white px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm border border-gray-700/50">
          {isVideoEnabled ? 'Stop Video' : 'Start Video'}
        </span>
      </motion.button>

      {isHost && (
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={handleToggleScreenShare}
          disabled={isProcessing}
          className={`p-4 rounded-full transition-all duration-300 ${
            isScreenSharing
              ? 'bg-blue-500/90 hover:bg-blue-600/90'
              : 'bg-gray-700/80 hover:bg-gray-600/80'
          } text-white relative group backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50`}
        >
          <FaDesktop className="w-5 h-5" />
          <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800/90 text-white px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm border border-gray-700/50">
            {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          </span>
        </motion.button>
      )}

      {isHost && (
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={handleToggleRecording}
          disabled={isProcessing}
          className={`p-4 rounded-full transition-all duration-300 ${
            isRecording
              ? 'bg-red-500/90 hover:bg-red-600/90'
              : 'bg-gray-700/80 hover:bg-gray-600/80'
          } text-white relative group backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50`}
        >
          <FaRecordVinyl className="w-5 h-5" />
          <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800/90 text-white px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm border border-gray-700/50">
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </span>
        </motion.button>
      )}

      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={handleToggleHand}
        disabled={isProcessing}
        className={`p-4 rounded-full transition-all duration-300 ${
          isHandRaised
            ? 'bg-yellow-500/90 hover:bg-yellow-600/90'
            : 'bg-gray-700/80 hover:bg-gray-600/80'
        } text-white relative group backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50`}
      >
        <FaHandPaper className="w-5 h-5" />
        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800/90 text-white px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm border border-gray-700/50">
          {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
        </span>
      </motion.button>

      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onToggleChat}
        disabled={isProcessing}
        className={`p-4 rounded-full transition-all duration-300 ${
          isChatOpen
            ? 'bg-blue-500/90 hover:bg-blue-600/90'
            : 'bg-gray-700/80 hover:bg-gray-600/80'
        } text-white relative group backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50`}
      >
        <FaComments className="w-5 h-5" />
        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800/90 text-white px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm border border-gray-700/50">
          {isChatOpen ? 'Close Chat' : 'Open Chat'}
        </span>
      </motion.button>

      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={onEndMeeting}
        disabled={isProcessing}
        className="p-4 rounded-full bg-red-500/90 hover:bg-red-600/90 text-white transition-all duration-300 relative group backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50"
      >
        <FaPhoneSlash className="w-5 h-5" />
        <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800/90 text-white px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap backdrop-blur-sm border border-gray-700/50">
          Leave Meeting
        </span>
      </motion.button>
    </motion.div>
  );
};

export default ControlBar; 