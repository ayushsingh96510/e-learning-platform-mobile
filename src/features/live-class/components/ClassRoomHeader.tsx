import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useConnectionState, useParticipants } from "@livekit/react-native";
import { ConnectionState } from "livekit-client";

import { useClassRoom } from "../classroom/ClassRoomContext";

const CONNECTION_CONFIG: Record<
  string,
  { label: string; icon: "wifi" | "wifi-off"; color: string }
> = {
  [ConnectionState.Connected]: { label: "Connected", icon: "wifi", color: "#22C55E" },
  [ConnectionState.Connecting]: { label: "Connecting...", icon: "wifi", color: "#EAB308" },
  [ConnectionState.Reconnecting]: { label: "Reconnecting...", icon: "wifi", color: "#EAB308" },
  [ConnectionState.Disconnected]: { label: "Disconnected", icon: "wifi-off", color: "#EF4444" },
};

interface Props {
  onLeave: () => void;
  roomError?: string | null;
}

export default function ClassRoomHeader({ onLeave, roomError }: Props) {
  const { state } = useClassRoom();
  const connectionState = useConnectionState();
  const participants = useParticipants();

  // Unknown states (for example a signal reconnect) are shown as "Connecting...".
  const connection =
    CONNECTION_CONFIG[connectionState] ?? CONNECTION_CONFIG[ConnectionState.Connecting];

  // Same rule as the web header: everyone except the teacher counts as a student.
  const teacherId = state.teacherIdentity?.id;
  const studentCount = participants.filter(
    (p) => p.identity && p.identity.trim() !== "" && p.identity !== teacherId
  ).length;

  return (
    <View className="border-b border-gray-100 bg-white px-4 py-3">
      <View className="flex-row items-center justify-between">
        <Text
          className="mr-3 flex-1 text-sm font-semibold text-violet-600"
          numberOfLines={1}
        >
          {state.title ?? "Live Class"}
        </Text>

        {/* Temporary: leave moves to the controls bar in the next step. */}
        <Pressable onPress={onLeave} className="rounded-full bg-red-50 px-4 py-2">
          <Text className="text-sm font-semibold text-red-600">Leave</Text>
        </Pressable>
      </View>

      <View className="mt-2 flex-row flex-wrap items-center gap-2">
        {state.isRecordingEnabled && (
          <View className="flex-row items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1">
            <View className="h-2 w-2 rounded-full bg-red-500" />
            <Text className="text-xs font-semibold tracking-wide text-red-600">REC</Text>
          </View>
        )}

        <View className="flex-row items-center gap-1 rounded-full bg-red-500 px-2.5 py-1">
          <View className="h-1.5 w-1.5 rounded-full bg-white" />
          <Text className="text-xs font-bold uppercase tracking-wide text-white">LIVE</Text>
        </View>

        <View
          className="flex-row items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1"
        >
          <Feather name={connection.icon} size={12} color={connection.color} />
          <Text className="text-xs font-medium" style={{ color: connection.color }}>
            {connection.label}
          </Text>
        </View>

        <Text className="text-xs text-gray-400">{studentCount} students</Text>
      </View>

      {roomError ? (
        <Text className="mt-1 text-xs text-red-600" numberOfLines={2}>
          {roomError}
        </Text>
      ) : null}
    </View>
  );
}