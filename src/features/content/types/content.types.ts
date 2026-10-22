export type MaterialType =
  | "VIDEO"
  | "PDF"
  | "DOCUMENT"
  | "IMAGE"
  | "AUDIO";

export type MaterialStatus = "DRAFT" | "PUBLISHED" | "DELETED";

export type SummaryStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface MaterialAiReady {
  isTranscriptReady: boolean;
  isSummaryReady: boolean;
  isAskAiReady: boolean;
}

export interface MaterialDetail {
  id: string;
  title: string;
  description: string | null;
  materialType?: MaterialType;
  objectKey: string;
  file: {
    originalFileName: string;
    mimeType: string;
    size: number;
  };
  status: MaterialStatus;
  createdAt: string;
  updatedAt?: string;
  subject: {
    id: string;
    name: string;
  } | null;
  createdBy: {
    id: string;
    name: string;
    profileImage?: string;
  };
  isAiReady: MaterialAiReady;
}

export interface Material {
  id: string;
  title: string;
  description: string | null;
  materialType: MaterialType;
  objectKey: string;
  file: {
    originalFileName: string;
    mimeType: string;
    size: number;
  };
  status: MaterialStatus;
  createdAt: string;
  updatedAt: string;
  subject:
    | string
    | {
        id: string;
        name: string;
      }
    | null;
  createdBy: {
    id: string;
    name: string;
  };
  metadata?: {
    durationMs?: number;
  };
}

export interface MaterialsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MaterialsResult {
  materials: Material[];
  pagination?: MaterialsPagination;
}

export interface MaterialFilters {
  status?: MaterialStatus;
  programId?: string;
  subjectId?: string;
  type?: MaterialType;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface MaterialTranscript {
  id: string;
  language: string;
  segments: TranscriptSegment[];
}

export interface MaterialSummary {
  id: string;
  status: SummaryStatus;
  summary: string;
  keyTopics: string[];
  keyTakeaways: string[];
  generatedAt: string;
}

export interface AskTutorRequest {
  mode: "LECTURE";
  message: string;
  materialId: string;
}

export type NotesSection = "TRANSCRIPT" | "SUMMARY" | "KEY_POINTS";

export type NotesFormat = "PDF" | "DOCX" | "TXT";

export interface ExportNotesPayload {
  sections: NotesSection[];
  format: NotesFormat;
}