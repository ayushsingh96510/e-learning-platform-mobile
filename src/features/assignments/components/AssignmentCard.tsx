import { Pressable, Text, View } from "react-native";
import {
  ClipboardList,
  BookOpen,
  CircleHelp,
  Trophy,
  CheckCircle2,
  ArrowRight,
  Eye,
} from "lucide-react-native";
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
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
          <ClipboardList
            size={21}
            color="#2563FF"
            strokeWidth={2}
          />
        </View>

        <View className="flex-1">
          <Text
            className="text-base font-bold text-gray-900"
            numberOfLines={2}
          >
            {item.title}
          </Text>

          {!!item.subject?.name && (
            <View className="mt-1 flex-row items-center">
              <BookOpen size={14} color="#6B7280" />
              <Text className="ml-1.5 flex-1 text-sm text-gray-500">
                {item.subject.name}
              </Text>
            </View>
          )}
        </View>

        {completed && (
          <View className="ml-2 rounded-full bg-emerald-50 p-1.5">
            <CheckCircle2 size={18} color="#059669" strokeWidth={2} />
          </View>
        )}
      </View>

      {/* Topics */}
      {!!topics && (
        <Text className="mt-3 text-sm text-gray-500" numberOfLines={1}>
          {topics}
        </Text>
      )}

      {/* Tags */}
      <View className="mt-3 flex-row flex-wrap gap-2">
        <View className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1">
          <Text className="text-xs font-medium text-blue-700">
            {assessmentTypeLabel(item.assessmentType)}
          </Text>
        </View>

        <DifficultyBadge difficulty={item.difficulty} />

        {!!questionTypes && (
          <View className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1">
            <Text className="text-xs font-medium text-purple-700">
              {questionTypes}
            </Text>
          </View>
        )}
      </View>

      {/* Assessment details */}
      <View className="mt-4 flex-row gap-3">
        <View className="flex-1 flex-row items-center rounded-xl bg-blue-50/70 p-3">
          <View className="mr-2 h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <CircleHelp size={17} color="#2563FF" strokeWidth={2} />
          </View>

          <View className="flex-1">
            <Text className="text-xs text-gray-500">Questions</Text>
            <Text className="mt-0.5 text-sm font-bold text-gray-900">
              {item.questionCount}
            </Text>
          </View>
        </View>

        <View className="flex-1 flex-row items-center rounded-xl bg-orange-50/70 p-3">
          <View className="mr-2 h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
            <Trophy size={17} color="#F08C00" strokeWidth={2} />
          </View>

          <View className="flex-1">
            <Text className="text-xs text-gray-500">Total marks</Text>
            <Text className="mt-0.5 text-sm font-bold text-gray-900">
              {item.totalMarks}
            </Text>
          </View>
        </View>
      </View>

      {/* Last score */}
      {completed && result && (
        <View className="mt-3 flex-row items-center rounded-xl border border-emerald-100 bg-emerald-50 p-3">
          <View className="mr-3 h-9 w-9 items-center justify-center rounded-xl bg-white">
            <Trophy size={19} color="#059669" strokeWidth={2} />
          </View>

          <View className="flex-1">
            <Text className="text-xs font-medium text-emerald-700">
              Last score
            </Text>

            <Text className="mt-0.5 text-base font-bold text-gray-900">
              {result.obtainedMarks}/{result.totalMarks}
              <Text className="text-sm font-medium text-gray-500">
                {" "}({result.percentage}%)
              </Text>
            </Text>
          </View>

          <CheckCircle2 size={20} color="#059669" strokeWidth={2} />
        </View>
      )}

      {/* Action */}
      {completed ? (
        <Pressable
          onPress={() => onViewResult(item)}
          accessibilityRole="button"
          className="mt-4 flex-row items-center justify-center rounded-xl border border-blue-100 bg-blue-50 py-3"
        >
          <Eye size={18} color="#2563FF" strokeWidth={2} />
          <Text className="ml-2 font-semibold text-blue-700">
            View Result
          </Text>
          <ArrowRight size={17} color="#2563FF" style={{ marginLeft: 8 }} />
        </Pressable>
      ) : (
        <Pressable
          onPress={() => onStart(item)}
          accessibilityRole="button"
          className="mt-4 flex-row items-center justify-center rounded-xl bg-blue-600 py-3"
        >
          <Text className="font-semibold text-white">Start Assessment</Text>
          <ArrowRight
            size={17}
            color="#FFFFFF"
            style={{ marginLeft: 8 }}
          />
        </Pressable>
      )}
    </View>
  );
}
