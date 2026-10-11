import { useCallback, useEffect, useState } from "react";
import { Alert, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useConnectionState, useRoomContext } from "@livekit/react-native";
import { ConnectionState } from "livekit-client";

import { useAuth } from "@/features/auth/AuthContext";
import { useClassRoom } from "../ClassRoomContext";

import ChatSheet from "./ChatSheet";
import ClassRoomHeader from "./ClassRoomHeader";
import ClassroomControls from "./ClassroomControls";
import ParticipantsSheet from "./ParticipantsSheet";

import { useClassroomChat } from "../hooks/useClassroomChat";
import { useClassroomFullscreen } from "../hooks/useClassroomFullscreen";
import { useClassroomRoomEvents } from "../hooks/useClassroomRoomEvents";

import MainStage from "../stage/MainStage";
import { useIngressParticipant } from "../stage/useIngressParticipant";

interface Props {
  onLeave: () => void;
  onRetry: () => void;
  roomError: string | null;
}

export default function ClassRoomContent({ onLeave, onRetry, roomError }: Props) {
  const insets = useSafeAreaInsets();
  const room = useRoomContext();
  const { user } = useAuth();
  const connectionState = useConnectionState();
  const { state, dispatch } = useClassRoom();
  const { send, notifyTyping } = useClassroomChat();
  const { fullscreen, enter, exit } = useClassroomFullscreen();

  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [seenCount, setSeenCount] = useState(0);

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
          onToggleFullscreen={() => (fullscreen ? exit() : enter())}
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