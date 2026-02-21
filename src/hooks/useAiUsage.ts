import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { AiUsageStats } from "../types";

type Period = "7d" | "30d" | "all";

const emptyStats: AiUsageStats = {
  totalPromptTokens: 0,
  totalCompletionTokens: 0,
  totalTokens: 0,
  totalCostUsd: 0,
  callCount: 0,
};

export function useAiUsage() {
  const [stats, setStats] = useState<AiUsageStats>(emptyStats);
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async (p: Period) => {
    setLoading(true);
    try {
      const result = await invoke<AiUsageStats>("get_ai_usage_stats", { period: p });
      setStats(result);
    } catch {
      setStats(emptyStats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(period);
  }, [period, fetchStats]);

  const changePeriod = (p: Period) => setPeriod(p);
  const refresh = () => fetchStats(period);

  return { stats, period, changePeriod, loading, refresh };
}
