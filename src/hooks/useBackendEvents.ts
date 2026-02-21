import { useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../stores/useStore";
import { useAiSummary } from "./useAiSummary";
import { Page } from "../types";
import { logger } from "../utils/logger";

export function useBackendEvents() {
  const openNoteEditor = useStore((s) => s.openNoteEditor);
  const setCurrentPage = useStore((s) => s.setCurrentPage);
  const openOnboarding = useStore((s) => s.openOnboarding);
  const { generateDailySummary } = useAiSummary();
  const generateDailySummaryRef = useRef(generateDailySummary);
  generateDailySummaryRef.current = generateDailySummary;

  useEffect(() => {
    let active = true;

    async function setup() {
      const listeners = await Promise.all([
        // Scheduler events — notification windows are created by the Rust backend,
        // these listeners are kept for frontend logging only.
        listen("scheduler:cycle-complete", () => {
          logger.info("useBackendEvents", "Cycle complete");
        }),

        listen("scheduler:suggest-config", () => {
          logger.info("useBackendEvents", "Suggest config");
        }),

        listen<{ idle: boolean }>("idle:state-changed", (event) => {
          logger.info("useBackendEvents", `Idle state: ${event.payload.idle}`);
        }),

        // Tray menu actions — these show the main window, so JS is active
        listen("tray:add-note", () => {
          logger.info("useBackendEvents", "Tray: add note");
          invoke("show_window").catch((err) =>
            logger.error("useBackendEvents", "Failed to show window", err),
          );
          openNoteEditor();
        }),

        listen("tray:configure-timer", () => {
          logger.info("useBackendEvents", "Tray: configure timer");
          invoke("show_window").catch((err) =>
            logger.error("useBackendEvents", "Failed to show window", err),
          );
          setCurrentPage(Page.Settings);
        }),

        listen("tray:tutorial", () => {
          logger.info("useBackendEvents", "Tray: tutorial");
          invoke("show_window").catch((err) =>
            logger.error("useBackendEvents", "Failed to show window", err),
          );
          openOnboarding();
        }),

        listen("tray:generate-summary", () => {
          logger.info("useBackendEvents", "Tray: generate summary");
          invoke("show_window").catch((err) =>
            logger.error("useBackendEvents", "Failed to show window", err),
          );
          generateDailySummaryRef.current();
        }),

        // Events from notification window action buttons —
        // the notification calls show_window before emitting, so JS is active
        listen("notification:add-note", () => {
          logger.info("useBackendEvents", "Notification: add note");
          openNoteEditor();
        }),

        listen("notification:open-settings", () => {
          logger.info("useBackendEvents", "Notification: open settings");
          setCurrentPage(Page.Settings);
        }),

        listen("notification:generate-summary", () => {
          logger.info("useBackendEvents", "Notification: generate summary");
          generateDailySummaryRef.current();
        }),
      ]);

      if (!active) {
        // StrictMode cleanup ran while setup was in progress — remove leaked listeners
        listeners.forEach((unlisten) => unlisten());
        return;
      }

      logger.info("useBackendEvents", "All event listeners registered");

      // Store for cleanup
      cleanup = () => listeners.forEach((unlisten) => unlisten());
    }

    let cleanup: (() => void) | undefined;

    setup();

    return () => {
      active = false;
      cleanup?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
