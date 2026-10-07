import { useEffect, useRef } from "react";
import { Animated, Image, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { getInitials } from "../utils";
import type { StageRole } from "./usePresenterMediaState";

const ROLE_LABEL: Record<StageRole, string> = {
  TEACHER: "Teacher",
  ADMIN: "Admin",
  STUDENT: "Student",
};

const BAR_HEIGHTS = [6, 12, 8, 15, 6];

function AudioBar({
  height,
  delay,
  active,
}: {
  height: number;
  delay: number;
  active?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) {
      scale.setValue(1);
      return;
    }
    scale.setValue(0.4);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.4, duration: 400, useNativeDriver: true }),
      ])
    );
    const timer = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [active, delay, scale]);

  return (
    <Animated.View
      style={{
        width: 3,
        height,
        borderRadius: 2,
        backgroundColor: "#10B981",
        transform: [{ scaleY: scale }],
      }}
    />
  );
}

function AudioBars({ isSpeaking }: { isSpeaking?: boolean }) {
  return (
    <View className="flex-row items-end gap-[2px]">
      {BAR_HEIGHTS.map((h, i) => (
        <AudioBar key={i} height={h} delay={i * 150} active={isSpeaking} />
      ))}
    </View>
  );
}

interface Props {
  name: string;
  role: StageRole;
  profileImage?: string;
  isSpeaking?: boolean;
  compact?: boolean;
}

export default function SeatAudioCard({
  name,
  role,
  profileImage,
  isSpeaking,
  compact,
}: Props) {
  const size = compact ? 28 : 56;

  return (
    <View className="h-full w-full overflow-hidden rounded-xl border border-violet-200 bg-violet-50">
      <View className="flex-1 items-center justify-center gap-1">
        <View
          className={`items-center justify-center overflow-hidden rounded-full bg-violet-500 ${
            compact ? "" : "border-2 border-violet-300"
          }`}
          style={{ width: size, height: size }}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <Text className="font-bold text-white" style={{ fontSize: compact ? 10 : 18 }}>
              {getInitials(name)}
            </Text>
          )}
        </View>
        {!compact && <Text className="text-[11px] text-slate-400">Camera off</Text>}
      </View>

      <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between gap-1 px-2 pb-1.5">
        <View className="min-w-0 shrink flex-row items-center gap-1.5">
          <Text className="min-w-0 shrink text-[11px] font-medium text-slate-700" numberOfLines={1}>
            {name}
          </Text>
          <View className="rounded border border-violet-200 bg-violet-50 px-1 py-0.5">
            <Text className="text-[9px] font-semibold uppercase text-violet-600">
              {ROLE_LABEL[role]}
            </Text>
          </View>
        </View>
        <AudioBars isSpeaking={isSpeaking} />
      </View>

      {compact && (
        <View className="absolute left-1 top-1 flex-row items-center gap-1 rounded-full bg-slate-900/60 px-1.5 py-0.5">
          <Ionicons name="mic" size={10} color="#FFFFFF" />
          <Text className="text-[9px] text-white">Cam off</Text>
        </View>
      )}
    </View>
  );
}