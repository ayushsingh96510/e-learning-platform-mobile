import { Pressable, Text, View } from "react-native";
import type { AssessmentResult, AssessmentSummary } from "../types";
import { assessmentTypeLabel, questionTypeLabel } from "../utils/labels";
import DifficultyBadge from "./DifficultyBadge";

interface Props {
  item: AssessmentSummary;
  /** Latest result of the student for this assessment, if completed. */
  result?: AssessmentResult;
  onStart: (item: AssessmentSummary) => void;
  onViewResult: (item: AssessmentSummary) => void;
}

export default function AssignmentCard({
  item,
  result,
  onStart,
  onViewResult,
}: Props) {
  const completed = !!result;
  const topics = (item.topic ?? []).join(" • ");
  const questionTypes = (item.questionTypes ?? [])
    .map(questionTypeLabel)
    .join(", ");

  return (
    <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
      {/* Header */}
      <View className="flex-row items-start">
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
          <Text className="text-xl">📝</Text>
        </View>

        <View className="flex-1">
          <Text
            className="text-base font-bold text-gray-900"
            numberOfLines={2}
          >
            {item.title}
          </Text>

          {!!item.subject?.name && (
            <Text className="mt-0.5 text-sm text-gray-500">
              {item.subject.name}
            </Text>
          )}
        </View>
      </View>

      {!!topics && (
        <Text className="mt-3 text-sm text-gray-500" numberOfLines={1}>
          {topics}
        </Text>
      )}

      {/* Tags */}
      <View className="mt-3 flex-row flex-wrap gap-2">
        <View className="rounded-full bg-gray-100 px-3 py-1">
          <Text className="text-xs font-medium text-gray-600">
            {assessmentTypeLabel(item.assessmentType)}
          </Text>
        </View>

        <DifficultyBadge difficulty={item.difficulty} />

        {!!questionTypes && (
          <View className="rounded-full bg-primary-50 px-3 py-1">
            <Text className="text-xs font-medium text-primary-600">
              {questionTypes}
            </Text>
          </View>
        )}
      </View>

      {/* Meta */}
      <View className="mt-3 gap-1">
        <Text className="text-sm text-gray-500">
          📋 {item.questionCount} questions
        </Text>
        <Text className="text-sm text-gray-500">🏆 {item.totalMarks} marks</Text>
      </View>

      {/* Last score */}
      {completed && result && (
        <View className="mt-3 rounded-xl bg-gray-50 px-3 py-2">
          <Text className="text-sm text-gray-700">
            Last score:{" "}
            <Text className="font-bold text-gray-900">
              {result.obtainedMarks}/{result.totalMarks}
            </Text>{" "}
            ({result.percentage}%)
          </Text>
        </View>
      )}

      {/* Action */}
      {completed ? (
        <Pressable
          onPress={() => onViewResult(item)}
          className="mt-4 items-center rounded-xl bg-primary-50 py-3"
        >
          <Text className="font-semibold text-primary-600">View Result</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => onStart(item)}
          className="mt-4 items-center rounded-xl bg-primary-600 py-3"
        >
          <Text className="font-semibold text-white">Start</Text>
        </Pressable>
      )}
    </View>
  );
}
