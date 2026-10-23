import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import {
  UsersRound,
  LockKeyhole,
  Globe,
  BookOpen,
  UserRound,
  DoorOpen,
  CheckCircle2,
} from "lucide-react-native";
import type { StudyRoom } from "../types";

interface Props {
  room: StudyRoom;
  joining: boolean;
  onJoin: (room: StudyRoom) => void;
}

const STATUS_STYLES: Record<
  string,
  { box: string; text: string; color: string }
> = {
  LIVE: {
    box: "bg-emerald-50",
    text: "text-emerald-700",
    color: "#059669",
  },
  ACTIVE: {
    box: "bg-amber-50",
    text: "text-amber-700",
    color: "#F08C00",
  },
  ENDED: {
    box: "bg-gray-100",
    text: "text-gray-500",
    color: "#9CA3AF",
  },
};

function CreatorAvatar({ name, uri }: { name?: string; uri?: string }) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        className="h-8 w-8 rounded-full border border-gray-100"
      />
    );
  }

  return (
    <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-50">
      <UserRound size={16} color="#2563FF" strokeWidth={2} />
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
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
          <UsersRound size={21} color="#A020F0" strokeWidth={2} />
        </View>

        <View className="flex-1 pr-2">
          <Text
            className="text-base font-bold text-gray-900"
            numberOfLines={2}
          >
            {room.name}
          </Text>

          {!!room.subject && (
            <View className="mt-1 flex-row items-center">
              <BookOpen size={13} color="#6B7280" />
              <Text className="ml-1 text-sm text-gray-500">
                {room.subject}
              </Text>
            </View>
          )}
        </View>

        <View
          className={`flex-row items-center rounded-full px-2.5 py-1 ${status.box}`}
        >
          {live && (
            <View className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500" />
          )}
          <Text className={`text-xs font-semibold ${status.text}`}>
            {room.status}
          </Text>
        </View>
      </View>

      {/* Description */}
      {!!room.description && (
        <Text className="mt-3 text-sm leading-5 text-gray-600" numberOfLines={2}>
          {room.description}
        </Text>
      )}

      {/* Room Details */}
      <View className="mt-4 flex-row gap-3">
        <View className="flex-1 flex-row items-center rounded-xl border border-blue-100 bg-blue-50/70 p-3">
          <UsersRound size={17} color="#2563FF" />
          <View className="ml-2 flex-1">
            <Text className="text-xs text-gray-500">Members</Text>
            <Text className="mt-0.5 text-sm font-semibold text-gray-900">
              {room.memberCount} student{room.memberCount === 1 ? "" : "s"}
            </Text>
          </View>
        </View>

        <View className="flex-1 flex-row items-center rounded-xl border border-purple-100 bg-purple-50/70 p-3">
          {room.isPrivate ? (
            <LockKeyhole size={17} color="#A020F0" />
          ) : (
            <Globe size={17} color="#A020F0" />
          )}

          <View className="ml-2 flex-1">
            <Text className="text-xs text-gray-500">Visibility</Text>
            <Text className="mt-0.5 text-sm font-semibold text-gray-900">
              {room.isPrivate ? "Private" : "Public"}
            </Text>
          </View>
        </View>
      </View>

      {/* Creator */}
      <View className="mt-4 flex-row items-center border-t border-gray-100 pt-3">
        <Text className="mr-2 text-xs text-gray-500">Created by</Text>

        <CreatorAvatar
          name={room.createdBy?.name}
          uri={room.createdBy?.profileImage}
        />

        <Text
          className="ml-2 flex-1 text-sm font-semibold text-gray-900"
          numberOfLines={1}
        >
          {room.createdBy?.name || "Unknown"}
        </Text>
      </View>

      {/* Action */}
      <Pressable
        onPress={() => onJoin(room)}
        disabled={ended || joining}
        accessibilityRole="button"
        className={`mt-4 flex-row items-center justify-center rounded-xl py-3 ${
          ended
            ? "bg-gray-100"
            : joining
              ? "bg-blue-400"
              : "bg-blue-600"
        }`}
      >
        {joining ? (
          <>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text className="ml-2 font-semibold text-white">
              Joining...
            </Text>
          </>
        ) : ended ? (
          <>
            <CheckCircle2 size={17} color="#9CA3AF" />
            <Text className="ml-2 font-semibold text-gray-400">
              Room Ended
            </Text>
          </>
        ) : (
          <>
            <DoorOpen size={18} color="#FFFFFF" />
            <Text className="ml-2 font-semibold text-white">
              Join Study Room
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}