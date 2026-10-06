import { Pressable, Text, View } from "react-native";

interface NextClassCardProps {
  liveClass?: any;
  onPress?: () => void;
}

export default function NextClassCard({
  liveClass,
  onPress,
}: NextClassCardProps) {
  if (!liveClass) {
    return (
      <View className="rounded-2xl border border-gray-100 bg-white p-5">
        <Text className="text-lg font-bold text-gray-900">
          Next Live Class
        </Text>

        <Text className="mt-2 text-sm text-gray-500">
          No upcoming live class.
        </Text>
      </View>
    );
  }

  return (
    <View className="rounded-2xl bg-primary-600 p-5">
      <Text className="text-sm font-semibold text-primary-100">
        NEXT LIVE CLASS
      </Text>

      <Text className="mt-2 text-xl font-bold text-white">
        {liveClass.title || "Live Class"}
      </Text>

      {liveClass.subject?.name ? (
        <Text className="mt-1 text-sm text-primary-100">
          {liveClass.subject.name}
        </Text>
      ) : null}

      <Pressable
        onPress={onPress}
        className="mt-5 self-start rounded-xl bg-white px-5 py-3"
      >
        <Text className="font-bold text-primary-600">
          View Class
        </Text>
      </Pressable>
    </View>
  );
}