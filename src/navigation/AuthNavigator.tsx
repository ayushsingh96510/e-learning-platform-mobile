import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text } from "react-native";

import LoginScreen from "../features/auth/screens/LoginScreen";

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
};

const Stack =
  createNativeStackNavigator<AuthStackParamList>();

function Placeholder({ title }: { title: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-900">
        {title}
      </Text>
    </View>
  );
}

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="ForgotPassword"
        children={() => (
          <Placeholder title="Forgot Password" />
        )}
      />

      <Stack.Screen
        name="ResetPassword"
        children={() => (
          <Placeholder title="Reset Password" />
        )}
      />
    </Stack.Navigator>
  );
}