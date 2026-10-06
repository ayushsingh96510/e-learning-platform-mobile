import { Text, View } from "react-native";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
}

export default function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  return (
    <View className="flex-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <View className="mb-4 h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
        <Text className="text-lg">{icon}</Text>
      </View>

      <Text className="text-2xl font-bold text-gray-900">
        {value}
      </Text>

      <Text className="mt-1 text-sm text-gray-500">
        {title}
      </Text>
    </View>
  );
}