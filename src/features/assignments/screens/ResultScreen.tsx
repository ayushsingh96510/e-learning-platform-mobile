import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import QuestionReviewCard from "../components/QuestionReviewCard";
import ScoreCard from "../components/ScoreCard";
import StatisticsCard from "../components/StatisticsCard";
import { useAssessmentResult } from "../hooks/useAssessmentResult";
import type { StudentStackParamList } from "../../../navigation/StudentNavigator";

type Props = NativeStackScreenProps<StudentStackParamList, "AssignmentResult">;

export default function ResultScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();

  const initial = route.params.result;
  const resultId = route.params.resultId || initial?.id || undefined;

  const { result, loading, error, reload } = useAssessmentResult(
    resultId,
    initial
  );

  const topPadding = { paddingTop: insets.top + 12 };

  const goToList = () => navigation.popToTop();

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-gray-50"
        style={topPadding}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (!result) {
    return (
      <View
        className="flex-1 items-center justify-center bg-gray-50 px-6"
        style={topPadding}
      >
        <Text className="text-center text-sm text-red-600">
          {error ?? "Unable to load the assessment result."}
        </Text>

        {!!resultId && (
          <Pressable
            onPress={reload}
            className="mt-4 rounded-xl bg-primary-600 px-6 py-3"
          >
            <Text className="font-semibold text-white">Retry</Text>
          </Pressable>
        )}

        <Pressable onPress={goToList} className="mt-3 px-6 py-3">
          <Text className="font-semibold text-gray-600">Back to Assignments</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8"
        contentContainerStyle={topPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-4 flex-row items-center">
          {/* <Pressable
            onPress={goToList}
            hitSlop={12}
            className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-gray-100"
          >
            <Text className="text-base text-gray-700">←</Text>
          </Pressable> */}
          <Pressable
            onPress={() => navigation.goBack()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <Text className="text-xl text-gray-900">‹</Text>
          </Pressable>
          <Text className="text-lg font-bold text-gray-900">Result</Text>
        </View>

        <View className="mb-4 items-center rounded-2xl border border-gray-100 bg-white p-6">
          <Text className="text-4xl">🏆</Text>
          <Text className="mt-3 text-2xl font-bold text-gray-900">
            Test Completed
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-500">
            {result.title}
          </Text>
        </View>

        {!!error && (
          <View className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <Text className="text-sm text-amber-700">
              The full question review could not be loaded. {error}
            </Text>
          </View>
        )}

        <View className="mb-4">
          <ScoreCard
            obtainedMarks={result.obtainedMarks}
            totalMarks={result.totalMarks}
            percentage={result.percentage}
          />
        </View>

        <View className="mb-6">
          <StatisticsCard
            totalQuestions={
              result.reviews.length ||
              result.correctCount + result.wrongCount + result.skippedCount
            }
            correctCount={result.correctCount}
            wrongCount={result.wrongCount}
            skippedCount={result.skippedCount}
          />
        </View>

        <Text className="mb-3 text-lg font-bold text-gray-900">
          Question Review
        </Text>

        {result.reviews.length === 0 ? (
          <View className="rounded-2xl border border-gray-100 bg-white p-6">
            <Text className="text-center text-sm text-gray-500">
              The question review is not available for this result.
            </Text>
          </View>
        ) : (
          result.reviews.map((review) => (
            <QuestionReviewCard key={review.questionId} review={review} />
          ))
        )}

        <Pressable
          onPress={goToList}
          className="mt-2 items-center rounded-xl bg-primary-600 py-3"
        >
          <Text className="font-semibold text-white">Back to Assignments</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
