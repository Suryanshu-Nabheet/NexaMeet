import { Meeting, MeetingInfo } from '../types';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// Function to check server health with retries and timeout
// const checkServerHealth = async (retries = 3, delay = 1000, timeout = 5000): Promise<boolean> => {
//   // ... function content ...
// };

// In-memory storage for meetings
const meetings = new Map<string, MeetingInfo>();

// Load meetings from localStorage on startup
const loadMeetings = () => {
  try {
    const storedMeetings = localStorage.getItem('meetings');
    if (storedMeetings) {
      const parsedMeetings = JSON.parse(storedMeetings);
      Object.entries(parsedMeetings).forEach(([id, meeting]) => {
        meetings.set(id, meeting as MeetingInfo);
      });
      console.log('Loaded meetings from localStorage:', meetings);
    }
  } catch (error) {
    console.error('Error loading meetings from localStorage:', error);
  }
};

// Save meetings to localStorage
const saveMeetings = () => {
  try {
    const meetingsObj = Object.fromEntries(meetings);
    localStorage.setItem('meetings', JSON.stringify(meetingsObj));
  } catch (error) {
    console.error('Error saving meetings to localStorage:', error);
  }
};

// Load meetings on startup
loadMeetings();

// Create a new meeting with retries
export const createMeeting = async (title: string = 'Untitled Meeting') => {
  try {
    const response = await fetch(`${API_URL}/api/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error('Failed to create meeting');
    }

    const data = await response.json();
    
    // Store meeting info in localStorage
    const meetingInfo: MeetingInfo = {
      id: data.id,
      hostId: data.hostId,
      meetingCode: data.meetingCode,
      title: title,
      createdAt: new Date().toISOString(),
    };
    
    meetings.set(data.id, meetingInfo);
    saveMeetings();
    
    // Store title separately for easy access
    localStorage.setItem(`meeting_${data.id}_title`, title);
    
    return data;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

// Join meeting by code with retries
export const joinMeetingByCode = async (meetingCode: string, participantName: string) => {
  try {
    const response = await fetch(`${API_URL}/api/meetings/${meetingCode}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: participantName }),
    });

    if (!response.ok) {
      throw new Error('Failed to join meeting');
    }

    const data = await response.json();
    
    // Store meeting info in localStorage
    const meetingInfo: MeetingInfo = {
      id: data.meetingId,
      participantId: data.participantId,
      meetingCode: meetingCode,
      title: data.title || 'Untitled Meeting',
      joinedAt: new Date().toISOString(),
    };
    
    meetings.set(data.meetingId, meetingInfo);
    saveMeetings();
    
    // Store title separately for easy access
    localStorage.setItem(`meeting_${data.meetingId}_title`, data.title || 'Untitled Meeting');
    
    return data;
  } catch (error) {
    console.error('Error joining meeting:', error);
    throw error;
  }
};

export const getMeetingStatus = async (meetingId: string) => {
  try {
    const response = await fetch(`${API_URL}/api/meetings/${meetingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get meeting status');
    }

    const data = await response.json();
    
    // Update meeting info in localStorage if needed
    if (data.title) {
      localStorage.setItem(`meeting_${meetingId}_title`, data.title);
    }
    
    return data;
  } catch (error) {
    console.error('Error getting meeting status:', error);
    throw error;
  }
};