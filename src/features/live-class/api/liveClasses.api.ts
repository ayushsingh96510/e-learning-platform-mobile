import api from "../../../api/axios";
import type {
  ApiResponse,
  JoinLiveClassResponse,
  LiveClassTab,
  LiveSession,
  SessionsResponse,
} from "../types";

const STATUS_BY_TAB: Record<LiveClassTab, "LIVE" | "SCHEDULED" | "COMPLETED"> = {
  LIVE: "LIVE",
  UPCOMING: "SCHEDULED",
  COMPLETED: "COMPLETED",
};

export interface SessionsParams {
  page: number;
  limit: number;
  startDate?: string; // YYYY-MM-DD, upcoming only
  endDate?: string; // YYYY-MM-DD, upcoming only
}

export async function getSessions(
  tab: LiveClassTab,
  params: SessionsParams
): Promise<SessionsResponse> {
  const res = await api.get<ApiResponse<SessionsResponse>>("/live-classes", {
    params: { status: STATUS_BY_TAB[tab], ...params },
  });
  const data = res.data.data;
  return {
    sessions: data?.sessions ?? [],
    pagination: data?.pagination,
  };
}

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