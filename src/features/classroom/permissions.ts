import { Alert, Linking, PermissionsAndroid, Platform } from "react-native";

export interface MediaPermissionResult {
  camera: boolean;
  microphone: boolean;
  /** True when Android will no longer show the permission dialog. */
  blocked: boolean;
}

export async function requestMediaPermissions(): Promise<MediaPermissionResult> {
  // iOS asks the first time the camera or microphone is used.
  if (Platform.OS !== "android") {
    return { camera: true, microphone: true, blocked: false };
  }

  const { CAMERA, RECORD_AUDIO } = PermissionsAndroid.PERMISSIONS;
  const { GRANTED, NEVER_ASK_AGAIN } = PermissionsAndroid.RESULTS;

  const result = await PermissionsAndroid.requestMultiple([CAMERA, RECORD_AUDIO]);

  return {
    camera: result[CAMERA] === GRANTED,
    microphone: result[RECORD_AUDIO] === GRANTED,
    blocked:
      result[CAMERA] === NEVER_ASK_AGAIN || result[RECORD_AUDIO] === NEVER_ASK_AGAIN,
  };
}

export function showPermissionAlert(blocked: boolean) {
  Alert.alert(
    "Camera and microphone access",
    "Your teacher can turn on your camera and microphone during class. Allow access so this works.",
    blocked
      ? [
          { text: "Not now", style: "cancel" },
          { text: "Open settings", onPress: () => Linking.openSettings() },
        ]
      : [{ text: "OK" }]
  );
}