import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "@/features/dashboard/screens/HomeScreen";
import ProfileScreen from "@/features/profile/screens/ProfileScreen";
import LiveClassesScreen from "@/features/live-class/screens/LiveClassesScreen";
import ClassRoomScreen from "@/features/classroom/screens/ClassRoomScreen";
import AssignmentsScreen from "@/features/assignments/screens/AssignmentsScreen";
import AttemptScreen from "@/features/assignments/screens/AttemptScreen";
import ResultScreen from "@/features/assignments/screens/ResultScreen";
import type { AssessmentResult } from "@/features/assignments/types";
import ContentLibraryScreen from "@/features/content/screens/ContentLibraryScreen";
import MaterialDetailScreen from "@/features/content/screens/MaterialDetailScreen";


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
  ClassRoom: { roomName: string };
  AssignmentAttempt: { assessmentId: string };
  AssignmentResult: { resultId?: string; result?: AssessmentResult };
  MaterialDetail: { materialId: string };
};

const Tab = createBottomTabNavigator<StudentTabParamList>();
const Stack = createNativeStackNavigator<StudentStackParamList>();

type IconName = keyof typeof Ionicons.glyphMap;

function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",

        tabBarStyle: {
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
          backgroundColor: "#FFFFFF",
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },

        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<
            keyof StudentTabParamList,
            {
              active: IconName;
              inactive: IconName;
            }
          > = {
            Home: {
              active: "home",
              inactive: "home-outline",
            },
            LiveClasses: {
              active: "videocam",
              inactive: "videocam-outline",
            },
            GroupStudy: {
              active: "people",
              inactive: "people-outline",
            },
            Assignments: {
              active: "document-text",
              inactive: "document-text-outline",
            },
            Content: {
              active: "library",
              inactive: "library-outline",
            },
          };

          const icon = icons[route.name];

          return (
            <Ionicons
              name={focused ? icon.active : icon.inactive}
              size={focused ? size + 1 : size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
        }}
      />

      <Tab.Screen
        name="LiveClasses"
        component={LiveClassesScreen}
        options={{
          tabBarLabel: "Live",
        }}
      />

      <Tab.Screen
        name="GroupStudy"
        children={() => null}
        options={{
          tabBarLabel: "Groups",
        }}
      />

      <Tab.Screen
        name="Assignments"
        component={AssignmentsScreen}
        options={{
          tabBarLabel: "Tests",
        }}
      />

      <Tab.Screen
        name="Content"
        component={ContentLibraryScreen}
        options={{ tabBarLabel: "Content" }}
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

      <Stack.Screen
        name="ClassRoom"
        component={ClassRoomScreen}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen
        name="AssignmentAttempt"
        component={AttemptScreen}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen
        name="AssignmentResult"
        component={ResultScreen}
      />

      <Stack.Screen
        name="MaterialDetail"
        component={MaterialDetailScreen}
      />
    </Stack.Navigator>
  );
}