import { ActivityIndicator, Pressable, Text, View } from "react-native";

interface Props {
  micOn: boolean;
  micBusy: boolean;
  unread: number;
  fileCount: number;
  isCreator: boolean;
  ending: boolean;
  bottomInset: number;
  onToggleMic: () => void;
  onOpenChat: () => void;
  onOpenFiles: () => void;
  onEndRoom: () => void;
  onLeave: () => void;
}

export default function RoomControls({
  micOn,
  micBusy,
  unread,
  fileCount,
  isCreator,
  ending,
  bottomInset,
  onToggleMic,
  onOpenChat,
  onOpenFiles,
  onEndRoom,
  onLeave,
}: Props) {
  return (
    <View
      className="flex-row items-center justify-around border-t border-gray-100 bg-white px-4 pt-3"
      style={{ paddingBottom: bottomInset + 12 }}
    >
      {/* Mic */}
      <Pressable
        onPress={onToggleMic}
        disabled={micBusy}
        className="items-center"
        accessibilityLabel={micOn ? "Mute microphone" : "Unmute microphone"}
      >
        <View
          className={`h-12 w-12 items-center justify-center rounded-full ${
            micOn ? "bg-primary-600" : "bg-gray-200"
          }`}
        >
          {micBusy ? (
            <ActivityIndicator color={micOn ? "#FFFFFF" : "#6B7280"} />
          ) : (
            <Text className="text-xl">{micOn ? "🎙️" : "🔇"}</Text>
          )}
        </View>
        <Text className="mt-1 text-xs text-gray-600">
          {micOn ? "Mute" : "Unmute"}
        </Text>
      </Pressable>

      {/* Chat */}
      <Pressable
        onPress={onOpenChat}
        className="items-center"
        accessibilityLabel="Open chat"
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Text className="text-xl">💬</Text>

          {unread > 0 && (
            <View className="absolute -right-1 -top-1 min-w-[20px] items-center rounded-full bg-red-500 px-1 py-0.5">
              <Text className="text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </Text>
            </View>
          )}
        </View>
        <Text className="mt-1 text-xs text-gray-600">Chat</Text>
      </Pressable>

      {/* Files */}
      <Pressable
        onPress={onOpenFiles}
        className="items-center"
        accessibilityLabel="Open shared files"
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Text className="text-xl">📎</Text>

          {fileCount > 0 && (
            <View className="absolute -right-1 -top-1 min-w-[20px] items-center rounded-full bg-red-500 px-1 py-0.5">
              <Text className="text-[10px] font-bold text-white">
                {fileCount > 9 ? "9+" : fileCount}
              </Text>
            </View>
          )}
        </View>
        <Text className="mt-1 text-xs text-gray-600">Files</Text>
      </Pressable>

      {/* End room (creator only) */}
      {isCreator && (
        <Pressable
          onPress={onEndRoom}
          disabled={ending}
          className="items-center"
          accessibilityLabel="End room"
        >
          <View className="h-12 w-12 items-center justify-center rounded-full bg-red-50">
            {ending ? (
              <ActivityIndicator color="#DC2626" />
            ) : (
              <Text className="text-xl">⏹️</Text>
            )}
          </View>
          <Text className="mt-1 text-xs text-red-600">End</Text>
        </Pressable>
      )}

      {/* Leave */}
      <Pressable
        onPress={onLeave}
        className="items-center"
        accessibilityLabel="Leave room"
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-red-600">
          <Text className="text-xl">📞</Text>
        </View>
        <Text className="mt-1 text-xs text-gray-600">Leave</Text>
      </Pressable>
    </View>
  );
}
