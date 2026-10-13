import { useCallback, useState } from "react";
import { submitAssessment } from "../api/results.api";
import type { AssessmentResult, SubmitAssessmentPayload } from "../types";

export function useSubmitAssessment() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Resolves to the result, or null if the submission failed. */
  const submit = useCallback(
    async (payload: SubmitAssessmentPayload): Promise<AssessmentResult | null> => {
      setSubmitting(true);
      setError(null);

      try {
        return await submitAssessment(payload);
      } catch (e: any) {
        setError(
          e?.response?.data?.message ?? "Failed to submit. Please try again."
        );
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const clearError = useCallback(() => setError(null), []);

  return { submit, submitting, error, clearError };
}
