import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import BottomSheet from "./BottomSheet";
import ChatPanel from "./ChatPanel";
import type { ChatMessage } from "../classroom/types";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSend: (content: string, type: ChatMessage["type"]) => Promise<boolean>;
  onTyping: () => void;
}

export default function ChatSheet({ visible, onClose, onSend, onTyping }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} heightPercent={80}>
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
          <Text className="text-sm font-semibold text-gray-900">Class chat</Text>
        </View>

        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={20} color="#6B7280" />
        </Pressable>
      </View>

      <ChatPanel onSend={onSend} onTyping={onTyping} />
    </BottomSheet>
  );
}