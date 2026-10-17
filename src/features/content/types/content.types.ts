
export type MaterialType =
  | "VIDEO"
  | "PDF"
  | "DOCUMENT"
  | "IMAGE"
  | "AUDIO";

export type MaterialStatus = "DRAFT" | "PUBLISHED" | "DELETED";

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

export type SummaryStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface MaterialSummary {
  id: string;
  status: SummaryStatus;
  summary: string;
  keyTopics: string[];
  keyTakeaways: string[];
  generatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors: string[];
}

export interface AskTutorRequest {
  mode: "LECTURE";
  message: string;
  materialId: string;
}



export interface MaterialAiReady {
  isTranscriptReady: boolean;
  isSummaryReady: boolean;
  isAskAiReady: boolean;
}

export interface MaterialDetail {
  id: string;
  title: string;
  description: string | null;
  materialType?: "VIDEO" | "PDF" | "DOCUMENT" | "IMAGE" | "AUDIO";
  objectKey: string;
  file: {
    originalFileName: string;
    mimeType: string;
    size: number;
  };
  status: "DRAFT" | "PUBLISHED" | "DELETED";
  createdAt: string;
  updatedAt?: string;
  subject: { id: string; name: string } | null;
  createdBy: {
    id: string;
    name: string;
    profileImage?: string;
  };
  isAiReady: MaterialAiReady;
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
