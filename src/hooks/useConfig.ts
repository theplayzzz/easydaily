import { invoke } from "@tauri-apps/api/core";
import i18n from "../locales";
import { useStore } from "../stores/useStore";
import type { Config } from "../types";
import { logger } from "../utils/logger";

export function useConfig() {
  const config = useStore((s) => s.config);
  const setConfig = useStore((s) => s.setConfig);

  const getConfig = (): Config => config;

  const updateConfig = async (updates: Partial<Config>) => {
    const merged = { ...config, ...updates };
    await invoke("update_config", { config: merged });
    setConfig(updates);
    if (updates.language && updates.language !== config.language) {
      i18n.changeLanguage(updates.language);
      logger.info("useConfig", `Language changed to ${updates.language}`);
    }
    logger.info("useConfig", "Config updated", updates);
  };

  return { config, getConfig, updateConfig };
}
