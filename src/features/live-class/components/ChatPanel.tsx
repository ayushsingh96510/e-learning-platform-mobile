import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useParticipants, useRoomContext } from "@livekit/react-native";

import { useClassRoom } from "../classroom/ClassRoomContext";
import type { ChatMessage, ChatTab } from "../classroom/types";

interface TabConfig {
  value: ChatTab;
  label: string;
  placeholder: string;
  empty: string;
  type: ChatMessage["type"];
}

const TABS: TabConfig[] = [
  { value: "chat", label: "Chat", placeholder: "Type a message...", empty: "No messages yet", type: "message" },
  { value: "qa", label: "Q&A", placeholder: "Ask a question...", empty: "No questions yet", type: "question" },
  { value: "announcements", label: "Announcements", placeholder: "Make an announcement...", empty: "No announcements yet", type: "announcement" },
];

interface Props {
  onSend: (content: string, type: ChatMessage["type"]) => Promise<boolean>;
  onTyping: () => void;
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageItem({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  return (
    <View className={`mb-3 px-4 ${isOwn ? "items-end" : "items-start"}`}>
      <View
        className={`max-w-[85%] rounded-2xl px-3 py-2 ${
          isOwn ? "bg-primary-600" : "border border-gray-100 bg-white"
        }`}
      >
        {!isOwn && (
          <Text className="mb-0.5 text-xs font-semibold text-primary-600">
            {message.senderName}
          </Text>
        )}
        <Text className={`text-sm ${isOwn ? "text-white" : "text-gray-900"}`}>
          {message.content}
        </Text>
      </View>
      <Text className="mt-1 text-[10px] text-gray-400">
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
}

export default function ChatPanel({ onSend, onTyping }: Props) {
  const room = useRoomContext();
  const participants = useParticipants();
  const { state, dispatch } = useClassRoom();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [text, setText] = useState("");

  // Chat and Q&A need isChatEnabled. Announcements are always visible.
  const visibleTabs = useMemo(
    () => TABS.filter((t) => t.value === "announcements" || state.isChatEnabled),
    [state.isChatEnabled]
  );
  const active =
    visibleTabs.find((t) => t.value === state.activeTab) ?? visibleTabs[0];

  const messages = useMemo(
    () => state.messages.filter((m) => m.type === active.type),
    [state.messages, active.type]
  );

  // This app is student-only, so announcements are always read-only.
  const readOnly = active.value === "announcements";

  const typingUsers = participants.filter(
    (p) =>
      p.attributes?.typing === "true" &&
      p.identity !== room.localParticipant.identity
  );

  useEffect(() => {
    setText("");
  }, [active.value]);

  const handleSend = async () => {
    const content = text;
    if (!content.trim()) return;
    setText("");
    await onSend(content, active.type);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Tabs */}
      <View className="mx-4 my-3 flex-row rounded-xl bg-gray-200 p-1">
        {visibleTabs.map((tab) => {
          const isActive = tab.value === active.value;
          return (
            <Pressable
              key={tab.value}
              onPress={() => dispatch({ type: "setActiveTab", payload: tab.value })}
              className={`flex-1 items-center rounded-lg py-2 ${isActive ? "bg-white" : ""}`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isActive ? "text-primary-600" : "text-gray-500"
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MessageItem
            message={item}
            isOwn={item.senderId === state.participantIdentity}
          />
        )}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View className="items-center px-6 pt-10">
            <Text className="text-sm text-gray-500">{active.empty}</Text>
          </View>
        }
        contentContainerStyle={{ paddingVertical: 8, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      />

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <Text className="px-4 py-1 text-xs italic text-gray-500">
          {typingUsers.length === 1
            ? `${typingUsers[0].name || "Someone"} is typing...`
            : `${typingUsers.length} students are typing...`}
        </Text>
      )}

      {/* Input */}
      {readOnly ? (
        <View className="border-t border-gray-100 bg-white px-4 py-3">
          <Text className="text-xs italic text-gray-500">
            Only teachers and admins can post announcements
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center gap-2 border-t border-gray-100 bg-white p-3">
          <TextInput
            value={text}
            onChangeText={(v) => {
              setText(v);
              onTyping();
            }}
            onSubmitEditing={handleSend}
            placeholder={active.placeholder}
            placeholderTextColor="#9CA3AF"
            returnKeyType="send"
            className="h-10 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900"
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim()}
            className={`h-10 w-10 items-center justify-center rounded-full bg-primary-600 ${
              text.trim() ? "" : "opacity-40"
            }`}
          >
            <Text className="text-base text-white">➤</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}