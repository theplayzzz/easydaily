import { info, warn, error, debug } from "@tauri-apps/plugin-log";

type LogLevel = "debug" | "info" | "warn" | "error";

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString("pt-BR", { hour12: false });
}

// Log to both console (dev) and Tauri log file (always)
function log(level: LogLevel, module: string, message: string, ...args: unknown[]) {
  const prefix = `[${formatTime()}][${module}]`;

  // Console (dev only)
  if (import.meta.env.DEV) {
    switch (level) {
      case "debug":
        console.debug(prefix, message, ...args);
        break;
      case "info":
        console.info(prefix, message, ...args);
        break;
      case "warn":
        console.warn(prefix, message, ...args);
        break;
      case "error":
        console.error(prefix, message, ...args);
        break;
    }
  }

  // Tauri log file (always — persisted to disk)
  const tauriMessage = `[${module}] ${message}${args.length > 0 ? " " + args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ") : ""}`;
  switch (level) {
    case "debug":
      debug(tauriMessage).catch(() => {});
      break;
    case "info":
      info(tauriMessage).catch(() => {});
      break;
    case "warn":
      warn(tauriMessage).catch(() => {});
      break;
    case "error":
      error(tauriMessage).catch(() => {});
      break;
  }
}

export const logger = {
  debug: (module: string, message: string, ...args: unknown[]) =>
    log("debug", module, message, ...args),
  info: (module: string, message: string, ...args: unknown[]) =>
    log("info", module, message, ...args),
  warn: (module: string, message: string, ...args: unknown[]) =>
    log("warn", module, message, ...args),
  error: (module: string, message: string, ...args: unknown[]) =>
    log("error", module, message, ...args),
};
