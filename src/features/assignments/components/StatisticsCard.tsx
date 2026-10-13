import { Text, View } from "react-native";

interface Props {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
}

export default function StatisticsCard({
  totalQuestions,
  correctCount,
  wrongCount,
  skippedCount,
}: Props) {
  const stats = [
    {
      label: "Correct",
      value: correctCount,
      box: "border-green-200 bg-green-50",
      text: "text-green-700",
    },
    {
      label: "Wrong",
      value: wrongCount,
      box: "border-red-200 bg-red-50",
      text: "text-red-700",
    },
    {
      label: "Skipped",
      value: skippedCount,
      box: "border-amber-200 bg-amber-50",
      text: "text-amber-700",
    },
    {
      label: "Total",
      value: totalQuestions,
      box: "border-gray-200 bg-gray-50",
      text: "text-gray-700",
    },
  ];

  return (
    <View className="rounded-2xl border border-gray-100 bg-white p-4">
      <Text className="mb-3 text-base font-bold text-gray-900">
        Performance Summary
      </Text>

      <View className="-mx-1 flex-row flex-wrap">
        {stats.map((stat) => (
          <View key={stat.label} className="w-1/2 p-1">
            <View className={`rounded-xl border p-3 ${stat.box}`}>
              <Text className={`text-xs font-medium ${stat.text}`}>
                {stat.label}
              </Text>
              <Text className={`mt-1 text-2xl font-bold ${stat.text}`}>
                {stat.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
