export type RoomStatus = "ACTIVE" | "LIVE" | "ENDED";
export type RoomMemberRole = "CREATOR" | "MEMBER";
export type RoomFilter = "ALL" | "MY_ROOMS" | "JOINED" | "LIVE";

export interface RoomUser {
  id: string;
  name: string;
  profileImage?: string;
}

export interface RoomMember {
  user: RoomUser;
  role: RoomMemberRole;
  joinedAt: string;
}

export interface StudyRoom {
  _id: string;
  id?: string;
  name: string;
  description: string | null;
  subject: string | null;
  createdBy: RoomUser;
  isPrivate: boolean;
  status: RoomStatus;
  roomName: string;
  members: RoomMember[];
  memberCount: number;
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

export interface RoomsPage {
  rooms: StudyRoom[];
  pagination?: Pagination;
}

export interface RoomStats {
  totalRooms: number;
  liveRooms: number;
  totalMembers: number;
  avgMembers: number;
}

/** Response of POST /group-study/:roomName/join. */
export interface JoinRoomData {
  room: {
    id: string;
    roomName: string;
    name: string;
    status: RoomStatus;
  };
  liveKit: {
    token: string;
    roomName: string;
    serverURL: string;
  };
}

/** Chat message sent over the LiveKit data channel (same shape as the web app). */
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
}
