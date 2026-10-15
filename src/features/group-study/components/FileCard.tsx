import { Alert, Image, Pressable, Text, View } from "react-native";
import * as Sharing from "expo-sharing";

import type { SharedFile } from "../types";
import { canPreviewInApp, formatFileSize, getFileIcon } from "../utils/files";

interface Props {
  file: SharedFile;
  isMine: boolean;
  onPreview: (file: SharedFile) => void;
}

export default function FileCard({ file, isMine, onPreview }: Props) {
  const previewable = canPreviewInApp(file.mimeType);

  // Opens the system share sheet, from where the file can be opened or saved.
  const handleOpen = async () => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Not available", "Sharing is not available on this device.");
        return;
      }
      await Sharing.shareAsync(file.uri, {
        mimeType: file.mimeType,
        dialogTitle: file.fileName,
      });
    } catch {
      Alert.alert("Could not open the file", "Please try again.");
    }
  };

  return (
    <View className="mb-3 flex-row rounded-xl border border-gray-100 bg-white p-3">
      {previewable ? (
        <Image
          source={{ uri: file.uri }}
          className="h-16 w-16 rounded-lg border border-gray-100"
          resizeMode="cover"
        />
      ) : (
        <View className="h-16 w-16 items-center justify-center rounded-lg bg-primary-50">
          <Text className="text-3xl">{getFileIcon(file.mimeType)}</Text>
        </View>
      )}

      <View className="ml-3 flex-1">
        <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
          {file.fileName}
        </Text>
        <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
          Shared by {isMine ? "you" : file.senderName}
        </Text>
        <Text className="mt-0.5 text-xs text-gray-400">
          {formatFileSize(file.size)}
        </Text>

        <View className="mt-2 flex-row gap-2">
          {previewable && (
            <Pressable
              onPress={() => onPreview(file)}
              className="rounded-lg border border-gray-200 px-3 py-1.5"
            >
              <Text className="text-xs font-semibold text-gray-700">Preview</Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleOpen}
            className="rounded-lg bg-primary-600 px-3 py-1.5"
          >
            <Text className="text-xs font-semibold text-white">Open / Save</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
