import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { StudentOption } from "../types";

interface Props {
  options: StudentOption[];
  selectedIds: string[];
  loading: boolean;
  error: string | null;
  /** False when the student's batch is not known, so nobody can be listed. */
  hasBatch: boolean;
  maxMembers: number;
  onToggle: (id: string) => void;
  onRetry: () => void;
  onDone: () => void;
}

export default function MemberSelectView({
  options,
  selectedIds,
  loading,
  error,
  hasBatch,
  maxMembers,
  onToggle,
  onRetry,
  onDone,
}: Props) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter((option) => option.label.toLowerCase().includes(keyword));
  }, [options, search]);

  const renderBody = () => {
    if (!hasBatch) {
      return (
        <Text className="p-6 text-center text-sm text-gray-500">
          Your batch could not be found, so classmates cannot be listed. You can
          still create the room without inviting anyone.
        </Text>
      );
    }

    if (loading) {
      return (
        <View className="items-center p-6">
          <ActivityIndicator />
        </View>
      );
    }

    if (error) {
      return (
        <View className="items-center p-6">
          <Text className="text-center text-sm text-red-600">{error}</Text>
          <Pressable
            onPress={onRetry}
            className="mt-4 rounded-xl bg-primary-600 px-6 py-3"
          >
            <Text className="font-semibold text-white">Retry</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.value}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        ListEmptyComponent={
          <Text className="p-6 text-center text-sm text-gray-500">
            No students found.
          </Text>
        }
        renderItem={({ item }) => {
          const selected = selectedIds.includes(item.value);

          return (
            <Pressable
              onPress={() => onToggle(item.value)}
              className="flex-row items-center border-b border-gray-100 bg-white px-4 py-3"
            >
              <View
                className={`mr-3 h-6 w-6 items-center justify-center rounded-md border ${
                  selected
                    ? "border-primary-600 bg-primary-600"
                    : "border-gray-300 bg-white"
                }`}
              >
                {selected && <Text className="text-xs font-bold text-white">✓</Text>}
              </View>

              <Text className="flex-1 text-sm text-gray-900" numberOfLines={1}>
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View
        className="border-b border-gray-100 bg-white px-4 pb-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-bold text-gray-900">Select Students</Text>
            <Text className="text-xs text-gray-500">
              {selectedIds.length} of {maxMembers} selected
            </Text>
          </View>

          <Pressable
            onPress={onDone}
            className="rounded-xl bg-primary-600 px-4 py-2"
          >
            <Text className="text-sm font-semibold text-white">Done</Text>
          </Pressable>
        </View>

        {hasBatch && (
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search students"
            placeholderTextColor="#9CA3AF"
            autoCorrect={false}
            className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900"
          />
        )}
      </View>

      {renderBody()}
    </View>
  );
}
