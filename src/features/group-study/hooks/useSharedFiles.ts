import { useCallback, useEffect, useRef, useState } from "react";
import { useRoomContext } from "@livekit/react-native";
import { ConnectionState, RoomEvent } from "livekit-client";
import type { Room } from "livekit-client";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

import type { SharedFile, SharedFileMeta } from "../types";
import { formatFileSize, MAX_FILE_BYTES, writeBase64ToCache } from "../utils/files";
import { createId } from "../utils/participants";

// Same values as the web app, so both sides can read each other's chunks.
const CHUNK_SIZE = 12000;
const CHUNK_DELAY_MS = 20;

interface IncomingFile {
  meta: SharedFileMeta;
  chunks: (string | undefined)[];
  received: number;
}

/** Sends the data URL in paced chunks, waiting for each one to be published. */
function sendChunks(
  room: Room,
  meta: SharedFileMeta,
  dataUrl: string,
  onProgress: (progress: number) => void
): Promise<void> {
  const total = Math.ceil(dataUrl.length / CHUNK_SIZE);

  return new Promise((resolve, reject) => {
    let index = 0;

    const next = async () => {
      if (room.state !== ConnectionState.Connected) {
        reject(new Error("disconnected"));
        return;
      }

      try {
        await room.localParticipant.publishData(
          new TextEncoder().encode(
            JSON.stringify({
              type: "shared-file-chunk",
              fileId: meta.id,
              meta,
              chunkIndex: index,
              totalChunks: total,
              data: dataUrl.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
            })
          ),
          { reliable: true }
        );
      } catch (e) {
        reject(e);
        return;
      }

      index += 1;
      onProgress(index / total);

      if (index < total) setTimeout(next, CHUNK_DELAY_MS);
      else resolve();
    };

    next();
  });
}

/**
 * Files shared in the room, over the LiveKit data channel and compatible
 * with the web app. Received files are saved to the device cache so the
 * large base64 string does not stay in memory.
 */
export function useSharedFiles() {
  const room = useRoomContext();
  const [files, setFiles] = useState<SharedFile[]>([]);
  // 0..1 while a file is being sent, otherwise null.
  const [sendProgress, setSendProgress] = useState<number | null>(null);
  const incoming = useRef<Record<string, IncomingFile>>({});
  const sending = useRef(false);

  useEffect(() => {
    const handleData = (payload: Uint8Array) => {
      let msg: any;
      try {
        msg = JSON.parse(new TextDecoder().decode(payload));
      } catch {
        return;
      }

      if (msg?.type !== "shared-file-chunk") return;

      const { fileId, chunkIndex, totalChunks, data, meta } = msg;
      if (
        typeof fileId !== "string" ||
        typeof data !== "string" ||
        !meta ||
        !Number.isInteger(totalChunks) ||
        totalChunks <= 0 ||
        !Number.isInteger(chunkIndex) ||
        chunkIndex < 0 ||
        chunkIndex >= totalChunks
      ) {
        return;
      }

      let entry = incoming.current[fileId];
      if (!entry) {
        entry = {
          meta,
          chunks: new Array(totalChunks).fill(undefined),
          received: 0,
        };
        incoming.current[fileId] = entry;
      }

      if (entry.chunks[chunkIndex] === undefined) {
        entry.chunks[chunkIndex] = data;
        entry.received += 1;
      }

      if (entry.received < entry.chunks.length) return;

      delete incoming.current[fileId];

      const dataUrl = entry.chunks.join("");
      const comma = dataUrl.indexOf(",");
      if (comma < 0) return;

      writeBase64ToCache(entry.meta.id, entry.meta.fileName, dataUrl.slice(comma + 1))
        .then((uri) => {
          const file: SharedFile = { ...entry.meta, uri };
          setFiles((prev) =>
            prev.some((f) => f.id === file.id) ? prev : [...prev, file]
          );
        })
        .catch(() => {
          // The file could not be saved; skip it.
        });
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
      incoming.current = {};
    };
  }, [room]);

  /** Opens the picker and shares the chosen file. Resolves to an error message or null. */
  const pickAndSend = useCallback(async (): Promise<string | null> => {
    if (sending.current) return "Another file is still being shared.";

    let result: DocumentPicker.DocumentPickerResult;
    try {
      result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
      });
    } catch {
      return "Could not open the file picker.";
    }

    if (result.canceled || !result.assets?.[0]) return null;

    const asset = result.assets[0];
    const tooLarge = `Files larger than ${formatFileSize(MAX_FILE_BYTES)} cannot be shared.`;
    if (asset.size !== undefined && asset.size > MAX_FILE_BYTES) return tooLarge;

    sending.current = true;
    setSendProgress(0);

    try {
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const size = asset.size ?? Math.floor((base64.length * 3) / 4);
      if (size > MAX_FILE_BYTES) return tooLarge;

      const mimeType = asset.mimeType || "application/octet-stream";
      const meta: SharedFileMeta = {
        id: createId(),
        senderId: room.localParticipant.identity,
        senderName: room.localParticipant.name || room.localParticipant.identity,
        fileName: asset.name,
        mimeType,
        size,
      };

      await sendChunks(room, meta, `data:${mimeType};base64,${base64}`, setSendProgress);

      // Show it in our own list once everyone else has received it.
      setFiles((prev) => [...prev, { ...meta, uri: asset.uri }]);
      return null;
    } catch {
      return "Failed to share the file. Please check your connection and try again.";
    } finally {
      sending.current = false;
      setSendProgress(null);
    }
  }, [room]);

  return { files, sendProgress, pickAndSend };
}
