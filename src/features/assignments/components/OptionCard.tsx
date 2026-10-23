import { Pressable, Text, View } from "react-native";
import { CheckCircle2, Circle } from "lucide-react-native";

interface Props {
  option: string;
  selected: boolean;
  onSelect: (option: string) => void;
}

export default function OptionCard({
  option,
  selected,
  onSelect,
}: Props) {
  return (
    <Pressable
      onPress={() => onSelect(option)}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={`mb-3 flex-row items-start rounded-xl border p-4 ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* Selection icon */}
      <View className="mr-3 mt-0.5">
        {selected ? (
          <CheckCircle2
            size={21}
            color="#2563FF"
            strokeWidth={2}
          />
        ) : (
          <Circle
            size={21}
            color="#D1D5DB"
            strokeWidth={1.8}
          />
        )}
      </View>

      {/* Option text */}
      <Text
        className={`flex-1 text-sm leading-5 ${
          selected
            ? "font-semibold text-gray-900"
            : "text-gray-700"
        }`}
      >
        {option}
      </Text>
    </Pressable>
  );
}
