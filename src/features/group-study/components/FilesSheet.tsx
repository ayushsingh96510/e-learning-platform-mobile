import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useState } from "react";
import { useRoomContext } from "@livekit/react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FileCard from "./FileCard";
import type { SharedFile } from "../types";
import { formatFileSize, MAX_FILE_BYTES } from "../utils/files";

interface Props {
  visible: boolean;
  files: SharedFile[];
  /** 0..1 while a file is being sent, otherwise null. */
  sendProgress: number | null;
  onUpload: () => void;
  onClose: () => void;
}

export default function FilesSheet({
  visible,
  files,
  sendProgress,
  onUpload,
  onClose,
}: Props) {
  const room = useRoomContext();
  const insets = useSafeAreaInsets();
  const [preview, setPreview] = useState<SharedFile | null>(null);

  const localIdentity = room.localParticipant.identity;
  const sending = sendProgress !== null;

  const handleClose = () => {
    setPreview(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View
          className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 pb-3"
          style={{ paddingTop: insets.top + 12 }}
        >
          <Text className="text-lg font-bold text-gray-900">Shared Files</Text>

          <Pressable
            onPress={handleClose}
            hitSlop={12}
            className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
          >
            <Text className="text-base text-gray-700">✕</Text>
          </Pressable>
        </View>

        {/* Upload */}
        <View className="border-b border-gray-100 bg-white p-4">
          <Pressable
            onPress={onUpload}
            disabled={sending}
            className={`items-center rounded-xl border-2 border-dashed py-5 ${
              sending ? "border-gray-200" : "border-gray-300"
            }`}
          >
            <Text className="text-2xl">📤</Text>
            <Text className="mt-1 text-sm font-semibold text-gray-900">
              {sending ? "Sharing..." : "Tap to choose a file"}
            </Text>
            <Text className="mt-0.5 text-xs text-gray-500">
              Shared with everyone in the room (up to{" "}
              {formatFileSize(MAX_FILE_BYTES)})
            </Text>
          </Pressable>

          {sending && (
            <View className="mt-3">
              <View className="h-2 rounded-full bg-gray-200">
                <View
                  className="h-2 rounded-full bg-primary-600"
                  style={{ width: `${Math.round((sendProgress ?? 0) * 100)}%` }}
                />
              </View>
              <Text className="mt-1 text-right text-xs text-gray-500">
                {Math.round((sendProgress ?? 0) * 100)}%
              </Text>
            </View>
          )}
        </View>

        {/* List */}
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-4"
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        >
          {files.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-sm text-gray-500">No shared files</Text>
              <Text className="mt-1 text-xs text-gray-400">
                Files shared in this room will show up here
              </Text>
            </View>
          ) : (
            files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                isMine={file.senderId === localIdentity}
                onPreview={setPreview}
              />
            ))
          )}
        </ScrollView>

        {/* Image preview */}
        {preview && (
          <View className="absolute inset-0 bg-black">
            <Image
              source={{ uri: preview.uri }}
              className="flex-1"
              resizeMode="contain"
            />

            <View
              className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-4"
              style={{ paddingTop: insets.top + 12 }}
            >
              <Text className="mr-3 flex-1 text-sm font-semibold text-white" numberOfLines={1}>
                {preview.fileName}
              </Text>

              <Pressable
                onPress={() => setPreview(null)}
                hitSlop={12}
                className="h-9 w-9 items-center justify-center rounded-full bg-white/20"
              >
                <Text className="text-base text-white">✕</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
