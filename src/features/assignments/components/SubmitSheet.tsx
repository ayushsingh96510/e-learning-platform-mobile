import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";

interface Props {
  visible: boolean;
  totalQuestions: number;
  answeredQuestions: number;
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function SubmitSheet({
  visible,
  totalQuestions,
  answeredQuestions,
  submitting,
  error,
  onCancel,
  onConfirm,
}: Props) {
  const remaining = totalQuestions - answeredQuestions;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (!submitting) onCancel();
      }}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="rounded-t-3xl bg-white px-5 pb-8 pt-3">
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-gray-300" />

          <Text className="text-lg font-bold text-gray-900">
            Submit Question Paper
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            Once submitted, you will not be able to change your answers.
          </Text>

          <View className="mt-5 gap-3">
            <View className="flex-row items-center justify-between rounded-xl border border-gray-100 p-3">
              <Text className="text-sm text-gray-700">Total Questions</Text>
              <Text className="font-semibold text-gray-900">
                {totalQuestions}
              </Text>
            </View>

            <View className="flex-row items-center justify-between rounded-xl border border-green-200 bg-green-50 p-3">
              <Text className="text-sm text-green-700">Answered</Text>
              <Text className="font-semibold text-green-700">
                {answeredQuestions}
              </Text>
            </View>

            <View className="flex-row items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-3">
              <Text className="text-sm text-amber-700">Remaining</Text>
              <Text className="font-semibold text-amber-700">{remaining}</Text>
            </View>

            {remaining > 0 && (
              <View className="rounded-xl border border-red-200 bg-red-50 p-3">
                <Text className="text-sm text-red-700">
                  You still have {remaining} unanswered{" "}
                  {remaining === 1 ? "question" : "questions"}.
                </Text>
              </View>
            )}

            {!!error && (
              <View className="rounded-xl border border-red-200 bg-red-50 p-3">
                <Text className="text-sm text-red-700">{error}</Text>
              </View>
            )}
          </View>

          <View className="mt-5 flex-row gap-3">
            <Pressable
              onPress={onCancel}
              disabled={submitting}
              className="flex-1 items-center rounded-xl border border-gray-200 py-3"
            >
              <Text className="font-semibold text-gray-700">
                Continue Attempt
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={submitting}
              className={`flex-1 items-center rounded-xl py-3 ${
                submitting ? "bg-primary-400" : "bg-primary-600"
              }`}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-semibold text-white">
                  {error ? "Retry" : "Submit Paper"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
