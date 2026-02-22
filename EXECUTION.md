# EasyDaily - Documento de Execução

> Este documento reflete o estado real da implementação do projeto EasyDaily, validado em 2026-02-21.
> Todas as 5 fases foram implementadas. Itens pendentes estão listados ao final.

---

## Stack Implementada

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework Desktop | Tauri | 2.10.0 |
| Frontend | React | 19.2.4 |
| Linguagem Frontend | TypeScript (strict) | 5.9.3 |
| Build Tool | Vite | 7.3.1 |
| Estilização | Tailwind CSS | 4.2.0 |
| Editor Rich Text | TipTap | 3.20.0 |
| State Management | Zustand | 5.0.11 |
| i18n | i18next + react-i18next | 25.8.11 / 16.5.4 |
| Ícones | lucide-react | 0.575.0 |
| Datas | date-fns | 4.1.0 |
| Backend | Rust | stable |
| HTTP Client | reqwest | 0.12 |
| Serialização | serde + serde_json | 1.x |
| Async Runtime | tokio (full) | 1.x |

---

## Estrutura do Projeto

```
src/
├── components/
│   ├── common/         Button, Card, Input, Modal, Select, Toggle, TagChip,
│   │                   ConfirmationModal, AiResultModal, TagEditorModal, StandupPlanModal
│   ├── layout/         Titlebar, Navbar, PageContainer
│   ├── notes/          NoteEditorModal, NoteItem, DayCard
│   ├── notification/   NotificationPopup (stub), NotificationWindow
│   └── onboarding/     OnboardingModal
├── pages/              QuickActionsPage, HistoryPage, SettingsPage
├── hooks/              useInitializeApp, useBackendEvents, useAiSummary,
│                       useConfig, useTags, useNotes, useAiUsage, useNotification
├── stores/             useStore (Zustand)
├── locales/            pt-BR.json (146 keys), en-US.json (146 keys), index.ts
├── styles/             globals.css (Tailwind + animações custom)
├── types/              index.ts (todos os models)
├── utils/              logger.ts (dual-output), cn.ts (clsx + tailwind-merge)
├── App.tsx             Roteamento por Page enum + detecção de notification window
└── main.tsx

src-tauri/src/
├── commands/           ai.rs, attachments.rs, config.rs, notes.rs, system.rs, tags.rs
├── services/           ai.rs, fullscreen.rs, idle.rs, notification.rs,
│                       scheduler.rs, startup.rs, storage.rs, tray.rs
├── models/             mod.rs (todos os models Rust)
├── lib.rs              Inicialização, setup, registro de 18 commands
└── main.rs

src-tauri/icons/        icon.ico, icon.png, icon.icns, 32x32 a 310x310 (Store logos)
src-tauri/sounds/       .gitkeep (sem arquivo de som custom)
```

---

# FASE 1: Setup e Infraestrutura

**Status: Completa**

## O que foi implementado

### Dependências Frontend (package.json)
Todas instaladas: tailwindcss 4.2.0, @tailwindcss/postcss 4.2.0, @tiptap/react 3.20.0, @tiptap/starter-kit 3.20.0, zustand 5.0.11, date-fns 4.1.0, lucide-react 0.575.0, clsx 2.1.1, tailwind-merge 3.5.0, i18next 25.8.11, react-i18next 16.5.4, @tauri-apps/api 2.10.1, @tauri-apps/plugin-log 2.8.0, @tauri-apps/plugin-shell 2.3.5.

### Tailwind CSS (tailwind.config.js)
Paleta de cores conforme PRD:
- Background: primary #0D0D0D, secondary #1A1A1A, card #242424
- Accent: primary #39FF14, hover #32E012
- Texto: primary #E8E8E8, secondary #A0A0A0
- Estado: error #FF4444, warning #FFAA00, success #39FF14
- Border: #333333
- Font: Inter com fallback system-ui

### Sistema de Logs
- **Frontend** (`src/utils/logger.ts`): Dual-output — console em dev + Tauri plugin-log para disco. Métodos: debug, info, warn, error. Formato: `[HH:MM:SS][Módulo]`.
- **Backend**: Crate `log` 0.4 + `tauri-plugin-log` (não env_logger diretamente). Rotação de arquivo com limite de 5MB.

### tauri.conf.json
- productName: EasyDaily, identifier: com.easydaily.app, version: 1.0.0
- Janela: 400x500, non-resizable, frameless (decorations: false), visible: false (inicia oculta), tema Dark
- Tray: id "main", iconPath "icons/icon.png"
- Bundle: targets ["nsis"], installMode: currentUser

### Cargo.toml
Todas as dependências: tauri 2.10.0 (tray-icon), tauri-plugin-log, serde (derive), serde_json, tokio (full), reqwest (json), chrono (serde), uuid (v4, serde), dirs 6, log 0.4, env_logger 0.11, winapi 0.3 (winuser, sysinfoapi, windef, playsoundapi), winreg 0.55.

### Tipos TypeScript (src/types/index.ts)
Enums: NotificationType (SummaryPrompt, CycleCheckin, SuggestConfig), Page (QuickActions, History, Settings).
Models: Note, Attachment, DayData, Summary, Tag, Config, ApiKeys, SoundConfig, WindowPosition, AiUsageStats.

### Models Rust (src-tauri/src/models/mod.rs)
Espelham os tipos TS com `#[serde(rename_all = "camelCase")]`. Adicionais: AiUsageEntry, AiUsageData, AiProvider enum (Openai, Grok), SummaryType enum, Language enum. Função `default_tags()` retorna Tarefa/Reunião/Estudo.

---

# FASE 2: Frontend Completo

**Status: Completa**

## Componentes de Layout

- **Titlebar** — Barra custom com drag region (data-tauri-drag-region), branding "EasyDaily", botão X que oculta janela (não fecha app). Altura 8px.
- **Navbar** — 3 itens fixos na parte inferior (h-14, z-40): Ações Rápidas (Zap), Histórico (Clock), Configurações (Settings). Item ativo em text-accent-primary. Labels text-[10px].
- **PageContainer** — Wrapper com padding (pt-4, px-4, pb-16 para navbar), overflow-y-auto, suporte a título opcional.

## Componentes Common

- **Button** — Variantes: primary, secondary, ghost. Tamanhos: sm, md, lg. Loading state com Loader2. Extends ButtonHTMLAttributes.
- **Input / Textarea** — ForwardRef, estados focus (accent-primary/50) e error (border-state-error).
- **Card** — bg-bg-card, border, rounded. Prop `hoverable` para cards interativos.
- **Modal** — Portal para document.body, backdrop click/ESC para fechar, animações fadeIn + scaleIn, max-h-[480px], max-w-sm.
- **TagChip** — Cor inline customizável, estados selected (ring) e removable (botão X).
- **Toggle** — role="switch", aria-checked, animação translate-x, disabled state. h-6 w-11.
- **Select** — Dropdown com ChevronDown overlay, consistente com Input.
- **ConfirmationModal** — AlertTriangle icon, botão confirmar em vermelho (state-error).
- **AiResultModal** — 3 estados: loading (Loader2 + spinner), success (Sparkles + copy + markdown render), error (AlertCircle + retry). Função `mapErrorToKey()` para classificar erros.
- **TagEditorModal** — Input de nome + grade de 10 cores predefinidas + preview com TagChip.
- **StandupPlanModal** — Textarea para plano do dia, auto-focus, confirm disabled quando vazio.

## Zustand Store (src/stores/useStore.ts)

**State**: config, tags, days (string[]), dayDataCache (Record<string, DayData>), selectedDay, currentPage, isLoading, notification ({visible, type, startedAt}), modals ({noteEditor, tagEditor, confirmation, aiResult, onboarding}).

**Actions**: setCurrentPage, setConfig, setTags, addTag, updateTag, removeTag, setDays, setDayDataForDate, setSelectedDay, loadDayData, addNote, updateNote, removeNote, showNotification, hideNotification, setLoading, openNoteEditor, closeNoteEditor, openTagEditor, closeTagEditor, openConfirmation, closeConfirmation, openAiResult, setAiResultState, closeAiResult, openOnboarding, closeOnboarding, setOnboardingStep.

## Páginas

### QuickActionsPage
4 cards de ação com ícones coloridos:
1. Adicionar Nota (PenLine, #39FF14) — abre NoteEditorModal
2. Resumo de Hoje (Sparkles, #BF40FF) — chama generateDailySummary()
3. Ontem + Hoje (Calendar, #00D4FF) — chama generateCombinedSummary()
4. Daily Standup (Target, #FFAA00) — abre StandupPlanModal, depois chama generateStandup()

### HistoryPage
- Campo de busca com filtro case-insensitive no conteúdo das notas
- DayCards expansíveis (accordion) com data formatada (Hoje/Ontem/dd/MM/yyyy), contagem de notas, ChevronDown animado
- NoteItem com horário (HH:mm), preview (80 chars), TagChips, botões edit/delete no hover
- Botões inferiores: "Exportar Dia" (secondary) e "Adicionar Nota" (primary)
- Estado vazio com mensagem centralizada

### SettingsPage
Seções:
1. **Ciclo de Notificações** — Select com 7 opções: 1m, 15m, 30m, 45m, 60m, 90m, 120m
2. **Integração com IA** — Provider dropdown (OpenAI/Grok) + API Key (password input)
3. **Estatísticas de Uso IA** — Período (7d/30d/all), grid com call count, tokens, custo USD. Hook useAiUsage()
4. **Gerenciar Tags** — Lista com TagChips, botões edit/delete (delete bloqueado para tags padrão), botão Nova Tag
5. **Som** — Toggle on/off
6. **Idioma** — Select pt-BR / en-US
7. **Tutorial** — Botão "Ver Tutorial Novamente"

## Notificações

Implementadas como **janelas WebView separadas** (não popup dentro da janela principal):
- Backend cria janela via `WebviewWindowBuilder` (360x140, always-on-top, skip-taskbar, frameless)
- URL com query param: `/?notification=type`
- App.tsx detecta param e renderiza `NotificationWindow` ao invés do app principal
- 3 tipos implementados: CycleCheckin, SuggestConfig, SummaryPrompt
- Timer de 5 minutos (300s) com barra de progresso
- Pausa/resume do timer baseado em `idle:state-changed` event
- Botões de ação emitem eventos para janela principal via `emit()`

## Editor de Notas (NoteEditorModal)

- TipTap com StarterKit + CodeBlock + Placeholder
- Toolbar: Bold, Italic, Code, BulletList (com active state)
- Seletor de tags multi-select com TagChip
- Botão de anexo (placeholder, sem implementação de upload)
- Modo criar e editar (carrega dados existentes)

## Onboarding (OnboardingModal)

5 steps com dots de progresso:
1. Boas-vindas (logo EasyDaily)
2. Como registrar notas (PenLine)
3. Configurar IA (Sparkles) — provider dropdown + API key input (opcional)
4. Tags (Tags icon)
5. Notificações (Bell)

Navegação Back/Next, finish seta `onboardingCompleted: true`.

## i18n

- i18next configurado com react-i18next, fallback pt-BR
- 146 chaves em cada locale (pt-BR.json, en-US.json)
- Categorias: app, nav, quickActions, history, settings, noteEditor, confirmation, aiResult, tagEditor, notification, onboarding, standup, common

## Hooks

- **useInitializeApp** — Carregamento sequencial: config → i18n language → tags → days → dayData (todas). Mostra onboarding se não completado.
- **useBackendEvents** — Listeners: scheduler:cycle-complete, scheduler:suggest-config, idle:state-changed, tray:add-note/configure-timer/tutorial/generate-summary, notification:add-note/open-settings/generate-summary. Cleanup no unmount.
- **useNotes** — CRUD via invoke(): createNote, editNote, deleteNote, getNotesForDay
- **useTags** — CRUD via invoke(): createTag, editTag, deleteTag, getTags
- **useConfig** — getConfig, updateConfig (+ i18n.changeLanguage)
- **useAiSummary** — generateDailySummary, generateCombinedSummary, generateStandup. Formata notas com tags. Error mapping. Timing.
- **useAiUsage** — fetchStats por período (7d/30d/all), changePeriod, refresh
- **useNotification** — show(type) com detecção de fullscreen + criação de WebviewWindow

## App.tsx

Detecta `?notification=type` na URL → renderiza NotificationWindow (janela separada) ou MainApp.
MainApp: useInitializeApp + useBackendEvents + roteamento por Page enum + Navbar + 5 modais globais (NoteEditor, Confirmation, AiResult, TagEditor, Onboarding).

---

# FASE 3: Backend Core

**Status: Completa**

## Storage Service (services/storage.rs)

Persistência JSON em `%APPDATA%/EasyDaily/`:
- `ensure_dirs()` cria data/, attachments/, logs/ automaticamente
- Day data: `data/YYYY-MM-DD.json` — load (retorna vazio se não existe), save (pretty JSON), list_days (ordenado decrescente)
- Config: `config.json` — load (cria default se não existe), save
- Tags: `tags.json` — load (cria 3 tags padrão se não existe), save
- AI Usage: `ai_usage.json` — load, save, append_ai_usage_entry (append-only)
- Attachments: save em `attachments/{date}/{uuid}_{filename}`, delete, get_path

## System Tray (services/tray.rs)

6 itens de menu (em português):
1. Adicionar Nota → emite `tray:add-note`
2. Abrir EasyDaily → show_main_window()
3. Gerar Resumo de Hoje → show + emite `tray:generate-summary`
4. Configurar Timer → emite `tray:configure-timer`
5. Tutorial → emite `tray:tutorial`
6. Sair → app.exit(0)

Clique no ícone da tray → mostra e foca janela principal.
Fechar janela (X) → intercepta CloseRequested, oculta janela (app continua na tray).

## Scheduler (services/scheduler.rs)

- Intervalo configurável em minutos (lido do config.cycle_interval)
- Loop async com `tokio::time::sleep()`
- Antes de notificar, verifica `fullscreen::is_fullscreen_app_active()`
- Se fullscreen: incrementa `consecutive_skips`; se >= 2 skips → emite `scheduler:suggest-config` + mostra notificação "suggest_config"
- Se não fullscreen: reseta skips, emite `scheduler:cycle-complete`, mostra notificação "cycle_checkin" com som
- Métodos: start, stop, update_interval, record_skip, reset_skips

## Idle Detection (services/idle.rs)

- Windows API: `GetLastInputInfo()` + `GetTickCount()`
- Polling a cada 30 segundos (POLL_INTERVAL_SECS = 30)
- Threshold de 60 segundos (IDLE_THRESHOLD_SECS = 60)
- Emite `idle:state-changed` com payload `{ "idle": bool }` apenas em transições de estado

## Fullscreen Detection (services/fullscreen.rs)

- Windows API: `GetForegroundWindow()`, `GetWindowRect()`, `GetSystemMetrics(SM_CXSCREEN/SM_CYSCREEN)`
- Algoritmo: verifica se janela cobre tela inteira E se rect.left >= -1 (distingue fullscreen real de janela maximizada, que no Windows 10 estende ~7px além da tela)

## Notification Service (services/notification.rs)

- Cria janelas WebView separadas (360x140, always-on-top, skip-taskbar, frameless, unfocused)
- Destrói notificação anterior antes de criar nova
- Posiciona no canto inferior direito (monitor primário - 16px margem)
- Som via Windows API `PlaySoundW("SystemNotification")` com `SND_ALIAS | SND_ASYNC`

## Startup (services/startup.rs)

- `register_autostart()` — escreve em `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` (chave "EasyDaily" → exe path). Usa crate `winreg`.
- `unregister_autostart()` — remove entrada do registro
- `run_startup_sequence()` — aguarda 2 segundos, depois mostra notificação "summary_prompt" com som

## AI Service (services/ai.rs)

- HTTP client OpenAI-compatible com `reqwest::Client`
- Timeout de 30 segundos
- Suporta OpenAI (`https://api.openai.com/v1`) e GROK (`https://api.x.ai/v1`)
- Request: POST /chat/completions, temperature=0.7, max_tokens=1024
- Parseia token usage (prompt_tokens, completion_tokens, total_tokens)
- Error handling: 401/403 → INVALID_API_KEY, 429 → RATE_LIMITED, timeout → TIMEOUT, rede → NO_CONNECTION

## Commands (18 registrados em lib.rs)

**Notas**: create_note, update_note, delete_note (cascata anexos), get_day_data, list_days
**Config**: get_config, update_config (atualiza scheduler se intervalo mudou)
**Tags**: get_tags, create_tag, update_tag, delete_tag
**Anexos**: save_attachment, delete_attachment, get_attachment_path
**Sistema**: show_window, hide_window, get_idle_seconds, play_notification_sound, is_fullscreen_app_active, get_data_path, get_log_path
**IA**: generate_summary (3 tipos), get_ai_usage_stats (por período)

## lib.rs — Inicialização

1. Configura tauri-plugin-log (max 5MB, rotação)
2. Cria StorageService, carrega Config
3. Cria Scheduler (com interval do config) e IdleDetector
4. Registra state management via Arc<Mutex<T>>
5. Setup tray via services::tray::setup_tray()
6. Intercepta CloseRequested → hide (close-to-hide)
7. Inicia IdleDetector, Scheduler, run_startup_sequence()
8. Registra autostart (non-fatal se falhar)
9. Registra 18 commands via generate_handler![]

---

# FASE 4: Integração

**Status: Completa (com exceções listadas abaixo)**

## Integrações Implementadas

### Config
- useInitializeApp carrega config via `invoke("get_config")` no startup
- useConfig.updateConfig() salva via `invoke("update_config")`, sincroniza i18n.changeLanguage()
- Backend atualiza scheduler automaticamente quando intervalo muda

### Tags
- Carregadas no startup via `invoke("get_tags")`
- CRUD completo: createTag, editTag, deleteTag — todos via invoke + store sync

### Notas
- createNote: invoke("create_note") com date, content, contentHtml, tags
- editNote: invoke("update_note") com atualizações parciais
- deleteNote: invoke("delete_note") com cascata de anexos no backend
- Formatação de data: yyyy-MM-dd (date-fns)

### Histórico
- list_days carregado no startup
- Todos os dayData carregados sequencialmente no startup (não lazy load por dia)
- DayCards com dados reais, busca funcional

### Notificações
- Backend cria janelas de notificação diretamente (notification service)
- Frontend escuta eventos via useBackendEvents:
  - scheduler:cycle-complete, scheduler:suggest-config
  - idle:state-changed (pausa/resume do timer na NotificationWindow)
  - tray:add-note/configure-timer/tutorial/generate-summary
  - notification:add-note/open-settings/generate-summary
- Timer de 5 min com pausa em idle implementado na NotificationWindow

### Skip Logic
- Scheduler conta consecutive_skips quando fullscreen está ativo
- Após 2 skips: emite scheduler:suggest-config + mostra notificação "suggest_config"
- Reseta skips quando ciclo completa sem fullscreen

### Fullscreen
- Scheduler verifica antes de cada notificação
- useNotification tem `waitForNoFullscreen()` com polling

### Som
- Backend toca som do sistema Windows (PlaySoundW "SystemNotification") quando notificação é criada com play_sound=true
- O parâmetro play_sound é passado pelo scheduler (true para cycle_checkin, false para suggest_config)

---

# FASE 5: IA, Onboarding e Distribuição

**Status: Completa (com exceções listadas abaixo)**

## IA — Implementada

### generate_summary (commands/ai.rs)
3 tipos de resumo, prompts em português:
- **daily_summary**: Analisa notas do dia, gera bullet points categorizados (Principais atividades, Destaques, Próximos passos)
- **combined_summary**: Notas de ontem + hoje separadas em seções
- **standup**: Formato "O que fiz ontem / O que vou fazer hoje / Bloqueios"

System prompt: "Você é um assistente especializado em resumos de produtividade profissional. Gere resumos concisos em português do Brasil..."

### Providers
- **OpenAI**: model gpt-4.1-mini, base_url api.openai.com/v1
- **GROK**: model grok-2-1212, base_url api.x.ai/v1

### Cost Tracking
- Preços hardcoded: OpenAI $0.40/$1.60 per 1M tokens (input/output), GROK $2.00/$10.00 per 1M tokens
- Cada chamada gera AiUsageEntry com timestamp, provider, model, tokens, custo
- get_ai_usage_stats filtra por período (7d/30d/all)
- Frontend exibe na SettingsPage via useAiUsage()

### Frontend (useAiSummary)
- generateDailySummary, generateCombinedSummary, generateStandup
- Formata notas com tags: `${content} [Tags: ${tagNames}]`
- AiResultModal com loading/success/error states, copy to clipboard, retry
- Error mapping: INVALID_API_KEY, NO_CONNECTION, RATE_LIMITED, TIMEOUT

## Onboarding — Implementado

- Frontend verifica `config.onboardingCompleted` no useInitializeApp
- Se false, abre OnboardingModal com 5 steps
- Step 3 permite configurar provider + API key (opcional)
- Finish seta onboardingCompleted: true via updateConfig
- Botão "Ver Tutorial" na SettingsPage reabre o onboarding

## i18n — Completo

- 146 chaves em pt-BR.json e en-US.json
- Cobertura: nav, quickActions, history, settings, noteEditor, confirmation, aiResult, tagEditor, notification, onboarding, standup, common
- Troca de idioma persiste no config e aplica via i18n.changeLanguage()

## Ícones — Completos

- icon.ico (Windows), icon.icns (macOS), icon.png (tray)
- Tamanhos: 32x32, 64x64, 128x128, 128x128@2x
- Windows Store logos: 30x30 a 310x310

## Build Configuration

- Janela inicia oculta (visible: false)
- NSIS installer, installMode: currentUser
- Output: src-tauri/target/release/bundle/nsis/
- Windows autostart via registro

---

# Itens Pendentes para Revisão

Os itens abaixo foram planejados mas **não foram implementados** ou estão **parcialmente implementados**. Necessitam decisão sobre implementação:

## 1. UI de Anexos (Frontend)
**Planejado em**: Fase 4.9
**Estado**: Backend completo (save_attachment, delete_attachment, get_attachment_path), mas o frontend tem apenas um botão placeholder "Adicionar Anexo" no NoteEditorModal sem handler.
**O que falta**:
- File picker / input type="file"
- Conversão para base64 e upload via invoke
- Exibição de anexos na nota (imagens, arquivos)
- Clipboard paste para imagens (Ctrl+V)
- Drag & drop

## 2. Integração de Som com Config
**Planejado em**: Fase 4.10
**Estado**: Backend toca som do sistema Windows via PlaySoundW quando notificação é criada. O toggle de som existe na SettingsPage. Porém o `config.sound.enabled` não é consultado antes de tocar o som — o backend sempre passa play_sound baseado no tipo de notificação, não na preferência do usuário.
**O que falta**:
- Verificar `config.sound.enabled` antes de tocar som na notification service
- Arquivo de som custom (src-tauri/sounds/ está vazio, usa som do sistema)

## 3. Auto-Updater
**Planejado em**: Fase 5.11 (marcado como opcional)
**Estado**: Não implementado. Nenhum plugin de updater configurado.
**O que falta**:
- tauri-plugin-updater no Cargo.toml
- Configuração de endpoint de updates
- UI para notificar e instalar atualizações

## 4. README do Projeto
**Planejado em**: Fase 5.10
**Estado**: Não criado.

## 5. Documentação SmartScreen
**Planejado em**: Fase 5.9
**Estado**: Não criada.

## 6. Build de Produção
**Planejado em**: Fase 5.8
**Estado**: Configuração pronta. Build não foi executado/validado.

---

**Última atualização:** 2026-02-21
