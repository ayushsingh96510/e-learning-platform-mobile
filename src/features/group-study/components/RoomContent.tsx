import { Alert, ScrollView, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useRoomContext } from "@livekit/react-native";
import { ConnectionState, RoomEvent } from "livekit-client";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChatSheet from "./ChatSheet";
import FilesSheet from "./FilesSheet";
import ParticipantTile from "./ParticipantTile";
import RoomControls from "./RoomControls";
import { useRoomChat } from "../hooks/useRoomChat";
import { useSharedFiles } from "../hooks/useSharedFiles";
import { useRoomParticipants } from "../hooks/useRoomParticipants";
import {
  requestMicrophonePermission,
  showMicrophoneDeniedAlert,
} from "../permissions";
import { isRoomCreator } from "../utils/participants";

interface Props {
  title: string;
  ending: boolean;
  onLeave: () => void;
  onEndRoom: () => void;
  onConnectionLost: () => void;
}

const CONNECTION_LABEL: Partial<Record<ConnectionState, string>> = {
  [ConnectionState.Connected]: "Connected",
  [ConnectionState.Connecting]: "Connecting...",
  [ConnectionState.Reconnecting]: "Reconnecting...",
};

export default function RoomContent({
  title,
  ending,
  onLeave,
  onEndRoom,
  onConnectionLost,
}: Props) {
  const room = useRoomContext();
  const insets = useSafeAreaInsets();
  const participants = useRoomParticipants();
  const { messages, send } = useRoomChat();
  const { files, sendProgress, pickAndSend } = useSharedFiles();

  const [chatOpen, setChatOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [seenCount, setSeenCount] = useState(0);
  const [micBusy, setMicBusy] = useState(false);

  const local = room.localParticipant;
  const micOn = local.isMicrophoneEnabled;
  const isCreator = isRoomCreator(local);
  const connected = room.state === ConnectionState.Connected;
  const unread = chatOpen ? 0 : Math.max(0, messages.length - seenCount);

  // Tell the screen when the room ends or the connection is lost for good.
  useEffect(() => {
    room.on(RoomEvent.Disconnected, onConnectionLost);
    return () => {
      room.off(RoomEvent.Disconnected, onConnectionLost);
    };
  }, [room, onConnectionLost]);

  const handleToggleMic = async () => {
    if (micBusy) return;

    const next = !local.isMicrophoneEnabled;
    setMicBusy(true);

    try {
      if (next && !(await requestMicrophonePermission())) {
        showMicrophoneDeniedAlert();
        return;
      }
      await local.setMicrophoneEnabled(next);
    } catch {
      if (next) showMicrophoneDeniedAlert();
    } finally {
      setMicBusy(false);
    }
  };

  const openChat = useCallback(() => {
    setSeenCount(messages.length);
    setChatOpen(true);
  }, [messages.length]);

  const closeChat = useCallback(() => {
    setSeenCount(messages.length);
    setChatOpen(false);
  }, [messages.length]);

  const handleUpload = async () => {
    const error = await pickAndSend();
    if (error) Alert.alert("Could not share the file", error);
  };

  const confirmEndRoom = () => {
    Alert.alert(
      "End this room?",
      "Everyone will be removed from the study room.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "End Room", style: "destructive", onPress: onEndRoom },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="bg-primary-600 px-4 pb-4"
        style={{ paddingTop: insets.top + 12 }}
      >
        <Text className="text-base font-bold text-white" numberOfLines={1}>
          {title}
        </Text>

        <View className="mt-1 flex-row items-center gap-3">
          <Text className="text-xs text-white/80">
            👥 {participants.length} in room
          </Text>

          <View className="flex-row items-center">
            <View
              className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                connected ? "bg-green-400" : "bg-amber-400"
              }`}
            />
            <Text className="text-xs text-white/80">
              {CONNECTION_LABEL[room.state] ?? "Disconnected"}
            </Text>
          </View>
        </View>
      </View>

      {/* Participants */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-3 pb-6 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {!micOn && (
          <View className="mx-1 mb-2 rounded-xl bg-white px-4 py-3">
            <Text className="text-center text-xs text-gray-500">
              You are muted. Tap the microphone to talk.
            </Text>
          </View>
        )}

        <View className="flex-row flex-wrap">
          {participants.map((participant) => (
            <ParticipantTile
              key={participant.sid || participant.identity}
              participant={participant}
              isLocal={participant.identity === local.identity}
            />
          ))}
        </View>
      </ScrollView>

      <RoomControls
        micOn={micOn}
        micBusy={micBusy}
        unread={unread}
        fileCount={files.length}
        isCreator={isCreator}
        ending={ending}
        bottomInset={insets.bottom}
        onToggleMic={handleToggleMic}
        onOpenChat={openChat}
        onOpenFiles={() => setFilesOpen(true)}
        onEndRoom={confirmEndRoom}
        onLeave={onLeave}
      />

      <ChatSheet
        visible={chatOpen}
        messages={messages}
        localIdentity={local.identity}
        onSend={send}
        onClose={closeChat}
      />

      <FilesSheet
        visible={filesOpen}
        files={files}
        sendProgress={sendProgress}
        onUpload={handleUpload}
        onClose={() => setFilesOpen(false)}
      />
    </View>
  );
}
