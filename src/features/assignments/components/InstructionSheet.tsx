import { Modal, Pressable, ScrollView, Text, View } from "react-native";
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
        <Pressable className="flex-1" onPress={onClose} />

        <View
          className="rounded-t-3xl bg-white px-5 pb-8 pt-3"
          style={{ maxHeight: "85%" }}
        >
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-gray-300" />

          {item && (
            <>
              <ScrollView
                style={{ flexShrink: 1 }}
                showsVerticalScrollIndicator={false}
              >
                <Text className="text-xl font-bold text-gray-900">
                  {item.title}
                </Text>
                <Text className="mt-1 text-sm text-gray-500">
                  Read all instructions carefully before starting.
                </Text>

                <View className="mt-4 flex-row flex-wrap gap-2">
                  <View className="rounded-full bg-gray-100 px-3 py-1">
                    <Text className="text-xs font-medium text-gray-600">
                      {assessmentTypeLabel(item.assessmentType)}
                    </Text>
                  </View>
                  <DifficultyBadge difficulty={item.difficulty} />
                  {(item.questionTypes ?? []).map((type) => (
                    <View
                      key={type}
                      className="rounded-full bg-primary-50 px-3 py-1"
                    >
                      <Text className="text-xs font-medium text-primary-600">
                        {questionTypeLabel(type)}
                      </Text>
                    </View>
                  ))}
                </View>

                <View className="mt-5 flex-row gap-3">
                  <View className="flex-1 rounded-xl border border-gray-100 p-4">
                    <Text className="text-xs text-gray-500">Questions</Text>
                    <Text className="mt-1 text-2xl font-bold text-gray-900">
                      {item.questionCount}
                    </Text>
                  </View>
                  <View className="flex-1 rounded-xl border border-gray-100 p-4">
                    <Text className="text-xs text-gray-500">Total marks</Text>
                    <Text className="mt-1 text-2xl font-bold text-gray-900">
                      {item.totalMarks}
                    </Text>
                  </View>
                </View>

                {(item.topic ?? []).length > 0 && (
                  <View className="mt-5">
                    <Text className="mb-2 font-semibold text-gray-900">
                      Topics
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {item.topic.map((topic) => (
                        <View
                          key={topic}
                          className="rounded-full border border-gray-200 px-3 py-1"
                        >
                          <Text className="text-xs text-gray-700">{topic}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {!!item.instructions && (
                  <View className="mt-5">
                    <Text className="mb-2 font-semibold text-gray-900">
                      Instructions
                    </Text>
                    <Text className="rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                      {item.instructions}
                    </Text>
                  </View>
                )}
              </ScrollView>

              <View className="mt-5 flex-row gap-3">
                <Pressable
                  onPress={onClose}
                  className="flex-1 items-center rounded-xl border border-gray-200 py-3"
                >
                  <Text className="font-semibold text-gray-700">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={onStart}
                  className="flex-1 items-center rounded-xl bg-primary-600 py-3"
                >
                  <Text className="font-semibold text-white">Start</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
