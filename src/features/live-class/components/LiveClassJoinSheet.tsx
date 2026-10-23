import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from "react-native";
import {
  Video,
  Clock3,
  UserRound,
  Disc3,
  GraduationCap,
  AlertCircle,
  Camera,
  Wifi,
  Headphones,
  MessageCircle,
  ShieldCheck,
} from "lucide-react-native";
import type { LiveSession } from "../types";

interface Props {
  visible: boolean;
  item: LiveSession | null;
  onClose: () => void;
  onJoin: () => void;
  joining?: boolean;
  userName?: string | null;
}

export default function LiveClassJoinSheet({
  visible,
  item,
  onClose,
  onJoin,
  joining = false,
  userName,
}: Props) {
  if (!item) return null;

  const isLive = item.status === "LIVE";
  const recording = item.isRecordingEnabled;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable
          className="flex-1"
          onPress={onClose}
          disabled={joining}
          accessibilityRole="button"
          accessibilityLabel="Close join sheet"
        />

        <View
          className="rounded-t-3xl border-t border-gray-100 bg-white px-5 pb-8 pt-3"
          style={{ maxHeight: "85%" }}
        >
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-gray-300" />

          <ScrollView
            style={{ flexShrink: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="flex-row items-center">
              <View
                className={`mr-3 h-12 w-12 items-center justify-center rounded-xl ${
                  isLive ? "bg-red-50" : "bg-blue-50"
                }`}
              >
                <Video
                  size={23}
                  color={isLive ? "#FF4545" : "#2563FF"}
                  strokeWidth={2}
                />
              </View>

              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">
                  {item.title}
                </Text>

                {!!item.subject?.name && (
                  <Text className="mt-0.5 text-sm text-gray-500">
                    {item.subject.name}
                  </Text>
                )}
              </View>

              {isLive && (
                <View className="flex-row items-center rounded-full bg-red-50 px-2.5 py-1">
                  <View className="mr-1.5 h-2 w-2 rounded-full bg-red-500" />
                  <Text className="text-xs font-bold text-red-600">
                    LIVE
                  </Text>
                </View>
              )}
            </View>

            <Text className="mt-3 text-sm leading-5 text-gray-500">
              Review the details and instructions below before joining your live class.
            </Text>

            {/* Duration and status */}
            <View className="mt-5 flex-row gap-3">
              <View className="flex-1 rounded-2xl border border-orange-100 bg-white p-4">
                <View className="mb-3 h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
                  <Clock3 size={19} color="#F08C00" strokeWidth={2} />
                </View>

                <Text className="text-xs font-medium text-gray-500">
                  Duration
                </Text>

                <Text
                  className="mt-1 text-xl font-bold text-gray-900"
                  numberOfLines={1}
                >
                  {item.durationMinutes} min
                </Text>
              </View>

              <View
                className={`flex-1 rounded-2xl border p-4 ${
                  isLive
                    ? "border-red-100 bg-white"
                    : "border-blue-100 bg-white"
                }`}
              >
                <View
                  className={`mb-3 h-9 w-9 items-center justify-center rounded-xl ${
                    isLive ? "bg-red-50" : "bg-blue-50"
                  }`}
                >
                  <Video
                    size={19}
                    color={isLive ? "#FF4545" : "#2563FF"}
                    strokeWidth={2}
                  />
                </View>

                <Text className="text-xs font-medium text-gray-500">
                  Class status
                </Text>

                <Text
                  className={`mt-1 text-xl font-bold ${
                    isLive ? "text-red-600" : "text-blue-600"
                  }`}
                >
                  {isLive ? "LIVE" : "Upcoming"}
                </Text>
              </View>
            </View>

            {/* Joining as and recording */}
            <View className="mt-3 flex-row gap-3">
              <View className="flex-1 rounded-2xl border border-purple-100 bg-white p-4">
                <View className="mb-3 h-9 w-9 items-center justify-center rounded-xl bg-purple-50">
                  <UserRound size={18} color="#A020F0" strokeWidth={2} />
                </View>

                <Text className="text-xs font-medium text-gray-500">
                  Joining as
                </Text>

                <Text
                  className="mt-1 text-sm font-bold text-gray-900"
                  numberOfLines={1}
                >
                  {userName?.trim() || "You"}
                </Text>
              </View>

              <View
                className={`flex-1 rounded-2xl border p-4 ${
                  recording ? "border-red-100 bg-white" : "border-gray-100 bg-white"
                }`}
              >
                <View
                  className={`mb-3 h-9 w-9 items-center justify-center rounded-xl ${
                    recording ? "bg-red-50" : "bg-gray-100"
                  }`}
                >
                  <Disc3
                    size={18}
                    color={recording ? "#FF4545" : "#6B7280"}
                    strokeWidth={2}
                  />
                </View>

                <Text className="text-xs font-medium text-gray-500">
                  Recording
                </Text>

                <Text
                  className={`mt-1 text-sm font-bold ${
                    recording ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  {recording ? "Enabled" : "Disabled"}
                </Text>
              </View>
            </View>

            {/* Instructor */}
            {!!item.teacher?.name && (
              <View className="mt-5 rounded-2xl border border-purple-100 bg-white p-4">
                <View className="flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                    <GraduationCap
                      size={21}
                      color="#A020F0"
                      strokeWidth={2}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-xs font-medium text-gray-500">
                      YOUR INSTRUCTOR
                    </Text>
                    <Text className="mt-1 text-sm font-semibold text-gray-900">
                      {item.teacher.name}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Recording consent */}
            {recording && (
              <View className="mt-5 flex-row items-start rounded-2xl border border-orange-100 bg-orange-50 p-4">
                <AlertCircle
                  size={19}
                  color="#F08C00"
                  strokeWidth={2}
                />

                <Text className="ml-3 flex-1 text-xs leading-5 text-amber-800">
                  This class is being recorded. By joining, you consent to the
                  recording of audio, video, and chat.
                </Text>
              </View>
            )}

            {/* Before you join */}
            <View className="mt-5">
              <View className="mb-3 flex-row items-center">
                <View className="mr-2 h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                  <ShieldCheck size={18} color="#2563FF" strokeWidth={2} />
                </View>

                <Text className="text-base font-bold text-gray-900">
                  Before you join
                </Text>
              </View>

              <View className="gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <View className="flex-row items-start">
                  <View className="mr-3 mt-0.5">
                    <Camera size={17} color="#2563FF" />
                  </View>
                  <Text className="flex-1 text-sm leading-5 text-gray-700">
                    Grant camera and microphone permissions.
                  </Text>
                </View>

                <View className="flex-row items-start">
                  <View className="mr-3 mt-0.5">
                    <Wifi size={17} color="#A020F0" />
                  </View>
                  <Text className="flex-1 text-sm leading-5 text-gray-700">
                    Ensure you have a stable internet connection.
                  </Text>
                </View>

                <View className="flex-row items-start">
                  <View className="mr-3 mt-0.5">
                    <Headphones size={17} color="#F08C00" />
                  </View>
                  <Text className="flex-1 text-sm leading-5 text-gray-700">
                    Join from a quiet environment and use headphones.
                  </Text>
                </View>

                {item.isChatEnabled && (
                  <View className="flex-row items-start">
                    <View className="mr-3 mt-0.5">
                      <MessageCircle size={17} color="#2563FF" />
                    </View>
                    <Text className="flex-1 text-sm leading-5 text-gray-700">
                      Use the class chat responsibly and professionally.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View className="mt-5 flex-row gap-3">
            <Pressable
              onPress={onClose}
              disabled={joining}
              accessibilityRole="button"
              className={`flex-1 items-center justify-center rounded-xl border border-gray-200 py-3 ${
                joining ? "opacity-50" : ""
              }`}
            >
              <Text className="font-semibold text-gray-700">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={onJoin}
              disabled={joining}
              accessibilityRole="button"
              accessibilityLabel={joining ? "Joining class" : "Join class"}
              className={`flex-1 flex-row items-center justify-center rounded-xl py-3 ${
                isLive ? "bg-red-500" : "bg-blue-600"
              } ${joining ? "opacity-60" : ""}`}
            >
              {joining ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="ml-2 font-semibold text-white">
                    Joining...
                  </Text>
                </>
              ) : (
                <>
                  <Video size={18} color="#FFFFFF" strokeWidth={2} />
                  <Text className="ml-2 font-semibold text-white">
                    Join Class
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}