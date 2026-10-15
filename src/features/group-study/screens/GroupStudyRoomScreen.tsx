import { Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { StudentStackParamList } from "@/navigation/StudentNavigator";

type Props = NativeStackScreenProps<StudentStackParamList, "GroupStudyRoom">;

/**
 * Temporary placeholder so that joining a room has somewhere to go.
 * It will be replaced by the full room screen
 * (audio, participants, chat, files and the view-only whiteboard).
 */
export default function GroupStudyRoomScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { roomName, joinData } = route.params;

  return (
    <View
      className="flex-1 items-center justify-center bg-gray-50 px-6"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Text className="text-lg font-bold text-gray-900">
        {joinData?.room.name ?? roomName}
      </Text>
      <Text className="mt-2 text-center text-sm text-gray-500">
        You have joined this room. Live audio, chat and the whiteboard are
        coming in the next step.
      </Text>

      <Pressable
        onPress={() => navigation.goBack()}
        className="mt-6 rounded-xl bg-primary-600 px-6 py-3"
      >
        <Text className="font-semibold text-white">Back</Text>
      </Pressable>
    </View>
  );
}
