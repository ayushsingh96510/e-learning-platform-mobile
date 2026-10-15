import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import type { StudyRoom } from "../types";

interface Props {
  room: StudyRoom;
  joining: boolean;
  onJoin: (room: StudyRoom) => void;
}

const STATUS_STYLES: Record<string, { box: string; text: string }> = {
  LIVE: { box: "bg-green-50", text: "text-green-700" },
  ACTIVE: { box: "bg-amber-50", text: "text-amber-700" },
  ENDED: { box: "bg-gray-100", text: "text-gray-500" },
};

function CreatorAvatar({ name, uri }: { name?: string; uri?: string }) {
  if (uri) {
    return <Image source={{ uri }} className="h-6 w-6 rounded-full" />;
  }

  return (
    <View className="h-6 w-6 items-center justify-center rounded-full bg-primary-50">
      <Text className="text-xs font-semibold text-primary-600">
        {(name ?? "?").charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

export default function RoomCard({ room, joining, onJoin }: Props) {
  const ended = room.status === "ENDED";
  const live = room.status === "LIVE";
  const status = STATUS_STYLES[room.status] ?? STATUS_STYLES.ACTIVE;

  return (
    <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
      {/* Header */}
      <View className="flex-row items-start">
        <View className="flex-1 pr-2">
          <Text className="text-base font-bold text-gray-900" numberOfLines={2}>
            {room.name}
          </Text>

          {!!room.subject && (
            <Text className="mt-0.5 text-sm text-gray-500">{room.subject}</Text>
          )}
        </View>

        <View
          className={`flex-row items-center rounded-full px-2.5 py-1 ${status.box}`}
        >
          {live && <View className="mr-1.5 h-2 w-2 rounded-full bg-green-500" />}
          <Text className={`text-xs font-semibold ${status.text}`}>
            {room.status}
          </Text>
        </View>
      </View>

      {!!room.description && (
        <Text className="mt-3 text-sm text-gray-600" numberOfLines={2}>
          {room.description}
        </Text>
      )}

      {/* Meta */}
      <View className="mt-3 flex-row items-center gap-4">
        <Text className="text-sm text-gray-500">
          👥 {room.memberCount} student{room.memberCount === 1 ? "" : "s"}
        </Text>
        <Text className="text-sm text-gray-500">
          {room.isPrivate ? "🔒 Private" : "🌐 Public"}
        </Text>
      </View>

      <View className="mt-3 flex-row items-center">
        <Text className="mr-2 text-sm text-gray-500">Created by</Text>
        <CreatorAvatar
          name={room.createdBy?.name}
          uri={room.createdBy?.profileImage}
        />
        <Text className="ml-2 flex-1 text-sm font-medium text-gray-900" numberOfLines={1}>
          {room.createdBy?.name}
        </Text>
      </View>

      {/* Action */}
      <Pressable
        onPress={() => onJoin(room)}
        disabled={ended || joining}
        className={`mt-4 items-center rounded-xl py-3 ${
          ended ? "bg-gray-100" : joining ? "bg-primary-400" : "bg-primary-600"
        }`}
      >
        {joining ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text
            className={`font-semibold ${ended ? "text-gray-400" : "text-white"}`}
          >
            {ended ? "Ended" : "Join Room"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
