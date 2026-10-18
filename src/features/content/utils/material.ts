
import type { MaterialType } from "../constants/material";

interface MaterialTypeSource {
  materialType?: MaterialType | null;
  file?: {
    mimeType?: string | null;
  } | null;
}

export function resolveMaterialType(
  material: MaterialTypeSource,
): MaterialType {
  if (material.materialType) {
    return material.materialType;
  }

  const mimeType = material.file?.mimeType?.toLowerCase();

  if (mimeType?.startsWith("video/")) return "VIDEO";
  if (mimeType?.startsWith("audio/")) return "AUDIO";
  if (mimeType?.startsWith("image/")) return "IMAGE";
  if (mimeType === "application/pdf") return "PDF";

  return "DOCUMENT";
}
