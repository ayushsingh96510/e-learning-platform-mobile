import { Text, View } from "react-native";
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
      }
    : review.isCorrect
      ? {
          label: "Correct",
          pill: "border-green-200 bg-green-50",
          pillText: "text-green-700",
          answerBox: "border-green-200 bg-green-50",
        }
      : {
          label: "Incorrect",
          pill: "border-red-200 bg-red-50",
          pillText: "text-red-700",
          answerBox: "border-red-200 bg-red-50",
        };

  const earned = !skipped && review.isCorrect ? review.marks : 0;

  return (
    <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-gray-900">
          Question {review.number}
        </Text>

        <View className={`rounded-full border px-3 py-1 ${status.pill}`}>
          <Text className={`text-xs font-semibold ${status.pillText}`}>
            {status.label}
          </Text>
        </View>
      </View>

      <Text className="mt-3 text-sm leading-5 text-gray-700">
        {review.question}
      </Text>

      <Text className="mb-1 mt-4 text-xs font-semibold text-gray-500">
        Your Answer
      </Text>
      <View className={`rounded-lg border p-3 ${status.answerBox}`}>
        <Text className="text-sm text-gray-900">
          {review.selectedAnswer || "Not answered"}
        </Text>
      </View>

      <Text className="mb-1 mt-4 text-xs font-semibold text-gray-500">
        Correct Answer
      </Text>
      <View className="rounded-lg border border-green-200 bg-green-50 p-3">
        <Text className="text-sm text-gray-900">{review.correctAnswer}</Text>
      </View>

      {!!review.explanation && (
        <>
          <Text className="mb-1 mt-4 text-xs font-semibold text-gray-500">
            Explanation
          </Text>
          <View className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <Text className="text-sm leading-5 text-gray-600">
              {review.explanation}
            </Text>
          </View>
        </>
      )}

      <Text className="mt-3 text-right text-xs text-gray-400">
        {earned}/{review.marks} marks
      </Text>
    </View>
  );
}
