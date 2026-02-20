import { useEffect, useState, useRef, useCallback } from "react";
import { X, RefreshCw, Settings, MessageSquare } from "lucide-react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { invoke } from "@tauri-apps/api/core";
import { emit, listen, type UnlistenFn } from "@tauri-apps/api/event";
import { NotificationType } from "../../types";

const DURATION = 300_000; // 5 minutes (PRD 3.3.2)

interface ButtonConfig {
  label: string;
  action: () => void;
  primary?: boolean;
}

const typeConfig: Record<
  NotificationType,
  { icon: typeof RefreshCw; title: string; body: string; color: string }
> = {
  [NotificationType.CycleCheckin]: {
    icon: RefreshCw,
    title: "Check-in do ciclo",
    body: "Registre seu progresso agora!",
    color: "#39FF14",
  },
  [NotificationType.SuggestConfig]: {
    icon: Settings,
    title: "Dica",
    body: "Ajuste o intervalo nas configurações.",
    color: "#00D4FF",
  },
  [NotificationType.SummaryPrompt]: {
    icon: MessageSquare,
    title: "Hora de registrar!",
    body: "O que você está fazendo?",
    color: "#BF40FF",
  },
};

function closeNotification() {
  getCurrentWebviewWindow().destroy().catch(() => {
    // fallback: try close if destroy fails
    getCurrentWebviewWindow().close().catch(() => {});
  });
}

function showMainAndClose(eventName: string) {
  // Fire all three in parallel — don't let one block the others
  invoke("show_window").catch(() => {});
  emit(eventName).catch(() => {});
  closeNotification();
}

function getButtons(type: NotificationType): ButtonConfig[] {
  switch (type) {
    case NotificationType.CycleCheckin:
      return [
        {
          label: "Adicionar Nota",
          primary: true,
          action: () => showMainAndClose("notification:add-note"),
        },
        { label: "Skip", action: closeNotification },
      ];
    case NotificationType.SuggestConfig:
      return [
        {
          label: "Configurações",
          primary: true,
          action: () => showMainAndClose("notification:open-settings"),
        },
        { label: "Não", action: closeNotification },
      ];
    case NotificationType.SummaryPrompt:
      return [
        {
          label: "Gerar Resumo",
          primary: true,
          action: () => showMainAndClose("notification:generate-summary"),
        },
        { label: "Fechar", action: closeNotification },
      ];
  }
}

export function NotificationWindow({ type }: { type: NotificationType }) {
  const [progress, setProgress] = useState(0);
  const idleRef = useRef(false);
  const elapsedRef = useRef(0);
  const lastTickRef = useRef(Date.now());

  const config = typeConfig[type];
  const Icon = config.icon;
  const buttons = getButtons(type);

  // Timer with idle pause/resume
  useEffect(() => {
    lastTickRef.current = Date.now();

    const interval = setInterval(() => {
      if (idleRef.current) {
        lastTickRef.current = Date.now();
        return;
      }

      const now = Date.now();
      elapsedRef.current += now - lastTickRef.current;
      lastTickRef.current = now;

      const p = Math.min(1, elapsedRef.current / DURATION);
      setProgress(p);
      if (p >= 1) {
        clearInterval(interval);
        closeNotification();
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Listen for idle state changes
  useEffect(() => {
    let unlisten: UnlistenFn | undefined;

    listen<{ idle: boolean }>("idle:state-changed", (event) => {
      idleRef.current = event.payload.idle;
      if (!event.payload.idle) {
        lastTickRef.current = Date.now();
      }
    }).then((fn) => {
      unlisten = fn;
    });

    return () => {
      unlisten?.();
    };
  }, []);

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    closeNotification();
  }, []);

  return (
    <div className="w-full h-full bg-bg-secondary flex flex-col select-none overflow-hidden">
      <div className="flex-1 flex items-start gap-3 px-4 py-3">
        {/* Icon */}
        <div
          className="shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon className="h-4 w-4" style={{ color: config.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">
              EasyDaily
            </span>
          </div>
          <p className="text-sm font-semibold text-text-primary mt-0.5">
            {config.title}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">{config.body}</p>
        </div>

        {/* Close X */}
        <button
          onClick={handleClose}
          className="shrink-0 p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 px-4 pb-3">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            className={
              btn.primary
                ? "flex-1 px-3 py-1.5 rounded-md text-xs font-medium text-bg-primary transition-colors"
                : "flex-1 px-3 py-1.5 rounded-md text-xs font-medium text-text-secondary bg-bg-card hover:bg-bg-primary transition-colors"
            }
            style={
              btn.primary
                ? { backgroundColor: config.color }
                : undefined
            }
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-bg-primary">
        <div
          className="h-full transition-all duration-100 ease-linear"
          style={{
            width: `${(1 - progress) * 100}%`,
            backgroundColor: config.color,
          }}
        />
      </div>
    </div>
  );
}
