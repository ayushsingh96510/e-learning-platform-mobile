import { Pressable, Text, View } from "react-native";

interface DashboardHeaderProps {
  name?: string;
  onProfilePress: () => void;
}

export default function DashboardHeader({
  name,
  onProfilePress,
}: DashboardHeaderProps) {
  return (
    <View className="mb-6 flex-row items-center justify-between">
      <View className="flex-1 pr-4">
        <Text className="text-2xl font-bold text-gray-900">
          Welcome back{ name ? `, ${name}` : "" }
        </Text>

        <Text className="mt-1 text-sm text-gray-500">
          Continue your learning journey
        </Text>
      </View>

      <Pressable
        onPress={onProfilePress}
        className="h-11 w-11 items-center justify-center rounded-full bg-primary-100"
      >
        <Text className="text-lg">👤</Text>
      </Pressable>
    </View>
  );
}