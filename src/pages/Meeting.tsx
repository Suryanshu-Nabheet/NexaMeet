import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MeetingLayout } from '../components/MeetingLayout';
import { toast } from 'react-hot-toast';
import { HostView } from '../components/HostView';
import { useMeeting } from '../hooks/useMeeting';

export const Meeting: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const participantId = searchParams.get('participantId') || '';
  const { localParticipant, isHost, isScreenSharing } = useMeeting(meetingId || '', participantId);
  
  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        // Check if we have the required URL parameters
        const participantName = searchParams.get('name');

        if (!participantId || !participantName) {
          toast.error('Invalid meeting access');
        navigate('/');
        return;
      }
      
        // Check if meetingId is valid
        if (!meetingId) {
          toast.error('Invalid meeting ID');
          navigate('/');
            return;
          }
          
        // Check if we have meeting info in localStorage
        // Note: We don't strictly need meetingInfo from localStorage here for basic rendering, 
        // the useMeeting hook handles meeting state and WebRTC connection.
        // However, keeping the check if it's part of the intended flow.
        // const meetingInfo = localStorage.getItem('currentMeeting');
        // if (!meetingInfo) {
        //   toast.error('Meeting information not found');
        //   navigate('/');
        //   return;
        // }

        // If all checks pass, we're ready to show the meeting room
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing meeting:', error);
        toast.error('Failed to initialize meeting');
        navigate('/');
      }
    };
    
    initializeMeeting();
  }, [meetingId, participantId, searchParams, navigate]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing meeting...</p>
        </div>
      </div>
    );
  }
  
  if (!meetingId || !participantId) {
    return null;
  }

  // Render MeetingLayout with HostView as children
  return (
    <MeetingLayout
        meetingId={meetingId}
      participantId={participantId}
    >
      {/* Pass HostView as a child to MeetingLayout */}
      <HostView localParticipant={localParticipant} isHost={isHost} isScreenSharing={isScreenSharing} /> 
    </MeetingLayout>
  );
};