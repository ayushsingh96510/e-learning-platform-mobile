import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAllPublishedAssessments } from "../api/assignments.api";
import { getAllResults } from "../api/results.api";
import type { AssessmentResult, AssessmentSummary } from "../types";
import { buildLatestResultMap } from "../utils/completion";

type LoadMode = "initial" | "refresh" | "silent";

/**
 * Loads all published assessments and all of the student's results,
 * and exposes the latest result per assessment (used for the
 * Completed tab and the "View Result" button).
 */
export function useAssignmentsList() {
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async (mode: LoadMode) => {
    const id = ++requestId.current;
    if (mode === "initial") setLoading(true);
    if (mode === "refresh") setRefreshing(true);
    if (mode !== "silent") setError(null);

    try {
      const [nextAssessments, nextResults] = await Promise.all([
        getAllPublishedAssessments(),
        getAllResults(),
      ]);

      // Ignore the result if a newer request has started.
      if (id !== requestId.current) return;

      setAssessments(nextAssessments);
      setResults(nextResults);
    } catch (e: any) {
      if (id !== requestId.current) return;
      if (mode !== "silent") {
        setError(e?.response?.data?.message ?? "Failed to load assignments.");
      }
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    load("initial");
  }, [load]);

  const latestResults = useMemo(() => buildLatestResultMap(results), [results]);

  const refetch = useCallback(() => load("refresh"), [load]);
  const reload = useCallback(() => load("initial"), [load]);
  // Used when the screen regains focus, e.g. after submitting an attempt.
  const refetchSilently = useCallback(() => load("silent"), [load]);

  return {
    assessments,
    latestResults,
    loading,
    refreshing,
    error,
    refetch,
    reload,
    refetchSilently,
  };
}
