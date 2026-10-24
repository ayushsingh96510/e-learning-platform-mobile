import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { useCallback, useEffect, useRef } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AudioSession, LiveKitRoom } from "@livekit/react-native";

import RoomContent from "../components/RoomContent";
import { useEndRoom } from "../hooks/useEndRoom";
import { useRoomJoin } from "../hooks/useRoomJoin";
import type { StudentStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<StudentStackParamList, "GroupStudyRoom">;

export default function GroupStudyRoomScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { roomName, joinData: initialJoinData } = route.params;

  const { joinData, loading, error, retry } = useRoomJoin(
    roomName,
    initialJoinData
  );
  const { end, ending } = useEndRoom();

  // True once we are leaving on purpose, so no "disconnected" alert is shown.
  const leavingRef = useRef(false);

  // Native audio session (mobile replacement for RoomAudioRenderer).
  useEffect(() => {
    AudioSession.startAudioSession();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  // Covers the Android back button as well as the Leave button.
  useEffect(
    () =>
      navigation.addListener("beforeRemove", () => {
        leavingRef.current = true;
      }),
    [navigation]
  );

  const leave = useCallback(() => {
    leavingRef.current = true;
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);

  const handleEndRoom = useCallback(async () => {
    if (!joinData) return;

    const message = await end(joinData.room.id);
    if (message) {
      Alert.alert("Could not end the room", message);
      return;
    }
    leave();
  }, [joinData, end, leave]);

  const handleConnectionLost = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    Alert.alert(
      "Disconnected",
      "The study room has ended or the connection was lost.",
      [
        {
          text: "OK",
          onPress: () => {
            if (navigation.canGoBack()) navigation.goBack();
          },
        },
      ]
    );
  }, [navigation]);

  if (error) {
    return (
      <View
        className="flex-1 items-center justify-center bg-gray-50 px-6"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-center text-base text-red-600">{error}</Text>

        <Pressable
          onPress={retry}
          className="mt-4 rounded-xl bg-primary-600 px-6 py-3"
        >
          <Text className="font-semibold text-white">Retry</Text>
        </Pressable>
        <Pressable onPress={leave} className="mt-3 px-6 py-2">
          <Text className="font-semibold text-gray-600">Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (loading || !joinData) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator />
        <Text className="mt-3 text-sm text-gray-500">Joining study room...</Text>
      </View>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={joinData.liveKit.serverURL}
      token={joinData.liveKit.token}
      connect
      audio={false}
      video={false}
      options={{ adaptiveStream: true, dynacast: true }}
    >
      <RoomContent
        title={joinData.room.name}
        ending={ending}
        onLeave={leave}
        onEndRoom={handleEndRoom}
        onConnectionLost={handleConnectionLost}
      />
    </LiveKitRoom>
  );
}