import { format, subDays } from "date-fns";
import type { Tag, Config, DayData, Note } from "../types";

const today = new Date();
const yesterday = subDays(today, 1);
const dayBefore = subDays(today, 2);

function formatDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function makeNote(
  id: string,
  hour: number,
  minute: number,
  content: string,
  contentHtml: string,
  tags: string[],
  date: Date,
): Note {
  const createdAt = new Date(date);
  createdAt.setHours(hour, minute, 0, 0);
  return {
    id,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
    content,
    contentHtml,
    tags,
    attachments: [],
  };
}

export const mockTags: Tag[] = [
  { id: "tag-1", name: "Tarefa", color: "#39FF14", isDefault: true },
  { id: "tag-2", name: "Reunião", color: "#00D4FF", isDefault: true },
  { id: "tag-3", name: "Estudo", color: "#BF40FF", isDefault: true },
];

export const mockConfig: Config = {
  cycleInterval: 30,
  activeProvider: "openai",
  apiKeys: { openai: "", grok: "" },
  sound: { enabled: true },
  language: "pt-BR",
  onboardingCompleted: true,
  lastSessionDate: formatDate(today),
  windowPosition: { x: 100, y: 100 },
  autostart: false,
};

const todayNotes: Note[] = [
  makeNote(
    "note-1",
    9,
    0,
    "Reunião de planejamento do sprint com a equipe de backend. Definimos as tasks para a próxima semana.",
    "<p>Reunião de planejamento do sprint com a equipe de backend. Definimos as tasks para a próxima semana.</p>",
    ["tag-2"],
    today,
  ),
  makeNote(
    "note-2",
    11,
    30,
    "Implementando o sistema de autenticação com JWT. Testes unitários passando.",
    "<p>Implementando o sistema de autenticação com <strong>JWT</strong>. Testes unitários passando.</p>",
    ["tag-1"],
    today,
  ),
  makeNote(
    "note-3",
    14,
    15,
    "Estudando padrões de design no Rust para o backend do Tauri.",
    "<p>Estudando padrões de design no <em>Rust</em> para o backend do Tauri.</p>",
    ["tag-3"],
    today,
  ),
];

const yesterdayNotes: Note[] = [
  makeNote(
    "note-4",
    10,
    0,
    "Code review do PR #42 - correções no módulo de notificações.",
    "<p>Code review do PR #42 - correções no módulo de notificações.</p>",
    ["tag-1"],
    yesterday,
  ),
  makeNote(
    "note-5",
    15,
    0,
    "Daily standup com o time. Discutimos bloqueios no deploy de staging.",
    "<p>Daily standup com o time. Discutimos bloqueios no deploy de staging.</p>",
    ["tag-2"],
    yesterday,
  ),
];

const dayBeforeNotes: Note[] = [
  makeNote(
    "note-6",
    9,
    30,
    "Configuração do ambiente de CI/CD com GitHub Actions.",
    "<p>Configuração do ambiente de CI/CD com GitHub Actions.</p>",
    ["tag-1"],
    dayBefore,
  ),
  makeNote(
    "note-7",
    13,
    0,
    "Leitura sobre arquitetura hexagonal e como aplicar no projeto.",
    "<p>Leitura sobre <strong>arquitetura hexagonal</strong> e como aplicar no projeto.</p>",
    ["tag-3"],
    dayBefore,
  ),
  makeNote(
    "note-8",
    16,
    30,
    "Reunião 1:1 com tech lead sobre crescimento de carreira.",
    "<p>Reunião 1:1 com tech lead sobre crescimento de carreira.</p>",
    ["tag-2"],
    dayBefore,
  ),
];

export const mockDays: string[] = [
  formatDate(today),
  formatDate(yesterday),
  formatDate(dayBefore),
];

export const mockDayDataCache: Record<string, DayData> = {
  [formatDate(today)]: {
    date: formatDate(today),
    notes: todayNotes,
    summaries: [],
  },
  [formatDate(yesterday)]: {
    date: formatDate(yesterday),
    notes: yesterdayNotes,
    summaries: [],
  },
  [formatDate(dayBefore)]: {
    date: formatDate(dayBefore),
    notes: dayBeforeNotes,
    summaries: [],
  },
};

export const mockAiSummary = `## Resumo do Dia

**Principais atividades:**
- Reunião de planejamento do sprint com a equipe de backend
- Implementação do sistema de autenticação com JWT
- Estudo de padrões de design em Rust

**Destaques:**
- Tasks da próxima semana foram definidas
- Testes unitários do JWT estão passando
- Progresso no entendimento de padrões Rust para Tauri

**Próximos passos:**
- Finalizar módulo de autenticação
- Aplicar padrões estudados no backend`;
