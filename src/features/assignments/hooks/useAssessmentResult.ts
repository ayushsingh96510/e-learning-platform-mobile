import { useCallback, useEffect, useRef, useState } from "react";
import { getResultById } from "../api/results.api";
import type { AssessmentResult } from "../types";

/**
 * Shows a result either from data passed in by the submit flow
 * (when it already includes the question review) or by fetching it.
 */
export function useAssessmentResult(
  resultId?: string,
  initial?: AssessmentResult
) {
  const hasFullInitial = !!initial && initial.reviews.length > 0;

  const [result, setResult] = useState<AssessmentResult | null>(
    initial ?? null
  );
  const [loading, setLoading] = useState(!hasFullInitial && !!resultId);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    if (!resultId) return;

    const current = ++requestId.current;
    setLoading(true);
    setError(null);

    try {
      const data = await getResultById(resultId);
      if (current !== requestId.current) return;
      setResult(data);
    } catch (e: any) {
      if (current !== requestId.current) return;
      setError(e?.response?.data?.message ?? "Failed to load the result.");
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [resultId]);

  useEffect(() => {
    if (!hasFullInitial) load();
  }, [hasFullInitial, load]);

  return { result, loading, error, reload: load };
}
