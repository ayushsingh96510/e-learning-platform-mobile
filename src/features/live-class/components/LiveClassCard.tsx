import { ActivityIndicator, Pressable, Text, View } from "react-native";
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

  // join window is [scheduled - 5min, scheduled + 15min]
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
    Boolean
  ) as string[];

  // Helper: what message to show for upcoming classes that can't join yet
  const upcomingHint = (() => {
    if (!isUpcoming || showJoin) return null;
    if (!scheduledMs) return "Join link will be available soon";
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
            isLive ? "bg-red-50" : "bg-gray-100"
          }`}
        >
          <Text className="text-xl">🎥</Text>
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
            <Text className="text-xs font-bold text-red-600">LIVE NOW</Text>
          </View>
        )}
      </View>

      {/* Tags */}
      {tags.length > 0 && (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {tags.map((tag) => (
            <View key={tag} className="rounded-full bg-primary-50 px-3 py-1">
              <Text className="text-xs font-medium text-primary-600">
                {tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Description (completed classes only) */}
      {isCompleted && !!item.description && (
        <Text className="mt-3 text-sm text-gray-600" numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {/* Meta */}
      <View className="mt-3 gap-1">
        {!!item.teacher?.name && (
          <Text className="text-sm text-gray-700">
            👨‍🏫 {item.teacher.name}
          </Text>
        )}
        {!!when && <Text className="text-sm text-gray-500">🗓 {when}</Text>}
        <Text className="text-sm text-gray-500">
          ⏱ {item.durationMinutes} min
        </Text>
      </View>

      {/* Action */}
      {showJoin && (
        <Pressable
          onPress={() => !joining && onJoin?.()}
          disabled={joining}
          className={`mt-4 flex-row items-center justify-center rounded-xl py-3 ${
            isLive ? "bg-red-50" : "bg-primary-600"
          } ${joining ? "opacity-60" : ""}`}
        >
          {joining ? (
            <>
              <ActivityIndicator
                size="small"
                color={isLive ? "#dc2626" : "#ffffff"}
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
            <Text
              className={`font-semibold ${
                isLive ? "text-red-600" : "text-white"
              }`}
            >
              Join Room
            </Text>
          )}
        </Pressable>
      )}

      {/* FIXED: accurate hint based on join window state */}
      {!!upcomingHint && (
        <Text className="mt-4 text-center text-xs text-gray-400">
          {upcomingHint}
        </Text>
      )}
    </View>
  );
}