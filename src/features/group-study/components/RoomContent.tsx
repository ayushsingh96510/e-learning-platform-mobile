import { Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { useRoomContext } from "@livekit/react-native";
import { ConnectionState, RoomEvent } from "livekit-client";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChatSheet from "./ChatSheet";
import FilesSheet from "./FilesSheet";
import ParticipantTile from "./ParticipantTile";
import RoomControls from "./RoomControls";
import WhiteboardView from "./WhiteboardView";
import { useRoomChat } from "../hooks/useRoomChat";
import { useSharedFiles } from "../hooks/useSharedFiles";
import { useWhiteboard } from "../hooks/useWhiteboard";
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
  [ConnectionState.Disconnected]: "Disconnected",
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
  const whiteboard = useWhiteboard();

  const [chatOpen, setChatOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [tab, setTab] = useState<"people" | "board">("people");
  const [seenCount, setSeenCount] = useState(0);
  const [micBusy, setMicBusy] = useState(false);

  const local = room.localParticipant;
  const micOn = local.isMicrophoneEnabled;
  const isCreator = isRoomCreator(local);
  const connected = room.state === ConnectionState.Connected;
  const unread = chatOpen ? 0 : Math.max(0, messages.length - seenCount);
  const [menuVisible, setMenuVisible] = useState(false);

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
        className="border-b border-gray-100 bg-white px-4 pb-4"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center">
          {/* Back button */}
          <Pressable
            onPress={onLeave}
            accessibilityRole="button"
            accessibilityLabel="Leave study room"
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          >
            <Ionicons name="arrow-back" size={21} color="#374151" />
          </Pressable>

          {/* Room icon */}
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
            <Ionicons name="people" size={25} color="#4F46E5" />
          </View>

          {/* Room details */}
          <View className="flex-1">
            <Text
              className="text-base font-bold text-gray-900"
              numberOfLines={1}
            >
              {title}
            </Text>

            <View className="mt-1 flex-row items-center">
              <Ionicons name="people-outline" size={13} color="#6B7280" />
              <Text className="ml-1 text-xs text-gray-500">
                {participants.length} in room
              </Text>

              <View className="mx-2 h-1 w-1 rounded-full bg-gray-300" />

              <View
                className={`mr-1.5 h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-amber-500"
                  }`}
              />
              <Text
                className={`flex-shrink text-xs ${connected ? "text-green-700" : "text-amber-700"
                  }`}
                numberOfLines={1}
              >
                {CONNECTION_LABEL[room.state] ?? "Disconnected"}
              </Text>
            </View>
          </View>
          {/* More Menu Trigger */}
          <Pressable
            onPress={() => setMenuVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Room options"
            className="ml-2 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          >
            <Ionicons name="ellipsis-vertical" size={21} color="#374151" />
          </Pressable>



          {/* Refresh Whiteboard */}
          {/* <Pressable
            onPress={() => {
              if (tab === "board") {
                // whiteboard.refresh?.();
              } else {
                setTab("board");
                // whiteboard.refresh?.();
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Refresh whiteboard"
            className="ml-2 h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white"
          >
            <Ionicons name="sync-outline" size={21} color="#4F46E5" />
          </Pressable> */}

        </View>
      </View>
      {/* More Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          className="flex-1"
          style={{ backgroundColor: "rgba(0,0,0,0.12)" }}
          onPress={() => setMenuVisible(false)}
        >
          <View
            className="absolute right-4 w-60 overflow-hidden rounded-2xl border border-gray-100 bg-white py-2"
            style={{
              top: insets.top + 58,
              elevation: 8,
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            {/* Refresh Whiteboard */}
            <Pressable
              onPress={() => {
                setMenuVisible(false);
                setTab("board");
              }}
              className="flex-row items-center px-4 py-3.5"
            >
              <Ionicons
                name="sync-outline"
                size={20}
                color="#4F46E5"
              />
              <Text className="ml-3 text-sm font-medium text-gray-800">
                Refresh Whiteboard
              </Text>
            </Pressable>

            {/* Participants */}
            <Pressable
              onPress={() => {
                setMenuVisible(false);
                setTab("people");
              }}
              className="flex-row items-center px-4 py-3.5"
            >
              <Ionicons
                name="people-outline"
                size={20}
                color="#4F46E5"
              />
              <Text className="ml-3 text-sm font-medium text-gray-800">
                Participants
              </Text>
              <View className="ml-auto rounded-full bg-indigo-50 px-2 py-1">
                <Text className="text-xs font-semibold text-indigo-700">
                  {participants.length}
                </Text>
              </View>
            </Pressable>

            {/* End Room — creator only */}
            {isCreator && (
              <>
                <View className="mx-3 my-1 h-px bg-gray-100" />

                <Pressable
                  disabled={ending}
                  onPress={() => {
                    setMenuVisible(false);
                    confirmEndRoom();
                  }}
                  className="flex-row items-center px-4 py-3.5"
                >
                  <Ionicons
                    name="stop-circle-outline"
                    size={20}
                    color="#DC2626"
                  />
                  <Text className="ml-3 text-sm font-semibold text-red-600">
                    End Room
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* View switcher */}
      <View className="flex-row border-b border-gray-100 bg-white px-4">
        {(["people", "board"] as const).map((item) => {
          const active = tab === item;
          const showDot =
            item === "board" &&
            !active &&
            (!!whiteboard.presenter || whiteboard.activity.length > 0);

          return (
            <Pressable
              key={item}
              onPress={() => setTab(item)}
              className={`mr-6 border-b-2 py-3 ${active ? "border-primary-600" : "border-transparent"
                }`}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={item === "people" ? "people-outline" : "easel-outline"}
                  size={17}
                  color={active ? "#4F46E5" : "#6B7280"}
                />
                <Text
                  className={`ml-2 text-sm font-semibold ${active ? "text-primary-600" : "text-gray-500"
                    }`}
                >
                  {item === "people" ? "People" : "Whiteboard"}
                </Text>

                {showDot && (
                  <View className="ml-1.5 h-2 w-2 rounded-full bg-red-500" />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Participants */}
      <ScrollView
        className="flex-1"
        style={{ display: tab === "people" ? "flex" : "none" }}
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

      {/* Whiteboard. It stays mounted so it keeps its view while hidden. */}
      <View
        className="flex-1"
        style={{ display: tab === "board" ? "flex" : "none" }}
      >
        <WhiteboardView whiteboard={whiteboard} />
      </View>

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
