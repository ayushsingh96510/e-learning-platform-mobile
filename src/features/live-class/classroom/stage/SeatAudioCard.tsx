import { Image, Text, View } from "react-native";

import { getInitials } from "../utils";
import type { StageRole } from "./usePresenterMediaState";

interface Props {
  name: string;
  role: StageRole;
  profileImage?: string;
  isSpeaking?: boolean;
  compact?: boolean;
}

const ROLE_LABEL: Record<StageRole, string> = {
  TEACHER: "Teacher",
  ADMIN: "Admin",
  STUDENT: "Student",
};

export default function SeatAudioCard({
  name,
  role,
  profileImage,
  isSpeaking,
  compact,
}: Props) {
  const size = compact ? 32 : 48;

  return (
    <View
      className={`h-full w-full items-center justify-center overflow-hidden rounded-xl border bg-violet-50 ${
        isSpeaking ? "border-violet-500" : "border-violet-200"
      }`}
    >
      <View
        className="items-center justify-center overflow-hidden rounded-full bg-violet-500"
        style={{ width: size, height: size }}
      >
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={{ width: "100%", height: "100%" }} />
        ) : (
          <Text className="font-bold text-white" style={{ fontSize: compact ? 11 : 16 }}>
            {getInitials(name)}
          </Text>
        )}
      </View>

      <View className="absolute bottom-1 left-1.5 right-1.5 flex-row items-center justify-between gap-1">
        <Text className="min-w-0 shrink text-[10px] font-medium text-slate-700" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-[9px] font-semibold uppercase text-violet-600">
          {ROLE_LABEL[role]}
        </Text>
      </View>
    </View>
  );
}