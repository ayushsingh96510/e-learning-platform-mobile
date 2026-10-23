import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useMaterialTranscript } from "../../hooks/useMaterialTranscript";

interface TranscriptTabProps {
  materialId: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "00:00";
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export default function TranscriptTab({
  materialId,
}: TranscriptTabProps) {
  const { transcript, loading, error, refetch } =
    useMaterialTranscript(materialId);

  const [search, setSearch] = useState("");
  const transcriptScrollRef = useRef<ScrollView>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const filteredSegments = useMemo(() => {
    const segments = transcript?.segments ?? [];
    const query = search.trim().toLowerCase();

    if (!query) {
      return segments;
    }

    return segments.filter((segment) =>
      segment.text.toLowerCase().includes(query),
    );
  }, [transcript, search]);

  if (loading) {
    return (
      <View className="items-center justify-center py-12">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-3 text-sm text-gray-500">
          Loading transcription...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center rounded-2xl border border-red-100 bg-red-50 p-6">
        <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
        <Text className="mt-3 text-center font-semibold text-gray-800">
          Could not load transcription
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-600">
          {error}
        </Text>
        <TouchableOpacity
          onPress={refetch}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-3"
          accessibilityRole="button"
        >
          <Text className="font-semibold text-white">Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!transcript || transcript.segments.length === 0) {
    return (
      <View className="items-center rounded-2xl border border-gray-200 bg-white p-6">
        <Ionicons
          name="document-text-outline"
          size={34}
          color="#6B7280"
        />
        <Text className="mt-3 text-base font-semibold text-gray-900">
          No transcription available
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          A transcript may not have been generated for this material yet.
        </Text>
        <TouchableOpacity
          onPress={refetch}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-3"
          accessibilityRole="button"
        >
          <Text className="font-semibold text-white">Refresh transcript</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">


      {filteredSegments.length === 0 ? (
        <View className="items-center rounded-2xl bg-gray-50 p-6">
          <Text className="text-sm text-gray-500">
            No matching transcript segments found.
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={transcriptScrollRef}
          style={{ height: 500, flexGrow: 0, flexShrink: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            setShowBackToTop(
              event.nativeEvent.contentOffset.y > 300
            );
          }}
          scrollEventThrottle={16}
        >
          <View className="mb-3 rounded-2xl border border-gray-200 bg-white p-3">
            <Text className="text-sm font-bold text-gray-900">
              Transcription
            </Text>

            <Text className="mt-0.5 text-xs text-gray-500">
              {transcript.segments.length} transcript segments
              {transcript.language ? ` · ${transcript.language}` : ""}
            </Text>

            <View className="mt-2 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-3">
              <Ionicons name="search-outline" size={18} color="#6B7280" />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search transcript..."
                placeholderTextColor="#9CA3AF"
                className="ml-2 flex-1 py-2 text-sm text-gray-900"
                accessibilityLabel="Search transcript"
                returnKeyType="search"
                autoCorrect={false}
              />

              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch("")}
                  accessibilityRole="button"
                  accessibilityLabel="Clear transcript search"
                >
                  <Ionicons name="close-circle" size={18} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {filteredSegments.map((segment, index) => (
            <View
              key={`${segment.start}-${index}`}
              className="mb-3 flex-row rounded-2xl border border-gray-200 bg-white p-4"
            >
              <View className="mr-3">
                <View className="rounded-lg bg-indigo-50 px-2 py-1">
                  <Text className="text-xs font-semibold text-indigo-700">
                    {formatTime(segment.start)}
                  </Text>
                </View>
              </View>

              <Text className="flex-1 text-sm leading-6 text-gray-700">
                {segment.text}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
      {showBackToTop && (
        <TouchableOpacity
          onPress={() => {
            transcriptScrollRef.current?.scrollTo({
              y: 0,
              animated: true,
            });
            setShowBackToTop(false);
          }}
          className="absolute top-5 right-2 h-12 w-12 items-center justify-center rounded-full bg-indigo-600 shadow-lg"
          style={{ elevation: 5 }}
          accessibilityRole="button"
          accessibilityLabel="Back to top"
        >
          <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}
