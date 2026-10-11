import api from "../../../api/axios";
import type { ApiResponse } from "../../../api/types";
import type {
  AssessmentResult,
  ReviewItem,
  SubmitAssessmentPayload,
} from "../types";

const PAGE_SIZE = 50;
const MAX_PAGES = 20;

interface RawAssessmentRef {
  _id?: string;
  id?: string;
  title?: string;
  assessmentType?: string;
  totalMarks?: number;
}

/**
 * The backend returns slightly different shapes:
 * - list items: `assessment: { id, title, assessmentType }`
 * - detail:     `assessmentId: { _id, title, assessmentType, totalMarks }`
 * - submit:     either of the above, or a plain string id
 */
interface RawResult {
  id?: string;
  _id?: string;
  assessmentId?: string | RawAssessmentRef;
  assessment?: RawAssessmentRef;
  title?: string;
  obtainedMarks?: number;
  totalMarks?: number;
  percentage?: number;
  correctCount?: number;
  wrongCount?: number;
  skippedCount?: number;
  reviews?: ReviewItem[];
  submittedAt?: string;
  createdAt?: string;
}

function normalizeResult(raw: RawResult): AssessmentResult {
  const ref: RawAssessmentRef | undefined =
    typeof raw.assessmentId === "object" && raw.assessmentId !== null
      ? raw.assessmentId
      : raw.assessment;

  const assessmentId =
    typeof raw.assessmentId === "string"
      ? raw.assessmentId
      : ref?._id ?? ref?.id ?? "";

  const obtainedMarks = raw.obtainedMarks ?? 0;
  const totalMarks = raw.totalMarks ?? ref?.totalMarks ?? 0;

  return {
    id: raw.id ?? raw._id ?? "",
    assessmentId,
    title: ref?.title ?? raw.title ?? "",
    assessmentType: ref?.assessmentType,
    obtainedMarks,
    totalMarks,
    percentage:
      raw.percentage ??
      (totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0),
    correctCount: raw.correctCount ?? 0,
    wrongCount: raw.wrongCount ?? 0,
    skippedCount: raw.skippedCount ?? 0,
    reviews: raw.reviews ?? [],
    submittedAt: raw.submittedAt ?? raw.createdAt,
  };
}

interface ResultsData {
  results?: RawResult[];
  totalResults?: number;
}

async function getResultsPage(page: number) {
  const res = await api.get<ApiResponse<ResultsData>>("/assessment-results", {
    params: { page, limit: PAGE_SIZE },
  });
  const data = res.data.data;
  return {
    results: (data?.results ?? []).map(normalizeResult),
    total: data?.totalResults ?? 0,
  };
}

/** Loads every result of the current student, page by page. */
export async function getAllResults(): Promise<AssessmentResult[]> {
  const all: AssessmentResult[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { results, total } = await getResultsPage(page);
    all.push(...results);
    if (results.length === 0 || all.length >= total) break;
  }

  return all;
}

export async function getResultById(id: string): Promise<AssessmentResult> {
  const res = await api.get<ApiResponse<RawResult>>(`/assessment-results/${id}`);
  return normalizeResult(res.data.data);
}

export async function submitAssessment(
  payload: SubmitAssessmentPayload
): Promise<AssessmentResult> {
  const res = await api.post<ApiResponse<RawResult>>(
    "/assessment-results/submit",
    payload
  );
  return normalizeResult(res.data.data);
}
