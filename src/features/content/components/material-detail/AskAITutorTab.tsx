import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EventSource from "react-native-sse";

import api from "@/api/axios";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface AskAITutorTabProps {
  materialId: string;
}

const STARTER_PROMPTS = [
  "Explain the key concepts covered in this lecture",
  "Summarize this lecture in simple terms",
  "Show me a practical example of how to apply this",
];

function getErrorMessage(type: string, message?: string): string {
  switch (type) {
    case "NoRelevantContentError":
      return "I couldn't find relevant information in this material for that question. Try asking about a specific topic from the lecture.";

    case "MaterialNotReadyForChatError":
      return "This material is not ready for AI chat yet. Please try again later.";

    case "InternalError":
      return message || "The AI tutor encountered a server error. Please try again.";

    default:
      return message || "Something went wrong. Please try again.";
  }
}

export default function AskAITutorTab({
  materialId,
}: AskAITutorTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const listRef = useRef<ScrollView>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const sendingRef = useRef(false);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      sendingRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Each material starts a separate chat.
    setMessages([]);
    setInput("");
    setError("");
  }, [materialId]);

  function updateAssistantMessage(
    assistantId: string,
    update: (current: string) => string,
  ) {
    setMessages((previous) =>
      previous.map((message) =>
        message.id === assistantId
          ? { ...message, content: update(message.content) }
          : message,
      ),
    );
  }

  function finishRequest(requestId: number) {
    if (requestId !== requestIdRef.current) return;

    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    sendingRef.current = false;

    if (mountedRef.current) {
      setSending(false);
    }
  }

  async function sendMessage(text?: string) {
    const question = (text ?? input).trim();

    if (!question || sendingRef.current || !materialId) return;

    sendingRef.current = true;
    setSending(true);
    setError("");
    setInput("");

    const requestId = ++requestIdRef.current;
    const assistantId = `assistant-${requestId}`;

    setMessages((previous) => [
      ...previous,
      {
        id: `user-${requestId}`,
        role: "user",
        content: question,
      },
      {
        id: assistantId,
        role: "assistant",
        content: "",
      },
    ]);

    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const refreshToken = await AsyncStorage.getItem("refreshToken");
      const baseURL =
        api.defaults.baseURL || process.env.EXPO_PUBLIC_API_BASE_URL;

      if (!baseURL) {
        throw new Error("API base URL is not configured.");
      }

      if (requestId !== requestIdRef.current || !mountedRef.current) {
        return;
      }

      const headers: Record<string, string> = {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
        "X-Client-Type": "mobile",
      };

      // Match the existing mobile Axios authentication convention.
      if (accessToken && refreshToken) {
        headers.Cookie =
          `accessToken=${accessToken}; refreshToken=${refreshToken}`;
      }

      const url = `${baseURL.replace(/\/+$/, "")}/ai-tutor/chat`;

      const source = new EventSource(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          mode: "LECTURE",
          message: question,
          materialId,
        }),
        pollingInterval: 0,
      });

      eventSourceRef.current = source;

      source.addEventListener("message", (event) => {
        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current ||
          !event.data
        ) {
          return;
        }

        try {
          const payload = JSON.parse(event.data) as {
            type?: string;
            text?: string;
            content?: string;
            delta?: string;
            message?: string;
          };

          if (payload.type === "text") {
            const chunk =
              payload.text ?? payload.content ?? payload.delta ?? "";

            if (chunk) {
              updateAssistantMessage(
                assistantId,
                (current) => current + chunk,
              );
            }

            return;
          }

          if (payload.type === "done") {
            finishRequest(requestId);
            return;
          }

          if (
            payload.type === "NoRelevantContentError" ||
            payload.type === "MaterialNotReadyForChatError" ||
            payload.type === "InternalError"
          ) {
            const errorMessage = getErrorMessage(
              payload.type,
              payload.message,
            );

            updateAssistantMessage(assistantId, () => errorMessage);
            finishRequest(requestId);
          }
        } catch {
          // Ignore non-JSON keepalive or event payloads.
        }
      });

      source.addEventListener("error", () => {
        if (
          !mountedRef.current ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        const message = "Unable to connect to the AI tutor. Please try again.";

        setMessages((previous) =>
          previous.map((item) =>
            item.id === assistantId && !item.content
              ? { ...item, content: message }
              : item,
          ),
        );

        setError(message);
        finishRequest(requestId);
      });
    } catch (err: unknown) {
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      const message =
        err instanceof Error
          ? err.message
          : "Unable to send your question.";

      setError(message);

      setMessages((previous) =>
        previous.map((item) =>
          item.id === assistantId
            ? { ...item, content: message }
            : item,
        ),
      );

      finishRequest(requestId);
    }
  }

  return (
    <View className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <ScrollView
        ref={listRef}
        style={{ height: 400, flexGrow: 0 }}
        contentContainerStyle={{ padding: 14, gap: 12 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: true })
        }
      >
        {/* AI Tutor header */}
        <View className="flex-row items-center border-b border-gray-100 pb-3">
          <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
            <Ionicons name="sparkles" size={23} color="#4F46E5" />
          </View>

          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900">
              AI Tutor
            </Text>
            <Text className="mt-1 text-xs text-gray-500">
              Ask questions about this material
            </Text>
          </View>

          {sending && (
            <ActivityIndicator size="small" color="#4F46E5" />
          )}
        </View>
        {messages.length === 0 && (
          <View className="py-3">
            <Text className="text-base font-semibold text-gray-900">
              What would you like to learn?
            </Text>
            <Text className="mt-2 text-sm leading-5 text-gray-500">
              Ask a question or choose one of these suggestions to get started.
            </Text>

            <View className="mt-4 gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <TouchableOpacity
                  key={prompt}
                  disabled={sending}
                  onPress={() => void sendMessage(prompt)}
                  className="flex-row items-center rounded-xl border border-indigo-100 bg-indigo-50 p-3"
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={18}
                    color="#4F46E5"
                  />
                  <Text className="ml-3 flex-1 text-sm leading-5 text-indigo-800">
                    {prompt}
                  </Text>
                  <Ionicons
                    name="arrow-up-outline"
                    size={18}
                    color="#4F46E5"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <View
              key={message.id}
              className={`max-w-[90%] rounded-2xl p-3 ${isUser
                ? "self-end rounded-br-sm bg-indigo-600"
                : "self-start rounded-bl-sm bg-gray-100"
                }`}
            >
              <Text
                className={`text-sm leading-6 ${isUser ? "text-white" : "text-gray-800"
                  }`}
              >
                {message.content ||
                  (sending && !isUser ? "Thinking..." : "")}
              </Text>
            </View>
          );
        })}

        {!!error && (
          <Text className="text-xs leading-5 text-red-600">
            If the response did not complete, you can send your question again.
          </Text>
        )}
      </ScrollView>


      <View style={{ backgroundColor: "#FFFFFF" }}>
        <View className="border-t border-gray-100 bg-white px-3 pt-2 pb-3">
          <View className="flex-row items-end rounded-xl border border-gray-200 bg-gray-50 px-3">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask your tutor..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={2000}
              editable={!sending}
              className="max-h-28 min-h-10 flex-1 py-2 text-sm text-gray-900"
              accessibilityLabel="Ask AI Tutor a question"
            />

            <TouchableOpacity
              disabled={!input.trim() || sending}
              onPress={() => void sendMessage()}
              className={`mb-1 ml-2 h-9 w-9 items-center justify-center rounded-lg ${input.trim() && !sending ? "bg-indigo-600" : "bg-gray-300"
                }`}
              accessibilityRole="button"
              accessibilityLabel="Send question"
            >
              <Ionicons name="send" size={17} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

    </View>
  );
}