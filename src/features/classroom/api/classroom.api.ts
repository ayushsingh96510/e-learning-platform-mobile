import api from "@/api/axios";
import type { ApiResponse } from "@/api/types";
import type { LiveSession } from "@/features/live-class/types";
import type { JoinLiveClassResponse } from "../types";

export async function getLiveClassByRoomName(roomName: string) {
  const res = await api.get<ApiResponse<LiveSession>>(
    `/live-classes/roomName/${encodeURIComponent(roomName)}`
  );
  return res.data.data;
}

export async function joinLiveClass(roomName: string) {
  const res = await api.post<ApiResponse<JoinLiveClassResponse>>(
    `/live-classes/${encodeURIComponent(roomName)}/join`
  );
  return res.data.data;
}