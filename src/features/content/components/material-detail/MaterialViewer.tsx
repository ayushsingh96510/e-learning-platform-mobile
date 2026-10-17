import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { WebView } from "react-native-webview";

import { type MaterialType } from "../../constants/material";

interface ViewerMaterial {
  title: string;
  materialType: MaterialType;
  objectKey: string;
  file: {
    originalFileName: string;
    mimeType: string;
    size: number;
  };
}

interface MaterialViewerProps {
  material: ViewerMaterial;
}

function VideoMaterialPlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri);

  return (
    <View className="overflow-hidden rounded-xl bg-black">
      <VideoView
        player={player}
        style={{ width: "100%", height: 230 }}
        contentFit="contain"
        nativeControls
      />
    </View>
  );
}

function AudioMaterialPlayer({ uri }: { uri: string }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  return (
    <View className="rounded-xl bg-blue-50 p-5">
      <View className="mb-4 flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Ionicons name="musical-notes" size={25} color="#2563EB" />
        </View>

        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-900">
            Audio material
          </Text>
          <Text className="mt-1 text-xs text-gray-500">
            Listen to the uploaded audio
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          if (status.playing) {
            player.pause();
          } else {
            player.play();
          }
        }}
        accessibilityRole="button"
        accessibilityLabel={
          status.playing ? "Pause audio" : "Play audio"
        }
        className="flex-row items-center justify-center rounded-xl bg-blue-600 px-4 py-3"
      >
        <Ionicons
          name={status.playing ? "pause" : "play"}
          size={20}
          color="#FFFFFF"
        />
        <Text className="ml-2 font-semibold text-white">
          {status.playing ? "Pause Audio" : "Play Audio"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function ViewerMessage({ message }: { message: string }) {
  return (
    <View className="items-center rounded-xl border border-gray-200 bg-white p-6">
      <Ionicons name="document-outline" size={32} color="#6B7280" />
      <Text className="mt-3 text-center text-sm text-gray-600">
        {message}
      </Text>
    </View>
  );
}

export default function MaterialViewer({ material }: MaterialViewerProps) {
  const uri = material.objectKey;
  const mimeType = material.file?.mimeType?.toLowerCase() ?? "";
  const fileName = material.file?.originalFileName?.toLowerCase() ?? "";

  const rawType = String(material.materialType ?? "").toUpperCase();

  let type: MaterialType | undefined;

  if (["VIDEO", "AUDIO", "IMAGE", "PDF", "DOCUMENT"].includes(rawType)) {
    type = rawType as MaterialType;
  } else if (
    mimeType.startsWith("video/") ||
    /\.(mp4|mov|webm|m4v|mkv)$/.test(fileName)
  ) {
    type = "VIDEO";
  } else if (
    mimeType.startsWith("audio/") ||
    /\.(mp3|wav|m4a|aac|ogg)$/.test(fileName)
  ) {
    type = "AUDIO";
  } else if (
    mimeType.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/.test(fileName)
  ) {
    type = "IMAGE";
  } else if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
    type = "PDF";
  } else if (
    mimeType.startsWith("text/") ||
    /\.(doc|docx|xls|xlsx|ppt|pptx|txt|rtf|csv)$/.test(fileName)
  ) {
    type = "DOCUMENT";
  }

  if (!uri || !/^https?:\/\//i.test(uri)) {
    return (
      <ViewerMessage message="The material URL is invalid or unavailable." />
    );
  }

  switch (type) {
    case "VIDEO":
      return <VideoMaterialPlayer uri={uri} />;

    case "AUDIO":
      return <AudioMaterialPlayer uri={uri} />;

    case "IMAGE":
      return (
        <View className="overflow-hidden rounded-xl bg-gray-100 p-2">
          <Image
            source={{ uri }}
            contentFit="contain"
            style={{ width: "100%", height: 280 }}
            accessibilityLabel={material.title}
          />
        </View>
      );

    case "PDF":
      return (
        <View
          className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          style={{ height: 520 }}
        >
          <WebView
            source={{
              uri: `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(
                uri,
              )}`,
            }}
            style={{ flex: 1 }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="mt-2 text-sm text-gray-500">
                  Loading PDF...
                </Text>
              </View>
            )}
          />
        </View>
      );

    case "DOCUMENT":
      return (
        <ViewerMessage message="The embedded document viewer will be added in the next step." />
      );

    default:
      return (
        <ViewerMessage message="We couldn't identify this material's file format." />
      );
  }
}