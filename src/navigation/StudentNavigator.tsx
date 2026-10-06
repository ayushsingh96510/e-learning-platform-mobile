import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../features/dashboard/screens/HomeScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";

export type StudentTabParamList = {
  Home: undefined;
  LiveClasses: undefined;
  GroupStudy: undefined;
  Assignments: undefined;
  Content: undefined;
};

export type StudentStackParamList = {
  MainTabs: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<StudentTabParamList>();
const Stack = createNativeStackNavigator<StudentStackParamList>();

function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      <Tab.Screen
        name="LiveClasses"
        children={() => null}
      />

      <Tab.Screen
        name="GroupStudy"
        children={() => null}
      />

      <Tab.Screen
        name="Assignments"
        children={() => null}
      />

      <Tab.Screen
        name="Content"
        children={() => null}
      />
    </Tab.Navigator>
  );
}

export default function StudentNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={StudentTabs}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Stack.Navigator>
  );
}