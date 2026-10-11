import { useCallback, useEffect, useState } from "react";
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
import { StatusBar } from "react-native"; // add to your existing react-native import
import { useClassroomFullscreen } from "../classroom/useClassroomFullscreen";

import { useClassRoomConnection } from "../hooks/useClassRoomConnection";
import { useClassroomRoomEvents } from "../hooks/useClassroomRoomEvents";
import type { StudentStackParamList } from "../../../navigation/StudentNavigator";
import { ClassRoomProvider, useClassRoom } from "../classroom/ClassRoomContext";
import type { ParticipantRole } from "../classroom/types";

import { KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import ChatPanel from "../components/ChatPanel";
import { useClassroomChat } from "../hooks/useClassroomChat";
import MainStage from "../classroom/stage/MainStage";
import { useIngressParticipant } from "../classroom/stage/useIngressParticipant";
import ClassRoomHeader from "../components/ClassRoomHeader";
import ClassroomControls from "../components/ClassroomControls";
import ParticipantsSheet from "../components/ParticipantsSheet";
import { requestMediaPermissions, showPermissionAlert } from "../classroom/permissions";
import ChatSheet from "../components/ChatSheet";

function ClassRoomContent({ onLeave, onRetry, roomError, }: { onLeave: () => void; onRetry: () => void; roomError: string | null; }) {
    const insets = useSafeAreaInsets();
    const room = useRoomContext();
    const { user } = useAuth();
    const connectionState = useConnectionState();
    const participants = useParticipants();
    const { state, dispatch } = useClassRoom();
    const { send, notifyTyping } = useClassroomChat();
    const [participantsOpen, setParticipantsOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [seenCount, setSeenCount] = useState(0);
    const { fullscreen, enter, exit } = useClassroomFullscreen();
    const handleToggleFullscreen = () => (fullscreen ? exit() : enter());

    useIngressParticipant();

    // While the chat sheet is open, every message counts as seen.
    useEffect(() => {
        if (chatOpen) setSeenCount(state.messages.length);
    }, [chatOpen, state.messages.length]);

    const unreadCount = state.messages
        .slice(seenCount)
        .filter((m) => m.senderId !== state.participantIdentity).length;

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
                .catch((e) => console.warn("[classroom] setAttributes(role) failed:", e));
        }
    }, [connectionState, room, user?.role, dispatch]);

    const handleLeave = async () => {
        try {
            await room.disconnect();
        } catch (e) {
            console.warn("[classroom] disconnect failed:", e);
        }
        onLeave();
    };

    return (
        <View
            className={`flex-1 ${fullscreen ? "bg-black" : "bg-gray-50"}`}
            style={
                fullscreen
                    ? {
                        paddingLeft: insets.left,
                        paddingRight: insets.right,
                        paddingBottom: insets.bottom,
                    }
                    : { paddingTop: insets.top, paddingBottom: insets.bottom }
            }
        >
            <StatusBar hidden={fullscreen} />

            {!fullscreen && <ClassRoomHeader onLeave={onLeave} roomError={roomError} />}

            <View className={fullscreen ? "flex-1" : "flex-1 px-3 pt-3"}>
                <MainStage
                    onRetry={onRetry}
                    fullscreen={fullscreen}
                    onToggleFullscreen={handleToggleFullscreen}
                />
            </View>

            {!fullscreen && (
                <ClassroomControls
                    chatOpen={chatOpen}
                    unreadCount={unreadCount}
                    onToggleChat={() => setChatOpen((open) => !open)}
                    onOpenParticipants={() => setParticipantsOpen(true)}
                    onLeave={handleLeave}
                />
            )}

            <ChatSheet
                visible={chatOpen}
                onClose={() => setChatOpen(false)}
                onSend={send}
                onTyping={notifyTyping}
            />

            <ParticipantsSheet
                visible={participantsOpen}
                onClose={() => setParticipantsOpen(false)}
            />
        </View>
    );
}

export default function ClassRoomScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const route = useRoute<RouteProp<StudentStackParamList, "ClassRoom">>();
    const { roomName } = route.params;
    const [permissionsReady, setPermissionsReady] = useState(false);

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

    const [roomError, setRoomError] = useState<string | null>(null);
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

    if (step !== "ready" || !connection || !permissionsReady) {
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
                    isRecordingEnabled: session?.isRecordingEnabled ?? false,
                }}
            >
                <ClassRoomContent onLeave={leave} onRetry={retry} roomError={roomError} />
            </ClassRoomProvider>
        </LiveKitRoom>
    );
}