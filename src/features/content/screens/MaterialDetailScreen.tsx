import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, type RouteProp } from "@react-navigation/native";

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