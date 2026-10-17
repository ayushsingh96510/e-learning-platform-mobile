
import { useCallback, useEffect, useState } from "react";

import { getMaterialTranscript } from "../api/content.api";
import type { MaterialTranscript } from "../types/content.types";

interface UseMaterialTranscriptResult {
  transcript: MaterialTranscript | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMaterialTranscript(
  materialId: string | undefined,
): UseMaterialTranscriptResult {
  const [transcript, setTranscript] =
    useState<MaterialTranscript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const refetch = useCallback(() => {
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    let active = true;

    if (!materialId) {
      setTranscript(null);
      setLoading(false);
      setError("Material ID is missing.");

      return () => {
        active = false;
      };
    }

    const currentMaterialId = materialId;

    async function fetchTranscript() {
      setLoading(true);
      setError(null);
      setTranscript(null);

      try {
        const result = await getMaterialTranscript(currentMaterialId);

        if (active) {
          setTranscript(result);
        }
      } catch (err: unknown) {
        if (!active) return;

        const message =
          err instanceof Error
            ? err.message
            : "Unable to load the transcript.";

        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchTranscript();

    return () => {
      active = false;
    };
  }, [materialId, retryCount]);

  return { transcript, loading, error, refetch };
}
