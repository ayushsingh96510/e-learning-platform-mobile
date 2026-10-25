import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ChevronRight, UsersRound } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useJoinRoom } from "../../group-study/hooks/useJoinRoom";
import MyStudyRoomCard from "./MyStudyRoomCard";
import type { StudyRoom } from "../../group-study/types";
import type { StudentStackParamList } from "@/navigation/types";

type Props = {
  rooms: StudyRoom[];
};

export default function MyStudyRooms({ rooms }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();

  const { join, joiningRoom } = useJoinRoom();
  const [joining, setJoining] = useState(false);

  const handleJoin = async (room: StudyRoom) => {
    if (joiningRoom || joining) return;

    setJoining(true);

    try {
      const { data, error } = await join(room.roomName);

      if (error || !data) {
        Alert.alert("Could not join", error ?? "Please try again.");
        return;
      }

      navigation.navigate("GroupStudyRoom", {
        roomName: room.roomName,
        joinData: data,
      });
    } catch {
      Alert.alert("Could not join", "Please try again.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <View className="mt-6">
      {/* Section header */}
      <View className="mb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-bold text-gray-900">
            My Study Rooms
          </Text>

          <Text className="mt-0.5 text-xs text-gray-500">
            Continue learning with your group
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View all study rooms"
          className="flex-row items-center"
          onPress={() =>
            navigation.navigate("MainTabs", {
              screen: "GroupStudy",
            } as never)
          }
        >
          <Text className="text-sm font-semibold text-blue-600">
            View all
          </Text>

          <ChevronRight size={17} color="#2563EB" />
        </Pressable>
      </View>

      {/* Empty state */}
      {rooms.length === 0 ? (
        <View className="items-center rounded-2xl border border-gray-100 bg-white px-5 py-6">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-purple-50">
            <UsersRound size={21} color="#A020F0" />
          </View>

          <Text className="mt-3 text-sm font-semibold text-gray-800">
            No study rooms yet
          </Text>

          <Text className="mt-1 text-center text-xs leading-5 text-gray-500">
            Join or create a study room to get started.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={{ paddingRight: 4 }}
        >
          {rooms.map((room) => {
            const isJoiningThisRoom = joiningRoom === room.roomName;

            return (
              <MyStudyRoomCard
                key={room.id ?? room.roomName}
                room={room}
                joining={isJoiningThisRoom || joining}
                onJoin={handleJoin}
              />
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
