import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Video, UserRound } from "lucide-react-native";
import type { LiveSession } from "../../live-class/types";

interface Props {
  item: LiveSession;
  onJoin?: () => void;
  joining?: boolean;
}

export default function ActiveLiveClassCard({
  item,
  onJoin,
  joining = false,
}: Props) {
  return (
    <View className="mr-3 w-[280px] rounded-2xl border border-red-100 bg-white p-4">
      {/* Header */}
      <View className="flex-row items-start">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-red-50">
          <Video size={20} color="#FF4545" strokeWidth={2} />
        </View>

        <View className="flex-1">
          <View className="mb-1 self-start flex-row items-center rounded-full bg-red-50 px-2 py-0.5">
            <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            <Text className="text-[10px] font-bold tracking-wide text-red-600">
              LIVE NOW
            </Text>
          </View>

          <Text
            className="text-sm font-bold text-gray-900"
            numberOfLines={2}
          >
            {item.title}
          </Text>

          {!!item.subject?.name && (
            <Text
              className="mt-0.5 text-xs text-gray-500"
              numberOfLines={1}
            >
              {item.subject.name}
            </Text>
          )}
        </View>
      </View>

      {/* Teacher */}
      {!!item.teacher?.name && (
        <View className="mt-3 flex-row items-center">
          <UserRound size={14} color="#8B5CF6" strokeWidth={2} />

          <Text
            className="ml-2 flex-1 text-xs text-gray-600"
            numberOfLines={1}
          >
            {item.teacher.name}
          </Text>
        </View>
      )}

      {/* Join action */}
      <Pressable
        onPress={() => {
          if (!joining && item.roomName) {
            onJoin?.();
          }
        }}
        disabled={joining || !item.roomName}
        accessibilityRole="button"
        accessibilityLabel={
          joining ? "Joining class" : "Join live class"
        }
        className={`mt-3 flex-row items-center justify-center rounded-xl bg-red-500 py-2.5 ${
          joining || !item.roomName ? "opacity-60" : ""
        }`}
      >
        {joining ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text className="ml-2 text-sm font-semibold text-white">
              Joining...
            </Text>
          </>
        ) : (
          <>
            <Video size={16} color="#FFFFFF" strokeWidth={2} />
            <Text className="ml-2 text-sm font-semibold text-white">
              Join Class
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
