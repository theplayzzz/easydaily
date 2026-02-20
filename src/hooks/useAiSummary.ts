import { format, subDays } from "date-fns";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../stores/useStore";
import { logger } from "../utils/logger";

function mapError(error: string): string {
  if (error.includes("INVALID_API_KEY")) return "INVALID_API_KEY";
  if (error.includes("NO_CONNECTION")) return "NO_CONNECTION";
  if (error.includes("RATE_LIMITED")) return "RATE_LIMITED";
  if (error.includes("TIMEOUT")) return "TIMEOUT";
  return error;
}

export function useAiSummary() {
  const dayDataCache = useStore((s) => s.dayDataCache);
  const openAiResult = useStore((s) => s.openAiResult);
  const setAiResultState = useStore((s) => s.setAiResultState);

  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

  const getTodayNotes = (): string[] => {
    return (dayDataCache[today]?.notes ?? []).map((n) => n.content);
  };

  const getYesterdayNotes = (): string[] => {
    return (dayDataCache[yesterday]?.notes ?? []).map((n) => n.content);
  };

  const generateDailySummary = async () => {
    openAiResult("daily_summary");
    try {
      const notes = getTodayNotes();
      const result = await invoke<string>("generate_summary", {
        summaryType: "daily_summary",
        notes,
        yesterdayNotes: null,
        todayPlan: null,
      });
      setAiResultState("success", result);
    } catch (err) {
      logger.error("useAiSummary", "Daily summary failed", err);
      setAiResultState("error", mapError(String(err)));
    }
  };

  const generateCombinedSummary = async () => {
    openAiResult("combined_summary");
    try {
      const notes = getTodayNotes();
      const yesterdayNotes = getYesterdayNotes();
      const result = await invoke<string>("generate_summary", {
        summaryType: "combined_summary",
        notes,
        yesterdayNotes,
        todayPlan: null,
      });
      setAiResultState("success", result);
    } catch (err) {
      logger.error("useAiSummary", "Combined summary failed", err);
      setAiResultState("error", mapError(String(err)));
    }
  };

  const generateStandup = async (todayPlan: string) => {
    openAiResult("standup");
    try {
      const yesterdayNotes = getYesterdayNotes();
      const result = await invoke<string>("generate_summary", {
        summaryType: "standup",
        notes: [],
        yesterdayNotes,
        todayPlan,
      });
      setAiResultState("success", result);
    } catch (err) {
      logger.error("useAiSummary", "Standup failed", err);
      setAiResultState("error", mapError(String(err)));
    }
  };

  return { generateDailySummary, generateCombinedSummary, generateStandup };
}
