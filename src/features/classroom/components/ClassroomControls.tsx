import { useCallback, useEffect, useRef, useState, type ComponentProps } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalParticipant, useRoomContext } from "@livekit/react-native";

import { useClassRoom } from "@/features/classroom/ClassRoomContext";

type Tone = "neutral" | "danger" | "warning";

const TONE: Record<Tone, { bg: string; icon: string }> = {
  neutral: { bg: "bg-gray-100", icon: "#374151" },
  danger: { bg: "bg-red-100", icon: "#DC2626" },
  warning: { bg: "bg-yellow-500", icon: "#FFFFFF" },
};

function RoundButton({
  icon,
  tone,
  locked,
  label,
  onPress,
  badge,
}: {
  icon: ComponentProps<typeof Ionicons>["name"];
  tone: Tone;
  locked?: boolean;
  label: string;
  onPress: () => void;
  badge?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`h-10 w-10 items-center justify-center rounded-full ${TONE[tone].bg} ${
        locked ? "opacity-60" : ""
      }`}
    >
      <Ionicons name={icon} size={18} color={TONE[tone].icon} />

      {badge ? (
        <View
          className="absolute -right-1 -top-1 items-center justify-center rounded-full bg-red-500 px-1"
          style={{ minWidth: 16, height: 16 }}
        >
          <Text className="text-[9px] font-bold text-white">
            {badge > 9 ? "9+" : badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const Divider = () => <View className="mx-0.5 h-8 w-px bg-gray-200" />;

interface Props {
  chatOpen: boolean;
  unreadCount: number;
  onToggleChat: () => void;
  onOpenParticipants: () => void;
  onLeave: () => void;
}

export default function ClassroomControls({
  chatOpen,
  unreadCount,
  onToggleChat,
  onOpenParticipants,
  onLeave,
}: Props) {
  const room = useRoomContext();
  const { isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  const { state, dispatch } = useClassRoom();

  const [hint, setHint] = useState<string | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showHint = useCallback((message: string) => {
    setHint(message);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(null), 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, []);

  const toggleHand = async () => {
    const next = !state.handRaised;
    dispatch({ type: "setHandRaised", payload: next });
    try {
      await room.localParticipant.setAttributes({ handRaised: String(next) });
    } catch (e) {
      console.warn("[classroom] setAttributes(handRaised) failed:", e);
      dispatch({ type: "setHandRaised", payload: !next });
    }
  };

  const confirmLeave = () => {
    Alert.alert(
      "Leave class?",
      "You will be disconnected from the live class. You can rejoin later if the class is still active.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Leave class", style: "destructive", onPress: onLeave },
      ]
    );
  };

  return (
    <View className="items-center px-3 py-3">
      {hint ? (
        <View className="mb-2 rounded-lg bg-gray-900 px-3 py-1.5">
          <Text className="text-xs text-white">{hint}</Text>
        </View>
      ) : null}

      <View className="flex-row items-center gap-1.5 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
        {/* Students cannot control their own mic or camera. Teachers and admins do it remotely. */}
        <RoundButton
          icon={isMicrophoneEnabled ? "mic" : "mic-off"}
          tone={isMicrophoneEnabled ? "neutral" : "danger"}
          locked
          label="Microphone"
          onPress={() => showHint("Only teachers and admins can control the microphone")}
        />
        <RoundButton
          icon={isCameraEnabled ? "videocam" : "videocam-off"}
          tone={isCameraEnabled ? "neutral" : "danger"}
          locked
          label="Camera"
          onPress={() => showHint("Only teachers and admins can control the camera")}
        />

        <Divider />

        <RoundButton
          icon="hand-left"
          tone={state.handRaised ? "warning" : "neutral"}
          label={state.handRaised ? "Lower hand" : "Raise hand"}
          onPress={toggleHand}
        />

        <Divider />

        <RoundButton
          icon={chatOpen ? "chatbubble" : "chatbubble-outline"}
          tone="neutral"
          label={chatOpen ? "Close chat" : "Open chat"}
          onPress={onToggleChat}
          badge={unreadCount}
        />
        <RoundButton
          icon="people"
          tone="neutral"
          label="Show participants"
          onPress={onOpenParticipants}
        />
        <RoundButton
          icon="log-out-outline"
          tone="danger"
          label="Leave class"
          onPress={confirmLeave}
        />
      </View>
    </View>
  );
}