import api from "../../../api/axios";
import type { ApiResponse } from "../../../api/types";

import type {
  Material,
  MaterialDetail,
  MaterialFilters,
  MaterialsPagination,
  MaterialsResult,
  MaterialSummary,
  MaterialTranscript,
} from "../types/content.types";

interface MaterialsData {
  materials?: Material[];
  pagination?: MaterialsPagination;
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
