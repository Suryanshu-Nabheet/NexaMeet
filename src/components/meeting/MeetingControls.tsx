import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  MessageSquare,
  Users,
  Layout,
  PhoneOff,
  Monitor,
  MonitorOff,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface MeetingControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isSharingScreen: boolean;
  isHandRaised: boolean;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  isHost: boolean;
  isRecording: boolean;
  onStreamChange: (type: 'audio' | 'video' | 'screen', stream: MediaStream | null) => void;
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  toggleScreenSharing: () => Promise<boolean>;
  toggleChat: () => void;
  toggleParticipants: () => void;
  toggleHandRaise: () => void;
  toggleLayout: () => void;
  toggleRecording: () => void;
  endMeeting: () => void;
}

export const MeetingControls: React.FC<MeetingControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  isSharingScreen,
  isHandRaised,
  isChatOpen,
  isParticipantsOpen,
  isHost,
  isRecording,
  onStreamChange,
  toggleAudio,
  toggleVideo,
  toggleScreenSharing,
  toggleChat,
  toggleParticipants,
  toggleHandRaise,
  toggleLayout,
  toggleRecording,
  endMeeting,
}) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleToggleAudio = async () => {
    if (isProcessing) return;
    setIsProcessing('audio');
    try {
        await toggleAudio();
      toast.success(isAudioEnabled ? 'Microphone muted' : 'Microphone unmuted', {
        icon: isAudioEnabled ? '🔇' : '🔊',
      });
    } catch (error) {
      console.error('Error toggling audio:', error);
      toast.error('Failed to toggle microphone');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleToggleVideo = async () => {
    if (isProcessing) return;
    setIsProcessing('video');
    try {
        await toggleVideo();
      toast.success(isVideoEnabled ? 'Camera turned off' : 'Camera turned on', {
        icon: isVideoEnabled ? '📹' : '🎥',
      });
    } catch (error) {
      console.error('Error toggling video:', error);
      toast.error('Failed to toggle camera');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleToggleScreenSharing = async () => {
    if (isProcessing) return;
    setIsProcessing('screen');
    try {
      const success = await toggleScreenSharing();
      if (success) {
        toast.success(isSharingScreen ? 'Screen sharing stopped' : 'Screen sharing started', {
          icon: isSharingScreen ? '🖥️' : '📺',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Error toggling screen sharing:', error);
      toast.error('Failed to toggle screen sharing');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleToggleHandRaise = async () => {
    if (isProcessing) return;
    setIsProcessing('hand');
    try {
      await toggleHandRaise();
      toast.success(isHandRaised ? 'Hand lowered' : 'Hand raised', {
        icon: isHandRaised ? '✋' : '👋',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error toggling hand raise:', error);
      toast.error('Failed to toggle hand raise');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleToggleChat = () => {
    if (isProcessing) return;
    setIsProcessing('chat');
    try {
      toggleChat();
      toast.success(isChatOpen ? 'Chat closed' : 'Chat opened', {
        icon: isChatOpen ? '💬' : '📝',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error toggling chat:', error);
      toast.error('Failed to toggle chat');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleToggleParticipants = () => {
    if (isProcessing) return;
    setIsProcessing('participants');
    try {
      toggleParticipants();
      toast.success(isParticipantsOpen ? 'Participants list closed' : 'Participants list opened', {
        icon: isParticipantsOpen ? '👥' : '👤',
      });
    } catch (error) {
      console.error('Error toggling participants:', error);
      toast.error('Failed to toggle participants list');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleToggleLayout = () => {
    if (isProcessing) return;
    setIsProcessing('layout');
    try {
      toggleLayout();
      toast.success('Layout changed', {
        icon: '🔄',
      });
    } catch (error) {
      console.error('Error changing layout:', error);
      toast.error('Failed to change layout');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleToggleRecording = () => {
    if (isProcessing) return;
    setIsProcessing('recording');
    try {
      toggleRecording();
      toast.success(isRecording ? 'Recording stopped' : 'Recording started', {
        icon: isRecording ? '⏹️' : '⏺️',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error toggling recording:', error);
      toast.error('Failed to toggle recording');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleEndMeeting = async () => {
    if (isProcessing) return;
    setIsProcessing('end');
    try {
      await endMeeting();
      toast.success('Meeting ended', {
        icon: '👋',
      });
    } catch (error) {
      console.error('Error ending meeting:', error);
      toast.error('Failed to end meeting');
    } finally {
      setIsProcessing(null);
    }
  };

  const buttonVariants = {
    hover: { scale: 1.1, y: -2 },
    tap: { scale: 0.95 },
  };

  const controlsVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const renderButton = (
    onClick: () => void,
    icon: React.ReactNode,
    label: string,
    variant: 'primary' | 'secondary' | 'danger' = 'primary',
    isActive: boolean = false,
    isDisabled: boolean = false,
    processingKey: string | null = null
  ) => (
    <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
      <Button
        variant={variant}
        size="sm"
        onClick={onClick}
        disabled={isDisabled || isProcessing !== null}
        aria-label={label}
        className={`relative group rounded-full ${
          variant === 'danger' ? 'bg-red-500/30 hover:bg-red-500/40' : 'bg-blue-500/30 hover:bg-blue-500/40'
        }`}
      >
        {isProcessing === processingKey ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          icon
        )}
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500/80 backdrop-blur-md text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {label}
        </span>
      </Button>
    </motion.div>
  );

  return (
    <motion.div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 p-2 flex items-center space-x-2 bg-blue-500/20 backdrop-blur-md rounded-full"
      initial="hidden"
      animate="visible"
      variants={controlsVariants}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <motion.div
        className="flex items-center space-x-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderButton(
          handleToggleAudio,
          isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />,
          isAudioEnabled ? 'Mute' : 'Unmute',
          isAudioEnabled ? 'primary' : 'danger',
          isAudioEnabled,
          false,
          'audio'
        )}

        {renderButton(
          handleToggleVideo,
          isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />,
          isVideoEnabled ? 'Stop Video' : 'Start Video',
          isVideoEnabled ? 'primary' : 'danger',
          isVideoEnabled,
          false,
          'video'
        )}

        {renderButton(
          handleToggleScreenSharing,
          isSharingScreen ? <MonitorOff size={20} /> : <Monitor size={20} />,
          isSharingScreen ? 'Stop Sharing' : 'Share Screen',
          isSharingScreen ? 'primary' : 'secondary',
          isSharingScreen,
          false,
          'screen'
        )}

        {!isHost && renderButton(
          handleToggleHandRaise,
          <Hand size={20} className={isHandRaised ? 'text-yellow-500' : ''} />,
          isHandRaised ? 'Lower Hand' : 'Raise Hand',
          isHandRaised ? 'primary' : 'secondary',
          isHandRaised,
          false,
          'hand'
        )}

        {renderButton(
          handleToggleChat,
          <MessageSquare size={20} className={isChatOpen ? 'text-blue-500' : ''} />,
          isChatOpen ? 'Close Chat' : 'Open Chat',
          isChatOpen ? 'primary' : 'secondary',
          isChatOpen,
          false,
          'chat'
        )}

        {renderButton(
          handleToggleParticipants,
          <Users size={20} />,
          isParticipantsOpen ? 'Close Participants' : 'Open Participants',
          isParticipantsOpen ? 'primary' : 'secondary',
          isParticipantsOpen,
          false,
          'participants'
        )}

        {isHost && renderButton(
          handleToggleLayout,
          <Layout size={20} />,
          'Toggle Layout',
          'secondary',
          false,
          false,
          'layout'
        )}

        {isHost && renderButton(
          handleToggleRecording,
          <Monitor size={20} className={isRecording ? 'text-red-500 animate-pulse' : ''} />,
          isRecording ? 'Stop Recording' : 'Start Recording',
          isRecording ? 'danger' : 'secondary',
          isRecording,
          false,
          'recording'
        )}

        {renderButton(
          handleEndMeeting,
          <PhoneOff size={20} />,
          isHost ? 'End Meeting' : 'Leave Meeting',
          'danger',
          false,
          false,
          'end'
        )}
      </motion.div>
    </motion.div>
  );
};