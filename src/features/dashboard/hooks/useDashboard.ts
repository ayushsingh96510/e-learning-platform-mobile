import { useEffect, useState } from "react";

import {
  getDashboardStats,
  getRecentContents,
  getRecentLiveClasses,
} from "../api/dashboard.api";

export function useDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [liveClasses, setLiveClasses] = useState<any>(null);
  const [contents, setContents] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsResponse, liveResponse, contentsResponse] =
        await Promise.all([
          getDashboardStats(),
          getRecentLiveClasses(),
          getRecentContents(),
        ]);

      setStats(statsResponse);
      setLiveClasses(liveResponse);
      setContents(contentsResponse);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    stats,
    liveClasses,
    contents,
    loading,
    error,
    refetch: fetchDashboard,
  };
}