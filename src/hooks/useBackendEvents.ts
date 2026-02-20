import { useEffect, useRef } from "react";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../stores/useStore";
import { useNotification } from "./useNotification";
import { useAiSummary } from "./useAiSummary";
import { NotificationType, Page } from "../types";
import { logger } from "../utils/logger";

export function useBackendEvents() {
  const { show: showNativeNotification } = useNotification();
  const openNoteEditor = useStore((s) => s.openNoteEditor);
  const setCurrentPage = useStore((s) => s.setCurrentPage);
  const openOnboarding = useStore((s) => s.openOnboarding);
  const { generateDailySummary } = useAiSummary();
  const generateDailySummaryRef = useRef(generateDailySummary);
  generateDailySummaryRef.current = generateDailySummary;

  useEffect(() => {
    const unlisteners: UnlistenFn[] = [];

    async function setup() {
      unlisteners.push(
        await listen("scheduler:cycle-complete", () => {
          logger.info("useBackendEvents", "Cycle complete");
          showNativeNotification(NotificationType.CycleCheckin);
          invoke("play_notification_sound").catch((err) =>
            logger.error("useBackendEvents", "Failed to play sound", err),
          );
        }),
      );

      unlisteners.push(
        await listen("scheduler:suggest-config", () => {
          logger.info("useBackendEvents", "Suggest config");
          showNativeNotification(NotificationType.SuggestConfig);
        }),
      );

      unlisteners.push(
        await listen("startup:summary-prompt", () => {
          logger.info("useBackendEvents", "Summary prompt");
          showNativeNotification(NotificationType.SummaryPrompt);
        }),
      );

      unlisteners.push(
        await listen<{ idle: boolean }>("idle:state-changed", (event) => {
          logger.info("useBackendEvents", `Idle state: ${event.payload.idle}`);
        }),
      );

      unlisteners.push(
        await listen("tray:add-note", () => {
          logger.info("useBackendEvents", "Tray: add note");
          invoke("show_window").catch((err) =>
            logger.error("useBackendEvents", "Failed to show window", err),
          );
          openNoteEditor();
        }),
      );

      unlisteners.push(
        await listen("tray:configure-timer", () => {
          logger.info("useBackendEvents", "Tray: configure timer");
          invoke("show_window").catch((err) =>
            logger.error("useBackendEvents", "Failed to show window", err),
          );
          setCurrentPage(Page.Settings);
        }),
      );

      unlisteners.push(
        await listen("tray:tutorial", () => {
          logger.info("useBackendEvents", "Tray: tutorial");
          invoke("show_window").catch((err) =>
            logger.error("useBackendEvents", "Failed to show window", err),
          );
          openOnboarding();
        }),
      );

      unlisteners.push(
        await listen("tray:generate-summary", () => {
          logger.info("useBackendEvents", "Tray: generate summary");
          invoke("show_window").catch((err) =>
            logger.error("useBackendEvents", "Failed to show window", err),
          );
          generateDailySummaryRef.current();
        }),
      );

      // Events from notification window action buttons
      unlisteners.push(
        await listen("notification:add-note", () => {
          logger.info("useBackendEvents", "Notification: add note");
          openNoteEditor();
        }),
      );

      unlisteners.push(
        await listen("notification:open-settings", () => {
          logger.info("useBackendEvents", "Notification: open settings");
          setCurrentPage(Page.Settings);
        }),
      );

      unlisteners.push(
        await listen("notification:generate-summary", () => {
          logger.info("useBackendEvents", "Notification: generate summary");
          generateDailySummaryRef.current();
        }),
      );

      logger.info("useBackendEvents", "All event listeners registered");
    }

    setup();

    return () => {
      unlisteners.forEach((unlisten) => unlisten());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
