import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type Tone = "neutral" | "danger" | "warning";

const TONE: Record<Tone, { bg: string; icon: string }> = {
  neutral: { bg: "bg-gray-100", icon: "#374151" },
  danger: { bg: "bg-red-100", icon: "#DC2626" },
  warning: { bg: "bg-yellow-500", icon: "#FFFFFF" },
};

function RoundButton({
  icon,
  tone,
  label,
  onPress,
  badge,
  loading = false,
  disabled = false,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  tone: Tone;
  label: string;
  onPress: () => void;
  badge?: number;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      className={`h-10 w-10 items-center justify-center rounded-full ${
        TONE[tone].bg
      } ${disabled || loading ? "opacity-60" : ""}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={TONE[tone].icon} />
      ) : (
        <Ionicons name={icon} size={18} color={TONE[tone].icon} />
      )}

      {badge != null && badge > 0 && (
        <View
          className="absolute -right-1 -top-1 items-center justify-center rounded-full bg-red-500 px-1"
          style={{ minWidth: 16, height: 16 }}
        >
          <Text className="text-[9px] font-bold text-white">
            {badge > 9 ? "9+" : badge}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const Divider = () => (
  <View className="mx-0.5 h-8 w-px bg-gray-200" />
);

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
      className="items-center px-3 pt-3"
      style={{ paddingBottom: bottomInset + 12 }}
    >
      <View className="flex-row items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
        {/* Microphone */}
        <RoundButton
          icon={micOn ? "mic" : "mic-off"}
          tone={micOn ? "neutral" : "danger"}
          label={micOn ? "Mute microphone" : "Unmute microphone"}
          onPress={onToggleMic}
          loading={micBusy}
        />

        <Divider />

        {/* Chat */}
        <RoundButton
          icon="chatbubble-outline"
          tone="neutral"
          label="Open chat"
          onPress={onOpenChat}
          badge={unread}
        />

        {/* Shared files */}
        <RoundButton
          icon="attach-outline"
          tone="neutral"
          label="Open shared files"
          onPress={onOpenFiles}
          badge={fileCount}
        />

        <Divider />

        {/* End room: creator only */}
        {/* {isCreator && (
          <RoundButton
            icon="stop-circle-outline"
            tone="danger"
            label="End room"
            onPress={onEndRoom}
            loading={ending}
          />
        )} */}

        {/* Leave room */}
        <RoundButton
          icon="log-out-outline"
          tone="danger"
          label="Leave room"
          onPress={onLeave}
        />
      </View>
    </View>
  );
}