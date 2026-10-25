import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import {
  ClipboardList,
  CheckCircle2,
  CircleAlert,
  AlertTriangle,
  X,
  ChevronRight,
  Send,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const remaining = Math.max(0, totalQuestions - answeredQuestions);
  const insets = useSafeAreaInsets();

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
        <View
          className="rounded-t-3xl border-t border-gray-100 bg-white px-5 pt-3"
          style={{
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          {/* Sheet handle */}
          <View className="mb-5 h-1 w-10 self-center rounded-full bg-gray-300" />

          {/* Header */}
          <View className="flex-row items-center">
            <View className="mr-3 h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <ClipboardList size={24} color="#2563FF" />
            </View>

            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                Submit Question Paper
              </Text>
              <Text className="mt-1 text-sm text-gray-500">
                Review your progress before submitting.
              </Text>
            </View>
          </View>

          {/* Warning */}
          <View className="mt-4 flex-row items-start rounded-xl border border-amber-100 bg-amber-50 p-3">
            <AlertTriangle
              size={18}
              color="#D97706"
              style={{ marginTop: 1 }}
            />
            <Text className="ml-2 flex-1 text-xs leading-5 text-amber-800">
              Once submitted, you will not be able to change your answers.
            </Text>
          </View>

          {/* Statistics */}
          <View className="mt-5 gap-3">
            {/* Total */}
            <View className="flex-row items-center rounded-xl border border-blue-100 bg-blue-50 p-3">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-white">
                <ClipboardList size={20} color="#2563FF" />
              </View>

              <Text className="flex-1 text-sm font-medium text-blue-800">
                Total Questions
              </Text>

              <Text className="text-lg font-bold text-blue-700">
                {totalQuestions}
              </Text>
            </View>

            {/* Answered */}
            <View className="flex-row items-center rounded-xl border border-emerald-100 bg-emerald-50 p-3">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-white">
                <CheckCircle2 size={20} color="#059669" />
              </View>

              <Text className="flex-1 text-sm font-medium text-emerald-800">
                Answered
              </Text>

              <Text className="text-lg font-bold text-emerald-700">
                {answeredQuestions}
              </Text>
            </View>

            {/* Remaining */}
            <View
              className={`flex-row items-center rounded-xl border p-3 ${remaining > 0
                  ? "border-amber-100 bg-amber-50"
                  : "border-emerald-100 bg-emerald-50"
                }`}
            >
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-lg bg-white">
                {remaining > 0 ? (
                  <CircleAlert size={20} color="#D97706" />
                ) : (
                  <CheckCircle2 size={20} color="#059669" />
                )}
              </View>

              <Text
                className={`flex-1 text-sm font-medium ${remaining > 0
                    ? "text-amber-800"
                    : "text-emerald-800"
                  }`}
              >
                Remaining
              </Text>

              <Text
                className={`text-lg font-bold ${remaining > 0
                    ? "text-amber-700"
                    : "text-emerald-700"
                  }`}
              >
                {remaining}
              </Text>
            </View>

            {/* Unanswered warning */}
            {remaining > 0 && (
              <View className="flex-row items-start rounded-xl border border-red-100 bg-red-50 p-3">
                <AlertTriangle
                  size={17}
                  color="#DC2626"
                  style={{ marginTop: 1 }}
                />

                <Text className="ml-2 flex-1 text-sm leading-5 text-red-700">
                  You still have {remaining} unanswered{" "}
                  {remaining === 1 ? "question" : "questions"}. You can
                  return to your attempt before submitting.
                </Text>
              </View>
            )}

            {/* Submission error */}
            {!!error && (
              <View className="flex-row items-start rounded-xl border border-red-200 bg-red-50 p-3">
                <CircleAlert
                  size={18}
                  color="#DC2626"
                  style={{ marginTop: 1 }}
                />

                <Text className="ml-2 flex-1 text-sm leading-5 text-red-700">
                  {error}
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View className="mt-5 flex-row gap-3">
            <Pressable
              onPress={onCancel}
              disabled={submitting}
              accessibilityRole="button"
              className={`flex-1 flex-row items-center justify-center rounded-xl border border-gray-200 bg-white py-3 ${submitting ? "opacity-50" : ""
                }`}
            >
              <X size={17} color="#4B5563" />
              <Text className="ml-1.5 font-semibold text-gray-700">
                Continue
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={submitting}
              accessibilityRole="button"
              className={`flex-1 flex-row items-center justify-center rounded-xl py-3 ${submitting ? "bg-blue-400" : "bg-blue-600"
                }`}
            >
              {submitting ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="ml-2 font-semibold text-white">
                    Submitting...
                  </Text>
                </>
              ) : (
                <>
                  {error ? (
                    <Send size={17} color="#FFFFFF" />
                  ) : (
                    <CheckCircle2 size={17} color="#FFFFFF" />
                  )}

                  <Text className="ml-2 font-semibold text-white">
                    {error ? "Retry" : "Submit Paper"}
                  </Text>

                  {!error && (
                    <ChevronRight
                      size={17}
                      color="#FFFFFF"
                      style={{ marginLeft: 3 }}
                    />
                  )}
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
