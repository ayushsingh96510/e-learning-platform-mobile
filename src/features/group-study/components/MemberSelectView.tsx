import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  UsersRound,
  Search,
  Check,
  ChevronLeft,
  UserRound,
  AlertCircle,
  X,
  UserPlus,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { StudentOption } from "../types";

interface Props {
  options: StudentOption[];
  selectedIds: string[];
  loading: boolean;
  error: string | null;
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

    return options.filter((option) =>
      option.label.toLowerCase().includes(keyword)
    );
  }, [options, search]);

  const renderBody = () => {
    if (!hasBatch) {
      return (
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl border border-purple-100 bg-purple-50">
            <UsersRound size={30} color="#A020F0" strokeWidth={1.8} />
          </View>

          <Text className="text-center text-base font-bold text-gray-900">
            Batch Not Found
          </Text>

          <Text className="mt-2 text-center text-sm leading-6 text-gray-500">
            Your batch could not be found, so classmates cannot be listed.
          </Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View className="flex-1 items-center justify-center">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <ActivityIndicator size="large" color="#2563FF" />
          </View>

          <Text className="mt-3 text-sm font-medium text-gray-500">
            Loading students...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-red-50">
            <AlertCircle size={26} color="#FF4545" strokeWidth={1.8} />
          </View>

          <Text className="text-center text-base font-bold text-gray-900">
            Couldn't Load Students
          </Text>

          <Text className="mt-2 text-center text-sm leading-5 text-red-600">
            {error}
          </Text>

          <Pressable
            onPress={onRetry}
            className="mt-5 flex-row items-center justify-center rounded-xl bg-primary-600 px-6 py-3"
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
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: insets.bottom + 16,
          flexGrow: 1,
        }}
        ItemSeparatorComponent={() => <View className="h-2" />}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-12">
            <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-purple-50">
              <Search size={24} color="#A020F0" strokeWidth={1.8} />
            </View>

            <Text className="text-sm font-semibold text-gray-900">
              No students found
            </Text>

            <Text className="mt-1 text-center text-xs text-gray-500">
              Try searching with a different name.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const selected = selectedIds.includes(item.value);

          return (
            <Pressable
              onPress={() => onToggle(item.value)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              className={`flex-row items-center rounded-xl border p-3 ${selected
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-100 bg-white"
                }`}
            >
              <View
                className={`mr-3 h-10 w-10 items-center justify-center rounded-xl ${selected ? "bg-blue-100" : "bg-purple-50"
                  }`}
              >
                <UserRound
                  size={19}
                  color={selected ? "#2563FF" : "#A020F0"}
                  strokeWidth={1.8}
                />
              </View>

              <Text
                className={`flex-1 text-sm ${selected
                    ? "font-semibold text-gray-900"
                    : "font-medium text-gray-700"
                  }`}
                numberOfLines={1}
              >
                {item.label}
              </Text>

              <View
                className={`ml-3 h-6 w-6 items-center justify-center rounded-md border ${selected
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300 bg-white"
                  }`}
              >
                {selected && (
                  <Check size={15} color="#FFFFFF" strokeWidth={2.5} />
                )}
              </View>
            </Pressable>
          );
        }}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="border-b border-gray-100 bg-white px-4 pb-4"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center">
            <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl border border-purple-100 bg-purple-50">
              <UserPlus
                size={21}
                color="#A020F0"
                strokeWidth={2}
              />
            </View>

            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                Select Students
              </Text>

              <Text className="mt-0.5 text-xs text-gray-500">
                Choose classmates to invite
              </Text>
            </View>
          </View>

          {selectedIds.length === 0 ? (
            <Pressable
              onPress={onDone}
              accessibilityRole="button"
              accessibilityLabel="Cancel member selection"
              className="h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white"
              hitSlop={8}
            >
              <X size={19} color="#6B7280" strokeWidth={2} />
            </Pressable>
          ) : (
            <Pressable
              onPress={onDone}
              accessibilityRole="button"
              accessibilityLabel={`Done, ${selectedIds.length} students selected`}
              className="flex-row items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5"
            >
              <Check size={16} color="#FFFFFF" strokeWidth={2.5} />

              <Text className="ml-1.5 text-sm font-semibold text-white">
                Done
              </Text>
            </Pressable>
          )}
        </View>

        {/* Selection summary */}
        <View className="mt-4 flex-row items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5">
          <View className="flex-row items-center">
            <UsersRound size={16} color="#2563FF" strokeWidth={2} />

            <Text className="ml-2 text-sm font-medium text-gray-700">
              Selected students
            </Text>
          </View>

          <Text className="text-sm font-bold text-blue-600">
            {selectedIds.length}/{maxMembers}
          </Text>
        </View>

        {/* Search */}
        {hasBatch && (
          <View className="mt-3 h-11 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-3">
            <Search size={18} color="#9CA3AF" strokeWidth={2} />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search students"
              placeholderTextColor="#9CA3AF"
              autoCorrect={false}
              className="ml-2 flex-1 py-2 text-sm text-gray-900"
            />

            {!!search && (
              <Pressable
                onPress={() => setSearch("")}
                hitSlop={8}
                className="p-1"
              >
                <X size={16} color="#6B7280" strokeWidth={2} />
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Student list, loading state, or error state */}
      {renderBody()}
    </View>
  );
}