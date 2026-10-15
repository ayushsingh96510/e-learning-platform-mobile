import { useCallback, useEffect, useState } from "react";
import { joinRoom } from "../api/groupStudy.api";
import type { JoinRoomData } from "../types";

/**
 * Uses the join data passed in by the rooms list. If the screen is opened
 * without it, the room is joined here instead.
 */
export function useRoomJoin(roomName: string, initial?: JoinRoomData) {
  const [joinData, setJoinData] = useState<JoinRoomData | null>(initial ?? null);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);

  const attempt = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setJoinData(await joinRoom(roomName));
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to join the study room.");
    } finally {
      setLoading(false);
    }
  }, [roomName]);

  useEffect(() => {
    if (!initial) attempt();
  }, [initial, attempt]);

  return { joinData, loading, error, retry: attempt };
}
