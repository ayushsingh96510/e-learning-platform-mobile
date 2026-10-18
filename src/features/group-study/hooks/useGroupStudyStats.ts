import { useCallback, useEffect, useRef, useState } from "react";
import { getStats } from "../api/groupStudy.api";
import type { RoomStats } from "../types";

export function useGroupStudyStats() {
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;

    try {
      const data = await getStats();
      if (id !== requestId.current) return;
      setStats(data);
    } catch {
      // Stats are decorative; keep the previous values if this fails.
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, loading, refetch: load };
}
