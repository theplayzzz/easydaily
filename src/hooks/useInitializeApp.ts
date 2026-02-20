import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import i18n from "../locales";
import { useStore } from "../stores/useStore";
import type { Config, Tag, DayData } from "../types";
import { logger } from "../utils/logger";

export function useInitializeApp() {
  const setConfig = useStore((s) => s.setConfig);
  const setTags = useStore((s) => s.setTags);
  const setDays = useStore((s) => s.setDays);
  const setDayDataForDate = useStore((s) => s.setDayDataForDate);
  const openOnboarding = useStore((s) => s.openOnboarding);
  const setLoading = useStore((s) => s.setLoading);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      try {
        // Load config
        const config = await invoke<Config>("get_config");
        if (cancelled) return;
        setConfig(config);
        i18n.changeLanguage(config.language);
        logger.info("useInitializeApp", "Config loaded", config);

        // Load tags
        const tags = await invoke<Tag[]>("get_tags");
        if (cancelled) return;
        setTags(tags);
        logger.info("useInitializeApp", `Loaded ${tags.length} tags`);

        // Load days list
        const days = await invoke<string[]>("list_days");
        if (cancelled) return;
        setDays(days);
        logger.info("useInitializeApp", `Loaded ${days.length} days`);

        // Load day data for each day
        for (const date of days) {
          if (cancelled) return;
          const dayData = await invoke<DayData>("get_day_data", { date });
          if (cancelled) return;
          setDayDataForDate(date, dayData);
        }

        // Show onboarding if not completed
        if (!config.onboardingCompleted) {
          openOnboarding();
        }

        logger.info("useInitializeApp", "Initialization complete");
      } catch (err) {
        logger.error("useInitializeApp", "Initialization failed", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
