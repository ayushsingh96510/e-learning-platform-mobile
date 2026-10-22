import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Mail,
  ShieldCheck,
} from "lucide-react-native";
import axios from "axios";

import { forgotPasswordRequest } from "../api/auth.api";

const COLORS = {
  primary: "#2563EB",
  muted: "#9CA3AF",
};

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [serverError, setServerError] = useState("");

  const validateEmail = () => {
    const value = email.trim();

    if (!value) {
      setEmailError("Email is required");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }

    setEmailError("");
    return true;
  };

  const handleSendResetLink = async () => {
    setServerError("");

    if (!validateEmail()) return;

    setLoading(true);

    try {
      await forgotPasswordRequest(email);

      setSuccess(true);
    } catch (error: unknown) {
      let message = "Something went wrong. Please try again.";

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as
          | {
              message?: string;
              errors?: { message?: string }[];
            }
          | undefined;

        message =
          responseData?.message ||
          responseData?.errors?.[0]?.message ||
          (error.code === "ECONNABORTED"
            ? "The request timed out. Please try again."
            : message);
      }

      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError("");
    setServerError("");
  };

  return (
    <KeyboardAwareScrollView
    style={{ flex: 1, backgroundColor: "#F9FAFB" }} // gray-50
    contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
    bottomOffset={8} // extra space kept between the focused input and the keyboard
    keyboardShouldPersistTaps="handled"
    keyboardDismissMode="on-drag"
    showsVerticalScrollIndicator={false}
  >
        <View className="w-full max-w-md self-center px-6 py-8">
          {/* Back button */}
          <Pressable
            onPress={() => navigation.goBack()}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mb-8 h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white"
          >
            <ArrowLeft size={20} color="#374151" />
          </Pressable>

          {/* Brand */}
          <View className="mb-8 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-primary-600">
              <ShieldCheck size={32} color="#FFFFFF" />
            </View>

            <Text className="text-2xl font-bold tracking-tight text-gray-900">
              E-Learning
            </Text>

            <Text className="mt-1 text-sm text-gray-500">
              Learning Management System
            </Text>
          </View>

          {/* Form card */}
          <View className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {success ? (
              <View>
                <View className="mb-5 h-14 w-14 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle2 size={30} color="#16A34A" />
                </View>

                <Text className="text-2xl font-bold text-gray-900">
                  Check your email
                </Text>

                <Text className="mt-3 text-sm leading-6 text-gray-600">
                  If an account exists for this email, a password
                  reset link has been sent.
                </Text>

                <View className="mt-5 flex-row items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3">
                  <Mail
                    size={17}
                    color={COLORS.primary}
                    style={{ marginTop: 2 }}
                  />

                  <Text className="flex-1 text-sm leading-5 text-blue-800">
                    Check your inbox and spam folder for the reset
                    email.
                  </Text>
                </View>

                <Text className="mt-4 text-xs leading-5 text-gray-500">
                  Your reset link's expiry and usage rules are
                  controlled by the server.
                </Text>

                <Pressable
                  onPress={() => navigation.navigate("Login" as never)}
                  className="mt-6 h-12 items-center justify-center rounded-xl bg-primary-600"
                  accessibilityRole="button"
                >
                  <Text className="text-base font-semibold text-white">
                    Back to login
                  </Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Text className="text-2xl font-bold tracking-tight text-gray-900">
                  Forgot password?
                </Text>

                <Text className="mt-2 text-sm leading-6 text-gray-500">
                  Enter the email address associated with your
                  account. We&apos;ll send you a link to reset
                  your password.
                </Text>

                {/* Email field */}
                <View className="mt-7">
                  <Text className="mb-2 text-sm font-medium text-gray-900">
                    Email address
                  </Text>

                  <View
                    className={`flex-row items-center rounded-xl border px-3 ${
                      emailError
                        ? "border-red-400 bg-red-50"
                        : focused
                          ? "border-primary-600 bg-white"
                          : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <Mail
                      size={18}
                      color={
                        focused
                          ? COLORS.primary
                          : COLORS.muted
                      }
                    />

                    <TextInput
                      value={email}
                      onChangeText={handleEmailChange}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      onSubmitEditing={handleSendResetLink}
                      placeholder="you@organisation.org"
                      placeholderTextColor={COLORS.muted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      editable={!loading}
                      accessibilityLabel="Email address"
                      className="h-12 flex-1 px-3 text-base text-gray-900"
                    />
                  </View>

                  {emailError ? (
                    <View className="mt-2 flex-row items-center gap-1.5">
                      <AlertCircle size={14} color="#DC2626" />
                      <Text
                        className="flex-1 text-xs text-red-600"
                        accessibilityRole="alert"
                      >
                        {emailError}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Server error */}
                {serverError ? (
                  <View className="mt-4 flex-row items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3">
                    <AlertCircle
                      size={17}
                      color="#DC2626"
                      style={{ marginTop: 1 }}
                    />

                    <Text
                      className="flex-1 text-sm leading-5 text-red-700"
                      accessibilityRole="alert"
                    >
                      {serverError}
                    </Text>
                  </View>
                ) : null}

                {/* Submit */}
                <Pressable
                  onPress={handleSendResetLink}
                  disabled={loading}
                  accessibilityRole="button"
                  accessibilityLabel="Send password reset link"
                  className={`mt-6 h-12 flex-row items-center justify-center gap-2 rounded-xl ${
                    loading ? "bg-primary-300" : "bg-primary-600"
                  }`}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />
                      <Text className="text-base font-semibold text-white">
                        Sending reset link...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Mail size={18} color="#FFFFFF" />
                      <Text className="text-base font-semibold text-white">
                        Send reset link
                      </Text>
                    </>
                  )}
                </Pressable>

                {/* Return to login */}
                <View className="mt-6 flex-row flex-wrap items-center justify-center">
                  <Text className="text-sm text-gray-500">
                    Remembered your password?{" "}
                  </Text>

                  <Pressable
                    onPress={() => navigation.navigate("Login" as never)}
                    disabled={loading}
                    accessibilityRole="button"
                  >
                    <Text className="text-sm font-semibold text-primary-600">
                      Back to login
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>

          <Text className="mt-6 text-center text-xs leading-5 text-gray-400">
            Keep your account secure. Never share a password reset
            link with anyone.
          </Text>
        </View>
    </KeyboardAwareScrollView>
  );
}
