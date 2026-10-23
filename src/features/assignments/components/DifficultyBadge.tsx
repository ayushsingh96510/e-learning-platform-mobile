import { Text, View } from "react-native";
import {
  CircleCheck,
  Gauge,
  Flame,
  Layers3,
} from "lucide-react-native";
import type { Difficulty } from "../types";

const STYLES: Record<
  Difficulty,
  {
    box: string;
    text: string;
    color: string;
    Icon: typeof CircleCheck;
  }
> = {
  EASY: {
    box: "bg-emerald-50",
    text: "text-emerald-700",
    color: "#059669",
    Icon: CircleCheck,
  },
  MEDIUM: {
    box: "bg-amber-50",
    text: "text-amber-700",
    color: "#D97706",
    Icon: Gauge,
  },
  HARD: {
    box: "bg-red-50",
    text: "text-red-700",
    color: "#FF4545",
    Icon: Flame,
  },
  MIXED: {
    box: "bg-blue-50",
    text: "text-blue-700",
    color: "#2563FF",
    Icon: Layers3,
  },
};

export default function DifficultyBadge({
  difficulty,
}: {
  difficulty: Difficulty;
}) {
  const style = STYLES[difficulty] ?? STYLES.MIXED;
  const Icon = style.Icon;

  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-full px-3 py-1 ${style.box}`}
    >
      <Icon size={13} color={style.color} strokeWidth={2.2} />

      <Text className={`text-xs font-semibold ${style.text}`}>
        {difficulty}
      </Text>
    </View>
  );
}
