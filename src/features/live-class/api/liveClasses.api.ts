import api from "../../../api/axios";
import type { ApiResponse } from "../../../api/types";
import type { LiveClassTab, SessionsResponse } from "../types";

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