import { Image, Pressable, Text, View } from "react-native";
import { UserRound } from "lucide-react-native";

interface DashboardHeaderProps {
  name?: string;
  profileImage?: string;
  onProfilePress: () => void;
}

export default function DashboardHeader({
  name,
  profileImage,
  onProfilePress,
}: DashboardHeaderProps) {
  return (
    <View className="mb-6 flex-row items-center justify-between">
      <View className="flex-1 pr-4">
        <Text className="text-2xl font-bold text-gray-900">
          Welcome back{name ? `, ${name}` : ""}
        </Text>

        <Text className="mt-1 text-sm text-gray-500">
          Continue your learning journey
        </Text>
      </View>

      <Pressable
        onPress={onProfilePress}
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        className="h-12 w-12 items-center justify-center rounded-full border-2 bg-primary-100"
      >
        {profileImage?.trim() ? (
          <Image
            source={{ uri: profileImage.trim() }}
            className="h-11 w-11 rounded-full"
          />
        ) : (
          <UserRound size={22} color="#2563EB" />
        )}
      </Pressable>
    </View>
  );
}