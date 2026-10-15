import api from "../../../api/axios";
import type {
  JoinRoomData,
  Pagination,
  RoomFilter,
  RoomStats,
  StudyRoom,
  RoomsPage,
  CreateRoomPayload,
  StudentOption,
} from "../types";

export interface RoomsParams {
  page: number;
  limit: number;
  search?: string;
  filter?: RoomFilter;
}

/**
 * Most endpoints reply with { success, statusCode, message, data }.
 * This also accepts a bare body, so it keeps working if an endpoint
 * does not use the envelope.
 */
function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    if ("data" in record && ("success" in record || "statusCode" in record)) {
      return record.data as T;
    }
  }
  return body as T;
}

export async function getRooms(params: RoomsParams): Promise<RoomsPage> {
  const res = await api.get("/group-study", { params });
  const data = unwrap<{ rooms?: StudyRoom[]; pagination?: Pagination }>(
    res.data
  );

  return {
    rooms: data?.rooms ?? [],
    pagination: data?.pagination,
  };
}

export async function getStats(): Promise<RoomStats> {
  const res = await api.get("/group-study/stats");
  const data = unwrap<Partial<RoomStats>>(res.data);

  return {
    totalRooms: data?.totalRooms ?? 0,
    liveRooms: data?.liveRooms ?? 0,
    totalMembers: data?.totalMembers ?? 0,
    avgMembers: data?.avgMembers ?? 0,
  };
}

export async function joinRoom(roomName: string): Promise<JoinRoomData> {
  const res = await api.post(`/group-study/${roomName}/join`);
  return unwrap<JoinRoomData>(res.data);
}

/** Ends the room for everyone. Only the creator is allowed to do this. */
export async function endRoom(id: string): Promise<void> {
  await api.post(`/group-study/${id}/end`);
}

export async function createRoom(payload: CreateRoomPayload): Promise<void> {
  await api.post("/group-study", payload);
}

interface RawStudent {
  id?: string;
  _id?: string;
  personalInfo?: { name?: string };
}

/** Students of a batch, used to pick the members of a new room. */
export async function getBatchStudents(
  batchId: string
): Promise<StudentOption[]> {
  const res = await api.get(`/users/students/by-batch/${batchId}`);
  const data = unwrap<{ students?: RawStudent[] }>(res.data);

  return (data?.students ?? [])
    .filter((student) => !!(student.id ?? student._id))
    .map((student) => ({
      value: String(student.id ?? student._id),
      label: student.personalInfo?.name ?? "Unknown Student",
    }));
}
