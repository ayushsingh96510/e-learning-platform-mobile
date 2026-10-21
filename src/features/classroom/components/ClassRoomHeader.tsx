import { Feather } from "@expo/vector-icons";
import { useConnectionState, useParticipants } from "@livekit/react-native";
import { ConnectionState } from "livekit-client";
import { Text, View } from "react-native";

import { useClassRoom } from "../ClassRoomContext";

const CONNECTION_CONFIG: Record<
  string,
  {
    label: string;
    icon: "wifi" | "wifi-off";
    color: string;
  }
> = {
  [ConnectionState.Connected]: {
    label: "Connected",
    icon: "wifi",
    color: "#15803D",
  },
  [ConnectionState.Connecting]: {
    label: "Connecting",
    icon: "wifi",
    color: "#A16207",
  },
  [ConnectionState.Reconnecting]: {
    label: "Reconnecting",
    icon: "wifi",
    color: "#A16207",
  },
  [ConnectionState.Disconnected]: {
    label: "Disconnected",
    icon: "wifi-off",
    color: "#DC2626",
  },
};

interface Props {
  onLeave: () => void;
  roomError?: string | null;
}

export default function ClassRoomHeader({
  onLeave,
  roomError,
}: Props) {
  const { state } = useClassRoom();
  const connectionState = useConnectionState();
  const participants = useParticipants();

  const connection =
    CONNECTION_CONFIG[connectionState] ??
    CONNECTION_CONFIG[ConnectionState.Connecting];

  const teacherId = state.teacherIdentity?.id;

  const studentCount = participants.filter(
    (p) => p.identity?.trim() && p.identity !== teacherId
  ).length;

  return (
    <View className="border-b border-gray-100 bg-white px-4 py-2">
      {/* Compact title row */}
      <View className="flex-row items-center">
        <View className="mr-2.5 h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
          <Feather name="video" size={17} color="#2563FF" />
        </View>

        <View className="mr-2 flex-1">
          <Text
            className="text-sm font-bold text-gray-900"
            numberOfLines={1}
          >
            {state.title ?? "Live Class"}
          </Text>

          <View className="mt-0.5 flex-row items-center">
            <Text className="text-[11px] text-gray-500">
              {studentCount}{" "}
              {studentCount === 1 ? "student" : "students"}
            </Text>

            <Text className="mx-1.5 text-[11px] text-gray-300">
              ·
            </Text>

            <Feather
              name={connection.icon}
              size={10}
              color={connection.color}
            />

            <Text
              className="ml-1 text-[11px]"
              style={{ color: connection.color }}
              numberOfLines={1}
            >
              {connection.label}
            </Text>
          </View>
        </View>

        {/* Live and Recording badges */}
        <View className="items-end gap-1.5">
          {/* Live badge */}
          <View className="w-14 flex-row items-center justify-center gap-1 rounded-full bg-red-50 py-1">
            <Feather name="radio" size={11} color="#DC2626" />
            <Text className="text-[10px] font-bold tracking-wide text-red-600">
              LIVE
            </Text>
          </View>

          {/* Recording badge */}
          {state.isRecordingEnabled && (
            <View className="w-14 flex-row items-center justify-center gap-1 rounded-full bg-[#800000] py-1">
              <Feather name="disc" size={11} color="#FCA5A5" />
              <Text className="text-[10px] font-bold tracking-wide text-white">
                REC
              </Text>
            </View>
          )}
        </View>

      </View>

      {/* Error appears only when needed */}
      {!!roomError && (
        <View className="mt-2 flex-row items-start rounded-lg border border-red-100 bg-red-50 p-2">
          <Feather
            name="alert-circle"
            size={14}
            color="#DC2626"
            style={{ marginTop: 1 }}
          />

          <Text className="ml-2 flex-1 text-xs leading-4 text-red-700">
            {roomError}
          </Text>
        </View>
      )}
    </View>
  );
}