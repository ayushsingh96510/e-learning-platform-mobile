import { Ionicons } from "@expo/vector-icons";
import { useParticipants } from "@livekit/react-native";
import { RoomEvent } from "livekit-client";
import { useMemo, useState } from "react";
import {
  FlatList,
  // KeyboardAvoidingView,
  // Modal,
  // Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import BottomSheet from "./BottomSheet";

import { useClassRoom } from "../classroom/ClassRoomContext";
import { extractAvatar } from "../classroom/utils";
import type { ParticipantRole } from "../classroom/types";
import { useSingleSpeakerSystem } from "../classroom/useSingleSpeakerSystem";
import Avatar from "./Avatar";

interface PanelParticipant {
  identity: string;
  name: string;
  avatar?: string;
  role: ParticipantRole;
  handRaised: boolean;
  isSpeaking: boolean;
}

// Same rule as the web ParticipantSidebar.
function resolveParticipantRole(
  participant: {
    identity: string;
    metadata?: string;
    attributes?: Record<string, string>;
  },
  teacherId?: string | null
): ParticipantRole {
  if (participant.identity === teacherId) return "TEACHER";
  const attrRole = participant.attributes?.role;
  if (attrRole === "ADMIN" || attrRole === "TEACHER") return attrRole;
  if (participant.metadata) {
    try {
      const meta = JSON.parse(participant.metadata);
      if (meta?.role === "ADMIN" || meta?.role === "TEACHER") return meta.role;
    } catch {
      // Ignore malformed metadata.
    }
  }
  return "STUDENT";
}

const ROLE_NAME: Record<ParticipantRole, string> = {
  TEACHER: "Teacher",
  ADMIN: "Admin",
  STUDENT: "Student",
};

const ROLE_CHIP: Record<ParticipantRole, { box: string; text: string }> = {
  TEACHER: { box: "bg-primary-600", text: "text-white" },
  ADMIN: { box: "border border-gray-300", text: "text-gray-700" },
  STUDENT: { box: "bg-gray-100", text: "text-gray-700" },
};

function ParticipantRow({
  participant,
  isLocal,
}: {
  participant: PanelParticipant;
  isLocal: boolean;
}) {
  const chip = ROLE_CHIP[participant.role];
  const label = participant.isSpeaking
    ? `Speaking ${ROLE_NAME[participant.role]}`
    : ROLE_NAME[participant.role];

  return (
    <View
      className={`mb-1.5 flex-row items-center gap-3 rounded-lg border bg-white px-3 py-2.5 ${participant.isSpeaking ? "border-green-400" : "border-slate-200"
        }`}
    >
      <View>
        <Avatar name={participant.name} uri={participant.avatar} size={36} />

        {participant.handRaised && (
          <View className="absolute -right-1.5 -top-1.5 h-[18px] w-[18px] items-center justify-center rounded-full bg-white">
            <Ionicons name="hand-left" size={11} color="#EAB308" />
          </View>
        )}

        <View className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-green-500" />
      </View>

      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="shrink text-sm font-medium text-gray-900" numberOfLines={1}>
            {participant.name}
          </Text>
          {isLocal && <Text className="text-[10px] text-gray-400">(you)</Text>}
        </View>

        <View className={`mt-0.5 self-start rounded-md px-1.5 py-0.5 ${chip.box}`}>
          <Text className={`text-[10px] font-medium ${chip.text}`}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

export default function ParticipantsSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { state } = useClassRoom();
  const teacherId = state.teacherIdentity?.id;
  const [query, setQuery] = useState("");

  const livekitParticipants = useParticipants({
    updateOnlyOn: [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.ActiveSpeakersChanged,
      RoomEvent.TrackMuted,
      RoomEvent.TrackUnmuted,
      RoomEvent.LocalTrackPublished,
      RoomEvent.LocalTrackUnpublished,
      RoomEvent.TrackPublished,
      RoomEvent.TrackUnpublished,
      RoomEvent.ParticipantAttributesChanged,
      RoomEvent.ParticipantMetadataChanged,
    ],
  });

  const { activeSpeaker } = useSingleSpeakerSystem(livekitParticipants, teacherId);

  const participants = useMemo<PanelParticipant[]>(() => {
    const q = query.trim().toLowerCase();
    return livekitParticipants
      .filter((p) => p.identity && p.identity.trim() !== "")
      .map((p) => ({
        identity: p.identity,
        name: p.name || p.identity,
        avatar: extractAvatar(p.metadata),
        role: resolveParticipantRole(p, teacherId),
        handRaised: p.attributes?.handRaised === "true",
        isSpeaking: p.identity === activeSpeaker,
      }))
      .filter((p) => (q ? p.name.toLowerCase().includes(q) : true))
      .sort((a, b) => {
        if (a.handRaised && !b.handRaised) return -1;
        if (!a.handRaised && b.handRaised) return 1;
        return 0;
      });
  }, [livekitParticipants, teacherId, query, activeSpeaker]);

  return (
    <BottomSheet visible={visible} onClose={onClose} heightPercent={70}>
      <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Ionicons name="people-outline" size={16} color="#6B7280" />
          <Text className="text-sm font-semibold text-gray-900">Participants</Text>
          <Text className="text-xs text-gray-500">{livekitParticipants.length}</Text>
        </View>

        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={20} color="#6B7280" />
        </Pressable>
      </View>

      <View className="px-3 pb-2 pt-3">
        <View className="h-9 flex-row items-center rounded-lg border border-gray-200 bg-white px-2.5">
          <Ionicons name="search" size={14} color="#9CA3AF" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search participants..."
            placeholderTextColor="#9CA3AF"
            className="ml-2 flex-1 text-xs text-gray-900"
          />
        </View>
      </View>

      <FlatList
        data={participants}
        keyExtractor={(p) => p.identity}
        renderItem={({ item }) => (
          <ParticipantRow
            participant={item}
            isLocal={item.identity === state.participantIdentity}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
      />
    </BottomSheet>
  );
}