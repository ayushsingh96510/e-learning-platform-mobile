import { Feather } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
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
                <Pressable className="flex-1" onPress={onClose} />

                <View
                    className="rounded-t-3xl bg-white px-5 pb-8 pt-3"
                    style={{ maxHeight: "85%" }}
                >
                    <View className="mb-4 h-1 w-10 self-center rounded-full bg-gray-300" />

                    <ScrollView
                        style={{ flexShrink: 1 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header */}
                        <View className="flex-row items-center">
                            <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                                <Text className="text-xl">🎥</Text>
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
                        </View>

                        <Text className="mt-3 text-sm text-gray-500">
                            Read the instructions below before joining the live class.
                        </Text>

                        {/* Meta cards: Duration + Status */}
                        <View className="mt-5 flex-row gap-3">
                            <View className="flex-1 rounded-xl border border-gray-100 p-4">
                                <Text className="text-xs text-gray-500">Duration</Text>
                                <Text className="mt-1 text-2xl font-bold text-gray-900">
                                    {item.durationMinutes} min
                                </Text>
                            </View>
                            <View className="flex-1 rounded-xl border border-gray-100 p-4">
                                <Text className="text-xs text-gray-500">Status</Text>
                                <Text
                                    className={`mt-1 text-2xl font-bold ${isLive ? "text-red-600" : "text-primary-600"
                                        }`}
                                >
                                    {isLive ? "LIVE" : "Upcoming"}
                                </Text>
                            </View>
                        </View>

                        {/* Meta cards: Joining as + Recording */}
                        <View className="mt-3 flex-row gap-3">
                            {/* Joining as */}
                            <View className="flex-1 rounded-xl border border-gray-100 p-4">
                                <View className="flex-row items-center gap-1.5">
                                    <Feather name="user" size={12} color="#6B7280" />
                                    <Text className="text-xs text-gray-500">Joining as</Text>
                                </View>
                                <Text
                                    className="mt-1 text-sm font-bold text-gray-900"
                                    numberOfLines={1}
                                >
                                    {userName?.trim() || "You"}
                                </Text>
                            </View>

                            {/* Recording */}
                            <View className="flex-1 rounded-xl border border-gray-100 p-4">
                                <View className="flex-row items-center gap-1.5">
                                    <Feather
                                        name="disc"
                                        size={12}
                                        color={recording ? "#DC2626" : "#6B7280"}
                                    />
                                    <Text className="text-xs text-gray-500">Recording</Text>
                                </View>
                                <Text
                                    className={`mt-1 text-sm font-bold ${recording ? "text-red-600" : "text-gray-700"
                                        }`}
                                >
                                    {recording ? "On" : "Off"}
                                </Text>
                            </View>
                        </View>

                        {/* Teacher */}
                        {!!item.teacher?.name && (
                            <View className="mt-5">
                                <Text className="mb-1 font-semibold text-gray-900">
                                    Instructor
                                </Text>
                                <Text className="text-sm text-gray-700">
                                    👨‍🏫 {item.teacher.name}
                                </Text>
                            </View>
                        )}

                        {/* Recording consent notice — only when recording is ON */}
                        {recording && (
                            <View className="mt-5 flex-row items-start rounded-xl border border-amber-100 bg-amber-50 p-3">
                                <Feather
                                    name="alert-circle"
                                    size={14}
                                    color="#B45309"
                                    style={{ marginTop: 1 }}
                                />
                                <Text className="ml-2 flex-1 text-xs leading-5 text-amber-800">
                                    This class is being recorded. By joining, you consent to
                                    the recording of audio, video, and chat.
                                </Text>
                            </View>
                        )}

                        {/* Instructions */}
                        <View className="mt-5">
                            <Text className="mb-2 font-semibold text-gray-900">
                                Before you join
                            </Text>
                            <View className="rounded-xl bg-gray-50 p-4">
                                <Text className="text-sm leading-6 text-gray-700">
                                    • Grant camera and microphone permissions{"\n"}
                                    • Ensure a stable internet connection before joining{"\n"}
                                    • Join from a quiet environment with headphones{"\n"}
                                    {item.isChatEnabled ? "• Use the class chat responsibly and professionally" : ""}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Actions */}
                    <View className="mt-5 flex-row gap-3">
                        <Pressable
                            onPress={onClose}
                            disabled={joining}
                            className="flex-1 items-center rounded-xl border border-gray-200 py-3"
                        >
                            <Text className="font-semibold text-gray-700">Cancel</Text>
                        </Pressable>

                        <Pressable
                            onPress={onJoin}
                            disabled={joining}
                            className={`flex-1 items-center rounded-xl py-3 ${joining ? "bg-primary-400" : "bg-primary-600"
                                }`}
                        >
                            <Text className="font-semibold text-white">
                                {joining ? "Joining..." : "Join Class"}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}