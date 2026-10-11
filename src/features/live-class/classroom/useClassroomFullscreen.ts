import { useCallback, useEffect, useState } from "react";
import { BackHandler } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";

export function useClassroomFullscreen() {
  const [fullscreen, setFullscreen] = useState(false);

  const enter = useCallback(async () => {
    try {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    } catch (e) {
      console.warn("[classroom] lock landscape failed:", e);
    }
    setFullscreen(true);
  }, []);

  const exit = useCallback(async () => {
    setFullscreen(false);
    try {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    } catch (e) {
      console.warn("[classroom] lock portrait failed:", e);
    }
  }, []);

  // The Android back button leaves fullscreen first instead of leaving the class.
  useEffect(() => {
    if (!fullscreen) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      exit();
      return true;
    });
    return () => subscription.remove();
  }, [fullscreen, exit]);

  // Always return to portrait when the class room closes.
  useEffect(() => {
    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      ).catch(() => {});
    };
  }, []);

  return { fullscreen, enter, exit };
}