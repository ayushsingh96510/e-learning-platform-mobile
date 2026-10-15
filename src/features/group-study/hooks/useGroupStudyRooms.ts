import { useCallback, useEffect, useRef, useState } from "react";
import { getRooms } from "../api/groupStudy.api";
import type { RoomFilter, StudyRoom } from "../types";

const PAGE_SIZE = 12;

type LoadMode = "initial" | "refresh" | "more" | "silent";

export function useGroupStudyRooms(filter: RoomFilter, search: string) {
  const [items, setItems] = useState<StudyRoom[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(
    async (nextPage: number, mode: LoadMode) => {
      const id = ++requestId.current;
      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);
      if (mode === "more") setLoadingMore(true);
      if (mode !== "silent") setError(null);

      try {
        const res = await getRooms({
          page: nextPage,
          limit: PAGE_SIZE,
          search: search || undefined,
          filter,
        });

        // Ignore the result if a newer request has started.
        if (id !== requestId.current) return;

        setItems((prev) =>
          mode === "more" ? [...prev, ...res.rooms] : res.rooms
        );
        setPage(nextPage);
        setTotalPages(res.pagination?.totalPages ?? 1);
      } catch (e: any) {
        if (id !== requestId.current) return;
        if (mode !== "silent") {
          setError(e?.response?.data?.message ?? "Failed to load study rooms.");
        }
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [filter, search]
  );

  useEffect(() => {
    setItems([]);
    load(1, "initial");
  }, [load]);

  const hasMore = page < totalPages;

  const loadMore = useCallback(() => {
    if (loading || loadingMore || refreshing || !hasMore) return;
    load(page + 1, "more");
  }, [load, loading, loadingMore, refreshing, hasMore, page]);

  const refetch = useCallback(() => load(1, "refresh"), [load]);
  const reload = useCallback(() => load(1, "initial"), [load]);
  const refetchSilently = useCallback(() => load(1, "silent"), [load]);

  return {
    items,
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,
    loadMore,
    refetch,
    reload,
    refetchSilently,
  };
}
