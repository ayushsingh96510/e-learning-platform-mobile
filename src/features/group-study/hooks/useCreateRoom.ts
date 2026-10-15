import { useCallback, useState } from "react";
import { createRoom } from "../api/groupStudy.api";
import type { CreateRoomPayload } from "../types";

export function useCreateRoom() {
  const [creating, setCreating] = useState(false);

  /** Resolves to an error message, or null if the room was created. */
  const create = useCallback(
    async (payload: CreateRoomPayload): Promise<string | null> => {
      setCreating(true);

      try {
        await createRoom(payload);
        return null;
      } catch (e: any) {
        return (
          e?.response?.data?.message ?? "Failed to create the study room."
        );
      } finally {
        setCreating(false);
      }
    },
    []
  );

  return { create, creating };
}
