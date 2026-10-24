import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowRight, LockKeyhole, Users } from "lucide-react-native";

import { useJoinRoom } from "../../group-study/hooks/useJoinRoom";
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
        Alert.alert(
          "Could not join",
          error ?? "Please try again.",
        );
        return;
      }

      navigation.navigate("GroupStudyRoom", {
        roomName: room.roomName,
        joinData: data,
      });
    } finally {
      setJoining(false);
    }
  };

  return (
    <View className="mt-6">
      <View className="mb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-bold text-gray-900">
            My Study Rooms
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            Continue learning with your group
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-1"
          onPress={() =>
            navigation.navigate("MainTabs", {
              screen: "GroupStudy",
            } as never)
          }
        >
          <Text className="text-sm font-semibold text-blue-600">
            View all
          </Text>
          <ArrowRight size={16} color="#2563EB" />
        </Pressable>
      </View>

      {rooms.length === 0 ? (
        <View className="rounded-2xl border border-gray-100 bg-white p-5">
          <Text className="font-semibold text-gray-800">
            No study rooms to show
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            Join or create a study room to get started.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 8 }}
        >
          {rooms.map((room) => {
            const isLive = room.status === "LIVE";
            const isJoining = joiningRoom === room.roomName;

            return (
              <View
                key={room.id ?? room.roomName}
                className="mr-3 w-72 rounded-2xl border border-gray-100 bg-white p-4"
              >
                <View className="mb-3 flex-row items-start justify-between">
                  <View className="mr-2 flex-1">
                    <Text
                      numberOfLines={1}
                      className="text-base font-bold text-gray-900"
                    >
                      {room.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      className="mt-1 text-sm text-gray-500"
                    >
                      {room.subject}
                    </Text>
                  </View>

                  <View
                    className={`rounded-full px-2 py-1 ${
                      isLive ? "bg-green-50" : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isLive ? "text-green-700" : "text-gray-600"
                      }`}
                    >
                      {isLive ? "LIVE NOW" : room.status}
                    </Text>
                  </View>
                </View>

                {room.description ? (
                  <Text
                    numberOfLines={2}
                    className="mb-3 text-sm leading-5 text-gray-600"
                  >
                    {room.description}
                  </Text>
                ) : (
                  <View className="mb-3 h-10" />
                )}

                <View className="mb-4 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Users size={15} color="#6B7280" />
                    <Text className="ml-1 text-sm text-gray-500">
                      {room.members?.length ?? room.memberCount ?? 0} members
                    </Text>
                  </View>

                  {room.isPrivate && (
                    <View className="flex-row items-center">
                      <LockKeyhole size={14} color="#6B7280" />
                      <Text className="ml-1 text-xs text-gray-500">
                        Private
                      </Text>
                    </View>
                  )}
                </View>

                <Pressable
                  disabled={
                    room.status === "ENDED" || joiningRoom !== null || joining
                  }
                  onPress={() => handleJoin(room)}
                  className={`min-h-11 flex-row items-center justify-center rounded-xl px-3 ${
                    room.status === "ENDED" ||
                    joiningRoom !== null ||
                    joining
                      ? "bg-gray-200"
                      : "bg-blue-600"
                  }`}
                >
                  {isJoining ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text
                      className={`font-semibold ${
                        room.status === "ENDED" ||
                        joiningRoom !== null ||
                        joining
                          ? "text-gray-500"
                          : "text-white"
                      }`}
                    >
                      {room.status === "ENDED"
                        ? "Room Ended"
                        : "Join Study Room"}
                    </Text>
                  )}
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
