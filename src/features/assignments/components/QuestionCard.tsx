import { Text, TextInput, View } from "react-native";
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
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <Text className="text-sm font-semibold text-primary-600">
          Question {question.number}
        </Text>

        <View className="flex-row items-center gap-2">
          <DifficultyBadge difficulty={question.difficulty} />
          <View className="rounded-full bg-gray-100 px-3 py-1">
            <Text className="text-xs font-semibold text-gray-600">
              {question.marks} {question.marks === 1 ? "mark" : "marks"}
            </Text>
          </View>
        </View>
      </View>

      <Text className="mb-5 mt-4 text-base font-semibold leading-6 text-gray-900">
        {question.question}
      </Text>

      {isWritten ? (
        <TextInput
          value={selectedAnswer ?? ""}
          onChangeText={onSelect}
          placeholder="Write your answer here"
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          className="min-h-[160px] rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-900"
        />
      ) : (
        question.options.map((option) => (
          <OptionCard
            key={option}
            option={option}
            selected={selectedAnswer === option}
            onSelect={onSelect}
          />
        ))
      )}
    </View>
  );
}
