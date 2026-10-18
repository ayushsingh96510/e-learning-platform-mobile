import { useCallback, useEffect, useRef, useState } from "react";
import { getBatchStudents } from "../api/groupStudy.api";
import type { StudentOption } from "../types";

/** Loads the students of a batch. Does nothing while batchId is undefined. */
export function useBatchStudents(batchId?: string) {
  const [options, setOptions] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    if (!batchId) return;

    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    try {
      const list = await getBatchStudents(batchId);
      if (id !== requestId.current) return;
      setOptions(list);
    } catch (e: any) {
      if (id !== requestId.current) return;
      setError(e?.response?.data?.message ?? "Failed to load students.");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    load();
  }, [load]);

  return { options, loading, error, reload: load };
}
