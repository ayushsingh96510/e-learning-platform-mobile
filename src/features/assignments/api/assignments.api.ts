import api from "../../../api/axios";
import type { ApiResponse } from "../../../api/types";
import type { AssessmentDetail, AssessmentSummary } from "../types";

const PAGE_SIZE = 50;
const MAX_PAGES = 20;

interface AssessmentsData {
  assessments?: AssessmentSummary[];
  totalAssessments?: number;
}

async function getPublishedPage(page: number) {
  const res = await api.get<ApiResponse<AssessmentsData>>("/assessments", {
    params: { page, limit: PAGE_SIZE, status: "PUBLISHED" },
  });
  const data = res.data.data;
  return {
    assessments: data?.assessments ?? [],
    total: data?.totalAssessments ?? 0,
  };
}

/** Loads every published assessment, page by page. */
export async function getAllPublishedAssessments(): Promise<AssessmentSummary[]> {
  const all: AssessmentSummary[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { assessments, total } = await getPublishedPage(page);
    all.push(...assessments);
    if (assessments.length === 0 || all.length >= total) break;
  }

  return all;
}

export async function getAssessment(id: string): Promise<AssessmentDetail> {
  const res = await api.get<ApiResponse<AssessmentDetail>>(`/assessments/${id}`);
  const data = res.data.data;

  return {
    ...data,
    topic: data.topic ?? [],
    additionalInstructions: data.additionalInstructions ?? "",
    // Keep only the fields needed for an attempt. Answers and explanations
    // are dropped here so they never reach the UI state.
    questions: (data.questions ?? []).map((q) => ({
      id: q.id,
      number: q.number,
      question: q.question,
      type: q.type,
      marks: q.marks,
      difficulty: q.difficulty,
      options: q.options ?? [],
    })),
  };
}
