import type { AssessmentType, QuestionType } from "../types";

const ASSESSMENT_TYPE_LABEL: Record<AssessmentType, string> = {
  QUIZ: "Quiz",
  "QUESTION-PAPER": "Question Paper",
  ASSIGNMENT: "Assignment",
};

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  MCQ: "MCQ",
  TRUE_FALSE: "True / False",
  QUESTION_ANSWERE: "Written",
};

export function assessmentTypeLabel(type: string): string {
  return ASSESSMENT_TYPE_LABEL[type as AssessmentType] ?? type;
}

export function questionTypeLabel(type: string): string {
  return QUESTION_TYPE_LABEL[type as QuestionType] ?? type;
}
