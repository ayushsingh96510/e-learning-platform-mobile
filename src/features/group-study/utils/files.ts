import * as FileSystem from "expo-file-system/legacy";

/** Largest file that can be shared from the phone. */
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export type PreviewType = "image" | "pdf" | "video" | "audio" | "text" | "none";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getPreviewType(mimeType: string): PreviewType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("text/")) return "text";
  return "none";
}

/** Only plain raster images can be previewed inside the app. */
export function canPreviewInApp(mimeType: string): boolean {
  return getPreviewType(mimeType) === "image" && mimeType !== "image/svg+xml";
}

export function getFileIcon(mimeType: string): string {
  switch (getPreviewType(mimeType)) {
    case "image":
      return "🖼️";
    case "pdf":
      return "📕";
    case "video":
      return "🎞️";
    case "audio":
      return "🎵";
    case "text":
      return "📝";
    default:
      return "📎";
  }
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^A-Za-z0-9._-]/g, "_");
}

/** Saves base64 data into the app cache and returns the file uri. */
export async function writeBase64ToCache(
  id: string,
  fileName: string,
  base64: string
): Promise<string> {
  const directory = `${FileSystem.cacheDirectory ?? ""}group-study/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true }).catch(
    () => undefined
  );

  const uri = `${directory}${id}-${sanitizeFileName(fileName)}`;
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return uri;
}
