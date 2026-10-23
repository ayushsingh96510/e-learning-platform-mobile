import { Text, View } from "react-native";
import {
  Trophy,
  Star,
  ThumbsUp,
  BookOpen,
  TrendingUp,
} from "lucide-react-native";

interface Props {
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
}

function getPerformance(percentage: number) {
  if (percentage >= 90) {
    return {
      label: "Excellent",
      description: "Outstanding performance.",
      color: "#059669",
      background: "#ECFDF5",
      border: "#A7F3D0",
      Icon: Trophy,
    };
  }

  if (percentage >= 75) {
    return {
      label: "Very Good",
      description: "You performed really well.",
      color: "#2563FF",
      background: "#EFF6FF",
      border: "#BBD5FF",
      Icon: Star,
    };
  }

  if (percentage >= 60) {
    return {
      label: "Good",
      description: "Nice work. Keep improving.",
      color: "#A020F0",
      background: "#FAF0FF",
      border: "#E9C8FF",
      Icon: ThumbsUp,
    };
  }

  if (percentage >= 40) {
    return {
      label: "Average",
      description: "You can do better with more practice.",
      color: "#F08C00",
      background: "#FFF8E8",
      border: "#FFDB80",
      Icon: TrendingUp,
    };
  }

  return {
    label: "Needs Improvement",
    description: "Practice more and try again.",
    color: "#FF4545",
    background: "#FFF0F0",
    border: "#FFCACA",
    Icon: BookOpen,
  };
}

export default function ScoreCard({
  obtainedMarks,
  totalMarks,
  percentage,
}: Props) {
  const performance = getPerformance(percentage);
  const PerformanceIcon = performance.Icon;
  const progress = Math.max(0, Math.min(100, percentage));

  return (
    <View className="items-center rounded-2xl border border-gray-100 bg-white p-6">
      {/* Score Icon */}
      <View
        className="h-16 w-16 items-center justify-center rounded-2xl border"
        style={{
          backgroundColor: performance.background,
          borderColor: performance.border,
        }}
      >
        <PerformanceIcon
          size={30}
          color={performance.color}
          strokeWidth={2}
        />
      </View>

      {/* Score */}
      <Text className="mt-4 text-sm font-medium text-gray-500">
        Your Score
      </Text>

      <Text className="mt-2 text-5xl font-bold text-gray-950">
        {obtainedMarks}
        <Text className="text-2xl font-semibold text-gray-400">
          {" "}/ {totalMarks}
        </Text>
      </Text>

      {/* Percentage */}
      <Text
        className="mt-3 text-3xl font-bold"
        style={{ color: performance.color }}
      >
        {percentage}%
      </Text>

      {/* Progress Bar */}
      <View className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <View
          className="h-2 rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: performance.color,
          }}
        />
      </View>

      {/* Performance */}
      <View
        className="mt-5 rounded-full border px-4 py-2"
        style={{
          backgroundColor: performance.background,
          borderColor: performance.border,
        }}
      >
        <Text
          className="text-sm font-bold"
          style={{ color: performance.color }}
        >
          {performance.label}
        </Text>
      </View>

      <Text className="mt-2 text-center text-sm leading-5 text-gray-500">
        {performance.description}
      </Text>
    </View>
  );
}