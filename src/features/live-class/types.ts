export type LiveClassTab = "LIVE" | "UPCOMING" | "COMPLETED";

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors: string[];
}

export interface LiveSession {
  id: string;
  title: string;
  description: string | null;
  program?: { id: string; name: string };
  batch?: { id: string; name: string } | null;
  subject: { id: string; name: string };
  teacher: { id: string; name: string; profileImage?: string };
  status: string; // SCHEDULED | LIVE | COMPLETED
  deliveryMode: string;
  roomName: string | null;
  durationMinutes: number;
  maxParticipants: number;
  isRecordingEnabled: boolean;
  isChatEnabled: boolean;
  isScreenShareAllowed: boolean;
  replayMaterialId: string | null;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SessionsResponse {
  sessions: LiveSession[];
  pagination?: Pagination;
}

export interface JoinLiveClassResponse {
  liveClass: {
    id: string;
    roomName: string;
    participantName: string;
    participantId: string;
    participantRole: string;
    deliveryMode: string;
  };
  liveKit: {
    token: string;
    roomName: string;
    serverURL: string;
  };
}