import type { AssessmentResult } from "../types";

function timeOf(result: AssessmentResult): number {
  const value = result.submittedAt ? Date.parse(result.submittedAt) : 0;
  return Number.isNaN(value) ? 0 : value;
}

/**
 * Maps assessment id to the student's most recent result for it.
 * A student can have several attempts of the same assessment;
 * "View Result" should always open the latest one.
 */
export function buildLatestResultMap(
  results: AssessmentResult[]
): Map<string, AssessmentResult> {
  const map = new Map<string, AssessmentResult>();

  for (const result of results) {
    if (!result.assessmentId || !result.id) continue;

    const existing = map.get(result.assessmentId);
    if (!existing || timeOf(result) > timeOf(existing)) {
      map.set(result.assessmentId, result);
    }
  }

  return map;
}
