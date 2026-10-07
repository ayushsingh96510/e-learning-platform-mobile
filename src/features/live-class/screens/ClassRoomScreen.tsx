import { useCallback, useEffect } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    AudioSession,
    LiveKitRoom,
    useConnectionState,
    useParticipants,
    useRoomContext,
} from "@livekit/react-native";
import { ConnectionState } from "livekit-client";

import { useClassRoomConnection } from "../hooks/useClassRoomConnection";
import { useClassroomRoomEvents } from "../hooks/useClassroomRoomEvents";
import type { StudentStackParamList } from "../../../navigation/StudentNavigator";
import { ClassRoomProvider, useClassRoom } from "../classroom/ClassRoomContext";
import type { ParticipantRole } from "../classroom/types";

import { KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import ChatPanel from "../components/ChatPanel";
import { useClassroomChat } from "../hooks/useClassroomChat";

function ClassRoomContent({ onLeave }: { onLeave: () => void }) {
    const insets = useSafeAreaInsets();
    const room = useRoomContext();
    const { user } = useAuth();
    const connectionState = useConnectionState();
    const participants = useParticipants();
    const { state, dispatch } = useClassRoom();
    const { send, notifyTyping } = useClassroomChat();

    const handleClassEnded = useCallback(() => {
        Alert.alert("Class ended", "This live class has ended.", [
            { text: "OK", onPress: onLeave },
        ]);
    }, [onLeave]);

    useClassroomRoomEvents(handleClassEnded);

    useEffect(() => {
        const connected = connectionState === ConnectionState.Connected;
        dispatch({ type: "setConnected", payload: connected });

        // Same as the web app: publish the user's role after connecting.
        if (connected) {
            room.localParticipant
                .setAttributes({ role: user?.role ?? "" })
                .catch(() => { });
        }
    }, [connectionState, room, user?.role, dispatch]);

    const handleLeave = async () => {
        await room.disconnect();
        onLeave();
    };

    const statusText =
        connectionState === ConnectionState.Connected
            ? "Connected"
            : connectionState === ConnectionState.Reconnecting
                ? "Reconnecting..."
                : "Connecting...";

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-gray-50"
            style={{ paddingTop: insets.top }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
                <View className="mr-3 flex-1">
                    <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                        {state.title ?? "Live Class"}
                    </Text>
                    <Text className="text-xs text-gray-500">
                        {statusText} · {participants.length} in room
                    </Text>
                </View>

                <Pressable onPress={handleLeave} className="rounded-full bg-red-50 px-4 py-2">
                    <Text className="text-sm font-semibold text-red-600">Leave</Text>
                </Pressable>
            </View>

            {/* Temporary placeholder: the stage is added in the next step. */}
            <View className="h-48 items-center justify-center bg-black">
                <Text className="text-sm text-gray-400">Stage will be added here.</Text>
            </View>

            <ChatPanel onSend={send} onTyping={notifyTyping} />
        </KeyboardAvoidingView>
    );
}

export default function ClassRoomScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const route = useRoute<RouteProp<StudentStackParamList, "ClassRoom">>();
    const { roomName } = route.params;

    const { step, session, joinData, connection, error, statusCode, retry } =
        useClassRoomConnection(roomName);

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

    if (step !== "ready" || !connection) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator />
                <Text className="mt-3 text-sm text-gray-500">
                    {step === "fetching_session"
                        ? "Loading class details..."
                        : "Joining class..."}
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
        >
            <ClassRoomProvider
                init={{
                    roomName: connection.roomName,
                    title: session?.title ?? null,
                    classId: joinData!.liveClass.id,
                    participantRole: joinData!.liveClass.participantRole as ParticipantRole,
                    participantIdentity: joinData!.liveClass.participantId,
                    deliveryMode: joinData!.liveClass.deliveryMode,
                    teacher: session?.teacher ?? null,
                    recordedVideoId: session?.replayMaterialId ?? null,
                    isChatEnabled: session?.isChatEnabled ?? false,
                }}
            >
                <ClassRoomContent
                    onLeave={leave} />
            </ClassRoomProvider>
        </LiveKitRoom>
    );
}