import { Text, View } from "react-native";
import type { Difficulty } from "../types";

const STYLES: Record<Difficulty, { box: string; text: string }> = {
  EASY: { box: "bg-emerald-50", text: "text-emerald-700" },
  MEDIUM: { box: "bg-amber-50", text: "text-amber-700" },
  HARD: { box: "bg-red-50", text: "text-red-700" },
  MIXED: { box: "bg-blue-50", text: "text-blue-700" },
};

export default function DifficultyBadge({
  difficulty,
}: {
  difficulty: Difficulty;
}) {
  const style = STYLES[difficulty] ?? STYLES.MIXED;

  return (
    <View className={`rounded-full px-3 py-1 ${style.box}`}>
      <Text className={`text-xs font-semibold ${style.text}`}>
        {difficulty}
      </Text>
    </View>
  );
}
