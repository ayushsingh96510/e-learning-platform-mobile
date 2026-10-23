import { Text, View } from "react-native";
import {
  CircleCheck,
  CircleX,
  CircleMinus,
  CheckCircle2,
  BookOpen,
  Lightbulb,
} from "lucide-react-native";
import type { ReviewItem } from "../types";

interface Props {
  review: ReviewItem;
}

export default function QuestionReviewCard({ review }: Props) {
  const skipped = !review.selectedAnswer;

  const status = skipped
    ? {
        label: "Skipped",
        pill: "border-amber-200 bg-amber-50",
        pillText: "text-amber-700",
        answerBox: "border-amber-200 bg-amber-50",
        color: "#F08C00",
        Icon: CircleMinus,
      }
    : review.isCorrect
      ? {
          label: "Correct",
          pill: "border-emerald-200 bg-emerald-50",
          pillText: "text-emerald-700",
          answerBox: "border-emerald-200 bg-emerald-50",
          color: "#059669",
          Icon: CircleCheck,
        }
      : {
          label: "Incorrect",
          pill: "border-red-200 bg-red-50",
          pillText: "text-red-700",
          answerBox: "border-red-200 bg-red-50",
          color: "#FF4545",
          Icon: CircleX,
        };

  const StatusIcon = status.Icon;
  const earned = !skipped && review.isCorrect ? review.marks : 0;

  return (
    <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="mr-2 h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
            <BookOpen size={18} color="#2563FF" strokeWidth={2} />
          </View>

          <Text className="text-sm font-bold text-gray-900">
            Question {review.number}
          </Text>
        </View>

        <View
          className={`flex-row items-center rounded-full border px-3 py-1 ${status.pill}`}
        >
          <StatusIcon size={14} color={status.color} strokeWidth={2.2} />

          <Text className={`ml-1.5 text-xs font-semibold ${status.pillText}`}>
            {status.label}
          </Text>
        </View>
      </View>

      {/* Question */}
      <Text className="mt-4 text-sm leading-6 text-gray-800">
        {review.question}
      </Text>

      {/* Your Answer */}
      <View className="mb-2 mt-4 flex-row items-center">
        <StatusIcon size={15} color={status.color} />
        <Text className="ml-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Your Answer
        </Text>
      </View>

      <View className={`rounded-xl border p-3 ${status.answerBox}`}>
        <Text className="text-sm leading-5 text-gray-900">
          {review.selectedAnswer || "Not answered"}
        </Text>
      </View>

      {/* Correct Answer */}
      <View className="mb-2 mt-4 flex-row items-center">
        <CheckCircle2 size={15} color="#059669" />
        <Text className="ml-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Correct Answer
        </Text>
      </View>

      <View className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
        <Text className="text-sm leading-5 text-gray-900">
          {review.correctAnswer}
        </Text>
      </View>

      {/* Explanation */}
      {!!review.explanation && (
        <>
          <View className="mb-2 mt-4 flex-row items-center">
            <Lightbulb size={15} color="#F08C00" />
            <Text className="ml-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Explanation
            </Text>
          </View>

          <View className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
            <Text className="text-sm leading-6 text-gray-700">
              {review.explanation}
            </Text>
          </View>
        </>
      )}

      {/* Marks */}
      <View className="mt-4 flex-row items-center justify-end border-t border-gray-100 pt-3">
        <Text className="mr-2 text-xs text-gray-500">Marks earned</Text>

        <View className="rounded-lg bg-blue-50 px-3 py-1.5">
          <Text className="text-sm font-bold text-blue-600">
            {earned}/{review.marks}
          </Text>
        </View>
      </View>
    </View>
  );
}