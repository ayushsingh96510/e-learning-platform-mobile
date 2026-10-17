
import { useCallback, useEffect, useState } from "react";

import { getMaterialSummary } from "../api/content.api";
import type { MaterialSummary } from "../types/content.types";

interface UseMaterialSummaryResult {
  summary: MaterialSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMaterialSummary(
  materialId: string | undefined,
): UseMaterialSummaryResult {
  const [summary, setSummary] = useState<MaterialSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const refetch = useCallback(() => {
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    let active = true;

    if (!materialId) {
      setSummary(null);
      setLoading(false);
      setError("Material ID is missing.");
      return () => {
        active = false;
      };
    }

    const currentMaterialId = materialId;

    async function fetchSummary() {
      setLoading(true);
      setError(null);
      setSummary(null);

      try {
        const result = await getMaterialSummary(currentMaterialId);

        if (active) {
          setSummary(result);
        }
      } catch (err: unknown) {
        if (!active) return;

        const message =
          err instanceof Error
            ? err.message
            : "Unable to load the AI summary.";

        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchSummary();

    return () => {
      active = false;
    };
  }, [materialId, retryCount]);

  return { summary, loading, error, refetch };
}
