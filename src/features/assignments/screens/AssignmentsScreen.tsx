import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import AssignmentCard from "../components/AssignmentCard";
import InstructionSheet from "../components/InstructionSheet";
import { useAssignmentsList } from "../hooks/useAssignmentsList";
import type {
  AssessmentSummary,
  AssignmentTab,
  DifficultyFilter,
} from "../types";
import type { StudentStackParamList } from "@/navigation/types";

const DIFFICULTY_FILTERS: { label: string; value: DifficultyFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Easy", value: "EASY" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Hard", value: "HARD" },
  { label: "Mixed", value: "MIXED" },
];

const EMPTY_TEXT: Record<AssignmentTab, string> = {
  NOT_COMPLETED: "You have nothing left to complete.",
  COMPLETED: "You have not completed any assessments yet.",
};

export default function AssignmentsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();

  const {
    assessments,
    latestResults,
    loading,
    refreshing,
    error,
    refetch,
    reload,
    refetchSilently,
  } = useAssignmentsList();

  const [activeTab, setActiveTab] = useState<AssignmentTab>("NOT_COMPLETED");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("ALL");
  const [selected, setSelected] = useState<AssessmentSummary | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Refresh quietly when returning to this screen (e.g. after a submit),
  // but skip the first focus because the hook already loads on mount.
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      refetchSilently();
    }, [refetchSilently])
  );

  const completedCount = useMemo(
    () => assessments.filter((a) => latestResults.has(a.id)).length,
    [assessments, latestResults]
  );
  const pendingCount = assessments.length - completedCount;

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return assessments.filter((a) => {
      const completed = latestResults.has(a.id);
      if (activeTab === "COMPLETED" ? !completed : completed) return false;

      if (difficulty !== "ALL" && a.difficulty !== difficulty) return false;

      if (!keyword) return true;
      return (
        a.title.toLowerCase().includes(keyword) ||
        (a.subject?.name ?? "").toLowerCase().includes(keyword) ||
        (a.topic ?? []).some((t) => t.toLowerCase().includes(keyword))
      );
    });
  }, [assessments, latestResults, activeTab, difficulty, search]);

  const handleStart = (item: AssessmentSummary) => {
    setSelected(item);
    setSheetOpen(true);
  };

  const handleConfirmStart = () => {
    if (!selected) return;
    setSheetOpen(false);
    navigation.navigate("AssignmentAttempt", { assessmentId: selected.id });
  };

  const handleViewResult = (item: AssessmentSummary) => {
    const result = latestResults.get(item.id);
    if (!result) return;
    navigation.navigate("AssignmentResult", { resultId: result.id });
  };

  const tabs: { label: string; value: AssignmentTab; count: number }[] = [
    { label: "Not Completed", value: "NOT_COMPLETED", count: pendingCount },
    { label: "Completed", value: "COMPLETED", count: completedCount },
  ];

  const hasFilters = search.trim() !== "" || difficulty !== "ALL";

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8 pt-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refetch} />
        }
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">Assignments</Text>
          <Text className="mt-1 text-sm text-gray-500">
            Practice with published quizzes and question papers
          </Text>
        </View>

        {/* Search */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by title, subject or topic"
          placeholderTextColor="#9CA3AF"
          autoCorrect={false}
          className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900"
        />

        {/* Difficulty filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerClassName="gap-2"
        >
          {DIFFICULTY_FILTERS.map((filter) => {
            const active = difficulty === filter.value;

            return (
              <Pressable
                key={filter.value}
                onPress={() => setDifficulty(filter.value)}
                className={`rounded-full border px-4 py-2 ${
                  active
                    ? "border-primary-600 bg-primary-600"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    active ? "text-white" : "text-gray-600"
                  }`}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Tabs */}
        <View className="mb-6 flex-row rounded-xl bg-gray-200 p-1">
          {tabs.map((tab) => {
            const active = activeTab === tab.value;

            return (
              <Pressable
                key={tab.value}
                onPress={() => setActiveTab(tab.value)}
                className={`flex-1 items-center rounded-lg py-3 ${
                  active ? "bg-white" : ""
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    active ? "text-primary-600" : "text-gray-500"
                  }`}
                >
                  {tab.label} ({tab.count})
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Content */}
        {loading ? (
          <View className="items-center rounded-2xl border border-gray-100 bg-white p-6">
            <ActivityIndicator />
          </View>
        ) : error ? (
          <View className="items-center rounded-2xl border border-gray-100 bg-white p-6">
            <Text className="text-center text-sm text-red-600">{error}</Text>

            <Pressable
              onPress={reload}
              className="mt-4 rounded-xl bg-primary-600 px-6 py-3"
            >
              <Text className="font-semibold text-white">Retry</Text>
            </Pressable>
          </View>
        ) : filtered.length === 0 ? (
          <View className="rounded-2xl border border-gray-100 bg-white p-6">
            <Text className="text-center text-sm leading-5 text-gray-500">
              {hasFilters
                ? "No assessments match your search or filter."
                : EMPTY_TEXT[activeTab]}
            </Text>
          </View>
        ) : (
          filtered.map((item) => (
            <AssignmentCard
              key={item.id}
              item={item}
              result={latestResults.get(item.id)}
              onStart={handleStart}
              onViewResult={handleViewResult}
            />
          ))
        )}
      </ScrollView>

      <InstructionSheet
        visible={sheetOpen}
        item={selected}
        onClose={() => setSheetOpen(false)}
        onStart={handleConfirmStart}
      />
    </View>
  );
}
