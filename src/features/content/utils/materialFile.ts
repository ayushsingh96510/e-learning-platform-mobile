import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

export interface MaterialFileInfo {
  id: string;
  title: string;
  objectKey: string;
  file?: {
    originalFileName?: string;
    mimeType?: string;
  };
}

function sanitizeFileName(name: string): string {
  return (
    name
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
      .trim() || "learning-material"
  );
}

export function getMaterialFileName(material: MaterialFileInfo): string {
  const originalName = material.file?.originalFileName?.trim();

  if (originalName) {
    return sanitizeFileName(originalName);
  }

  const title = sanitizeFileName(material.title);
  const mime = material.file?.mimeType?.toLowerCase();

  const extensionByMime: Record<string, string> = {
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "video/mp4": ".mp4",
    "audio/mpeg": ".mp3",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
  };

  return `${title}${extensionByMime[mime ?? ""] ?? ""}`;
}

export async function ensureMaterialDownloaded(
  material: MaterialFileInfo,
): Promise<string> {
  if (!material.objectKey || !/^https?:\/\//i.test(material.objectKey)) {
    throw new Error("The material does not have a valid download URL.");
  }

  const directory = FileSystem.documentDirectory;

  if (!directory) {
    throw new Error("Device document storage is unavailable.");
  }

  const folder = `${directory}materials/`;
  await FileSystem.makeDirectoryAsync(folder, {
    intermediates: true,
  }).catch(() => undefined);

  const fileName = `${sanitizeFileName(material.id)}-${getMaterialFileName(material)}`;
  const destination = `${folder}${fileName}`;

  const existing = await FileSystem.getInfoAsync(destination);

  if (existing.exists) {
    return destination;
  }

  const result = await FileSystem.downloadAsync(
    material.objectKey,
    destination,
  );

  if (result.status < 200 || result.status >= 300) {
    await FileSystem.deleteAsync(result.uri, { idempotent: true }).catch(
      () => undefined,
    );
    throw new Error(`Download failed with status ${result.status}.`);
  }

  return result.uri;
}


/**
 * Copies a downloaded material into a user-selected public folder.
 * On Android, select the Downloads folder in the system picker.
 */
export async function saveMaterialToPublicDownloads(
  material: MaterialFileInfo,
): Promise<"saved" | "cancelled" | "unsupported"> {
  if (Platform.OS !== "android") {
    return "unsupported";
  }

  const sourceUri = await ensureMaterialDownloaded(material);
  const SAF = FileSystem.StorageAccessFramework;

  const permission = await SAF.requestDirectoryPermissionsAsync();

  if (!permission.granted || !permission.directoryUri) {
    return "cancelled";
  }

  const fileName = getMaterialFileName(material);
  const mimeType = material.file?.mimeType || "application/octet-stream";

  const destinationUri = await SAF.createFileAsync(
    permission.directoryUri,
    fileName,
    mimeType,
  );

  // Read the downloaded file as Base64, then write it to the
  // folder selected by the user through Android's Storage Access Framework.
  const base64 = await FileSystem.readAsStringAsync(sourceUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await FileSystem.writeAsStringAsync(destinationUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return "saved";
}

