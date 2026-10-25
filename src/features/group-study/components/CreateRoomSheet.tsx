import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  BookOpen,
  UsersRound,
  LockKeyhole,
  ChevronRight,
  X,
  AlertCircle,
  Users,
  AlignLeft,
  GraduationCap,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MemberSelectView from "./MemberSelectView";
import { useBatchStudents } from "../hooks/useBatchStudents";
import { useCreateRoom } from "../hooks/useCreateRoom";
import { ROOM_LIMITS, validateRoomForm } from "../utils/roomForm";

interface Props {
  visible: boolean;
  /** Batch of the logged-in student, used to list classmates to invite. */
  batchId?: string;
  onClose: () => void;
  onCreated: () => void;
}

const inputClass =
  "rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900";

export default function CreateRoomSheet({
  visible,
  batchId,
  onClose,
  onCreated,
}: Props) {
  const insets = useSafeAreaInsets();
  const students = useBatchStudents(visible ? batchId : undefined);
  const { create, creating } = useCreateRoom();

  const [screen, setScreen] = useState<"form" | "members">("form");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const errors = useMemo(
    () =>
      submitted ? validateRoomForm({ name, subject, description, memberIds }) : {},
    [submitted, name, subject, description, memberIds]
  );

  const selectedLabels = useMemo(
    () =>
      memberIds.map(
        (id) => students.options.find((option) => option.value === id)?.label ?? "Student"
      ),
    [memberIds, students.options]
  );

  const reset = () => {
    setScreen("form");
    setName("");
    setSubject("");
    setDescription("");
    setIsPrivate(true);
    setMemberIds([]);
    setSubmitted(false);
    setServerError(null);
  };

  const toggleMember = (id: string) => {
    if (memberIds.includes(id)) {
      setMemberIds((prev) => prev.filter((value) => value !== id));
      return;
    }

    if (memberIds.length >= ROOM_LIMITS.membersMax) {
      Alert.alert(
        "Limit reached",
        `You can invite up to ${ROOM_LIMITS.membersMax} students.`
      );
      return;
    }

    setMemberIds((prev) => [...prev, id]);
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setServerError(null);

    const found = validateRoomForm({ name, subject, description, memberIds });
    if (Object.keys(found).length > 0) return;

    const message = await create({
      name: name.trim(),
      description: description.trim(),
      subject: subject.trim(),
      isPrivate,
      memberIds,
    });

    if (message) {
      setServerError(message);
      return;
    }

    reset();
    onClose();
    onCreated();
    Alert.alert("Study Room Created", "Your study room is ready.");
  };

  const memberSummary =
    selectedLabels.length === 0
      ? null
      : selectedLabels.length <= 2
        ? selectedLabels.join(", ")
        : `${selectedLabels.slice(0, 2).join(", ")} +${selectedLabels.length - 2} more`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={() => {
        if (screen === "members") setScreen("form");
        else if (!creating) onClose();
      }}
    >
      {screen === "members" ? (
        <MemberSelectView
          options={students.options}
          selectedIds={memberIds}
          loading={students.loading}
          error={students.error}
          hasBatch={!!batchId}
          maxMembers={ROOM_LIMITS.membersMax}
          onToggle={toggleMember}
          onRetry={students.reload}
          onDone={() => setScreen("form")}
        />
      ) : (
        <KeyboardAvoidingView
          className="flex-1 bg-gray-50"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Header */}
          <View
            className="flex-row items-center justify-between border-b border-gray-100 bg-white px-4 pb-3"
            style={{ paddingTop: insets.top + 12 }}
          >
            <Text className="text-lg font-bold text-gray-900">
              Create Study Room
            </Text>

            <Pressable
              onPress={onClose}
              disabled={creating}
              hitSlop={12}
              className="h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white"
            >
              <X size={18} color="#6B7280" strokeWidth={2} />
            </Pressable>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="p-4"
            keyboardShouldPersistTaps="handled"
          >
            {/* Name */}
            <View className="mb-1.5 flex-row items-center gap-2">
              <View className="h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                <BookOpen size={15} color="#2563FF" strokeWidth={2} />
              </View>

              <Text className="text-sm font-semibold text-gray-700">
                Room Name
              </Text>
            </View>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="DSA Group Study"
              placeholderTextColor="#9CA3AF"
              maxLength={ROOM_LIMITS.nameMax}
              className={inputClass}
            />
            {!!errors.name && (
              <Text className="mt-1 text-xs text-red-600">{errors.name}</Text>
            )}

            {/* Subject */}
            <View className="mb-1.5 mt-4 flex-row items-center gap-2">
              <View className="h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                <GraduationCap size={15} color="#2563FF" strokeWidth={2} />
              </View>

              <Text className="text-sm font-semibold text-gray-700">
                Subject (optional)
              </Text>
            </View>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="Data Structures"
              placeholderTextColor="#9CA3AF"
              maxLength={ROOM_LIMITS.subjectMax}
              className={inputClass}
            />
            {!!errors.subject && (
              <Text className="mt-1 text-xs text-red-600">{errors.subject}</Text>
            )}

            {/* Description */}
            <View className="mb-1.5 mt-4 flex-row items-center gap-2">
              <View className="h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                <AlignLeft size={15} color="#2563FF" strokeWidth={2} />
              </View>
              <Text className="mb-1.5 mt-4 text-sm font-medium text-gray-700">
                Description (optional)
              </Text>
            </View>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What will you study in this room?"
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              maxLength={ROOM_LIMITS.descriptionMax}
              className={`min-h-[96px] ${inputClass}`}
            />
            {!!errors.description && (
              <Text className="mt-1 text-xs text-red-600">
                {errors.description}
              </Text>
            )}

            {/* Members */}
            <View className="mb-1.5 mt-4 flex-row items-center gap-2">
              <View className="h-7 w-7 items-center justify-center rounded-lg bg-purple-50">
                <UsersRound size={15} color="#A020F0" strokeWidth={2} />
              </View>

              <Text className="text-sm font-semibold text-gray-700">
                Members
              </Text>
            </View>
            <Pressable
              onPress={() => setScreen("members")}
              className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <Text
                className={`mr-2 flex-1 text-sm ${memberSummary ? "text-gray-900" : "text-gray-400"
                  }`}
                numberOfLines={1}
              >
                {memberSummary ?? "Select students..."}
              </Text>

              <View className="flex-row items-center gap-2">
                {memberIds.length > 0 && (
                  <View className="rounded-lg bg-purple-50 px-2 py-1">
                    <Text className="text-xs font-semibold text-purple-700">
                      {memberIds.length}
                    </Text>
                  </View>
                )}

                <ChevronRight size={18} color="#A020F0" strokeWidth={2} />
              </View>
            </Pressable>
            {!!errors.members && (
              <Text className="mt-1 text-xs text-red-600">{errors.members}</Text>
            )}

            {/* Private */}
            <View className="mt-4 flex-row items-center justify-between rounded-xl border border-orange-200 bg-white p-4">
              <View className="mr-3 flex-1 flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                  <LockKeyhole
                    size={19}
                    color="#F08C00"
                    strokeWidth={2}
                  />
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900">
                    Private Room
                  </Text>

                  <Text className="mt-0.5 text-xs leading-5 text-gray-500">
                    Only invited members can join a private room
                  </Text>
                </View>
              </View>

              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{
                  false: "#E5E7EB",
                  true: "#F08C00",
                }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
              />

            </View>

            {!!serverError && (
              <View className="mt-4 flex-row items-start rounded-xl border border-red-200 bg-red-50 p-3">
                <AlertCircle
                  size={18}
                  color="#FF4545"
                  strokeWidth={2}
                />

                <Text className="ml-2 flex-1 text-sm leading-5 text-red-700">
                  {serverError}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View
            className="flex-row gap-3 border-t border-gray-100 bg-white px-4 pt-3"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            <Pressable
              onPress={onClose}
              disabled={creating}
              className="flex-1 items-center rounded-xl border border-gray-200 py-3"
            >
              <Text className="font-semibold text-gray-700">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              disabled={creating}
              className={`flex-1 flex-row items-center justify-center rounded-xl py-3 ${creating ? "bg-primary-400" : "bg-primary-600"
                }`}
            >
              {creating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Users size={17} color="#FFFFFF" strokeWidth={2} />

                  <Text className="ml-2 font-semibold text-white">
                    Create Room
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
}
