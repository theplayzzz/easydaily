import { format, subDays } from "date-fns";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../stores/useStore";
import { logger } from "../utils/logger";
import type { Note, Summary } from "../types";

function mapError(error: string): string {
  if (error.includes("INVALID_API_KEY")) return "INVALID_API_KEY";
  if (error.includes("NO_CONNECTION")) return "NO_CONNECTION";
  if (error.includes("RATE_LIMITED")) return "RATE_LIMITED";
  if (error.includes("TIMEOUT")) return "TIMEOUT";
  return error;
}

export function useAiSummary() {
  const dayDataCache = useStore((s) => s.dayDataCache);
  const tags = useStore((s) => s.tags);
  const config = useStore((s) => s.config);
  const openAiResult = useStore((s) => s.openAiResult);
  const setAiResultState = useStore((s) => s.setAiResultState);
  const addSummary = useStore((s) => s.addSummary);

  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

  // Build tag name lookup: { "tag-1": "Tarefa", "tag-2": "Reunião" }
  const tagNameMap = new Map(tags.map((t) => [t.id, t.name]));

  // Convert notes to strings with tag names included
  const formatNotesWithTags = (notes: Note[]): string[] => {
    return notes.map((n) => {
      const tagNames = n.tags
        .map((id) => tagNameMap.get(id))
        .filter(Boolean);
      if (tagNames.length > 0) {
        return `${n.content} [Tags: ${tagNames.join(", ")}]`;
      }
      return n.content;
    });
  };

  const getTodayNotes = (): string[] => {
    const notes = dayDataCache[today]?.notes ?? [];
    return formatNotesWithTags(notes);
  };

  const getYesterdayNotes = (): string[] => {
    const notes = dayDataCache[yesterday]?.notes ?? [];
    return formatNotesWithTags(notes);
  };

  const saveSummaryToBackend = async (
    summaryType: "daily_summary" | "combined_summary" | "standup",
    content: string,
    date: string
  ) => {
    try {
      const summary = await invoke<Summary>("save_summary", {
        date,
        summaryType,
        content,
        provider: config.activeProvider,
      });
      addSummary(date, summary);
      logger.info("useAiSummary", `[save_summary] Saved summary ${summary.id} to ${date}`);
    } catch (err) {
      logger.error("useAiSummary", `[save_summary] Failed to save summary`, err);
      // Don't show error to user - summary was still generated successfully
    }
  };

  const generateDailySummary = async () => {
    const startTime = performance.now();
    logger.info("useAiSummary", "[daily_summary] Started — collecting notes...");
    openAiResult("daily_summary");
    try {
      const notes = getTodayNotes();
      logger.info("useAiSummary", `[daily_summary] Collected ${notes.length} notes from today (${today})`);
      logger.info("useAiSummary", `[daily_summary] Calling invoke("generate_summary")...`);
      const invokeStart = performance.now();
      const result = await invoke<string>("generate_summary", {
        summaryType: "daily_summary",
        notes,
        yesterdayNotes: null,
        todayPlan: null,
      });
      const invokeMs = Math.round(performance.now() - invokeStart);
      const totalMs = Math.round(performance.now() - startTime);
      logger.info("useAiSummary", `[daily_summary] Success — invoke: ${invokeMs}ms, total: ${totalMs}ms, result: ${result.length} chars`);
      setAiResultState("success", result);
      // Save summary to backend
      await saveSummaryToBackend("daily_summary", result, today);
    } catch (err) {
      const totalMs = Math.round(performance.now() - startTime);
      logger.error("useAiSummary", `[daily_summary] Failed after ${totalMs}ms`, err);
      setAiResultState("error", mapError(String(err)));
    }
  };

  const generateCombinedSummary = async () => {
    const startTime = performance.now();
    logger.info("useAiSummary", "[combined_summary] Started — collecting notes...");
    openAiResult("combined_summary");
    try {
      const notes = getTodayNotes();
      const yesterdayNotes = getYesterdayNotes();
      logger.info("useAiSummary", `[combined_summary] Collected ${notes.length} today + ${yesterdayNotes.length} yesterday notes`);
      logger.info("useAiSummary", `[combined_summary] Calling invoke("generate_summary")...`);
      const invokeStart = performance.now();
      const result = await invoke<string>("generate_summary", {
        summaryType: "combined_summary",
        notes,
        yesterdayNotes,
        todayPlan: null,
      });
      const invokeMs = Math.round(performance.now() - invokeStart);
      const totalMs = Math.round(performance.now() - startTime);
      logger.info("useAiSummary", `[combined_summary] Success — invoke: ${invokeMs}ms, total: ${totalMs}ms, result: ${result.length} chars`);
      setAiResultState("success", result);
      // Save summary to backend (saved on today's date)
      await saveSummaryToBackend("combined_summary", result, today);
    } catch (err) {
      const totalMs = Math.round(performance.now() - startTime);
      logger.error("useAiSummary", `[combined_summary] Failed after ${totalMs}ms`, err);
      setAiResultState("error", mapError(String(err)));
    }
  };

  const generateStandup = async (todayPlan: string) => {
    const startTime = performance.now();
    logger.info("useAiSummary", "[standup] Started — collecting notes...");
    openAiResult("standup");
    try {
      const yesterdayNotes = getYesterdayNotes();
      logger.info("useAiSummary", `[standup] Collected ${yesterdayNotes.length} yesterday notes, plan: ${todayPlan.length} chars`);
      logger.info("useAiSummary", `[standup] Calling invoke("generate_summary")...`);
      const invokeStart = performance.now();
      const result = await invoke<string>("generate_summary", {
        summaryType: "standup",
        notes: [],
        yesterdayNotes,
        todayPlan,
      });
      const invokeMs = Math.round(performance.now() - invokeStart);
      const totalMs = Math.round(performance.now() - startTime);
      logger.info("useAiSummary", `[standup] Success — invoke: ${invokeMs}ms, total: ${totalMs}ms, result: ${result.length} chars`);
      setAiResultState("success", result);
      // Save summary to backend (saved on today's date)
      await saveSummaryToBackend("standup", result, today);
    } catch (err) {
      const totalMs = Math.round(performance.now() - startTime);
      logger.error("useAiSummary", `[standup] Failed after ${totalMs}ms`, err);
      setAiResultState("error", mapError(String(err)));
    }
  };

  return { generateDailySummary, generateCombinedSummary, generateStandup };
}
