import { useCallback, useEffect, useRef } from "react";
import { useStore } from "../stores/useStore";
import { logger } from "../utils/logger";
import type { NotificationType } from "../types";

const NOTIFICATION_DURATION = 300_000; // 5 minutes in ms

export function useNotification() {
  const notification = useStore((s) => s.notification);
  const showNotification = useStore((s) => s.showNotification);
  const hideNotification = useStore((s) => s.hideNotification);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const remainingRef = useRef<number>(NOTIFICATION_DURATION);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hide = useCallback(() => {
    clearTimer();
    hideNotification();
    logger.info("useNotification", "Notification dismissed");
  }, [clearTimer, hideNotification]);

  const show = useCallback(
    (type: NotificationType) => {
      clearTimer();
      remainingRef.current = NOTIFICATION_DURATION;
      pausedAtRef.current = null;
      showNotification(type);
      timerRef.current = setTimeout(hide, NOTIFICATION_DURATION);
      logger.info("useNotification", `Showing notification: ${type}`);
    },
    [clearTimer, showNotification, hide],
  );

  const pause = useCallback(() => {
    if (!notification.visible || pausedAtRef.current) return;
    clearTimer();
    pausedAtRef.current = Date.now();
    const elapsed = notification.startedAt ? Date.now() - notification.startedAt : 0;
    remainingRef.current = Math.max(0, NOTIFICATION_DURATION - elapsed);
    logger.debug("useNotification", "Notification paused");
  }, [notification.visible, notification.startedAt, clearTimer]);

  const resume = useCallback(() => {
    if (!notification.visible || !pausedAtRef.current) return;
    pausedAtRef.current = null;
    timerRef.current = setTimeout(hide, remainingRef.current);
    logger.debug("useNotification", "Notification resumed");
  }, [notification.visible, hide]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const progress = notification.startedAt
    ? Math.min(1, (Date.now() - notification.startedAt) / NOTIFICATION_DURATION)
    : 0;

  return {
    notification,
    show,
    hide,
    pause,
    resume,
    progress,
    duration: NOTIFICATION_DURATION,
  };
}
