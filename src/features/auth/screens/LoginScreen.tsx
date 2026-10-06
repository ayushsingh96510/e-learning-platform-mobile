import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Check, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react-native";

import { useAuth } from "../AuthContext";

const HERO_IMAGE =
  "https://plus.unsplash.com/premium_photo-1681488245781-6d5617e3dba9?q=80&w=1740&auto=format&fit=crop";

const COLORS = {
  muted: "#9CA3AF",
  primary: "#2563EB", // match your `primary-600` value
};

type FieldErrors = { email?: string; password?: string };

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<"email" | "password" | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errors.email = "Please enter a valid email";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    return errors;
  };

  const clearErrors = () => {
    if (serverError) setServerError("");
  };

  const handleLogin = async () => {
    setServerError("");

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      // `keepSignedIn` is available here if you extend login() to accept it
      const result = await login(email.trim(), password);

      if (!result.success) {
        setServerError(result.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "h-11 flex-1 text-base text-gray-900";
  const inputWrap = (field: "email" | "password") =>
    `flex-row items-center rounded-lg border px-3 ${
      focused === field
        ? "border-primary-600 bg-white"
        : "border-gray-200 bg-gray-50"
    }`;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero (web's left panel) */}
        <ImageBackground
          source={{ uri: HERO_IMAGE }}
          resizeMode="cover"
          className="bg-zinc-900"
        >
          <View className="bg-zinc-900/70 px-6 pb-10 pt-16">
            <View className="mb-5 flex-row items-center gap-4">
              <View className="h-14 w-14 items-center justify-center rounded-2xl border border-primary-600/30 bg-primary-600/20">
                <ShieldCheck size={28} color="#FFFFFF" />
              </View>
              <Text className="text-3xl font-bold tracking-tight text-white">
                E-Learning
              </Text>
            </View>

            <Text className="text-base leading-6 text-zinc-300">
              Secure, efficient, and intelligent e-learning platform designed to
              deliver engaging digital learning experiences with modern
              technology.
            </Text>
          </View>
        </ImageBackground>

        {/* Form */}
        <View className="w-full max-w-md self-center px-6 pb-10 pt-8">
          <View className="mb-8">
            <Text className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </Text>
            <Text className="mt-2 text-base text-gray-500">
              Enter your credentials to access the dashboard
            </Text>
          </View>

          {/* Email */}
          <View className="mb-5">
            <Text className="mb-2 text-sm font-medium text-gray-900">
              Email address
            </Text>

            <View className={inputWrap("email")}>
              <Mail
                size={16}
                color={focused === "email" ? COLORS.primary : COLORS.muted}
              />
              <TextInput
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  clearErrors();
                }}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="name@company.com"
                placeholderTextColor={COLORS.muted}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                editable={!loading}
                className={`${inputBase} ml-3`}
              />
            </View>

            {fieldErrors.email ? (
              <Text className="mt-1.5 text-xs text-red-500">
                {fieldErrors.email}
              </Text>
            ) : null}
          </View>

          {/* Password */}
          <View className="mb-5">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm font-medium text-gray-900">
                Password
              </Text>

              <Pressable
                onPress={() => navigation.navigate("ForgotPassword" as never)}
                disabled={loading}
                hitSlop={8}
              >
                <Text className="text-sm font-medium text-primary-600">
                  Forgot password?
                </Text>
              </Pressable>
            </View>

            <View className={inputWrap("password")}>
              <Lock
                size={16}
                color={focused === "password" ? COLORS.primary : COLORS.muted}
              />
              <TextInput
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  clearErrors();
                }}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                editable={!loading}
                className={`${inputBase} ml-3`}
              />
              <Pressable
                onPress={() => setShowPassword((value) => !value)}
                disabled={loading}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={16} color={COLORS.muted} />
                ) : (
                  <Eye size={16} color={COLORS.muted} />
                )}
              </Pressable>
            </View>

            {fieldErrors.password ? (
              <Text className="mt-1.5 text-xs text-red-500">
                {fieldErrors.password}
              </Text>
            ) : null}
            {serverError ? (
              <Text
                className="mt-1.5 text-xs text-red-500"
                accessibilityRole="alert"
              >
                {serverError}
              </Text>
            ) : null}
          </View>

          {/* Keep me signed in */}
          <Pressable
            onPress={() => setKeepSignedIn((value) => !value)}
            disabled={loading}
            className="mb-6 flex-row items-center gap-2"
            accessibilityRole="checkbox"
            accessibilityState={{ checked: keepSignedIn }}
          >
            <View
              className={`h-4 w-4 items-center justify-center rounded border ${
                keepSignedIn
                  ? "border-primary-600 bg-primary-600"
                  : "border-gray-300 bg-white"
              }`}
            >
              {keepSignedIn ? <Check size={12} color="#FFFFFF" /> : null}
            </View>
            <Text className="text-sm text-gray-500">Keep me signed in</Text>
          </Pressable>

          {/* Sign in */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className={`h-11 flex-row items-center justify-center gap-2 rounded-lg shadow-lg shadow-primary-600/20 ${
              loading ? "bg-primary-300" : "bg-primary-600"
            }`}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text className="text-base font-medium text-white">
                  Signing in...
                </Text>
              </>
            ) : (
              <Text className="text-base font-medium text-white">Sign In</Text>
            )}
          </Pressable>

          {/* Footer */}
          <View className="mt-8 flex-row flex-wrap items-center justify-center">
            <Text className="text-sm text-gray-500">
              Don't have an account?{" "}
            </Text>
            <Pressable
              onPress={() => Linking.openURL("mailto:admin@company.com")}
              hitSlop={8}
            >
              <Text className="text-sm font-medium text-primary-600">
                Contact Administrator
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
