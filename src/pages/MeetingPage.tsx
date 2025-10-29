import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import MeetingRoom from '../components/MeetingRoom';
import { toast } from 'react-hot-toast';
import MeetingLayout from '../components/MeetingLayout';

interface LocationState {
  isHost: boolean;
  participantId: string;
  participantName: string;
}

export default function MeetingPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const state = location.state as LocationState;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        // Check if we have the required state or URL parameters
        const participantId = state?.participantId || searchParams.get('participantId');
        const participantName = state?.participantName || searchParams.get('name');
        const isHost = state?.isHost || false;

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
        const meetingInfo = localStorage.getItem('currentMeeting');
        if (!meetingInfo) {
          toast.error('Meeting information not found');
          navigate('/');
          return;
        }

        // If all checks pass, we're ready to show the meeting room
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing meeting:', error);
        toast.error('Failed to initialize meeting');
        navigate('/');
      }
    };

    initializeMeeting();
  }, [meetingId, state, searchParams, navigate]);

  // Get participant info from either state or URL parameters
  const participantId = state?.participantId || searchParams.get('participantId');
  const participantName = state?.participantName || searchParams.get('name');
  const isHost = state?.isHost || false;

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

  if (!participantId || !participantName || !meetingId) {
    return null;
  }

  return (
    <MeetingLayout ...>
    <MeetingRoom
      meetingId={meetingId}
      isHost={isHost}
      participantId={participantId}
      participantName={participantName}
    />
    </MeetingLayout>
  );
} 