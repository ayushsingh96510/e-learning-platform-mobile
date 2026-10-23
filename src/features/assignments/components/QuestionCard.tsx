import { Text, TextInput, View } from "react-native";
import { ClipboardList, FileText } from "lucide-react-native";
import type { Question } from "../types";
import DifficultyBadge from "./DifficultyBadge";
import OptionCard from "./OptionCard";

interface Props {
  question: Question;
  selectedAnswer?: string;
  onSelect: (value: string) => void;
}

export default function QuestionCard({
  question,
  selectedAnswer,
  onSelect,
}: Props) {
  const isWritten = question.type === "QUESTION_ANSWERE";

  return (
    <View className="rounded-2xl border border-gray-100 bg-white p-4">
      {/* Question header */}
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View className="flex-row items-center rounded-xl bg-blue-50 px-3 py-2">
          <ClipboardList size={16} color="#2563FF" />

          <Text className="ml-2 text-sm font-semibold text-blue-700">
            Question {question.number}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <DifficultyBadge difficulty={question.difficulty} />

          <View className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1">
            <Text className="text-xs font-semibold text-blue-700">
              {question.marks}{" "}
              {question.marks === 1 ? "mark" : "marks"}
            </Text>
          </View>
        </View>
      </View>

      {/* Question text */}
      <Text className="mb-5 mt-5 text-base font-semibold leading-6 text-gray-900">
        {question.question}
      </Text>

      {/* Written answer */}
      {isWritten ? (
        <View>
          <View className="mb-2 flex-row items-center">
            <FileText size={17} color="#2563FF" />

            <Text className="ml-2 text-sm font-semibold text-gray-700">
              Your Answer
            </Text>
          </View>

          <TextInput
            value={selectedAnswer ?? ""}
            onChangeText={onSelect}
            placeholder="Write your answer here..."
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            accessibilityLabel="Your written answer"
            className="min-h-[160px] rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-900"
            style={{ borderColor: selectedAnswer ? "#93B9FF" : "#E5E7EB" }}
          />

          <Text className="mt-2 text-xs text-gray-400">
            Your answer will be included when you submit the assessment.
          </Text>
        </View>
      ) : (
        <View>
          <Text className="mb-3 text-sm font-semibold text-gray-700">
            Choose the correct answer
          </Text>

          {question.options.map((option) => (
            <OptionCard
              key={option}
              option={option}
              selected={selectedAnswer === option}
              onSelect={onSelect}
            />
          ))}
        </View>
      )}
    </View>
  );
}
