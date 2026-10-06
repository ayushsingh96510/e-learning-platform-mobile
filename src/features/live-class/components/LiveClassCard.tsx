import { Pressable, Text, View } from "react-native";
import type { LiveClassTab, LiveSession } from "../types";

const JOIN_WINDOW_MS = 5 * 60 * 1000;

interface Props {
  item: LiveSession;
  variant: LiveClassTab;
  onJoin?: (roomName: string) => void;
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

export default function LiveClassCard({ item, variant, onJoin }: Props) {
  const isLive = variant === "LIVE";
  const isUpcoming = variant === "UPCOMING";
  const isCompleted = variant === "COMPLETED";

  // Upcoming classes open for joining 5 minutes before the scheduled time.
  const canJoinUpcoming =
    isUpcoming &&
    !!item.scheduledAt &&
    new Date(item.scheduledAt).getTime() - Date.now() <= JOIN_WINDOW_MS;

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

      {/* Description (completed classes only, like the web app) */}
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
          onPress={() => item.roomName && onJoin?.(item.roomName)}
          className={`mt-4 items-center rounded-xl py-3 ${
            isLive ? "bg-red-50" : "bg-primary-600"
          }`}
        >
          <Text
            className={`font-semibold ${
              isLive ? "text-red-600" : "text-white"
            }`}
          >
            Join Room
          </Text>
        </Pressable>
      )}

      {isUpcoming && !showJoin && (
        <Text className="mt-4 text-center text-xs text-gray-400">
          Available 5 minutes before class start
        </Text>
      )}
    </View>
  );
}