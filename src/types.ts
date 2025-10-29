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

export interface MeetingState {
  isActive: boolean;
  isRecording: boolean;
  isChatEnabled: boolean;
  isHandRaiseEnabled: boolean;
  isScreenSharingEnabled: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  title: string;
  handRaisedParticipants?: Set<string>;
  lastChatMessage?: ChatMessage;
}

export interface ChatMessage {
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
} 