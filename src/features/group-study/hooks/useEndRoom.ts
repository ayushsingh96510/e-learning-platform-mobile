import { useCallback, useState } from "react";
import { endRoom } from "../api/groupStudy.api";

export function useEndRoom() {
  const [ending, setEnding] = useState(false);

  /** Resolves to an error message, or null if the room was ended. */
  const end = useCallback(async (id: string): Promise<string | null> => {
    setEnding(true);

    try {
      await endRoom(id);
      return null;
    } catch (e: any) {
      return e?.response?.data?.message ?? "Failed to end the study room.";
    } finally {
      setEnding(false);
    }
  }, []);

  return { end, ending };
}
