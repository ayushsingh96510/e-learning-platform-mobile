import { Ionicons } from "@expo/vector-icons";
import { Image, Text, View } from "react-native";

import { useClassRoom } from "../ClassRoomContext";
import { getInitials } from "../utils";

export default function StageWaiting() {
  const { state } = useClassRoom();
  const presenter = state.presenter;

  return (
    <View className="h-full w-full items-center justify-center gap-3 p-4">
      <View>
        <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-violet-300 bg-violet-500">
          {presenter?.profileImage ? (
            <Image
              source={{ uri: presenter.profileImage }}
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <Text className="text-xl font-bold text-white">
              {getInitials(presenter?.name || "")}
            </Text>
          )}
        </View>
        <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100">
          <Ionicons name="time-outline" size={13} color="#64748B" />
        </View>
      </View>

      <View className="items-center">
        <Text className="text-center text-sm font-medium text-slate-700">
          Waiting for {presenter?.name || "teacher"} to start the class
        </Text>
        <Text className="mt-1 text-xs text-slate-400">
          The class will begin shortly
        </Text>
      </View>
    </View>
  );
}