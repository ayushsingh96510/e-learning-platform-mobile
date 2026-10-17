import { Ionicons } from "@expo/vector-icons";

export type MaterialType = "VIDEO" | "PDF" | "DOCUMENT" | "IMAGE" | "AUDIO";

export const TYPE_LABELS: Record<MaterialType, string> = {
  VIDEO: "Recorded Class",
  PDF: "PDF Document",
  DOCUMENT: "Document",
  IMAGE: "Image",
  AUDIO: "Audio",
};

export const TYPE_ICONS: Record<MaterialType, keyof typeof Ionicons.glyphMap> = {
  VIDEO: "videocam-outline",
  PDF: "document-text-outline",
  DOCUMENT: "book-outline",
  IMAGE: "image-outline",
  AUDIO: "musical-notes-outline",
};

export interface MaterialTabItem<T extends string> {
  key: T;
  label: string;
  a11y?: string;
}
