
import { Text, View } from "react-native";
import {
  CalendarClock,
  Clock3,
  UserRound,
} from "lucide-react-native";
import type { LiveSession } from "../../live-class/types";

interface Props {
  item: LiveSession;
  now: number;
}

function formatSchedule(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Schedule not available";
  }

  return date.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getTimeUntil(value: string, now: number) {
  const scheduledAt = new Date(value).getTime();
  const diff = scheduledAt - now;

  if (!Number.isFinite(scheduledAt)) {
    return "Time not available";
  }

  if (diff <= 0) {
    return "Starting soon";
  }

  const totalMinutes = Math.ceil(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `Starts in ${days}d ${hours}h`;
  if (hours > 0) return `Starts in ${hours}h ${minutes}m`;

  return `Starts in ${minutes}m`;
}

export default function UpcomingLiveClassCard({ item, now }: Props) {
  return (
    <View className="rounded-2xl border border-blue-100 bg-white p-4">
      {/* Countdown and class icon */}
      <View className="flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <CalendarClock size={20} color="#2563FF" strokeWidth={2} />
        </View>

        <View className="flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Coming up next
          </Text>

          <Text className="mt-0.5 text-sm font-bold text-gray-900">
            {getTimeUntil(item.scheduledAt!, now)}
          </Text>
        </View>

        <View className="rounded-full bg-blue-50 px-2.5 py-1">
          <Text className="text-xs font-semibold text-blue-700">
            UPCOMING
          </Text>
        </View>
      </View>

      {/* Class information */}
      <Text
        className="mt-3 text-base font-bold text-gray-900"
        numberOfLines={2}
      >
        {item.title}
      </Text>

      {!!item.subject?.name && (
        <Text className="mt-0.5 text-sm text-gray-500" numberOfLines={1}>
          {item.subject.name}
        </Text>
      )}

      {/* Schedule */}
      <View className="mt-4 flex-row items-start">
        <CalendarClock size={16} color="#2563FF" />

        <Text className="ml-2 flex-1 text-sm text-gray-700">
          {formatSchedule(item.scheduledAt!)}
        </Text>
      </View>

      {/* Teacher and duration */}
      <View className="mt-3 flex-row items-center">
        <View className="flex-1 flex-row items-center">
          <UserRound size={16} color="#8B5CF6" />

          <Text
            className="ml-2 flex-1 text-sm text-gray-600"
            numberOfLines={1}
          >
            {item.teacher?.name ?? "Teacher not specified"}
          </Text>
        </View>

        <View className="ml-2 flex-row items-center">
          <Clock3 size={15} color="#F08C00" />

          <Text className="ml-1.5 text-sm text-gray-600">
            {item.durationMinutes} min
          </Text>
        </View>
      </View>
    </View>
  );
}
