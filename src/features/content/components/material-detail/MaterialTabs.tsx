import { Pressable, Text, View } from "react-native";
import type { MaterialTabItem } from "../../constants/material";


interface MaterialTabsProps<T extends string> {
  tabs: MaterialTabItem<T>[];
  activeTab: T;
  onChange: (key: T) => void;
}

export default function MaterialTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
}: MaterialTabsProps<T>) {
  return (
    <View className="mb-6 flex-row rounded-xl bg-gray-200 p-1">
      {tabs.map((tab) => {
        const active = activeTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.a11y ?? tab.label}
            className={`flex-1 items-center rounded-lg py-3 ${
              active ? "bg-white" : ""
            }`}
          >
            <Text
              numberOfLines={1}
              className={`text-sm font-semibold ${
                active ? "text-indigo-600" : "text-gray-500"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}