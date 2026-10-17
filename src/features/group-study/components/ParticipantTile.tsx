import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Participant } from "livekit-client";
import { getInitials, isRoomCreator } from "../utils/participants";

interface Props {
  participant: Participant;
  isLocal: boolean;
}

export default function ParticipantTile({
  participant,
  isLocal,
}: Props) {
  const name = participant.name || participant.identity;
  const creator = isRoomCreator(participant);
  const micOn = participant.isMicrophoneEnabled;
  const speaking = participant.isSpeaking;

  return (
    <View className="w-1/3 items-center px-1 py-3">
      <View className="relative">
        {/* Participant Avatar */}
        <View
          className={`h-16 w-16 items-center justify-center rounded-full border-2 bg-primary-50 ${
            speaking ? "border-green-500" : "border-transparent"
          }`}
        >
          <Text className="text-base font-semibold text-primary-600">
            {getInitials(name)}
          </Text>
        </View>

        {/* Room Creator */}
        {creator && (
          <View className="absolute -right-1 -top-1 h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white">
            <Ionicons
              name="star"
              size={14}
              color="#D97706"
            />
          </View>
        )}

        {/* Microphone Status */}
        <View
          className={`absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full border border-gray-100 ${
            micOn ? "bg-gray-100" : "bg-red-100"
          }`}
        >
          <Ionicons
            name={micOn ? "mic" : "mic-off"}
            size={13}
            color={micOn ? "#374151" : "#DC2626"}
          />
        </View>
      </View>

      {/* Participant Name */}
      <Text
        className="mt-2 max-w-full text-xs font-medium text-gray-900"
        numberOfLines={1}
      >
        {isLocal ? `${name} (You)` : name}
      </Text>
    </View>
  );
}
