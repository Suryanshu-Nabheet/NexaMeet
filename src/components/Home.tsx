import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaVideo, FaUser } from 'react-icons/fa';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [meetingTitle, setMeetingTitle] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleStartMeeting = () => {
    if (!meetingTitle.trim() || !participantName.trim()) {
      alert('Please enter both meeting title and your name');
      return;
    }
    const meetingId = Math.random().toString(36).substring(7);
    const participantId = Math.random().toString(36).substring(7);
    navigate(`/meeting/${meetingId}`, { 
      state: { 
        participantId,
        meetingTitle,
        participantName,
        isHost: true 
      } 
    });
  };

  const handleJoinMeeting = () => {
    if (!meetingTitle.trim() || !participantName.trim()) {
      alert('Please enter both meeting title and your name');
      return;
    }
    setIsJoining(true);
  };

  const handleJoinSubmit = (meetingId: string) => {
    const participantId = Math.random().toString(36).substring(7);
    navigate(`/meeting/${meetingId}`, { 
      state: { 
        participantId,
        meetingTitle,
        participantName,
        isHost: false 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0D1424] rounded-xl p-8 shadow-2xl"
        >
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            NexaMeet
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meeting Title
              </label>
              <input
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="Enter meeting title"
                className="w-full px-4 py-2 bg-gray-800/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 bg-gray-800/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {!isJoining ? (
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartMeeting}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  <FaVideo className="w-5 h-5" />
                  <span>Start Meeting</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoinMeeting}
                  className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  <FaUser className="w-5 h-5" />
                  <span>Join Meeting</span>
                </motion.button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter meeting ID"
                  className="w-full px-4 py-2 bg-gray-800/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleJoinSubmit(e.currentTarget.value);
                    }
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsJoining(false)}
                  className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium"
                >
                  Back
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home; 