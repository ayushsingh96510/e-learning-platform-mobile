import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ChatMessage } from "../types";

interface Props {
  visible: boolean;
  messages: ChatMessage[];
  localIdentity: string;
  onSend: (text: string) => void;
  onClose: () => void;
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatSheet({
  visible,
  messages,
  localIdentity,
  onSend,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [text, setText] = useState("");

  const handleSend = () => {
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText("");
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        className="flex-1 bg-gray-50"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 pb-3"
          style={{ paddingTop: insets.top + 12 }}
        >
          <Text className="text-lg font-bold text-gray-900">Chat</Text>

          <Pressable
            onPress={onClose}
            hitSlop={12}
            className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
          >
            <Text className="text-base text-gray-700">✕</Text>
          </Pressable>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="p-4"
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-sm text-gray-500">No messages yet</Text>
              <Text className="mt-1 text-xs text-gray-400">
                Say hi to get the conversation going 👋
              </Text>
            </View>
          ) : (
            messages.map((msg) => {
              const mine = msg.senderId === localIdentity;

              return (
                <View
                  key={msg.id}
                  className={`mb-4 ${mine ? "items-end" : "items-start"}`}
                >
                  <View className="mb-1 flex-row items-baseline gap-2">
                    <Text className="text-xs font-semibold text-gray-700">
                      {mine ? "You" : msg.senderName}
                    </Text>
                    <Text className="text-[10px] text-gray-400">
                      {formatTime(msg.timestamp)}
                    </Text>
                  </View>

                  <View
                    className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                      mine
                        ? "rounded-tr-sm bg-primary-600"
                        : "rounded-tl-sm border border-gray-100 bg-white"
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        mine ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {msg.message}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Input */}
        <View
          className="flex-row items-center gap-2 border-t border-gray-100 bg-white px-3 pt-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message"
            placeholderTextColor="#9CA3AF"
            returnKeyType="send"
            onSubmitEditing={handleSend}
            className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900"
          />

          <Pressable
            onPress={handleSend}
            className="h-10 w-10 items-center justify-center rounded-full bg-primary-600"
          >
            <Text className="text-base text-white">➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
