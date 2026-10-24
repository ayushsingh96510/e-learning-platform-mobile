import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { ChevronRight, Video } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert } from "react-native";
import { requestMediaPermissions } from "@/features/classroom/permissions";

import { useLiveSessions } from "../../live-class/hooks/useLiveSessions";
import LiveClassCard from "../../live-class/components/LiveClassCard";
import LiveClassJoinSheet from "../../live-class/components/LiveClassJoinSheet";
import type { LiveSession } from "../../live-class/types";
import type { StudentStackParamList } from "@/navigation/types";
import ActiveLiveClassCard from "./ActiveLiveClassCard";

interface Props {
    userName?: string | null;
}

export default function ActiveLiveClasses({ userName }: Props) {
    const navigation =
        useNavigation<NativeStackNavigationProp<StudentStackParamList>>();

    const {
        items,
        loading,
        error,
        refetch,
    } = useLiveSessions("LIVE");

    useEffect(() => {
        if (loading) return;

        const intervalId = setInterval(() => {
            refetch();
        }, 30_000);

        return () => clearInterval(intervalId);
    }, [loading, refetch]);

    const [selectedClass, setSelectedClass] =
        useState<LiveSession | null>(null);

    const [sheetVisible, setSheetVisible] = useState(false);
    const [joining, setJoining] = useState(false);

    const handleJoin = (item: LiveSession) => {
        if (!item.roomName) return;

        setSelectedClass(item);
        setSheetVisible(true);
    };

    const closeSheet = () => {
        if (joining) return;

        setSheetVisible(false);
        setSelectedClass(null);
    };

    const confirmJoin = async () => {
        if (!selectedClass?.roomName || joining) return;

        try {
            setJoining(true);

            const result = await requestMediaPermissions();
            const denied = !result.camera || !result.microphone;

            if (denied) {
                Alert.alert(
                    "Camera and microphone access",
                    result.blocked
                        ? "Permissions are blocked. You can enable them later from device settings."
                        : "Camera or microphone permission was denied. You can still join the class.",
                    [
                        {
                            text: "Join anyway",
                            onPress: () => {
                                navigation.navigate("ClassRoom", {
                                    roomName: selectedClass.roomName!,
                                });
                                setSheetVisible(false);
                                setSelectedClass(null);
                            },
                        },
                        {
                            text: "Cancel",
                            style: "cancel",
                        },
                    ],
                );

                return;
            }

            navigation.navigate("ClassRoom", {
                roomName: selectedClass.roomName,
            });

            setSheetVisible(false);
            setSelectedClass(null);
        } catch (error) {
            console.warn("[dashboard-join] failed:", error);

            Alert.alert(
                "Join failed",
                "Unable to join the class. Please try again.",
            );
        } finally {
            setJoining(false);
        }
    };

    return (
        <View className="mt-6">
            {/* Section header */}
            <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <View>
                        <Text className="text-lg font-bold text-gray-900">
                            Active Live Classes
                        </Text>
                        <Text className="mt-0.5 text-xs text-gray-500">
                            Classes happening right now
                        </Text>
                    </View>
                </View>

                <Pressable
                    onPress={() =>
                        navigation.navigate("MainTabs", {
                            screen: "LiveClasses",
                        } as never)
                    }
                    className="flex-row items-center"
                    accessibilityRole="button"
                    accessibilityLabel="View all live classes"
                >
                    <Text className="text-sm font-semibold text-blue-600">
                        View all
                    </Text>
                    <ChevronRight size={17} color="#2563EB" />
                </Pressable>
            </View>

            {/* Loading */}
            {loading && (
                <View className="h-40 items-center justify-center rounded-2xl border border-gray-100 bg-white">
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text className="mt-3 text-sm text-gray-500">
                        Loading active classes...
                    </Text>
                </View>
            )}

            {/* Error */}
            {!loading && !!error && (
                <View className="rounded-2xl border border-gray-100 bg-white p-5">
                    <Text className="text-sm text-red-600">{error}</Text>

                    <Pressable
                        onPress={refetch}
                        className="mt-3 self-start rounded-lg bg-blue-50 px-4 py-2"
                    >
                        <Text className="font-semibold text-blue-600">
                            Try again
                        </Text>
                    </Pressable>
                </View>
            )}

            {/* Empty state */}
            {!loading && !error && items.length === 0 && (
                <View className="items-center rounded-2xl border border-gray-100 bg-white px-5 py-7">
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <Video size={23} color="#6B7280" />
                    </View>

                    <Text className="mt-3 text-base font-semibold text-gray-800">
                        No active classes
                    </Text>

                    <Text className="mt-1 text-center text-sm text-gray-500">
                        Your live classes will appear here when they start.
                    </Text>
                </View>
            )}

            {/* Horizontal cards */}
            {!loading && !error && items.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled
                    contentContainerStyle={{ paddingRight: 4 }}
                >
                    {items.map((item) => (
                        <ActiveLiveClassCard
                            key={item.id}
                            item={item}
                            onJoin={() => handleJoin(item)}
                        />
                    ))}
                </ScrollView>
            )}

            {/* Existing join confirmation sheet */}
            <LiveClassJoinSheet
                visible={sheetVisible}
                item={selectedClass}
                onClose={closeSheet}
                onJoin={confirmJoin}
                joining={joining}
                userName={userName}
            />
        </View>
    );
}