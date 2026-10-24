import { useCallback, useEffect, useRef, useState } from "react";
import { getSessions } from "../api/liveClasses.api";
import type { LiveClassTab, LiveSession } from "../types";

const PAGE_SIZE = 10;

export function useLiveSessions(
  tab: LiveClassTab,
  startDate?: string,
  endDate?: string
) {
  const [items, setItems] = useState<LiveSession[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(
    async (nextPage: number, mode: "initial" | "refresh" | "more") => {
      const id = ++requestId.current;
      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);
      if (mode === "more") setLoadingMore(true);
      setError(null);

      try {
        const res = await getSessions(tab, {
          page: nextPage,
          limit: PAGE_SIZE,
          startDate: tab === "UPCOMING" ? startDate || undefined : undefined,
          endDate: tab === "UPCOMING" ? endDate || undefined : undefined,
        });

        // Ignore the result if a newer request has started.
        if (id !== requestId.current) return;

        setItems((prev) =>
          mode === "more" ? [...prev, ...res.sessions] : res.sessions
        );
        setPage(nextPage);
        setTotalPages(res.pagination?.totalPages ?? 1);
      } catch (e: any) {
        if (id !== requestId.current) return;
        setError(e?.response?.data?.message ?? "Failed to load classes.");
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [tab, startDate, endDate]
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

  const refetch = useCallback(() => {
    void load(1, "refresh");
  }, [load]);

  return {
    items,
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,
    loadMore,
    refetch,
    reload: () => load(1, "initial"),
  };
}