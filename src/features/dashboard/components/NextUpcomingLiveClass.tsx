
import { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowRight, CalendarClock, Clock3, UserRound } from "lucide-react-native";

import { useLiveSessions } from "../../live-class/hooks/useLiveSessions";
import type { StudentStackParamList } from "@/navigation/types";

function formatSchedule(value: string | null) {
  if (!value) return "Schedule not available";

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

function getTimeUntil(value: string | null) {
  if (!value) return "";

  const scheduledAt = new Date(value).getTime();
  const diff = scheduledAt - Date.now();

  if (!Number.isFinite(scheduledAt) || diff <= 0) {
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

export default function NextUpcomingLiveClass() {
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();

  const {
    items,
    loading,
    refreshing,
    error,
    refetch,
  } = useLiveSessions("UPCOMING");

  useEffect(() => {
    const timer = setInterval(() => {
      void refetch();
    }, 30000);

    return () => clearInterval(timer);
  }, [refetch]);

  const nextClass = useMemo(() => {
    const now = Date.now();

    return [...items]
      .filter(
        (item) =>
          item.status === "SCHEDULED" &&
          !!item.scheduledAt &&
          new Date(item.scheduledAt).getTime() >= now,
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt!).getTime() -
          new Date(b.scheduledAt!).getTime(),
      )[0] ?? null;
  }, [items]);

  const openLiveClasses = () => {
    navigation.navigate("MainTabs", {
      screen: "LiveClasses",
    } as never);
  };

  return (
    <View className="mt-6">
      <View className="mb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-bold text-gray-900">
            Next Upcoming Live Class
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            Your next scheduled session
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={openLiveClasses}
          className="flex-row items-center gap-1"
        >
          <Text className="text-sm font-semibold text-blue-600">
            View all
          </Text>
          <ArrowRight size={16} color="#2563EB" />
        </Pressable>
      </View>

      {loading && !refreshing ? (
        <View className="items-center rounded-2xl border border-gray-100 bg-white p-6">
          <ActivityIndicator color="#2563EB" />
          <Text className="mt-2 text-sm text-gray-500">
            Loading upcoming class...
          </Text>
        </View>
      ) : error ? (
        <View className="rounded-2xl border border-gray-100 bg-white p-4">
          <Text className="font-semibold text-gray-800">
            Couldn't load upcoming classes
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            {error}
          </Text>
          <Pressable onPress={() => void refetch()} className="mt-3 self-start">
            <Text className="font-semibold text-blue-600">
              Try again
            </Text>
          </Pressable>
        </View>
      ) : !nextClass ? (
        <View className="rounded-2xl border border-gray-100 bg-white p-5">
          <View className="mb-3 h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
            <CalendarClock size={22} color="#2563EB" />
          </View>
          <Text className="font-semibold text-gray-900">
            No upcoming classes
          </Text>
          <Text className="mt-1 text-sm leading-5 text-gray-500">
            Your next scheduled live class will appear here.
          </Text>
        </View>
      ) : (
        <View className="overflow-hidden rounded-2xl border border-blue-100 bg-white">
          <View className="bg-blue-600 px-4 py-3">
            <Text className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              Coming up next
            </Text>
            <Text className="mt-1 text-lg font-bold text-white">
              {getTimeUntil(nextClass.scheduledAt)}
            </Text>
          </View>

          <View className="p-4">
            <Text className="text-lg font-bold text-gray-900">
              {nextClass.title}
            </Text>

            <Text className="mt-1 text-sm text-gray-500">
              {nextClass.subject?.name ?? "Subject not specified"}
            </Text>

            <View className="mt-4 gap-3">
              <View className="flex-row items-center">
                <CalendarClock size={17} color="#6B7280" />
                <Text className="ml-2 flex-1 text-sm text-gray-700">
                  {formatSchedule(nextClass.scheduledAt)}
                </Text>
              </View>

              <View className="flex-row items-center">
                <UserRound size={17} color="#6B7280" />
                <Text className="ml-2 flex-1 text-sm text-gray-700">
                  {nextClass.teacher?.name ?? "Teacher not specified"}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Clock3 size={17} color="#6B7280" />
                <Text className="ml-2 flex-1 text-sm text-gray-700">
                  {nextClass.durationMinutes} minutes
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={openLiveClasses}
              className="mt-5 min-h-11 flex-row items-center justify-center rounded-xl bg-blue-600 px-4"
            >
              <Text className="font-semibold text-white">
                View Class Details
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
