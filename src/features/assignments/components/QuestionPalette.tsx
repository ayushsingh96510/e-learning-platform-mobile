import { Modal, Pressable, ScrollView, Text, View } from "react-native";

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
  const answeredCount = questionIds.filter((id) => !!answers[id]).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="flex-1" onPress={onClose} />

        <View
          className="rounded-t-3xl bg-white px-5 pb-8 pt-3"
          style={{ maxHeight: "75%" }}
        >
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-gray-300" />

          <Text className="text-lg font-bold text-gray-900">
            Question Palette
          </Text>

          <ScrollView
            style={{ flexShrink: 1 }}
            className="mt-4"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row flex-wrap gap-2">
              {questionIds.map((id, index) => {
                const active = index === currentIndex;
                const answered = !!answers[id];

                return (
                  <Pressable
                    key={id}
                    onPress={() => onJump(index)}
                    className={`h-11 w-11 items-center justify-center rounded-xl border ${
                      active
                        ? "border-primary-600 bg-primary-600"
                        : answered
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        active
                          ? "text-white"
                          : answered
                            ? "text-green-700"
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

          <View className="mt-5 gap-2 border-t border-gray-100 pt-4">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Answered</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {answeredCount}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Remaining</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {questionIds.length - answeredCount}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Total</Text>
              <Text className="text-sm font-semibold text-gray-900">
                {questionIds.length}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
