import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { getMaterials } from "../api/content.api";
import { MaterialType, Material } from "../types/content.types";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { StudentStackParamList } from "@/navigation/types";

const MATERIAL_TYPES: Array<{
  label: string;
  value: MaterialType | undefined;
}> = [
  { label: "All", value: undefined },
  { label: "Video", value: "VIDEO" },
  { label: "PDF", value: "PDF" },
  { label: "Document", value: "DOCUMENT" },
  { label: "Image", value: "IMAGE" },
  { label: "Audio", value: "AUDIO" },
];

const TYPE_ICONS: Record<MaterialType, keyof typeof Ionicons.glyphMap> = {
  VIDEO: "videocam-outline",
  PDF: "document-text-outline",
  DOCUMENT: "book-outline",
  IMAGE: "image-outline",
  AUDIO: "musical-notes-outline",
};

function formatSize(bytes: number): string {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(date: string): string {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ContentLibraryScreen() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<
    MaterialType | undefined
  >(undefined);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigation =
  useNavigation<NativeStackNavigationProp<StudentStackParamList>>();

  const fetchMaterials = useCallback(
    async (requestedPage: number, append = false) => {
      try {
        setError("");

        const result = await getMaterials({
          status: "PUBLISHED",
          search: search.trim() || undefined,
          type: selectedType,
          page: requestedPage,
          limit: 20,
        });

        setMaterials((previous) =>
          append
            ? [
                ...previous,
                ...result.materials.filter(
                  (item) => !previous.some((old) => old.id === item.id),
                ),
              ]
            : result.materials,
        );

        setPage(requestedPage);
        setTotalPages(result.pagination?.totalPages ?? 1);
      } catch (err: unknown) {
        const message =
          typeof err === "object" &&
          err !== null &&
          "response" in err
            ? (
                err as {
                  response?: { data?: { message?: string } };
                }
              ).response?.data?.message
            : undefined;

        setError(message || "Unable to load learning materials.");
      }
    },
    [search, selectedType],
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await getMaterials({
          status: "PUBLISHED",
          search: search.trim() || undefined,
          type: selectedType,
          page: 1,
          limit: 20,
        });

        if (!active) return;

        setMaterials(result.materials);
        setPage(1);
        setTotalPages(result.pagination?.totalPages ?? 1);
      } catch (err: unknown) {
        if (!active) return;

        const message =
          typeof err === "object" &&
          err !== null &&
          "response" in err
            ? (
                err as {
                  response?: { data?: { message?: string } };
                }
              ).response?.data?.message
            : undefined;

        setError(message || "Unable to load learning materials.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [search, selectedType]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMaterials(1);
    setRefreshing(false);
  }, [fetchMaterials]);

  const onLoadMore = useCallback(async () => {
    if (loading || refreshing || loadingMore || page >= totalPages) return;

    setLoadingMore(true);
    await fetchMaterials(page + 1, true);
    setLoadingMore(false);
  }, [
    loading,
    refreshing,
    loadingMore,
    page,
    totalPages,
    fetchMaterials,
  ]);

  const renderMaterial = ({ item }: { item: Material }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      className="mb-3 overflow-hidden rounded-2xl border border-gray-100 bg-white"
      onPress={() =>
        navigation.navigate("MaterialDetail", {materialId: item.id,})}
    >
      <View className="h-36 items-center justify-center bg-blue-50">
        <Ionicons
          name={TYPE_ICONS[item.materialType] ?? "document-outline"}
          size={48}
          color="#2563EB"
        />
      </View>

      <View className="p-4">
        <Text
          numberOfLines={2}
          className="text-base font-bold text-gray-900"
        >
          {item.title}
        </Text>

        <Text numberOfLines={1} className="mt-1 text-sm text-gray-500">
            {(typeof item.subject === "string" ? item.subject : item.subject?.name) || "General"}{" · "}{item.createdBy?.name || "Instructor"}
        </Text>

        <View className="mt-3 flex-row items-center">
          <View className="rounded-md bg-blue-50 px-2 py-1">
            <Text className="text-xs font-semibold text-blue-700">
              {item.materialType}
            </Text>
          </View>

          <Text className="ml-2 text-xs text-gray-500">
            {formatSize(item.file?.size ?? 0)}
          </Text>

          <View className="flex-1" />

          <Text className="text-xs text-gray-400">
            {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="border-b border-gray-100 bg-white px-5 pb-4 pt-5">
        <Text className="text-2xl font-bold text-gray-900">
          Content Library
        </Text>
        <Text className="mt-1 text-sm text-gray-500">
          Browse your learning materials
        </Text>

        <View className="mt-4 flex-row items-center rounded-xl border border-gray-200 bg-gray-50 px-3">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search materials..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            className="flex-1 px-3 py-3 text-sm text-gray-900"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="py-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          data={MATERIAL_TYPES}
          keyExtractor={(item) => item.value ?? "ALL"}
          renderItem={({ item }) => {
            const selected = selectedType === item.value;

            return (
              <TouchableOpacity
                onPress={() => setSelectedType(item.value)}
                className={`rounded-full border px-4 py-2 ${
                  selected
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selected ? "text-white" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="mt-3 text-sm text-gray-500">
            Loading materials...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons
            name="cloud-offline-outline"
            size={42}
            color="#9CA3AF"
          />
          <Text className="mt-3 text-center font-semibold text-gray-900">
            Couldn’t load materials
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-500">
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => {
              void onRefresh();
            }}
            className="mt-4 rounded-xl bg-blue-600 px-5 py-3"
          >
            <Text className="font-semibold text-white">Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={materials}
          keyExtractor={(item) => item.id}
          renderItem={renderMaterial}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 24,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                void onRefresh();
              }}
              tintColor="#2563EB"
            />
          }
          onEndReached={() => {
            void onLoadMore();
          }}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons
                name="library-outline"
                size={48}
                color="#9CA3AF"
              />
              <Text className="mt-4 text-base font-semibold text-gray-900">
                No materials found
              </Text>
              <Text className="mt-1 text-center text-sm text-gray-500">
                Try another search or material type.
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View className="py-4">
                <ActivityIndicator color="#2563EB" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}