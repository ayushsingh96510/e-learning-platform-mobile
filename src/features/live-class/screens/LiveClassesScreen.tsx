import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";

import LiveClassCard from "../components/LiveClassCard";
import { useLiveSessions } from "../hooks/useLiveSessions";
import type { LiveClassTab } from "../types";

const tabs: { label: string; value: LiveClassTab }[] = [
  {
    label: "Live",
    value: "LIVE",
  },
  {
    label: "Upcoming",
    value: "UPCOMING",
  },
  {
    label: "Completed",
    value: "COMPLETED",
  },
];

const SECTION: Record<LiveClassTab, { title: string; empty: string }> = {
  LIVE: {
    title: "Live Classes",
    empty: "No class is live right now.",
  },
  UPCOMING: {
    title: "Upcoming Classes",
    empty: "No upcoming classes found.",
  },
  COMPLETED: {
    title: "Completed Classes",
    empty: "No classes have been completed yet.",
  },
};

// Formats a Date as YYYY-MM-DD in the device's local timezone.
const toYmd = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Parses YYYY-MM-DD into a local Date (avoids UTC shifting).
const fromYmd = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export default function LiveClassesScreen() {
  const [activeTab, setActiveTab] =
    useState<LiveClassTab>("LIVE");

  // Upcoming filter. Defaults to today, same as the web app.
  const [startDate, setStartDate] = useState<string>(toYmd(new Date()));
  const [endDate, setEndDate] = useState<string>("");
  const [picker, setPicker] = useState<"start" | "end" | null>(null);

  const {
    items,
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,
    loadMore,
    refetch,
    reload,
  } = useLiveSessions(activeTab, startDate, endDate);

  const handleJoin = (roomName: string) => {
    // TODO: navigate to the class room screen (added in the next step).
    Alert.alert("Join class", `Room: ${roomName}`);
  };

  const pickerValue =
    picker === "start" && startDate
      ? fromYmd(startDate)
      : picker === "end" && endDate
        ? fromYmd(endDate)
        : new Date();

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8 pt-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refetch} />
        }
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">
            Live Classes
          </Text>

          <Text className="mt-1 text-sm text-gray-500">
            Join your live learning sessions
          </Text>
        </View>

        {/* Tabs */}
        <View className="mb-6 flex-row rounded-xl bg-gray-200 p-1">
          {tabs.map((tab) => {
            const active = activeTab === tab.value;

            return (
              <Pressable
                key={tab.value}
                onPress={() => setActiveTab(tab.value)}
                className={`flex-1 items-center rounded-lg py-3 ${
                  active ? "bg-white" : ""
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    active
                      ? "text-primary-600"
                      : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Date filter (Upcoming only) */}
        {activeTab === "UPCOMING" && (
          <View className="mb-6 flex-row items-center gap-2">
            <Pressable
              onPress={() => setPicker("start")}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-3"
            >
              <Text className="text-sm text-gray-700">
                {startDate || "From"}
              </Text>
            </Pressable>

            <Text className="text-gray-400">to</Text>

            <Pressable
              onPress={() => setPicker("end")}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-3"
            >
              <Text className="text-sm text-gray-700">
                {endDate || "To"}
              </Text>
            </Pressable>

            {(startDate || endDate) && (
              <Pressable
                onPress={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                <Text className="px-1 text-sm font-semibold text-primary-600">
                  Clear
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Section title */}
        <Text className="mb-3 text-lg font-bold text-gray-900">
          {SECTION[activeTab].title}
        </Text>

        {/* Content */}
        {loading ? (
          <View className="items-center rounded-2xl border border-gray-100 bg-white p-6">
            <ActivityIndicator />
          </View>
        ) : error ? (
          <View className="items-center rounded-2xl border border-gray-100 bg-white p-6">
            <Text className="text-center text-sm text-red-600">{error}</Text>

            <Pressable
              onPress={reload}
              className="mt-4 rounded-xl bg-primary-600 px-6 py-3"
            >
              <Text className="font-semibold text-white">Retry</Text>
            </Pressable>
          </View>
        ) : items.length === 0 ? (
          <View className="rounded-2xl border border-gray-100 bg-white p-6">
            <Text className="text-center text-sm leading-5 text-gray-500">
              {SECTION[activeTab].empty}
            </Text>
          </View>
        ) : (
          <>
            {items.map((item) => (
              <LiveClassCard
                key={item.id}
                item={item}
                variant={activeTab}
                onJoin={handleJoin}
              />
            ))}

            {hasMore && (
              <Pressable
                onPress={loadMore}
                disabled={loadingMore}
                className="items-center rounded-xl bg-gray-200 py-3"
              >
                {loadingMore ? (
                  <ActivityIndicator />
                ) : (
                  <Text className="text-sm font-semibold text-gray-700">
                    Load more
                  </Text>
                )}
              </Pressable>
            )}
          </>
        )}
      </ScrollView>

      {picker && (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          onChange={(_, date) => {
            const which = picker;
            setPicker(null);
            if (!date) return;
            if (which === "start") setStartDate(toYmd(date));
            else setEndDate(toYmd(date));
          }}
        />
      )}
    </View>
  );
}