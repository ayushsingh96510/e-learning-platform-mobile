import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";

export type StudentTabParamList = {
  Home: undefined;
  LiveClasses: undefined;
  GroupStudy: undefined;
  Assignments: undefined;
  Content: undefined;
};

const Tab = createBottomTabNavigator<StudentTabParamList>();

function Placeholder({ title }: { title: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-900">
        {title}
      </Text>
    </View>
  );
}

export default function StudentNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        children={() => <Placeholder title="Home" />}
      />

      <Tab.Screen
        name="LiveClasses"
        children={() => <Placeholder title="Live Classes" />}
      />

      <Tab.Screen
        name="GroupStudy"
        children={() => <Placeholder title="Group Study" />}
      />

      <Tab.Screen
        name="Assignments"
        children={() => <Placeholder title="Assignments" />}
      />

      <Tab.Screen
        name="Content"
        children={() => <Placeholder title="Content" />}
      />
    </Tab.Navigator>
  );
}