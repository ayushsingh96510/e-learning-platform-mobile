import type { ReactNode } from "react";
import {
  Modal,
  Platform,
  Pressable,
  View,
  Keyboard,
} from "react-native";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onClose: () => void;
  heightPercent?: number;
  children: ReactNode;
}

export default function BottomSheet({
  visible,
  onClose,
  heightPercent = 70,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      navigationBarTranslucent={false}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "flex-end" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
          onPress={onClose}
        />

        <View
          className="rounded-t-3xl bg-gray-50"
          style={{
            height: `${heightPercent}%`,
            overflow: "hidden",
            paddingBottom:
              Platform.OS === "android" && !keyboardVisible
                ? insets.bottom
                : 0,
          }}
        >
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}