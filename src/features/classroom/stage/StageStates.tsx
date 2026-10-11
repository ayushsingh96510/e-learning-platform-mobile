import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useClassRoom } from "../ClassRoomContext";

export function StageConnecting() {
  return (
    <View className="h-full w-full items-center justify-center gap-3 p-4">
      <ActivityIndicator size="large" color="#7C3AED" />
      <View className="items-center">
        <Text className="text-sm font-medium text-slate-700">
          Preparing classroom...
        </Text>
        <Text className="mt-1 text-xs text-slate-400">Establishing connection</Text>
      </View>
    </View>
  );
}

export function StageReplayPending() {
  return (
    <View className="h-full w-full items-center justify-center gap-3 p-4">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-blue-500">
        <Ionicons name="play" size={28} color="#FFFFFF" />
      </View>
      <View className="items-center">
        <Text className="text-sm font-medium text-slate-700">
          Preparing replay session
        </Text>
        <Text className="mt-1 text-xs text-slate-400">
          The replay stream is starting soon
        </Text>
      </View>
    </View>
  );
}

// Student view only. The teacher/admin variant is not needed in this app.
export function StageBuffering() {
  const { state } = useClassRoom();
  const teacher = state.teacherIdentity;

  return (
    <View className="h-full w-full items-center justify-center gap-1 p-4">
      <Text className="text-center text-sm font-medium text-slate-700">
        {teacher ? `${teacher.name} is presenting` : "Presenter is presenting"}
      </Text>
      <Text className="text-center text-xs text-slate-400">
        Please wait while the presenter shares their screen or turns on their camera.
      </Text>
    </View>
  );
}

export function StageError({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="h-full w-full items-center justify-center gap-3 p-4">
      <View className="h-14 w-14 items-center justify-center rounded-full border border-red-200 bg-red-50">
        <Ionicons name="warning-outline" size={26} color="#EF4444" />
      </View>
      <View className="items-center">
        <Text className="text-sm font-medium text-slate-700">
          Unable to receive video
        </Text>
        <Text className="mt-1 text-center text-xs text-slate-400">
          The connection was lost. Please try reconnecting.
        </Text>
      </View>
      <Pressable
        onPress={onRetry}
        className="flex-row items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2"
      >
        <Ionicons name="refresh" size={14} color="#334155" />
        <Text className="text-sm font-medium text-slate-700">Reconnect</Text>
      </Pressable>
    </View>
  );
}