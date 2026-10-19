import { Text, View } from "react-native";
import {
  BookOpen,
  UsersRound,
  Video,
  Layers3,
} from "lucide-react-native";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: "book" | "users" | "video" | "layers";
}

const iconConfig = {
  book: {
    Component: BookOpen,
    color: "#2563FF",
    background: "#EFF6FF",
    border: "#BBD5FF",
  },
  users: {
    Component: UsersRound,
    color: "#A020F0",
    background: "#FAF0FF",
    border: "#E9C8FF",
  },
  video: {
    Component: Video,
    color: "#FF4545",
    background: "#FFF0F0",
    border: "#FFCACA",
  },
  layers: {
    Component: Layers3,
    color: "#F08C00",
    background: "#FFF8E8",
    border: "#FFDB80",
  },
};

export default function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  const config = iconConfig[icon];
  const Icon = config.Component;

  return (
    <View
      className="flex-1 flex-row items-center rounded-xl border bg-white px-4 py-3"
      style={{ borderColor: config.border }}
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: config.background }}
      >
        <Icon size={19} color={config.color} strokeWidth={2} />
      </View>

      <View className="ml-3 flex-1">
        <Text
          className="text-sm text-gray-500"
          numberOfLines={1}
        >
          {title}
        </Text>

        <Text
          className="text-xl font-bold leading-6 text-gray-950"
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
