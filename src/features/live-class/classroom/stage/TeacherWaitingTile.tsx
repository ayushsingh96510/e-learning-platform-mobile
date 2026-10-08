import { Ionicons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";

import { getInitials } from "../utils";

interface Props {
  name: string;
  profileImage?: string;
  compact?: boolean;
}

export default function TeacherWaitingTile({ name, profileImage, compact }: Props) {
  const size = compact ? 36 : 56;

  return (
    <View className="h-full w-full overflow-hidden rounded-xl border border-violet-200 bg-violet-50">
      <View className="flex-1 items-center justify-center gap-1">
        <View
          className="items-center justify-center overflow-hidden rounded-full border-2 border-violet-300 bg-violet-500"
          style={{ width: size, height: size }}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <Text className="font-bold text-white" style={{ fontSize: compact ? 12 : 18 }}>
              {getInitials(name)}
            </Text>
          )}
        </View>
        <Text className="text-[11px] text-slate-500" numberOfLines={1}>
          Waiting for {name}
        </Text>
      </View>

      <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between gap-1 px-2 pb-1.5">
        <Text className="min-w-0 shrink text-[11px] font-medium text-slate-700" numberOfLines={1}>
          {name}
        </Text>
        <View className="flex-row items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5">
          <Ionicons name="time-outline" size={10} color="#D97706" />
          <Text className="text-[10px] font-semibold text-amber-600">Not joined</Text>
        </View>
      </View>
    </View>
  );
}