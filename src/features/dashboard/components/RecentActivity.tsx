import { Text, View } from "react-native";

interface RecentActivityProps {
  contents?: any;
}

export default function RecentActivity({
  contents,
}: RecentActivityProps) {
  const items = Array.isArray(contents)
    ? contents
    : contents?.data || [];

  return (
    <View className="rounded-2xl border border-gray-100 bg-white p-5">
      <Text className="text-lg font-bold text-gray-900">
        Recent Activity
      </Text>

      {items.length === 0 ? (
        <Text className="mt-3 text-sm text-gray-500">
          No recent activity.
        </Text>
      ) : (
        <View className="mt-3 gap-3">
          {items.slice(0, 5).map(
            (item: any, index: number) => (
              <View
                key={item.id || index}
                className="rounded-xl bg-gray-50 p-3"
              >
                <Text className="font-medium text-gray-900">
                  {item.title ||
                    item.name ||
                    "Learning material"}
                </Text>
              </View>
            ),
          )}
        </View>
      )}
    </View>
  );
}