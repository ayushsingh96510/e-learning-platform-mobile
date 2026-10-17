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

/** Metadata sent with every chunk of a shared file (same shape as the web app). */
export interface SharedFileMeta {
  id: string;
  senderId: string;
  senderName: string;
  fileName: string;
  mimeType: string;
  size: number;
}

/** A shared file that has been saved to the device cache. */
export interface SharedFile extends SharedFileMeta {
  uri: string;
}

/** Body of POST /group-study (same fields as the web form). */
export interface CreateRoomPayload {
  name: string;
  description: string;
  subject: string;
  isPrivate: boolean;
  memberIds: string[];
}

export interface StudentOption {
  value: string;
  label: string;
}

/**
 * A whiteboard element as sent by the web app (Excalidraw format).
 * Only the fields needed to draw it are listed.
 */
export interface WhiteboardElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
  strokeColor?: string;
  backgroundColor?: string;
  fillStyle?: string;
  strokeWidth?: number;
  strokeStyle?: string;
  opacity?: number;
  roundness?: { type: number; value?: number } | null;
  isDeleted?: boolean;
  version?: number;
  points?: number[][];
  startArrowhead?: string | null;
  endArrowhead?: string | null;
  text?: string;
  fontSize?: number;
  fontFamily?: number;
  textAlign?: string;
  lineHeight?: number;
  fileId?: string | null;
  name?: string | null;
}

/** Scroll and zoom of the board, using Excalidraw's meaning: screen = (point + scroll) * zoom. */
export interface ViewportState {
  scrollX: number;
  scrollY: number;
  zoom: number;
}

export interface Presenter {
  identity: string;
  name: string;
}

/** "Someone is drawing over here" ping from a participant who is not presenting. */
export interface ActivityPing extends ViewportState {
  identity: string;
  name: string;
}
