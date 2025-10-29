import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeeting } from '../hooks/useMeeting';
import ControlBar from './ControlBar';
import ParticipantSidebar from './ParticipantSidebar';
import { Monitor, Users, MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface MeetingLayoutProps {
  meetingId: string;
  participantId: string;
  children: React.ReactNode;
}

export const MeetingLayout: React.FC<MeetingLayoutProps> = ({ meetingId, participantId, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();
  const { meetingTitle, participantName, isHost: navIsHost } = location.state || {};

  const {
    participants,
    localParticipant,
    meetingState,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleRecording,
    toggleHand,
    toggleChat,
    endMeeting
  } = useMeeting(meetingId, participantId, navIsHost || false);

  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; message: string; timestamp: number }>>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (meetingTitle && meetingState) {
      console.log('Setting meeting title:', meetingTitle);
      meetingState.title = meetingTitle;
    }
  }, [meetingTitle, meetingState]);

  const isHost = localParticipant?.isHost || false;
  const isAudioEnabled = localParticipant?.isAudioEnabled || false;
  const isVideoEnabled = localParticipant?.isVideoEnabled || false;
  const isScreenSharing = localParticipant?.isScreenSharing || false;
  const isRecording = meetingState?.isRecording || false;
  const isHandRaised = localParticipant?.isHandRaised || false;
  const displayTitle = meetingTitle || (meetingState?.title) || 'Untitled Meeting';

  const handleToggleChat = () => {
    setIsChatOpen((prev) => {
      const newState = !prev;
      toggleChat(newState);
      return newState;
    });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && localParticipant) {
      const message = {
        sender: localParticipant.name || 'You',
        message: newMessage.trim(),
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#0A0F1C] to-[#0D1424] text-white">
      {/* Top Bar */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="flex items-center justify-between px-8 py-4 bg-[#0D1424]/80 backdrop-blur-xl border-b border-gray-800/50"
      >
        <div className="flex-1" />
        <div className="flex items-center justify-center flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            {displayTitle}
          </h1>
        </div>
        <div className="flex items-center space-x-6 flex-1 justify-end">
          {isHost && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1.5 text-sm font-medium text-blue-400 bg-blue-900/30 rounded-full border border-blue-500/20"
            >
              Host
            </motion.span>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-300 hover:text-white transition-colors flex items-center space-x-2 bg-gray-800/50 rounded-lg hover:bg-gray-800/80"
          >
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">{participants.size} Participants</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 relative bg-[#0A0F1C]">
          <AnimatePresence mode="wait">
            {isScreenSharing ? (
              <motion.div
                key="screen-share"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 flex items-center justify-center p-4"
              >
                <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl bg-black">
                  {children}
                </div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-6 right-6 bg-blue-500/90 backdrop-blur-xl px-4 py-2 rounded-full text-white text-sm flex items-center space-x-2 shadow-lg"
                >
                  <Monitor size={16} />
                  <span>Screen Share</span>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="video"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 flex items-center justify-center p-4"
              >
                <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl bg-black">
                  {children}
                </div>
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center border-4 border-gray-700">
                      <span className="text-5xl font-bold text-gray-400">
                        {participantName?.charAt(0).toUpperCase() || localParticipant?.name?.charAt(0).toUpperCase() || 'Y'}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Participant Sidebar */}
        <motion.div
          initial={false}
          animate={{
            width: isSidebarOpen ? 320 : 0,
            opacity: isSidebarOpen ? 1 : 0
          }}
          className="h-full bg-[#0D1424]/90 backdrop-blur-xl border-l border-gray-800/50 overflow-hidden"
        >
          <ParticipantSidebar 
            isOpen={isSidebarOpen} 
            meetingId={meetingId}
            participantId={participantId}
          />
        </motion.div>

        {/* Chat Sidebar */}
        <motion.div
          initial={false}
          animate={{
            width: isChatOpen ? 320 : 0,
            opacity: isChatOpen ? 1 : 0,
            display: isChatOpen ? 'block' : 'none'
          }}
          className="h-full bg-[#0D1424]/90 backdrop-blur-xl border-l border-gray-800/50 overflow-hidden"
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-100">Chat</h2>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <div className="flex-1 flex flex-col">
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto mb-4 bg-gray-900/50 rounded-lg p-4">
                <div className="space-y-4">
                  {chatMessages.length === 0 ? (
                    <p className="text-gray-400 text-sm">No messages yet</p>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <div key={index} className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-blue-400">{msg.sender}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-200 mt-1">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {/* Chat input */}
              <div className="mt-auto">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 bg-gray-800/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700/50"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-xl transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Control Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="px-6 py-4 bg-[#0D1424]/80 backdrop-blur-xl border-t border-gray-800/50"
      >
        <ControlBar
          isHost={isHost}
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={isScreenSharing}
          isRecording={isRecording}
          isHandRaised={isHandRaised}
          isChatOpen={isChatOpen}
          onToggleAudio={() => toggleAudio(!isAudioEnabled)}
          onToggleVideo={() => toggleVideo(!isVideoEnabled)}
          onToggleScreenShare={() => toggleScreenShare(!isScreenSharing)}
          onToggleRecording={() => toggleRecording(!isRecording)}
          onToggleHand={toggleHand}
          onToggleChat={handleToggleChat}
          onEndMeeting={endMeeting}
        />
      </motion.div>

      {/* Overlay for participant name and status */}
      <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-2">
        <span>{participantId === localParticipant?.id ? `${participantName} (You)` : participantName || 'Participant'}</span>
        {!isAudioEnabled && <span className="text-red-400">🎤</span>}
        {!isVideoEnabled && <span className="text-red-400">📹</span>}
        {isHandRaised && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-yellow-400"
          >
            ✋
          </motion.div>
        )}
        {isScreenSharing && <span className="text-blue-400">🖥️</span>}
      </div>
    </div>
  );
};

export default MeetingLayout; 