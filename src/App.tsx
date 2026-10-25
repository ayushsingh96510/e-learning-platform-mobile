import "./global.css";

import { NavigationContainer } from "@react-navigation/native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";

import RootNavigator from "./navigation/RootNavigator";
import { AuthProvider } from "./features/auth/AuthContext";

export default function App() {
  return (
    <KeyboardProvider>
      <SafeAreaProvider>
        <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white">
          <AuthProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </KeyboardProvider>
  );
}
