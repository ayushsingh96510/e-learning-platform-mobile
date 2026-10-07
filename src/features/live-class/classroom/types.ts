export type PresenterType = "TEACHER" | "REPLAY";

export interface PresenterIdentity {
  /** LiveKit participant identity used to match tracks. */
  identity: string | null;
  type: PresenterType;
  name: string;
  profileImage?: string;
}

export type ParticipantRole = "TEACHER" | "STUDENT" | "ADMIN";

export interface ParticipantInfo {
  identity: string;
  name: string;
  avatar?: string;
  role: ParticipantRole;
  isMuted: boolean;
  isCameraOff: boolean;
  handRaised: boolean;
  isPinned?: boolean;
  audioLevel?: number;
  isSpeaking?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: number;
  type: "message" | "question" | "announcement";
}

export type ChatTab = "chat" | "qa" | "announcements";

export type ConnectionQuality = "excellent" | "good" | "poor" | "disconnected";

export interface ITeacherIdentity {
  id: string;
  name: string;
  profileImage?: string;
}