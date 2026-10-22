import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { GraduationCap } from "lucide-react-native";

export default function SplashScreen() {
  const dots = useRef([
    new Animated.Value(0.35),
    new Animated.Value(0.35),
    new Animated.Value(0.35),
  ]).current;

  useEffect(() => {
    const animations = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 150),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.35,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [dots]);

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 px-6 dark:bg-slate-950">
      {/* Scholar cap logo */}
      <View className="mb-7 h-20 w-20 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <GraduationCap
          size={42}
          color="#2563EB"
          strokeWidth={2}
        />
      </View>

      {/* App title */}
      <Text className="text-center text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
        E-Learning Platform
      </Text>

      {/* Loading message */}
      <Text className="mt-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
        Preparing your workspace...
      </Text>

      {/* Animated loading dots */}
      <View className="mt-8 flex-row items-center justify-center gap-2">
        {dots.map((dot, index) => (
          <Animated.View
            key={index}
            style={{ opacity: dot }}
            className="h-2.5 w-2.5 rounded-full bg-blue-600"
          />
        ))}
      </View>
    </View>
  );
}