import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MaterialInfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}

export default function MaterialInfoRow({
  icon,
  label,
  value,
  last = false,
}: MaterialInfoRowProps) {
  return (
    <View
      className={`flex-row items-start py-3 ${
        last ? "" : "border-b border-gray-100"
      }`}
    >
      <Ionicons
        name={icon}
        size={19}
        color="#6B7280"
        style={{ marginTop: 2 }}
      />

      <View className="ml-3 flex-1">
        <Text className="text-xs text-gray-500">{label}</Text>
        <Text className="mt-1 text-sm font-medium text-gray-900">
          {value}
        </Text>
      </View>
    </View>
  );
}