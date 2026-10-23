import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import {
  ClipboardList,
  CircleHelp,
  Trophy,
  BookOpen,
  Tags,
  FileText,
  ArrowRight,
  X,
} from "lucide-react-native";
import type { AssessmentSummary } from "../types";
import { assessmentTypeLabel, questionTypeLabel } from "../utils/labels";
import DifficultyBadge from "./DifficultyBadge";

interface Props {
  visible: boolean;
  item: AssessmentSummary | null;
  onClose: () => void;
  onStart: () => void;
}

export default function InstructionSheet({
  visible,
  item,
  onClose,
  onStart,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        {/* Tap outside to close */}
        <Pressable
          className="flex-1"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close instructions"
        />

        <View
          className="rounded-t-3xl border-t border-gray-100 bg-white px-5 pb-8 pt-3"
          style={{ maxHeight: "85%" }}
        >
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-gray-300" />

          {item && (
            <>
              <ScrollView
                style={{ flexShrink: 1 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Header */}
                <View className="flex-row items-start">
                  <View className="mr-3 h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <ClipboardList
                      size={23}
                      color="#2563FF"
                      strokeWidth={2}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900">
                      {item.title}
                    </Text>

                    <Text className="mt-1 text-sm leading-5 text-gray-500">
                      Read all instructions carefully before starting.
                    </Text>
                  </View>
                </View>

                {/* Assessment tags */}
                <View className="mt-4 flex-row flex-wrap gap-2">
                  <View className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1">
                    <Text className="text-xs font-semibold text-blue-700">
                      {assessmentTypeLabel(item.assessmentType)}
                    </Text>
                  </View>

                  <DifficultyBadge difficulty={item.difficulty} />

                  {(item.questionTypes ?? []).map((type) => (
                    <View
                      key={type}
                      className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1"
                    >
                      <Text className="text-xs font-medium text-purple-700">
                        {questionTypeLabel(type)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Assessment statistics */}
                <View className="mt-5 flex-row gap-3">
                  <View className="flex-1 rounded-2xl border border-blue-100 bg-white p-4">
                    <View className="mb-3 h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                      <CircleHelp
                        size={19}
                        color="#2563FF"
                        strokeWidth={2}
                      />
                    </View>

                    <Text className="text-xs font-medium text-gray-500">
                      Questions
                    </Text>

                    <Text className="mt-1 text-2xl font-bold text-gray-900">
                      {item.questionCount}
                    </Text>
                  </View>

                  <View className="flex-1 rounded-2xl border border-orange-100 bg-white p-4">
                    <View className="mb-3 h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
                      <Trophy
                        size={19}
                        color="#F08C00"
                        strokeWidth={2}
                      />
                    </View>

                    <Text className="text-xs font-medium text-gray-500">
                      Total marks
                    </Text>

                    <Text className="mt-1 text-2xl font-bold text-gray-900">
                      {item.totalMarks}
                    </Text>
                  </View>
                </View>

                {/* Topics */}
                {(item.topic ?? []).length > 0 && (
                  <View className="mt-5">
                    <View className="mb-3 flex-row items-center">
                      <View className="mr-2 h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                        <Tags size={17} color="#A020F0" strokeWidth={2} />
                      </View>

                      <Text className="text-base font-bold text-gray-900">
                        Topics covered
                      </Text>
                    </View>

                    <View className="flex-row flex-wrap gap-2">
                      {item.topic.map((topic) => (
                        <View
                          key={topic}
                          className="rounded-full border border-purple-100 bg-purple-50/50 px-3 py-2"
                        >
                          <Text className="text-xs font-medium text-purple-700">
                            {topic}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Instructions */}
                {!!item.instructions && (
                  <View className="mt-5">
                    <View className="mb-3 flex-row items-center">
                      <View className="mr-2 h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                        <FileText
                          size={17}
                          color="#2563FF"
                          strokeWidth={2}
                        />
                      </View>

                      <Text className="text-base font-bold text-gray-900">
                        Instructions
                      </Text>
                    </View>

                    <View className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <Text className="text-sm leading-6 text-gray-700">
                        {item.instructions}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Reminder */}
                <View className="mt-5 flex-row items-start rounded-xl border border-amber-100 bg-amber-50 p-3">
                  <BookOpen
                    size={18}
                    color="#D97706"
                    strokeWidth={2}
                  />

                  <Text className="ml-2 flex-1 text-xs leading-5 text-amber-800">
                    Make sure you understand the instructions and have enough
                    time to complete your assessment before starting.
                  </Text>
                </View>
              </ScrollView>

              {/* Actions */}
              <View className="mt-5 flex-row gap-3">
                <Pressable
                  onPress={onClose}
                  accessibilityRole="button"
                  className="flex-1 flex-row items-center justify-center rounded-xl border border-gray-200 py-3"
                >
                  <X size={17} color="#4B5563" strokeWidth={2} />
                  <Text className="ml-2 font-semibold text-gray-700">
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={onStart}
                  accessibilityRole="button"
                  className="flex-1 flex-row items-center justify-center rounded-xl bg-blue-600 py-3"
                >
                  <Text className="font-semibold text-white">
                    Start Assessment
                  </Text>
                  <ArrowRight
                    size={17}
                    color="#FFFFFF"
                    style={{ marginLeft: 8 }}
                  />
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
