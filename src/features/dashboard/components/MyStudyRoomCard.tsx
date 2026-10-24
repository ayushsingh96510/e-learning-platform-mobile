import { ActivityIndicator, Pressable, Text, View } from "react-native";
import {
  UsersRound,
  LockKeyhole,
  Globe,
  BookOpen,
  DoorOpen,
  CheckCircle2,
} from "lucide-react-native";
import type { StudyRoom } from "../../group-study/types";

interface Props {
  room: StudyRoom;
  joining?: boolean;
  onJoin: (room: StudyRoom) => void;
}

export default function MyStudyRoomCard({
  room,
  joining = false,
  onJoin,
}: Props) {
  const isLive = room.status === "LIVE";
  const isEnded = room.status === "ENDED";

  const memberCount = room.members?.length ?? room.memberCount ?? 0;
  const disabled = isEnded || joining;

  return (
    <View className="mr-3 w-[280px] rounded-2xl border border-gray-100 bg-white p-4">
      {/* Header */}
      <View className="flex-row items-start">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
          <UsersRound size={20} color="#A020F0" strokeWidth={2} />
        </View>

        <View className="flex-1 pr-1">
          <Text
            className="text-sm font-bold text-gray-900"
            numberOfLines={2}
          >
            {room.name}
          </Text>

          {!!room.subject && (
            <View className="mt-1 flex-row items-center">
              <BookOpen size={12} color="#6B7280" />

              <Text
                className="ml-1 flex-1 text-xs text-gray-500"
                numberOfLines={1}
              >
                {room.subject}
              </Text>
            </View>
          )}
        </View>

        <View
          className={`flex-row items-center rounded-full px-2 py-1 ${
            isLive ? "bg-emerald-50" : isEnded ? "bg-gray-100" : "bg-amber-50"
          }`}
        >
          {isLive && (
            <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
          )}

          <Text
            className={`text-[10px] font-bold ${
              isLive
                ? "text-emerald-700"
                : isEnded
                  ? "text-gray-500"
                  : "text-amber-700"
            }`}
          >
            {isLive ? "LIVE NOW" : room.status}
          </Text>
        </View>
      </View>

      {/* Room details */}
      <View className="mt-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <UsersRound size={15} color="#6B7280" />

          <Text className="ml-1.5 text-xs text-gray-600">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </Text>
        </View>

        <View className="flex-row items-center">
          {room.isPrivate ? (
            <LockKeyhole size={14} color="#8B5CF6" />
          ) : (
            <Globe size={14} color="#8B5CF6" />
          )}

          <Text className="ml-1 text-xs text-gray-600">
            {room.isPrivate ? "Private" : "Public"}
          </Text>
        </View>
      </View>

      {/* Join action */}
      <Pressable
        onPress={() => onJoin(room)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={
          isEnded
            ? "Room ended"
            : joining
              ? "Joining study room"
              : "Join study room"
        }
        className={`mt-4 min-h-11 flex-row items-center justify-center rounded-xl px-3 ${
          isEnded ? "bg-gray-100" : "bg-blue-600"
        } ${joining ? "opacity-60" : ""}`}
      >
        {joining ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" />

            <Text className="ml-2 text-sm font-semibold text-white">
              Joining...
            </Text>
          </>
        ) : isEnded ? (
          <>
            <CheckCircle2 size={16} color="#9CA3AF" />

            <Text className="ml-2 text-sm font-semibold text-gray-400">
              Room Ended
            </Text>
          </>
        ) : (
          <>
            <DoorOpen size={17} color="#FFFFFF" />

            <Text className="ml-2 text-sm font-semibold text-white">
              Join Study Room
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
