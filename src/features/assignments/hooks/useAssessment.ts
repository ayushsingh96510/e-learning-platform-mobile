import { useCallback, useEffect, useRef, useState } from "react";
import { getAssessment } from "../api/assignments.api";
import type { AssessmentDetail } from "../types";

/** Loads one assessment (with its questions) for an attempt. */
export function useAssessment(id: string) {
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true);
    setError(null);

    try {
      const data = await getAssessment(id);
      if (current !== requestId.current) return;
      setAssessment(data);
    } catch (e: any) {
      if (current !== requestId.current) return;
      setError(e?.response?.data?.message ?? "Failed to load the assessment.");
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { assessment, loading, error, reload: load };
}
