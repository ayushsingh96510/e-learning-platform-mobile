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
import LiveClassJoinSheet from "../components/LiveClassJoinSheet";
import { useLiveSessions } from "../hooks/useLiveSessions";
import type { LiveClassTab, LiveSession } from "../types";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { StudentStackParamList } from "@/navigation/types";

import { requestMediaPermissions } from "@/features/classroom/permissions";

import { useAuth } from "@/features/auth/AuthContext";

const tabs: { label: string; value: LiveClassTab }[] = [
  { label: "Live", value: "LIVE" },
  { label: "Upcoming", value: "UPCOMING" },
  { label: "Completed", value: "COMPLETED" },
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

const toYmd = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const fromYmd = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export default function LiveClassesScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();

  const { user } = useAuth();
  const userName = user?.personalInfo?.name ?? null; 

  const [activeTab, setActiveTab] = useState<LiveClassTab>("LIVE");
  const [startDate, setStartDate] = useState<string>(toYmd(new Date()));
  const [endDate, setEndDate] = useState<string>("");
  const [picker, setPicker] = useState<"start" | "end" | null>(null);

  const [selectedClass, setSelectedClass] = useState<LiveSession | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [joining, setJoining] = useState(false);

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

  const handleJoin = (item: LiveSession) => {
    if (!item.roomName) return;
    setSelectedClass(item);
    setSheetVisible(true);
  };

  const confirmJoin = async () => {
    if (!selectedClass?.roomName) return;

    try {
      setJoining(true);

      const result = await requestMediaPermissions();
      const denied = !result.camera || !result.microphone;

      if (denied) {
        Alert.alert(
          "Camera and microphone access",
          result.blocked
            ? "Permissions are blocked. Your teacher may not be able to turn on your camera or microphone. You can enable them later from device settings."
            : "Camera or microphone permission was denied. You can still join the class, but the teacher may not be able to turn them on.",
          [
            {
              text: "Join anyway",
              onPress: () => {
                navigation.navigate("ClassRoom", {
                  roomName: selectedClass.roomName!,
                });
                closeSheet();
              },
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
        return;
      }

      navigation.navigate("ClassRoom", { roomName: selectedClass.roomName });
      closeSheet();
    } catch (e) {
      console.warn("[join] failed:", e);
      Alert.alert("Join failed", "Unable to join the class. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  const closeSheet = () => {
    setSheetVisible(false);
    setSelectedClass(null);
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
                    active ? "text-primary-600" : "text-gray-500"
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

        <Text className="mb-3 text-lg font-bold text-gray-900">
          {SECTION[activeTab].title}
        </Text>

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
                onJoin={() => handleJoin(item)}
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

      <LiveClassJoinSheet
        visible={sheetVisible}
        item={selectedClass}
        onClose={closeSheet}
        onJoin={confirmJoin}
        joining={joining}
        userName={userName}
      />
    </View>
  );
}