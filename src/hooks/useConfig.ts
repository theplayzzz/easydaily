import i18n from "../locales";
import { useStore } from "../stores/useStore";
import type { Config } from "../types";
import { logger } from "../utils/logger";

export function useConfig() {
  const config = useStore((s) => s.config);
  const setConfig = useStore((s) => s.setConfig);

  const getConfig = (): Config => config;

  const updateConfig = (updates: Partial<Config>) => {
    if (updates.language && updates.language !== config.language) {
      i18n.changeLanguage(updates.language);
      logger.info("useConfig", `Language changed to ${updates.language}`);
    }
    setConfig(updates);
    logger.info("useConfig", "Config updated", updates);
  };

  return { config, getConfig, updateConfig };
}
