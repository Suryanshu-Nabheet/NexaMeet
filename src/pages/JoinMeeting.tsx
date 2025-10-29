import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useMeeting } from '../hooks/useMeeting';
import { Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-react';

export const JoinMeeting: React.FC = () => {
  const { id: meetingId } = useParams<{ id: string }>();
  const { user, isAuthenticated, login } = useAuthContext();
  const { meeting, getMeeting, joinMeeting, loading, error } = useMeeting(
    user?.uid || null,
    user?.displayName || user?.email?.split('@')[0] || null
  );
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  
  // Set display name from user profile
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || user.email?.split('@')[0] || '');
    }
  }, [user]);
  
  // Get meeting data
  useEffect(() => {
    if (meetingId && isAuthenticated) {
      getMeeting(meetingId);
    }
  }, [meetingId, isAuthenticated]);
  
  // Initialize camera and microphone
  useEffect(() => {
    async function initializeMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: isAudioEnabled,
          video: isVideoEnabled,
        });
        
        setLocalStream(stream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
      }
    }
    
    initializeMedia();
    
    // Clean up on component unmount
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };
  
  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };
  
  // Join the meeting
  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setJoinError('Please enter your name');
      return;
    }
    
    if (!isAuthenticated) {
      await login();
      return;
    }
    
    setJoinError(null);
    const success = await joinMeeting(meetingId || '');
    
    if (success) {
      navigate(`/meeting/${meetingId}`);
    } else {
      setJoinError('Failed to join meeting');
    }
  };
  
  // No meeting ID
  if (!meetingId) {
    return (
      <Layout>
        <div className="max-w-md mx-auto p-6 mt-16">
          <h2 className="text-2xl font-bold text-center mb-6">Invalid Meeting</h2>
          <p className="text-gray-600 text-center mb-8">
            No meeting ID provided. Please check your meeting link.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="w-full"
          >
            Return Home
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 mt-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0 md:w-1/2 bg-gray-100 p-6">
              <h2 className="text-2xl font-bold mb-6">Join Meeting</h2>
              
              <div className="bg-black rounded-lg overflow-hidden aspect-video mb-6 relative">
                {isVideoEnabled ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  ></video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <span className="text-white text-lg">Camera is off</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button
                  variant="icon"
                  className={`p-3 rounded-full ${
                    isAudioEnabled ? 'bg-gray-200' : 'bg-red-100 text-red-600'
                  }`}
                  onClick={toggleAudio}
                  aria-label={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
                >
                  {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </Button>
                
                <Button
                  variant="icon"
                  className={`p-3 rounded-full ${
                    isVideoEnabled ? 'bg-gray-200' : 'bg-red-100 text-red-600'
                  }`}
                  onClick={toggleVideo}
                  aria-label={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
                >
                  {isVideoEnabled ? <VideoIcon size={20} /> : <VideoOff size={20} />}
                </Button>
              </div>
            </div>
            
            <div className="p-8 md:w-1/2">
              <h3 className="text-xl font-semibold mb-6">Meeting details</h3>
              
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 mb-4">
                  {error}
                </div>
              ) : meeting ? (
                <div className="mb-6">
                  <p className="text-gray-700 mb-2">
                    <span className="font-medium">Meeting ID:</span> {meeting.id}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Host:</span> {meeting.hostName}
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 mb-4">
                  Loading meeting details...
                </p>
              )}
              
              <form onSubmit={handleJoinMeeting}>
                <div className="space-y-4">
                  <Input
                    label="Your Name"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    error={joinError || undefined}
                    required
                  />
                  
                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={loading}
                    disabled={!meetingId}
                  >
                    Join Now
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};