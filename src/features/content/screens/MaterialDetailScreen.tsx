import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, type RouteProp } from "@react-navigation/native";

import api from "@/api/axios";
import type { ApiResponse } from "@/api/types";
import type { StudentStackParamList } from "@/navigation/StudentNavigator";

import {
  type MaterialType,
  type MaterialTabItem,
} from "../constants/material";

import AISummaryTab from "../components/material-detail/AISummaryTab";
import MaterialTabs from "../components/material-detail/MaterialTabs";
import MaterialViewer from "../components/material-detail/MaterialViewer";
import OverviewTab from "../components/material-detail/OverviewTab";
import TranscriptTab from "../components/material-detail/TranscriptionTab";

import MaterialHeader from "../components/material-detail/MaterialHeader";

type MaterialDetailRoute = RouteProp<
  StudentStackParamList,
  "MaterialDetail"
>;

type MaterialTab =
  | "overview"
  | "ai-summary"
  | "ai-tutor"
  | "transcription";

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
  isAiReady?: {
    isTranscriptReady: boolean;
    isSummaryReady: boolean;
    isAskAiReady: boolean;
  };
}

export default function MaterialDetailScreen() {
  const route = useRoute<MaterialDetailRoute>();
  const { materialId } = route.params;

  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<MaterialTab>("overview");

  useEffect(() => {
    let active = true;

    async function fetchMaterial() {
      setLoading(true);
      setError("");
      setMaterial(null);
      setActiveTab("overview");

      try {
        const response = await api.get<ApiResponse<MaterialDetail>>(
          `/materials/${encodeURIComponent(materialId)}`,
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
        if (active) {
          setLoading(false);
        }
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
        <Ionicons name="cloud-offline-outline" size={44} color="#9CA3AF" />
        <Text className="mt-3 text-center font-semibold text-gray-900">
          Couldn't load material
        </Text>
        <Text className="mt-1 text-center text-sm text-gray-500">
          {error || "Material details are unavailable."}
        </Text>
      </View>
    );
  }

  const materialType = material.materialType;
  const aiReady = material.isAiReady;

  const tabs: MaterialTabItem<MaterialTab>[] = [
    { key: "overview", label: "Overview" },
    ...(aiReady?.isSummaryReady
      ? [
          {
            key: "ai-summary" as const,
            label: "Summary",
            a11y: "AI Summary",
          },
        ]
      : []),
    ...(aiReady?.isAskAiReady
      ? [
          {
            key: "ai-tutor" as const,
            label: "Ask AI",
            a11y: "Ask AI Tutor",
          },
        ]
      : []),
    ...(aiReady?.isTranscriptReady
      ? [
          {
            key: "transcription" as const,
            label: "Transcript",
            a11y: "Transcription",
          },
        ]
      : []),
  ];

  const activeTabAvailable = tabs.some((tab) => tab.key === activeTab);

  const displayedTab: MaterialTab = activeTabAvailable
    ? activeTab
    : "overview";

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Material header */}
      <MaterialHeader material={material} />

      {/* Material viewer */}
      <View className="mt-5 px-5">
        <MaterialViewer material={material} />
      </View>

      {/* Material tabs */}
      <View className="mt-5 px-5">
        <MaterialTabs
          tabs={tabs}
          activeTab={displayedTab}
          onChange={setActiveTab}
        />
      </View>

      {/* Selected tab content */}
      <View className="px-5">
        {displayedTab === "overview" && <OverviewTab material={material} />}

        {displayedTab === "ai-summary" && aiReady?.isSummaryReady && (
          <AISummaryTab
            key={`summary-${material.id}`}
            materialId={material.id}
          />
        )}

        {displayedTab === "transcription" && aiReady?.isTranscriptReady && (
          <TranscriptTab
            key={`transcript-${material.id}`}
            materialId={material.id}
          />
        )}

        {displayedTab === "ai-tutor" && aiReady?.isAskAiReady && (
          <View className="rounded-2xl border border-gray-100 bg-white p-5">
            <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
              <Ionicons
                name="chatbubbles-outline"
                size={25}
                color="#4F46E5"
              />
            </View>

            <Text className="text-base font-bold text-gray-900">
              Ask AI Tutor
            </Text>

            <Text className="mt-2 text-sm leading-6 text-gray-600">
              Ask questions about this learning material and get help
              understanding its concepts.
            </Text>

            <Text className="mt-3 text-xs text-gray-400">
              AI Tutor chat will be connected in the next step.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}