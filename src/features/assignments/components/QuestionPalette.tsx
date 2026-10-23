import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  CircleDot,
} from "lucide-react-native";

interface Props {
  visible: boolean;
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, string>;
  onJump: (index: number) => void;
  onClose: () => void;
}

export default function QuestionPalette({
  visible,
  questionIds,
  currentIndex,
  answers,
  onJump,
  onClose,
}: Props) {
  const answeredCount = questionIds.filter(
    (id) => !!answers[id]?.trim(),
  ).length;

  const remainingCount = questionIds.length - answeredCount;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable
          className="flex-1"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close question palette"
        />

        <View
          className="rounded-t-3xl border-t border-gray-100 bg-white px-5 pb-8 pt-3"
          style={{ maxHeight: "75%" }}
        >
          {/* Sheet handle */}
          <View className="mb-5 h-1 w-10 self-center rounded-full bg-gray-300" />

          {/* Header */}
          <View className="flex-row items-center">
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <ClipboardList size={22} color="#2563FF" />
            </View>

            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                Question Palette
              </Text>
              <Text className="mt-0.5 text-xs text-gray-500">
                Navigate between questions
              </Text>
            </View>

            <View className="rounded-xl bg-blue-50 px-3 py-2">
              <Text className="text-sm font-bold text-blue-700">
                {currentIndex + 1}/{questionIds.length}
              </Text>
            </View>
          </View>

          {/* Legend */}
          <View className="mt-5 flex-row flex-wrap gap-x-4 gap-y-2">
            <View className="flex-row items-center">
              <CircleDot size={15} color="#2563FF" />
              <Text className="ml-1.5 text-xs text-gray-600">
                Current
              </Text>
            </View>

            <View className="flex-row items-center">
              <CheckCircle2 size={15} color="#059669" />
              <Text className="ml-1.5 text-xs text-gray-600">
                Answered
              </Text>
            </View>

            <View className="flex-row items-center">
              <Circle size={15} color="#9CA3AF" />
              <Text className="ml-1.5 text-xs text-gray-600">
                Unanswered
              </Text>
            </View>
          </View>

          {/* Question numbers */}
          <ScrollView
            style={{ flexShrink: 1 }}
            className="mt-5"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row flex-wrap gap-3">
              {questionIds.map((id, index) => {
                const active = index === currentIndex;
                const answered = !!answers[id]?.trim();

                return (
                  <Pressable
                    key={id}
                    onPress={() => onJump(index)}
                    accessibilityRole="button"
                    accessibilityLabel={`Question ${index + 1}${
                      active
                        ? ", current question"
                        : answered
                          ? ", answered"
                          : ", unanswered"
                    }`}
                    accessibilityState={{ selected: active }}
                    className={`h-11 w-11 items-center justify-center rounded-xl border ${
                      active
                        ? "border-blue-600 bg-blue-600"
                        : answered
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-gray-200 bg-white"
                    }`}
                  >
                    {answered && !active ? (
                      <View className="absolute -right-1 -top-1 rounded-full bg-white">
                        <CheckCircle2 size={13} color="#059669" />
                      </View>
                    ) : null}

                    <Text
                      className={`text-sm font-bold ${
                        active
                          ? "text-white"
                          : answered
                            ? "text-emerald-700"
                            : "text-gray-700"
                      }`}
                    >
                      {index + 1}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Summary */}
          <View className="mt-5 border-t border-gray-100 pt-4">
            <View className="mb-4 flex-row gap-3">
              <View className="flex-1 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <View className="flex-row items-center">
                  <CheckCircle2 size={16} color="#059669" />
                  <Text className="ml-1.5 text-xs font-medium text-emerald-700">
                    Answered
                  </Text>
                </View>
                <Text className="mt-2 text-2xl font-bold text-emerald-700">
                  {answeredCount}
                </Text>
              </View>

              <View className="flex-1 rounded-xl border border-amber-100 bg-amber-50 p-3">
                <View className="flex-row items-center">
                  <Circle size={16} color="#D97706" />
                  <Text className="ml-1.5 text-xs font-medium text-amber-700">
                    Remaining
                  </Text>
                </View>
                <Text className="mt-2 text-2xl font-bold text-amber-700">
                  {remainingCount}
                </Text>
              </View>

              <View className="flex-1 rounded-xl border border-blue-100 bg-blue-50 p-3">
                <View className="flex-row items-center">
                  <ClipboardList size={16} color="#2563FF" />
                  <Text className="ml-1.5 text-xs font-medium text-blue-700">
                    Total
                  </Text>
                </View>
                <Text className="mt-2 text-2xl font-bold text-blue-700">
                  {questionIds.length}
                </Text>
              </View>
            </View>

            {/* Close */}
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              className="items-center rounded-xl border border-gray-200 bg-white py-3"
            >
              <Text className="font-semibold text-gray-700">
                Close Palette
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
