import { create } from "zustand";
import type { Config, Tag, DayData, Note, NotificationType } from "../types";
import { Page } from "../types";
import { logger } from "../utils/logger";

interface NotificationState {
  visible: boolean;
  type: NotificationType | null;
  startedAt: number | null;
}

interface ModalsState {
  noteEditor: { open: boolean; noteId: string | null };
  tagEditor: { open: boolean; tagId: string | null };
  confirmation: {
    open: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
  };
  aiResult: { open: boolean; state: "loading" | "success" | "error"; content: string; summaryType: "daily_summary" | "combined_summary" | "standup" | null };
  onboarding: { open: boolean; step: number };
}

interface AppState {
  config: Config;
  tags: Tag[];
  currentPage: Page;
  days: string[];
  selectedDay: string | null;
  dayDataCache: Record<string, DayData>;
  notification: NotificationState;
  modals: ModalsState;
  isLoading: boolean;

  // Navigation
  setCurrentPage: (page: Page) => void;

  // Config
  setConfig: (config: Partial<Config>) => void;

  // Tags
  addTag: (tag: Tag) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  removeTag: (id: string) => void;

  // Bulk setters (for backend init)
  setTags: (tags: Tag[]) => void;
  setDays: (days: string[]) => void;
  setDayDataForDate: (date: string, data: DayData) => void;

  // Days / Notes
  setSelectedDay: (day: string | null) => void;
  loadDayData: (date: string) => void;
  addNote: (date: string, note: Note) => void;
  updateNote: (date: string, noteId: string, updates: Partial<Note>) => void;
  removeNote: (date: string, noteId: string) => void;

  // Notification
  showNotification: (type: NotificationType) => void;
  hideNotification: () => void;

  // Modals
  openNoteEditor: (noteId?: string | null) => void;
  closeNoteEditor: () => void;
  openTagEditor: (tagId?: string | null) => void;
  closeTagEditor: () => void;
  openConfirmation: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirmation: () => void;
  openAiResult: (summaryType?: "daily_summary" | "combined_summary" | "standup") => void;
  setAiResultState: (state: "loading" | "success" | "error", content?: string) => void;
  closeAiResult: () => void;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  setOnboardingStep: (step: number) => void;

  // Loading
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  config: {
    cycleInterval: 30,
    activeProvider: "openai",
    apiKeys: { openai: "", grok: "" },
    sound: { enabled: true },
    language: "pt-BR",
    onboardingCompleted: false,
    lastSessionDate: "",
    windowPosition: { x: 0, y: 0 },
  },
  tags: [],
  currentPage: Page.QuickActions,
  days: [],
  selectedDay: null,
  dayDataCache: {},
  notification: { visible: false, type: null, startedAt: null },
  modals: {
    noteEditor: { open: false, noteId: null },
    tagEditor: { open: false, tagId: null },
    confirmation: { open: false, title: "", message: "", onConfirm: null },
    aiResult: { open: false, state: "loading", content: "", summaryType: null },
    onboarding: { open: false, step: 0 },
  },
  isLoading: false,

  setCurrentPage: (page) => {
    logger.info("Store", `Navigate to ${page}`);
    set({ currentPage: page });
  },

  setConfig: (partial) => {
    const current = get().config;
    const updated = { ...current, ...partial };
    logger.info("Store", "Config updated", partial);
    set({ config: updated });
  },

  addTag: (tag) => {
    logger.info("Store", `Tag added: ${tag.name}`);
    set((s) => ({ tags: [...s.tags, tag] }));
  },

  updateTag: (id, updates) => {
    logger.info("Store", `Tag updated: ${id}`, updates);
    set((s) => ({
      tags: s.tags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  removeTag: (id) => {
    logger.info("Store", `Tag removed: ${id}`);
    set((s) => ({ tags: s.tags.filter((t) => t.id !== id) }));
  },

  setTags: (tags) => {
    logger.info("Store", `Tags set: ${tags.length} tags`);
    set({ tags });
  },

  setDays: (days) => {
    logger.info("Store", `Days set: ${days.length} days`);
    set({ days });
  },

  setDayDataForDate: (date, data) => {
    logger.debug("Store", `Day data set for: ${date}`);
    set((s) => ({
      dayDataCache: { ...s.dayDataCache, [date]: data },
    }));
  },

  setSelectedDay: (day) => {
    logger.debug("Store", `Selected day: ${day}`);
    set({ selectedDay: day });
  },

  loadDayData: (date) => {
    const cache = get().dayDataCache;
    if (cache[date]) {
      logger.debug("Store", `Day data loaded from cache: ${date}`);
      return;
    }
    logger.info("Store", `Loading day data: ${date}`);
    set((s) => ({
      dayDataCache: {
        ...s.dayDataCache,
        [date]: { date, notes: [], summaries: [] },
      },
    }));
  },

  addNote: (date, note) => {
    logger.info("Store", `Note added to ${date}: ${note.id}`);
    set((s) => {
      const dayData = s.dayDataCache[date] || { date, notes: [], summaries: [] };
      const updatedDays = s.days.includes(date) ? s.days : [date, ...s.days];
      return {
        days: updatedDays,
        dayDataCache: {
          ...s.dayDataCache,
          [date]: { ...dayData, notes: [note, ...dayData.notes] },
        },
      };
    });
  },

  updateNote: (date, noteId, updates) => {
    logger.info("Store", `Note updated: ${noteId}`);
    set((s) => {
      const dayData = s.dayDataCache[date];
      if (!dayData) return s;
      return {
        dayDataCache: {
          ...s.dayDataCache,
          [date]: {
            ...dayData,
            notes: dayData.notes.map((n) =>
              n.id === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n,
            ),
          },
        },
      };
    });
  },

  removeNote: (date, noteId) => {
    logger.info("Store", `Note removed: ${noteId}`);
    set((s) => {
      const dayData = s.dayDataCache[date];
      if (!dayData) return s;
      return {
        dayDataCache: {
          ...s.dayDataCache,
          [date]: {
            ...dayData,
            notes: dayData.notes.filter((n) => n.id !== noteId),
          },
        },
      };
    });
  },

  showNotification: (type) => {
    logger.info("Store", `Notification shown: ${type}`);
    set({
      notification: { visible: true, type, startedAt: Date.now() },
    });
  },

  hideNotification: () => {
    logger.info("Store", "Notification hidden");
    set({
      notification: { visible: false, type: null, startedAt: null },
    });
  },

  openNoteEditor: (noteId = null) => {
    logger.info("Store", `Note editor opened: ${noteId ?? "new"}`);
    set((s) => ({
      modals: { ...s.modals, noteEditor: { open: true, noteId: noteId ?? null } },
    }));
  },

  closeNoteEditor: () => {
    logger.info("Store", "Note editor closed");
    set((s) => ({
      modals: { ...s.modals, noteEditor: { open: false, noteId: null } },
    }));
  },

  openTagEditor: (tagId = null) => {
    logger.info("Store", `Tag editor opened: ${tagId ?? "new"}`);
    set((s) => ({
      modals: { ...s.modals, tagEditor: { open: true, tagId: tagId ?? null } },
    }));
  },

  closeTagEditor: () => {
    logger.info("Store", "Tag editor closed");
    set((s) => ({
      modals: { ...s.modals, tagEditor: { open: false, tagId: null } },
    }));
  },

  openConfirmation: (title, message, onConfirm) => {
    logger.info("Store", `Confirmation opened: ${title}`);
    set((s) => ({
      modals: { ...s.modals, confirmation: { open: true, title, message, onConfirm } },
    }));
  },

  closeConfirmation: () => {
    logger.info("Store", "Confirmation closed");
    set((s) => ({
      modals: {
        ...s.modals,
        confirmation: { open: false, title: "", message: "", onConfirm: null },
      },
    }));
  },

  openAiResult: (summaryType = "daily_summary" as const) => {
    logger.info("Store", `AI result opened: ${summaryType}`);
    set((s) => ({
      modals: { ...s.modals, aiResult: { open: true, state: "loading", content: "", summaryType } },
    }));
  },

  setAiResultState: (state, content = "") => {
    logger.info("Store", `AI result state: ${state}`);
    set((s) => ({
      modals: { ...s.modals, aiResult: { ...s.modals.aiResult, state, content } },
    }));
  },

  closeAiResult: () => {
    logger.info("Store", "AI result closed");
    set((s) => ({
      modals: { ...s.modals, aiResult: { open: false, state: "loading", content: "", summaryType: null } },
    }));
  },

  openOnboarding: () => {
    logger.info("Store", "Onboarding opened");
    set((s) => ({
      modals: { ...s.modals, onboarding: { open: true, step: 0 } },
    }));
  },

  closeOnboarding: () => {
    logger.info("Store", "Onboarding closed");
    set((s) => ({
      modals: { ...s.modals, onboarding: { open: false, step: 0 } },
    }));
  },

  setOnboardingStep: (step) => {
    set((s) => ({
      modals: { ...s.modals, onboarding: { ...s.modals.onboarding, step } },
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
