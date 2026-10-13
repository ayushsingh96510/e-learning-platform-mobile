import { Text, View } from "react-native";

interface Props {
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
}

function getPerformance(percentage: number) {
  if (percentage >= 90) {
    return { label: "Excellent 🎉", description: "Outstanding performance." };
  }
  if (percentage >= 75) {
    return { label: "Very Good 👏", description: "You performed really well." };
  }
  if (percentage >= 60) {
    return { label: "Good 👍", description: "Nice work. Keep improving." };
  }
  if (percentage >= 40) {
    return {
      label: "Average 🙂",
      description: "You can do better with more practice.",
    };
  }
  return {
    label: "Needs Improvement 📚",
    description: "Practice more and try again.",
  };
}

export default function ScoreCard({
  obtainedMarks,
  totalMarks,
  percentage,
}: Props) {
  const performance = getPerformance(percentage);

  return (
    <View className="items-center rounded-2xl border border-gray-100 bg-white p-6">
      <Text className="text-sm text-gray-500">Your Score</Text>

      <Text className="mt-2 text-5xl font-bold text-gray-900">
        {obtainedMarks}
        <Text className="text-2xl text-gray-400"> / {totalMarks}</Text>
      </Text>

      <Text className="mt-3 text-2xl font-semibold text-primary-600">
        {percentage}%
      </Text>

      <Text className="mt-3 text-lg font-semibold text-gray-900">
        {performance.label}
      </Text>
      <Text className="mt-1 text-center text-sm text-gray-500">
        {performance.description}
      </Text>
    </View>
  );
}
