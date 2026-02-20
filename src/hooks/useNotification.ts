import { useCallback } from "react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { invoke } from "@tauri-apps/api/core";
import { NotificationType } from "../types";
import { logger } from "../utils/logger";

const NOTIFICATION_WIDTH = 360;
const NOTIFICATION_HEIGHT = 140;
const FULLSCREEN_POLL_INTERVAL = 5_000;

async function waitForNoFullscreen(): Promise<void> {
  try {
    const isFullscreen = await invoke<boolean>("is_fullscreen_app_active");
    if (!isFullscreen) return;

    logger.info("useNotification", "Fullscreen app detected, waiting...");
    return new Promise((resolve) => {
      const poll = setInterval(async () => {
        try {
          const still = await invoke<boolean>("is_fullscreen_app_active");
          if (!still) {
            clearInterval(poll);
            resolve();
          }
        } catch {
          clearInterval(poll);
          resolve();
        }
      }, FULLSCREEN_POLL_INTERVAL);
    });
  } catch {
    // If the command fails, proceed anyway
  }
}

export function useNotification() {
  const show = useCallback(async (type: NotificationType) => {
    try {
      // Wait until no fullscreen app is active
      await waitForNoFullscreen();

      // Close existing notification window if any
      const existing = await WebviewWindow.getByLabel("notification");
      if (existing) {
        await existing.destroy().catch(() => existing.close().catch(() => {}));
        // Small delay for cleanup
        await new Promise((r) => setTimeout(r, 200));
      }

      // Position at bottom-right of available screen area
      const x = window.screen.availWidth - NOTIFICATION_WIDTH - 16;
      const y = window.screen.availHeight - NOTIFICATION_HEIGHT - 16;

      const webview = new WebviewWindow("notification", {
        url: `/?notification=${type}`,
        title: "EasyDaily",
        width: NOTIFICATION_WIDTH,
        height: NOTIFICATION_HEIGHT,
        x,
        y,
        decorations: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        focus: false,
      });

      webview.once("tauri://error", (e) => {
        logger.error("useNotification", "Failed to create notification window", e);
      });

      logger.info("useNotification", `Notification window created: ${type}`);
    } catch (err) {
      logger.error("useNotification", "Failed to show notification", err);
    }
  }, []);

  return { show };
}
