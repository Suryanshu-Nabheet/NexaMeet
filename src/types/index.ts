export interface Meeting {
  id: string;
  title: string;
  hostId: string;
  meetingCode: string;
  participants: Participant[];
  messages: ChatMessage[];
  createdAt: Date;
  settings: MeetingSettings;
}

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  isAdmitted: boolean;
  stream: MediaStream | null;
}

export type ParticipantMap = Map<string, Participant>;

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

export interface MeetingSettings {
  isWaitingRoomEnabled: boolean;
  isChatEnabled: boolean;
  isScreenSharingEnabled: boolean;
  isCodeEditorEnabled: boolean;
}

export interface CodeSession {
  language: string;
  code: string;
  lastUpdated: number;
}

export interface ConnectionQuality {
  participantId: string;
  quality: 'good' | 'medium' | 'poor';
}

// Signaling message interfaces
export interface OfferSignal {
  type: 'offer';
  from: string;
  sdp: RTCSessionDescriptionInit;
}

export interface AnswerSignal {
  type: 'answer';
  from: string;
  sdp: RTCSessionDescriptionInit;
}

export interface IceCandidateSignal {
  type: 'ice-candidate';
  from: string;
  candidate: RTCIceCandidateInit;
}

export interface ParticipantJoinedSignal {
  type: 'participant-joined';
  participantId: string;
}

export interface ParticipantLeftSignal {
  type: 'participant-left';
  participantId: string;
}

export interface ErrorSignal {
  type: 'error';
  error: string;
}

export interface JoinSignal {
  type: 'join';
  meetingId: string;
  participantId: string;
}

export type SignalingMessage = 
  | OfferSignal
  | AnswerSignal
  | IceCandidateSignal
  | ParticipantJoinedSignal
  | ParticipantLeftSignal
  | ErrorSignal
  | JoinSignal;

export interface MeetingHeaderProps {
  title: string;
  participantCount: number;
  duration: string;
  meetingId: string;
  meetingCode: string;
  isHost: boolean;
  onOpenSettings: () => void;
  onToggleWaitingRoom: () => void;
  isWaitingRoomEnabled: boolean;
  connectionQualities: ConnectionQuality[];
  isReconnecting: boolean;
}

export interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  localUser: {
    id: string;
    name: string;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    isHandRaised: boolean;
  };
  participants: Participant[];
  emojiReactions: {
    [participantId: string]: {
      emoji: string;
      timestamp: number;
    };
  };
  layout: 'grid' | 'focus' | 'presentation';
  connectionQualities: ConnectionQuality[];
}

export interface WaitingRoomProps {
  participants: Participant[];
  onAdmitParticipant: (participantId: string) => void;
  onRejectParticipant: (participantId: string) => void;
  isHost: boolean;
}

export interface MeetingControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isSharingScreen: boolean;
  isHandRaised: boolean;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
  isCodeEditorOpen: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenSharing: () => void;
  toggleChat: () => void;
  toggleParticipants: () => void;
  toggleHandRaise: () => void;
  toggleCodeEditor: () => void;
  toggleLayout: () => void;
  sendEmoji: (emoji: string) => void;
  endMeeting: () => void;
}

export interface ParticipantsListProps {
  participants: Participant[];
  localUserId: string;
  isHost: boolean;
  onClose: () => void;
  onRemoveParticipant: (participantId: string) => void;
  onPromoteToHost: (participantId: string) => void;
  onToggleParticipantAudio: (participantId: string) => void;
  onToggleParticipantVideo: (participantId: string) => void;
}

export interface CodeEditorProps {
  initialCode: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
  readOnly: boolean;
  onClose: () => void;
}

export interface WebRTCHookReturn {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isSharingScreen: boolean;
  isInitialized: boolean;
  error: string | null;
  connectionQualities: ConnectionQuality[];
  initialize: () => Promise<boolean>;
  cleanup: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenSharing: () => Promise<void>;
  addRemoteStream: (participantId: string, stream: MediaStream) => void;
  removeRemoteStream: (participantId: string) => void;
}

export interface WebRTCHookProps {
  userId: string;
  meetingId: string;
  onConnectionQualityChange: (qualities: ConnectionQuality[]) => void;
}

export interface MeetingHookReturn {
  meeting: Meeting | null;
  participants: Participant[];
  messages: ChatMessage[];
  error: string | null;
  isLoading: boolean;
  createMeeting: () => Promise<{ id: string; hostId: string; meetingCode: string; } | null>;
  getMeeting: (id: string) => Promise<Meeting | null>;
  joinMeeting: () => Promise<boolean>;
  leaveMeeting: () => Promise<void>;
  removeParticipant: (participantId: string) => Promise<void>;
  addMessage: (message: ChatMessage) => Promise<void>;
  updateParticipant: (participantId: string, updates: Partial<Participant>) => Promise<void>;
}

export interface User {
  uid: string;
  id: string;
  email: string | null;
  displayName: string | null;
  name: string | null;
  photoURL: string | null;
}

export interface ScreenShareProps {
  isSharing: boolean;
  onStartSharing: () => void;
  onStopSharing: () => void;
}