import "./global.css";

import { NavigationContainer } from "@react-navigation/native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import RootNavigator from "./navigation/RootNavigator";
import { AuthProvider } from "./features/auth/AuthContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        edges={["top"]}
        className="flex-1 bg-gray-50"
      >
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
