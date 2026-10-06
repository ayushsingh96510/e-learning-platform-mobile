import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthNavigator from "./AuthNavigator";
import StudentNavigator from "./StudentNavigator";
import { useAuth } from "../features/auth/AuthContext";

export type RootStackParamList = {
  Auth: undefined;
  Student: undefined;
};

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return null;
  }

  const isStudent = user?.role?.toUpperCase() === "STUDENT";

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      {isAuthenticated && isStudent ? (
        <Stack.Screen
          name="Student"
          component={StudentNavigator}
        />
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
        />
      )}
    </Stack.Navigator>
  );
}