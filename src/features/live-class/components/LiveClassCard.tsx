import { ActivityIndicator, Pressable, Text, View } from "react-native";
import {
  Video,
  UserRound,
  CalendarDays,
  Clock3,
} from "lucide-react-native";
import type { LiveClassTab, LiveSession } from "../types";

// Join window: opens 5 minutes before start, closes 15 minutes after start.
const JOIN_WINDOW_BEFORE_MS = 5 * 60 * 1000;
const JOIN_GRACE_AFTER_MS = 15 * 60 * 1000;

interface Props {
  item: LiveSession;
  variant: LiveClassTab;
  onJoin?: () => void;
  joining?: boolean;
}

function formatDateTime(iso?: string | null) {
  if (!iso) return null;

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LiveClassCard({
  item,
  variant,
  onJoin,
  joining = false,
}: Props) {
  const isLive = variant === "LIVE";
  const isUpcoming = variant === "UPCOMING";
  const isCompleted = variant === "COMPLETED";

  const scheduledMs = item.scheduledAt
    ? new Date(item.scheduledAt).getTime()
    : null;

  const canJoinUpcoming =
    isUpcoming &&
    scheduledMs !== null &&
    Date.now() >= scheduledMs - JOIN_WINDOW_BEFORE_MS &&
    Date.now() <= scheduledMs + JOIN_GRACE_AFTER_MS;

  const showJoin = !!item.roomName && (isLive || canJoinUpcoming);

  const timeSource = isLive
    ? item.startedAt ?? item.scheduledAt
    : isCompleted
      ? item.endedAt ?? item.startedAt ?? item.scheduledAt
      : item.scheduledAt;

  const when = formatDateTime(timeSource);

  const tags = [item.program?.name, item.batch?.name].filter(
    Boolean,
  ) as string[];

  const upcomingHint = (() => {
    if (!isUpcoming || showJoin) return null;
    if (scheduledMs === null) return "Join link will be available soon";

    if (Date.now() < scheduledMs - JOIN_WINDOW_BEFORE_MS) {
      return "Available 5 minutes before class start";
    }

    return "Join window has closed";
  })();

  return (
    <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
      {/* Header */}
      <View className="flex-row items-start">
        <View
          className={`mr-3 h-11 w-11 items-center justify-center rounded-xl ${
            isLive ? "bg-red-50" : "bg-blue-50"
          }`}
        >
          <Video
            size={21}
            color={isLive ? "#FF4545" : "#2563FF"}
            strokeWidth={2}
          />
        </View>

        <View className="flex-1 pr-2">
          <Text className="text-base font-bold text-gray-900">
            {item.title}
          </Text>

          {!!item.subject?.name && (
            <Text className="mt-0.5 text-sm text-gray-500">
              {item.subject.name}
            </Text>
          )}
        </View>

        {isLive && (
          <View className="flex-row items-center rounded-full bg-red-50 px-2.5 py-1">
            <View className="mr-1.5 h-2 w-2 rounded-full bg-red-600" />
            <Text className="text-xs font-bold text-red-600">
              LIVE NOW
            </Text>
          </View>
        )}
      </View>

      {/* Program and batch tags */}
      {tags.length > 0 && (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {tags.map((tag) => (
            <View
              key={tag}
              className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1"
            >
              <Text className="text-xs font-medium text-blue-700">
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Description */}
      {isCompleted && !!item.description && (
        <Text className="mt-3 text-sm text-gray-600" numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {/* Class details */}
      <View className="mt-4 gap-3">
        {!!item.teacher?.name && (
          <View className="flex-row items-center">
            <View className="mr-2.5 h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
              <UserRound size={16} color="#A020F0" strokeWidth={2} />
            </View>

            <Text className="flex-1 text-sm text-gray-700">
              {item.teacher.name}
            </Text>
          </View>
        )}

        {!!when && (
          <View className="flex-row items-center">
            <View className="mr-2.5 h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <CalendarDays size={16} color="#2563FF" strokeWidth={2} />
            </View>

            <Text className="flex-1 text-sm text-gray-600">
              {when}
            </Text>
          </View>
        )}

        <View className="flex-row items-center">
          <View className="mr-2.5 h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
            <Clock3 size={16} color="#F08C00" strokeWidth={2} />
          </View>

          <Text className="flex-1 text-sm text-gray-600">
            {item.durationMinutes} min
          </Text>
        </View>
      </View>

      {/* Join action */}
      {showJoin && (
        <Pressable
          onPress={() => !joining && onJoin?.()}
          disabled={joining}
          accessibilityRole="button"
          accessibilityLabel={joining ? "Joining class" : "Join class room"}
          className={`mt-4 flex-row items-center justify-center rounded-xl py-3 ${
            isLive ? "bg-red-50" : "bg-blue-600"
          } ${joining ? "opacity-60" : ""}`}
        >
          {joining ? (
            <>
              <ActivityIndicator
                size="small"
                color={isLive ? "#FF4545" : "#FFFFFF"}
              />
              <Text
                className={`ml-2 font-semibold ${
                  isLive ? "text-red-600" : "text-white"
                }`}
              >
                Joining...
              </Text>
            </>
          ) : (
            <>
              <Video
                size={18}
                color={isLive ? "#FF4545" : "#FFFFFF"}
                strokeWidth={2}
              />
              <Text
                className={`ml-2 font-semibold ${
                  isLive ? "text-red-600" : "text-white"
                }`}
              >
                Join Room
              </Text>
            </>
          )}
        </Pressable>
      )}

      {/* Upcoming class hint */}
      {!!upcomingHint && (
        <Text className="mt-4 text-center text-xs text-gray-400">
          {upcomingHint}
        </Text>
      )}
    </View>
  );
}
