# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EasyDaily is a Windows desktop app (Tauri v2 + React 19) for documenting daily activities and generating AI-powered standup summaries. It runs as a system tray application with idle detection, fullscreen-aware notifications, and multi-language support (pt-BR, en-US).

## Build & Development Commands

```bash
npm install                # Install frontend dependencies
npm run tauri dev          # Start dev server (Vite on :1420 + Tauri window)
npm run tauri build        # Production build → NSIS installer in src-tauri/target/release/bundle/nsis/
```

There are no test commands configured. The project uses TypeScript strict mode — run `npx tsc --noEmit` to type-check the frontend.

## Architecture

### Backend (Rust — `src-tauri/src/`)

- **`lib.rs`** — App initialization: creates services, registers 18 Tauri commands, starts background tasks (scheduler, idle detector), sets up close-to-hide window behavior
- **`commands/`** — Tauri invoke handlers (stateless). Each command acquires a `StorageService` mutex lock, performs work, and returns results. Commands: notes CRUD, config, tags, attachments, AI summary generation, system controls
- **`services/`** — Background services sharing state via `Arc<Mutex<T>>`:
  - `storage.rs` — JSON file persistence in `%APPDATA%/EasyDaily/`. One `YYYY-MM-DD.json` per day, plus `config.json`, `tags.json`, `ai_usage.json`
  - `ai.rs` — OpenAI-compatible API client (supports OpenAI gpt-4-mini and GROK grok-2-1212)
  - `scheduler.rs` — Periodic reminder timer; skips when fullscreen app is active
  - `idle.rs` — Windows API (`GetLastInputInfo`) polling for idle detection
  - `tray.rs` — System tray menu and click handlers; emits events to frontend
  - `notification.rs` — Spawns separate WebView windows for notifications
  - `startup.rs` — Onboarding check + Windows Registry autostart registration

### Frontend (React/TypeScript — `src/`)

- **State**: Zustand store (`src/stores/useStore.ts`) — single source of truth for config, tags, day data cache, modals, notifications, navigation
- **Hooks** (`src/hooks/`): Domain logic wrappers around Tauri `invoke()` calls and store mutations. Key hooks: `useInitializeApp` (sequential startup loader), `useBackendEvents` (Tauri event listeners), `useAiSummary` (summary generation with error classification)
- **Pages**: QuickActionsPage (4 action cards), HistoryPage (search + day cards), SettingsPage (config, AI usage stats, tags, language)
- **Components**: `layout/` (Titlebar, Navbar), `common/` (Button, Modal, Card, etc.), `notes/` (editor with TipTap rich text), `notification/` (popup + standalone window), `onboarding/` (multi-step wizard)

### Communication Patterns

- **Frontend → Backend**: `invoke<T>("command_name", { params })` for synchronous request/response
- **Backend → Frontend**: `handle.emit("event:name", payload)` for async events (scheduler cycles, idle state changes, tray actions)
- **Notification windows**: Separate WebView instances launched with query params (`?notification=type`), communicate back to main window via Tauri events

### Data Flow

All persistence is JSON-based in `%APPDATA%/EasyDaily/`:
- `data/YYYY-MM-DD.json` — notes and summaries per day
- `config.json` — app configuration
- `tags.json` — user tags (defaults: Tarefa, Reunião, Estudo)
- `ai_usage.json` — append-only AI API call log with token counts and cost estimates

### i18n

Uses i18next with JSON locale files in `src/locales/`. Language is stored in config and applied on startup via `i18n.changeLanguage()`. Translation keys follow dot notation: `settings.ai.provider`, `quickActions.addNote`, etc.

## Key Conventions

- Rust models use `snake_case` with serde rename for JSON; TypeScript models use `camelCase`
- Logging uses a dual-output system (`src/utils/logger.ts`): console in dev + Tauri plugin-log to disk. Pattern: `logger.info("Module", "message", data)`
- Rust commands log with bracketed prefixes: `[AI:daily_summary]`, `[Storage]`, etc.
- The window is non-resizable (400x500), frameless (custom titlebar), and starts hidden (tray-only launch)
- AI prompts in `commands/ai.rs` are written in Portuguese regardless of app language setting
- AI cost tracking uses hardcoded per-token prices in `commands/ai.rs`
