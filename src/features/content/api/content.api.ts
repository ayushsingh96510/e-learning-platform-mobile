import api from "../../../api/axios";
import type { ApiResponse } from "../../../api/types";
import type {
  MaterialDetail,
  MaterialSummary,
  MaterialTranscript,
} from "../types/content.types";

export type MaterialStatus = "DRAFT" | "PUBLISHED" | "DELETED";
export type MaterialType = "VIDEO" | "PDF" | "DOCUMENT" | "IMAGE" | "AUDIO";

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

interface MaterialsData {
  materials?: Material[];
  pagination?: MaterialsPagination;
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

export async function getMaterials(
  filters: MaterialFilters = { status: "PUBLISHED" },
): Promise<MaterialsResult> {
  const response = await api.get<ApiResponse<MaterialsData>>(
    "/materials",
    {
      params: {
        ...filters,
        status: "PUBLISHED",
      },
    },
  );

  const data = response.data.data;

  return {
    materials: data?.materials ?? [],
    pagination: data?.pagination,
  };
}



export async function getMaterial(
  materialId: string,
): Promise<MaterialDetail> {
  const response = await api.get<ApiResponse<MaterialDetail>>(
    `/materials/${encodeURIComponent(materialId)}`,
  );

  return response.data.data;
}

export async function getMaterialSummary(
  materialId: string,
): Promise<MaterialSummary> {
  const response = await api.get<ApiResponse<MaterialSummary>>(
    `/materials/${encodeURIComponent(materialId)}/summary`,
  );

  return response.data.data;
}

export async function getMaterialTranscript(
  materialId: string,
): Promise<MaterialTranscript> {
  const response = await api.get<ApiResponse<MaterialTranscript>>(
    `/materials/${encodeURIComponent(materialId)}/transcript`,
  );

  return response.data.data;
}
