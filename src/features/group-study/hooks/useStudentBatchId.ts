import { useEffect, useState } from "react";

// Reuses the profile feature's API and types so the shape of the user is
// defined in one place. Adjust the file name if the profile api file differs.
import { getProfile } from "@/features/profile/api/profile.api";

/**
 * Batch id of the logged-in student, from the profile (GET /auth/me).
 * It is used to load the classmates who can be invited to a new study room.
 */
export function useStudentBatchId(): string | undefined {
  const [batchId, setBatchId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    getProfile()
      .then((profile) => {
        const id = profile.roleInfo?.batch?.id;

        if (__DEV__ && !id) {
          console.warn(
            "[group-study] The profile has no batch (roleInfo.batch.id), so classmates cannot be listed."
          );
        }

        if (!cancelled) setBatchId(id);
      })
      .catch(() => {
        // Without a batch id the room can still be created without invitees.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return batchId;
}