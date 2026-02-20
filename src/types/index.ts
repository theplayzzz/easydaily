// --- Enums ---

export enum NotificationType {
  SummaryPrompt = "summary_prompt",
  CycleCheckin = "cycle_checkin",
  SuggestConfig = "suggest_config",
}

export enum Page {
  QuickActions = "quick_actions",
  History = "history",
  Settings = "settings",
}

// --- Core Models ---

export interface Attachment {
  id: string;
  filename: string;
  type: string;
  size: number;
}

export interface Note {
  id: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  contentHtml: string;
  tags: string[];
  attachments: Attachment[];
}

export interface Summary {
  id: string;
  createdAt: string;
  type: "daily" | "combined" | "standup";
  content: string;
  provider: "openai" | "grok";
}

export interface DayData {
  date: string;
  notes: Note[];
  summaries: Summary[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

// --- Configuration ---

export interface ApiKeys {
  openai: string;
  grok: string;
}

export interface SoundConfig {
  enabled: boolean;
}

export interface WindowPosition {
  x: number;
  y: number;
}

export interface Config {
  cycleInterval: number;
  activeProvider: "openai" | "grok";
  apiKeys: ApiKeys;
  sound: SoundConfig;
  language: "pt-BR" | "en-US";
  onboardingCompleted: boolean;
  lastSessionDate: string;
  windowPosition: WindowPosition;
}
