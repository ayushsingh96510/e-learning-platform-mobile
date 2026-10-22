import {  Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { resolveMaterialType } from "../../utils/material";
import LectureNotesModal from "./LectureNotesModal";

import {
  TYPE_LABELS,
  type MaterialType,
} from "../../constants/material";

interface HeaderMaterial {
  id: string;
  title: string;
  materialType?: MaterialType;
  file?: {
    mimeType?: string;
  };
  subject: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
  isAiReady?: {
    isTranscriptReady: boolean;
    isSummaryReady: boolean;
    isAskAiReady: boolean;
  };
}

interface MaterialHeaderProps {
  material: HeaderMaterial;
}

/** Tailwind class bundles per material type — keeps the header visually distinct. */
const TYPE_THEMES: Record<
  MaterialType,
  {
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  VIDEO: {
    iconBg: "bg-blue-100",
    iconColor: "#2563EB",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
  },
  AUDIO: {
    iconBg: "bg-amber-100",
    iconColor: "#D97706",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
  },
  PDF: {
    iconBg: "bg-red-100",
    iconColor: "#DC2626",
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
  },
  IMAGE: {
    iconBg: "bg-emerald-100",
    iconColor: "#059669",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
  },
  DOCUMENT: {
    iconBg: "bg-slate-200",
    iconColor: "#475569",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
  },
};

function getAiReadyCount(aiReady: HeaderMaterial["isAiReady"]): number {
  if (!aiReady) return 0;
  return [
    aiReady.isSummaryReady,
    aiReady.isAskAiReady,
    aiReady.isTranscriptReady,
  ].filter(Boolean).length;
}

export default function MaterialHeader({ material }: MaterialHeaderProps) {
  const navigation = useNavigation();
  const materialType = resolveMaterialType(material);
  const theme = TYPE_THEMES[materialType] ?? TYPE_THEMES.DOCUMENT;
  const aiCount = getAiReadyCount(material.isAiReady);
  const [menuVisible, setMenuVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);

  return (
    <View className="border-b border-gray-100 bg-white px-5 pb-6 pt-7">

      {/* Back button + Material icon + Type badge + Menu */}
      <View className="mb-5 flex-row items-center">
        {/* Back button */}
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>

        {/* Material icon */}
        {/* <View
          className={`h-14 w-14 items-center justify-center rounded-2xl ${theme.iconBg}`}
        >
          <Ionicons
            name={TYPE_ICONS[materialType] ?? "document-outline"}
            size={28}
            color={theme.iconColor}
          />
        </View> */}

        {/* Type badge + AI Ready */}
        <View className="ml-3 flex-1 flex-row flex-wrap items-center gap-2">
          <View className={`rounded-lg px-2.5 py-1 ${theme.badgeBg}`}>
            <Text className={`text-xs font-semibold ${theme.badgeText}`}>
              {TYPE_LABELS[materialType]}
            </Text>
          </View>

          {aiCount > 0 && (
            <View className="flex-row items-center rounded-lg bg-indigo-50 px-2.5 py-1">
              <Ionicons
                name="sparkles"
                size={12}
                color="#4F46E5"
                style={{ marginRight: 4 }}
              />
              <Text className="text-xs font-semibold text-indigo-700">
                AI Ready
              </Text>
            </View>
          )}
        </View>

        {/* More menu trigger */}
        <Pressable
          onPress={() => setMenuVisible(true)}
          className="ml-2 h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white"
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          <Ionicons name="ellipsis-horizontal" size={22} color="#374151" />
        </Pressable>
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            className="flex-1 bg-black/20"
            onPress={() => setMenuVisible(false)}
          >
            <View className="absolute right-5 top-24 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-lg">
              <Pressable
                onPress={() => {
                  setMenuVisible(false);
                  setNotesVisible(true);
                }}
                className="flex-row items-center rounded-xl px-3 py-3 active:bg-gray-50"
              >
                <Ionicons
                  name="document-text-outline"
                  size={19}
                  color="#4B5563"
                />
                <Text className="ml-3 text-sm font-medium text-gray-800">
                  Lecture Notes
                </Text>
                <View className="flex-1" />
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </Pressable>

              <View className="my-1 h-px bg-gray-100" />


              {/* Download Material */}
              <Pressable
                onPress={() => {
                  setMenuVisible(false);
                  // TODO: Connect material download functionality
                }}
                className="flex-row items-center rounded-xl px-3 py-3 active:bg-gray-50"
              >
                <Ionicons
                  name="download-outline"
                  size={19}
                  color="#4B5563"
                />
                <Text className="ml-3 text-sm font-medium text-gray-800">
                  Download Material
                </Text>
                <View className="flex-1" />
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </Pressable>

              <View className="my-1 h-px bg-gray-100" />

              {/* Share Material */}
              <Pressable
                onPress={() => {
                  setMenuVisible(false);
                  // TODO: Connect native share functionality
                }}
                className="flex-row items-center rounded-xl px-3 py-3 active:bg-gray-50"
              >
                <Ionicons
                  name="share-social-outline"
                  size={19}
                  color="#4B5563"
                />
                <Text className="ml-3 text-sm font-medium text-gray-800">
                  Share Material
                </Text>
                <View className="flex-1" />
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </View>

      {/* Title */}
      <Text
        className="text-2xl font-bold leading-8 text-gray-900"
        numberOfLines={1}
      >
        {material.title}
      </Text>

      {/* Subject + uploader meta */}
      <View className="mt-3 flex-row flex-wrap items-center gap-x-4 gap-y-1">
        {material.subject?.name ? (
          <View className="flex-row items-center">
            <Ionicons name="book-outline" size={14} color="#6B7280" />
            <Text className="ml-1.5 text-sm text-gray-600">
              {material.subject.name}
            </Text>
          </View>
        ) : null}

        <View className="flex-row items-center">
          <Ionicons name="person-outline" size={14} color="#6B7280" />
          <Text className="ml-1.5 text-sm text-gray-600">
            {material.createdBy?.name || "Instructor"}
          </Text>
        </View>
      </View>
      <LectureNotesModal
        visible={notesVisible}
        materialId={material.id}
        materialTitle={material.title}
        onClose={() => setNotesVisible(false)}
      />
    </View>
  );
}