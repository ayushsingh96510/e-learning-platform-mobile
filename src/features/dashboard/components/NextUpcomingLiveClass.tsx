
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ChevronRight, CalendarClock } from "lucide-react-native";

import { useLiveSessions } from "../../live-class/hooks/useLiveSessions";
import UpcomingLiveClassCard from "./UpcomingLiveClassCard";
import type { StudentStackParamList } from "@/navigation/types";

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

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      void refetch();
    }, 30_000);

    return () => clearInterval(timer);
  }, [refetch]);

  const nextClass = useMemo(() => {
    return [...items]
      .filter((item) => {
        if (item.status !== "SCHEDULED" || !item.scheduledAt) {
          return false;
        }

        const scheduledAt = new Date(item.scheduledAt).getTime();

        return Number.isFinite(scheduledAt) && scheduledAt > now;
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledAt!).getTime() -
          new Date(b.scheduledAt!).getTime(),
      )[0] ?? null;
  }, [items, now]);

  const openLiveClasses = () => {
    navigation.navigate("MainTabs", {
      screen: "LiveClasses",
    } as never);
  };

  return (
    <View className="mt-6">
      {/* Section header */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-lg font-bold text-gray-900">
            Upcoming Live Class
          </Text>

          <Text className="mt-0.5 text-xs text-gray-500">
            Your next scheduled session
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View all live classes"
          onPress={openLiveClasses}
          className="flex-row items-center"
        >
          <Text className="text-sm font-semibold text-blue-600">
            View all
          </Text>

          <ChevronRight size={17} color="#2563EB" />
        </Pressable>
      </View>

      {/* Loading */}
      {loading && !refreshing ? (
        <View className="items-center rounded-2xl border border-gray-100 bg-white p-5">
          <ActivityIndicator size="small" color="#2563EB" />

          <Text className="mt-2 text-sm text-gray-500">
            Loading upcoming class...
          </Text>
        </View>
      ) : error ? (
        /* Error */
        <View className="rounded-2xl border border-gray-100 bg-white p-4">
          <Text className="text-sm font-semibold text-gray-800">
            Couldn't load upcoming classes
          </Text>

          <Text className="mt-1 text-sm text-gray-500">
            {error}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => void refetch()}
            className="mt-3 self-start rounded-lg bg-blue-50 px-3 py-2"
          >
            <Text className="text-sm font-semibold text-blue-600">
              Try again
            </Text>
          </Pressable>
        </View>
      ) : !nextClass ? (
        /* Empty state */
        <View className="rounded-2xl border border-gray-100 bg-white p-5">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <CalendarClock size={21} color="#2563FF" />
          </View>

          <Text className="mt-3 text-sm font-semibold text-gray-900">
            No upcoming classes
          </Text>

          <Text className="mt-1 text-sm leading-5 text-gray-500">
            Your next scheduled live class will appear here.
          </Text>
        </View>
      ) : (
        /* Compact upcoming class card */
        <UpcomingLiveClassCard
          item={nextClass}
          now={now}
        />
      )}
    </View>
  );
}
