import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Participant } from '../types';

interface HostViewProps {
  localParticipant: Participant | null;
  isHost: boolean;
  isScreenSharing: boolean;
}

export const HostView = ({ localParticipant, isHost, isScreenSharing }: HostViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log('HostView useEffect: localParticipant stream changed', localParticipant?.stream);
    if (videoRef.current && localParticipant?.stream) {
      console.log('Attempting to set video srcObject', localParticipant.stream);
      videoRef.current.srcObject = localParticipant.stream;
    } else if (videoRef.current) {
      console.log('localParticipant stream is null, clearing srcObject');
      videoRef.current.srcObject = null;
    }
    // Cleanup function to stop tracks when component unmounts or stream changes
    return () => {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject;
        if (stream instanceof MediaStream) {
          stream.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
      }
    };
  }, [localParticipant?.stream]);

  return (
    <div className="relative w-full h-full bg-gray-900">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full ${isScreenSharing ? 'object-contain' : 'object-cover'}`}
        onError={(e) => console.error('Video error:', e)}
      />
      
      {/* Host Label */}
      <motion.div
        className="absolute top-4 left-4 bg-blue-500/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-blue-200"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: isHost ? 1 : 0, y: isHost ? 0 : -10 }}
        transition={{ duration: 0.3 }}
      >
        {localParticipant?.name || 'You'}
      </motion.div>

      {/* Connection Status */}
      <motion.div
        className="absolute bottom-4 right-4 bg-gray-800/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-200 flex items-center space-x-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Connected</span>
      </motion.div>

      {/* Screen Share Button - Now in ControlBar */}
      {/* Keeping the handleScreenShare function in case it's called elsewhere, but removing the button */}
      {/*
      {isHost && !isScreenSharing && (
        <motion.div
          className="absolute bottom-4 left-4 bg-gray-800/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={handleScreenShare}
            className="flex items-center space-x-2 hover:text-white transition-colors duration-300"
          >
            <span>Share Screen</span>
          </button>
        </motion.div>
      )}
      */}
    </div>
  );
}; 