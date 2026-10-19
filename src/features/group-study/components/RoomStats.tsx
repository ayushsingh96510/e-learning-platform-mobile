
import { ActivityIndicator, Text, View } from "react-native";
import { BookOpen, Radio, UserGroup, Users2 } from "lucide-react-native";
import type { RoomStats as RoomStatsData } from "../types";

interface Props {
  stats: RoomStatsData | null;
  loading: boolean;
}

const items = [
  {
    label: "Total Rooms",
    icon: UserGroup,
    color: "#2563FF",
    background: "#EFF6FF",
    border: "#BBD5FF",
  },
  {
    label: "Live Now",
    icon: Radio,
    color: "#FF4545",
    background: "#FFF0F0",
    border: "#FFCACA",
  },
];

export default function RoomStats({ stats, loading }: Props) {
  const values = [
    stats?.totalRooms ?? 0,
    stats?.liveRooms ?? 0,
  ];

  return (
    <View className="mb-6 flex-row gap-3">
      {items.map((item, index) => {
        const Icon = item.icon;

        return (
          <View
            key={item.label}
            className="flex-1 flex-row items-center rounded-xl border bg-white px-3 py-3"
            style={{ borderColor: item.border }}
          >
            <View
              className="h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: item.background }}
            >
              <Icon
                size={19}
                color={item.color}
                strokeWidth={2}
              />
            </View>

            <View className="ml-3 flex-1">
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={item.color}
                  style={{ alignSelf: "flex-start" }}
                />
              ) : (
                <Text
                  className="text-xl font-bold leading-6 text-gray-950"
                  numberOfLines={1}
                >
                  {values[index]}
                </Text>
              )}

              <Text
                className="text-xs text-gray-500"
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
