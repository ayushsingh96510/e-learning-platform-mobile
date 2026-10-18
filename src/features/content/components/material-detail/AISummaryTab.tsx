
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useMaterialSummary } from "../../hooks/useMaterialSummary";

interface AISummaryTabProps {
  materialId: string;
}

export default function AISummaryTab({
  materialId,
}: AISummaryTabProps) {
  const { summary, loading, error, refetch } =
    useMaterialSummary(materialId);

  if (loading) {
    return (
      <View className="items-center justify-center py-12">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-3 text-sm text-gray-500">
          Loading AI summary...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center rounded-2xl border border-red-100 bg-red-50 p-6">
        <Ionicons name="alert-circle-outline" size={32} color="#DC2626" />
        <Text className="mt-3 text-center font-semibold text-gray-800">
          Could not load summary
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

  if (!summary || summary.status !== "COMPLETED") {
    return (
      <View className="items-center rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
        <Ionicons name="sparkles-outline" size={34} color="#4F46E5" />
        <Text className="mt-3 text-center text-base font-semibold text-gray-900">
          AI summary is being generated
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-600">
          The summary is not available yet. Please try again shortly.
        </Text>
        <TouchableOpacity
          onPress={refetch}
          className="mt-4 rounded-xl bg-indigo-600 px-5 py-3"
          accessibilityRole="button"
        >
          <Text className="font-semibold text-white">Refresh summary</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={{ paddingBottom: 20 }}
    >
      <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
        <View className="mb-3 flex-row items-center">
          <View className="mr-3 rounded-xl bg-indigo-100 p-2">
            <Ionicons name="sparkles" size={22} color="#4F46E5" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900">
              AI Summary
            </Text>
            <Text className="text-xs text-gray-500">
              Key points from your learning material
            </Text>
          </View>
        </View>

        <Text className="text-sm leading-6 text-gray-700">
          {summary.summary || "No summary text is available."}
        </Text>

        {summary.generatedAt ? (
          <Text className="mt-4 text-xs text-gray-400">
            Generated: {new Date(summary.generatedAt).toLocaleDateString()}
          </Text>
        ) : null}
      </View>

      {summary.keyTopics?.length > 0 && (
        <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
          <Text className="mb-3 text-base font-bold text-gray-900">
            Key Topics
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {summary.keyTopics.map((topic, index) => (
              <View
                key={`${topic}-${index}`}
                className="rounded-full bg-indigo-50 px-3 py-2"
              >
                <Text className="text-sm font-medium text-indigo-700">
                  {topic}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {summary.keyTakeaways?.length > 0 && (
        <View className="rounded-2xl border border-gray-200 bg-white p-4">
          <Text className="mb-4 text-base font-bold text-gray-900">
            Key Takeaways
          </Text>

          {summary.keyTakeaways.map((takeaway, index) => (
            <View key={`${index}-${takeaway}`} className="mb-4 flex-row">
              <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-indigo-100">
                <Text className="text-sm font-bold text-indigo-700">
                  {index + 1}
                </Text>
              </View>
              <Text className="flex-1 text-sm leading-6 text-gray-700">
                {takeaway}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
