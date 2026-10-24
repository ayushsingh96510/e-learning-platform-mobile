import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AudioSession, LiveKitRoom } from "@livekit/react-native";

import type { StudentStackParamList } from "@/navigation/types";
import ClassRoomContent from "../components/ClassRoomContent";
import { ClassRoomProvider } from "../ClassRoomContext";
import { useClassRoomConnection } from "../hooks/useClassRoomConnection";
import { requestMediaPermissions, showPermissionAlert } from "../permissions";
import type { ParticipantRole } from "../types";

export default function ClassRoomScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<StudentStackParamList, "ClassRoom">>();
  const { roomName } = route.params;

  const { step, session, joinData, connection, error, statusCode, retry } =
    useClassRoomConnection(roomName);

  const [roomError, setRoomError] = useState<string | null>(null);
  const [permissionsReady, setPermissionsReady] = useState(false);

  const leave = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);

  // Native audio session (mobile replacement for RoomAudioRenderer).
  useEffect(() => {
    AudioSession.startAudioSession();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  // Ask for camera and microphone once, so a teacher can turn them on remotely later.
  useEffect(() => {
    let cancelled = false;

    requestMediaPermissions()
      .then((result) => {
        if (!cancelled && (!result.camera || !result.microphone)) {
          showPermissionAlert(result.blocked);
        }
      })
      .catch((e) => console.warn("[classroom] permission request failed:", e))
      .finally(() => {
        if (!cancelled) setPermissionsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (step === "error") {
    return (
      <View
        className="flex-1 items-center justify-center bg-gray-50 px-6"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-center text-base text-red-600">{error}</Text>
        {statusCode ? (
          <Text className="mt-1 text-xs text-gray-400">Error code: {statusCode}</Text>
        ) : null}

        <Pressable onPress={retry} className="mt-4 rounded-xl bg-primary-600 px-6 py-3">
          <Text className="font-semibold text-white">Retry</Text>
        </Pressable>
        <Pressable onPress={leave} className="mt-3 px-6 py-2">
          <Text className="font-semibold text-gray-600">Go back</Text>
        </Pressable>
      </View>
    );
  }

  if (step !== "ready" || !connection || !joinData || !permissionsReady) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator />
        <Text className="mt-3 text-sm text-gray-500">
          {step === "fetching_session" ? "Loading class details..." : "Joining class..."}
        </Text>
      </View>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={connection.serverUrl}
      token={connection.token}
      connect
      audio={false}
      video={false}
      options={{ adaptiveStream: true, dynacast: true }}
      onConnected={() => setRoomError(null)}
      onError={(e) => setRoomError(e?.message ?? "Room error")}
    >
      <ClassRoomProvider
        init={{
          roomName: connection.roomName,
          title: session?.title ?? null,
          classId: joinData.liveClass.id,
          participantRole: joinData.liveClass.participantRole as ParticipantRole,
          participantIdentity: joinData.liveClass.participantId,
          deliveryMode: joinData.liveClass.deliveryMode,
          teacher: session?.teacher ?? null,
          recordedVideoId: session?.replayMaterialId ?? null,
          isChatEnabled: session?.isChatEnabled ?? false,
          isRecordingEnabled: session?.isRecordingEnabled ?? false,
        }}
      >
        <ClassRoomContent onLeave={leave} onRetry={retry} roomError={roomError} />
      </ClassRoomProvider>
    </LiveKitRoom>
  );
}