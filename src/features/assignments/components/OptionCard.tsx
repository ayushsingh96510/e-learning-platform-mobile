import { Pressable, Text, View } from "react-native";

interface Props {
  option: string;
  selected: boolean;
  onSelect: (option: string) => void;
}

export default function OptionCard({ option, selected, onSelect }: Props) {
  return (
    <Pressable
      onPress={() => onSelect(option)}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={`mb-3 flex-row items-start rounded-xl border p-4 ${
        selected
          ? "border-primary-600 bg-primary-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <View
        className={`mr-3 mt-0.5 h-5 w-5 items-center justify-center rounded-full border-2 ${
          selected ? "border-primary-600" : "border-gray-300"
        }`}
      >
        {selected && <View className="h-2.5 w-2.5 rounded-full bg-primary-600" />}
      </View>

      <Text
        className={`flex-1 text-sm leading-5 ${
          selected ? "font-semibold text-gray-900" : "text-gray-700"
        }`}
      >
        {option}
      </Text>
    </Pressable>
  );
}
