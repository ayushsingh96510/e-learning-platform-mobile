import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, type RouteProp } from "@react-navigation/native";

import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { WebView } from "react-native-webview";

import api from "@/api/axios";
import type { ApiResponse } from "@/api/types";
import type { StudentStackParamList } from "@/navigation/StudentNavigator";

type MaterialDetailRoute = RouteProp<
  StudentStackParamList,
  "MaterialDetail"
>;

type MaterialType = "VIDEO" | "PDF" | "DOCUMENT" | "IMAGE" | "AUDIO";

interface MaterialDetail {
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
  status: "DRAFT" | "PUBLISHED" | "DELETED";
  createdAt: string;
  subject: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
}

const TYPE_LABELS: Record<MaterialType, string> = {
  VIDEO: "Recorded Class",
  PDF: "PDF Document",
  DOCUMENT: "Document",
  IMAGE: "Image",
  AUDIO: "Audio",
};

const TYPE_ICONS: Record<
  MaterialType,
  keyof typeof Ionicons.glyphMap
> = {
  VIDEO: "videocam-outline",
  PDF: "document-text-outline",
  DOCUMENT: "book-outline",
  IMAGE: "image-outline",
  AUDIO: "musical-notes-outline",
};

function formatSize(bytes: number): string {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  return `${(bytes / 1024 ** index).toFixed(
    index === 0 ? 0 : 1,
  )} ${units[index]}`;
}

function formatDate(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "--";

  return parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
        // allowsFullscreen
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
          <Ionicons
            name="musical-notes"
            size={25}
            color="#2563EB"
          />
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


function MaterialViewer({
  material,
}: {
  material: MaterialDetail;
}) {
  const uri = material.objectKey;
  const mimeType = material.file?.mimeType?.toLowerCase() ?? "";
  const fileName =
    material.file?.originalFileName?.toLowerCase() ?? "";

  // Prefer the API material type, then fall back to MIME type/file extension.
  const rawType = String(material.materialType ?? "").toUpperCase();

  let type: MaterialType | undefined;

  if (["VIDEO", "AUDIO", "IMAGE", "PDF", "DOCUMENT"].includes(rawType)) {
    type = rawType as MaterialType;
  } else if (mimeType.startsWith("video/") || /\.(mp4|mov|webm|m4v|mkv)$/.test(fileName)) {
    type = "VIDEO";
  } else if (mimeType.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg)$/.test(fileName)) {
    type = "AUDIO";
  } else if (mimeType.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/.test(fileName)) {
    type = "IMAGE";
  } else if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
    type = "PDF";
  } else if (
    mimeType.startsWith("text/") ||
    /\.(doc|docx|xls|xlsx|ppt|pptx|txt|rtf|csv)$/.test(fileName)
  ) {
    type = "DOCUMENT";
  }

  console.log("Material viewer resolved type:", {
    apiType: material.materialType,
    mimeType,
    fileName,
    resolvedType: type,
  });

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
              uri: `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(uri)}`,
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


function ViewerMessage({ message }: { message: string }) {
  return (
    <View className="items-center rounded-xl border border-gray-200 bg-white p-6">
      <Ionicons
        name="document-outline"
        size={32}
        color="#6B7280"
      />
      <Text className="mt-3 text-center text-sm text-gray-600">
        {message}
      </Text>
    </View>
  );
}

export default function MaterialDetailScreen() {
  const route = useRoute<MaterialDetailRoute>();
  const { materialId } = route.params;

  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchMaterial() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get<ApiResponse<MaterialDetail>>(
          `/materials/${materialId}`,
        );

        if (active) {
          setMaterial(response.data.data);
        }
      } catch (err: unknown) {
        if (!active) return;

        const message =
          typeof err === "object" && err !== null && "response" in err
            ? (
                err as {
                  response?: { data?: { message?: string } };
                }
              ).response?.data?.message
            : undefined;

        setError(message || "Unable to load material details.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchMaterial();

    return () => {
      active = false;
    };
  }, [materialId]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-3 text-sm text-gray-500">
          Loading material details...
        </Text>
      </View>
    );
  }

  if (error || !material) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-8">
        <Ionicons
          name="cloud-offline-outline"
          size={44}
          color="#9CA3AF"
        />
        <Text className="mt-3 text-center font-semibold text-gray-900">
          Couldn’t load material
        </Text>
        <Text className="mt-1 text-center text-sm text-gray-500">
          {error || "Material details are unavailable."}
        </Text>
      </View>
    );
  }

  const materialType = material.materialType;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: 28 }}
    >
      <View className="border-b border-gray-100 bg-white px-5 pb-5 pt-6">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
          <Ionicons
            name={TYPE_ICONS[materialType] ?? "document-outline"}
            size={32}
            color="#2563EB"
          />
        </View>

        <Text className="text-2xl font-bold text-gray-900">
          {material.title}
        </Text>

        <View className="mt-3 self-start rounded-lg bg-blue-50 px-3 py-1.5">
          <Text className="text-xs font-semibold text-blue-700">
            {TYPE_LABELS[materialType] ?? materialType}
          </Text>
        </View>
      </View>

      <View className="mt-5">
  <MaterialViewer material={material} />
</View>

      <View className="px-5 pt-5">
        <View className="rounded-2xl border border-gray-100 bg-white p-4">
          <Text className="text-base font-bold text-gray-900">
            Description
          </Text>

          <Text className="mt-3 text-sm leading-6 text-gray-600">
            {material.description?.trim() ||
              "No description provided."}
          </Text>
        </View>

        <View className="mt-4 rounded-2xl border border-gray-100 bg-white p-4">
          <Text className="mb-4 text-base font-bold text-gray-900">
            Content Information
          </Text>

          <InfoRow
            icon="book-outline"
            label="Subject"
            value={material.subject?.name || "--"}
          />

          <InfoRow
            icon="person-outline"
            label="Uploaded by"
            value={material.createdBy?.name || "Instructor"}
          />

          <InfoRow
            icon="document-outline"
            label="File name"
            value={material.file?.originalFileName || "--"}
          />

          <InfoRow
            icon="cloud-download-outline"
            label="File size"
            value={formatSize(material.file?.size ?? 0)}
          />

          <InfoRow
            icon="calendar-outline"
            label="Uploaded"
            value={formatDate(material.createdAt)}
          />

          <InfoRow
            icon="layers-outline"
            label="Content type"
            value={TYPE_LABELS[materialType] ?? materialType}
            last
          />
        </View>
      </View>
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-start py-3 ${
        last ? "" : "border-b border-gray-100"
      }`}
    >
      <Ionicons
        name={icon}
        size={19}
        color="#6B7280"
        style={{ marginTop: 2 }}
      />

      <View className="ml-3 flex-1">
        <Text className="text-xs text-gray-500">{label}</Text>
        <Text className="mt-1 text-sm font-medium text-gray-900">
          {value}
        </Text>
      </View>
    </View>
  );
}