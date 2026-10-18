import { Alert, Linking, PermissionsAndroid, Platform } from "react-native";

/**
 * Returns true if the microphone can be used.
 * Android needs an explicit runtime request. On iOS the system asks the
 * first time the microphone is used.
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true;

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: "Microphone access",
      message: "Allow microphone access to talk in the study room.",
      buttonPositive: "Allow",
      buttonNegative: "Not now",
    }
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export function showMicrophoneDeniedAlert() {
  Alert.alert(
    "Microphone is off",
    "Allow microphone access in Settings to talk in the study room.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ]
  );
}
