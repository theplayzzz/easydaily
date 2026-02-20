type LogLevel = "debug" | "info" | "warn" | "error";

const isEnabled = import.meta.env.DEV;

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString("pt-BR", { hour12: false });
}

function log(level: LogLevel, module: string, message: string, ...args: unknown[]) {
  if (!isEnabled) return;

  const prefix = `[${formatTime()}][${module}]`;

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
