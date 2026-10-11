export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "MIXED";
export type DifficultyFilter = Difficulty | "ALL";

export type QuestionType = "MCQ" | "TRUE_FALSE" | "QUESTION_ANSWERE";
export type AssessmentType = "QUIZ" | "QUESTION-PAPER" | "ASSIGNMENT";

export type AssignmentTab = "NOT_COMPLETED" | "COMPLETED";

export interface NamedRef {
  id: string;
  name: string;
}

/** Item returned by GET /assessments. */
export interface AssessmentSummary {
  id: string;
  title: string;
  instructions: string;
  assessmentType: AssessmentType;
  topic: string[];
  difficulty: Difficulty;
  questionTypes: QuestionType[];
  questionCount: number;
  totalMarks: number;
  status: "PUBLISHED" | "DRAFT";
  createdBy?: NamedRef;
  subject?: NamedRef;
  program?: NamedRef;
  createdAt: string;
  updatedAt: string;
}

/**
 * Question as used during an attempt.
 * correctAnswer and explanation are intentionally not part of this type:
 * the attempt screen must never depend on them.
 */
export interface Question {
  id: string;
  number: number;
  question: string;
  type: QuestionType;
  marks: number;
  difficulty: Difficulty;
  options: string[];
}

/** Response of GET /assessments/:id. */
export interface AssessmentDetail extends AssessmentSummary {
  additionalInstructions: string;
  questions: Question[];
}

export interface ReviewItem {
  questionId: string;
  number: number;
  question: string;
  selectedAnswer?: string;
  correctAnswer: string;
  explanation?: string;
  isCorrect: boolean;
  marks: number;
}

/**
 * Normalized result. List items have an empty `reviews` array;
 * the detail endpoint and the submit response include the full review.
 */
export interface AssessmentResult {
  id: string;
  assessmentId: string;
  title: string;
  assessmentType?: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  reviews: ReviewItem[];
  submittedAt?: string;
}

export interface SubmitAssessmentPayload {
  assessmentId: string;
  /** Map of question id to the selected option (or typed answer). */
  answers: Record<string, string>;
}
