import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Plus } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import CreateRoomSheet from "../components/CreateRoomSheet";
import RoomCard from "../components/RoomCard";
import RoomStats from "../components/RoomStats";
import { useGroupStudyRooms } from "../hooks/useGroupStudyRooms";
import { useGroupStudyStats } from "../hooks/useGroupStudyStats";
import { useJoinRoom } from "../hooks/useJoinRoom";
import { useStudentBatchId } from "../hooks/useStudentBatchId";
import type { RoomFilter, StudyRoom } from "../types";
import type { StudentStackParamList } from "../../../navigation/StudentNavigator";

const FILTERS: { label: string; value: RoomFilter }[] = [
  { label: "All Rooms", value: "ALL" },
  { label: "My Rooms", value: "MY_ROOMS" },
  { label: "Joined", value: "JOINED" },
  { label: "Live Now", value: "LIVE" },
];

export default function GroupStudyScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState<RoomFilter>("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const batchId = useStudentBatchId();

  // Wait for the student to stop typing before calling the API.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const rooms = useGroupStudyRooms(filter, debouncedSearch);
  const stats = useGroupStudyStats();
  const { join, joiningRoom } = useJoinRoom();

  const { refetchSilently: refetchRoomsSilently } = rooms;
  const { refetch: refetchStats } = stats;

  // Refresh quietly when returning to this screen (e.g. after leaving a room),
  // but skip the first focus because the hooks already load on mount.
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      refetchRoomsSilently();
      refetchStats();
    }, [refetchRoomsSilently, refetchStats])
  );

  const handleRefresh = () => {
    rooms.refetch();
    refetchStats();
  };

  const handleJoin = async (room: StudyRoom) => {
    const { data, error } = await join(room.roomName);

    if (error || !data) {
      Alert.alert("Could not join", error ?? "Please try again.");
      return;
    }

    navigation.navigate("GroupStudyRoom", {
      roomName: room.roomName,
      joinData: data,
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8 pt-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={rooms.refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View className="mb-6 flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-2xl font-bold text-gray-900">Study Rooms</Text>
            <Text className="mt-1 text-sm text-gray-500">
              Join a peer study room with live audio and a shared whiteboard
            </Text>
          </View>

          <Pressable
            onPress={() => setCreateOpen(true)}
            className="flex-row items-center rounded-xl bg-primary-600 px-3 py-2.5 active:opacity-80"
          >
            <Plus size={17} color="#FFFFFF" strokeWidth={2.5} />

            <Text className="ml-1.5 text-sm font-semibold text-white">
              New Room
            </Text>
          </Pressable>
        </View>

        <RoomStats stats={stats.stats} loading={stats.loading} />

        {/* Search */}
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search rooms by name or subject"
          placeholderTextColor="#9CA3AF"
          autoCorrect={false}
          className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900"
        />

        {/* Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
          contentContainerClassName="gap-2"
        >
          {FILTERS.map((item) => {
            const active = filter === item.value;

            return (
              <Pressable
                key={item.value}
                onPress={() => setFilter(item.value)}
                className={`rounded-full border px-4 py-2 ${
                  active
                    ? "border-primary-600 bg-primary-600"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    active ? "text-white" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Content */}
        {rooms.loading ? (
          <View className="items-center rounded-2xl border border-gray-100 bg-white p-6">
            <ActivityIndicator />
          </View>
        ) : rooms.error ? (
          <View className="items-center rounded-2xl border border-gray-100 bg-white p-6">
            <Text className="text-center text-sm text-red-600">
              {rooms.error}
            </Text>

            <Pressable
              onPress={rooms.reload}
              className="mt-4 rounded-xl bg-primary-600 px-6 py-3"
            >
              <Text className="font-semibold text-white">Retry</Text>
            </Pressable>
          </View>
        ) : rooms.items.length === 0 ? (
          <View className="rounded-2xl border border-gray-100 bg-white p-6">
            <Text className="text-center text-sm font-semibold text-gray-900">
              No study rooms found
            </Text>
            <Text className="mt-1 text-center text-sm leading-5 text-gray-500">
              Try a different filter or search.
            </Text>
          </View>
        ) : (
          <>
            {rooms.items.map((room) => (
              <RoomCard
                key={room._id ?? room.id ?? room.roomName}
                room={room}
                joining={joiningRoom === room.roomName}
                onJoin={handleJoin}
              />
            ))}

            {rooms.hasMore && (
              <Pressable
                onPress={rooms.loadMore}
                disabled={rooms.loadingMore}
                className="items-center rounded-xl bg-gray-200 py-3"
              >
                {rooms.loadingMore ? (
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

      <CreateRoomSheet
        visible={createOpen}
        batchId={batchId}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          refetchRoomsSilently();
          refetchStats();
        }}
      />
    </View>
  );
}
