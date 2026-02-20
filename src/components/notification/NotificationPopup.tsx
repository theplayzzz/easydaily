import { useEffect, useState, useCallback } from "react";
import { X, MessageSquare, WifiOff, RefreshCw, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NotificationType } from "../../types";
import { useNotification } from "../../hooks/useNotification";
import { cn } from "../../utils/cn";

const typeConfig: Record<NotificationType, { icon: typeof MessageSquare; messageKey: string }> = {
  [NotificationType.SummaryPrompt]: { icon: MessageSquare, messageKey: "notification.summaryPrompt" },
  [NotificationType.OfflinePrompt]: { icon: WifiOff, messageKey: "notification.offlinePrompt" },
  [NotificationType.CycleCheckin]: { icon: RefreshCw, messageKey: "notification.cycleCheckin" },
  [NotificationType.SuggestConfig]: { icon: Settings, messageKey: "notification.suggestConfig" },
};

export function NotificationPopup() {
  const { t } = useTranslation();
  const { notification, hide, pause, resume, duration } = useNotification();
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(hide, 300);
  }, [hide]);

  useEffect(() => {
    if (!notification.visible || !notification.startedAt) {
      setProgress(0);
      setIsExiting(false);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - notification.startedAt!;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      if (p >= 1) {
        clearInterval(interval);
        handleClose();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [notification.visible, notification.startedAt, duration, handleClose]);

  if (!notification.visible || !notification.type) return null;

  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "fixed bottom-16 left-2 right-2 z-50 mx-auto max-w-[380px]",
        isExiting ? "animate-slideOut" : "animate-slideIn",
      )}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="bg-bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-start gap-3 px-4 py-3">
          <div className="shrink-0 mt-0.5">
            <Icon className="h-5 w-5 text-accent-primary" />
          </div>
          <p className="flex-1 text-sm text-text-primary">
            {t(config.messageKey)}
          </p>
          <button
            onClick={handleClose}
            className="shrink-0 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-bg-secondary">
          <div
            className="h-full bg-accent-primary transition-all duration-100 ease-linear"
            style={{ width: `${(1 - progress) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
