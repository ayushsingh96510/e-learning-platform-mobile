import { ActivityIndicator, Text, View } from "react-native";
import type { RoomStats as RoomStatsData } from "../types";

interface Props {
  stats: RoomStatsData | null;
  loading: boolean;
}

export default function RoomStats({ stats, loading }: Props) {
  const items = [
    { label: "Total Rooms", value: stats?.totalRooms ?? 0, icon: "📚" },
    { label: "Live Now", value: stats?.liveRooms ?? 0, icon: "🔴" },
  ];

  return (
    <View className="mb-6 flex-row gap-3">
      {items.map((item) => (
        <View
          key={item.label}
          className="flex-1 flex-row items-center rounded-2xl border border-gray-100 bg-white p-4"
        >
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
            <Text className="text-lg">{item.icon}</Text>
          </View>

          <View>
            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text className="text-lg font-bold leading-6 text-gray-900">
                {item.value}
              </Text>
            )}
            <Text className="text-xs text-gray-500">{item.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
