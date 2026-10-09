import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Sheet height as a percentage of the screen. */
  heightPercent?: number;
  children: ReactNode;
}

export default function BottomSheet({
  visible,
  onClose,
  heightPercent = 70,
  children,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1 justify-end bg-black/40"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable className="flex-1" onPress={onClose} />

        <View
          className="rounded-t-3xl bg-gray-50"
          style={{ height: `${heightPercent}%` }}
        >
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}