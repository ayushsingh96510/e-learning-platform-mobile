import type { ReactNode } from "react";
import {
  Modal,
  Platform,
  Pressable,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

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
        style={{ flex: 1, justifyContent: "flex-end" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} onPress={onClose} />

        <View
          className="rounded-t-3xl bg-gray-50"
          style={{ height: `${heightPercent}%`, overflow: "hidden", }}
        >
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}