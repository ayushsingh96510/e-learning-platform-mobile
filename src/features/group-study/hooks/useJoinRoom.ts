import { useCallback, useState } from "react";
import { joinRoom } from "../api/groupStudy.api";
import type { JoinRoomData } from "../types";

interface JoinOutcome {
  data: JoinRoomData | null;
  error: string | null;
}

export function useJoinRoom() {
  const [joiningRoom, setJoiningRoom] = useState<string | null>(null);

  const join = useCallback(async (roomName: string): Promise<JoinOutcome> => {
    setJoiningRoom(roomName);

    try {
      const data = await joinRoom(roomName);
      return { data, error: null };
    } catch (e: any) {
      return {
        data: null,
        error: e?.response?.data?.message ?? "Failed to join the study room.",
      };
    } finally {
      setJoiningRoom(null);
    }
  }, []);

  return { join, joiningRoom };
}
