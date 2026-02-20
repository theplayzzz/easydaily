# EasyDaily

Assistente pessoal de daily standup que roda na system tray do Windows. Registre notas ao longo do dia e gere resumos automáticos com IA.

## Features

- **Notas rápidas** — Registre atividades com um clique, a qualquer momento
- **Tags coloridas** — Organize notas por categoria (Tarefa, Reunião, Estudo, etc.)
- **Resumos com IA** — Gere resumos diários, combinados ou no formato standup via OpenAI ou GROK
- **System tray** — App roda minimizado na bandeja do sistema
- **Notificações inteligentes** — Lembretes periódicos que respeitam modo fullscreen
- **Detecção de idle** — Pausa automática quando você se ausenta
- **Histórico** — Navegue por dias anteriores e busque notas
- **i18n** — Português (BR) e English (US)

## Download

Baixe o instalador mais recente na aba [Releases](../../releases).

> **Nota:** No Windows, o SmartScreen pode exibir um aviso por ser um app não assinado. Clique em "Mais informações" → "Executar assim mesmo".

## Como Usar

1. Após instalar, o EasyDaily inicia na system tray (ícone verde "E")
2. Clique no ícone da tray para abrir a janela principal
3. Na primeira execução, o onboarding guia você pela configuração
4. Configure sua chave de API (OpenAI ou GROK) em Configurações → IA
5. Adicione notas ao longo do dia
6. Use as Ações Rápidas para gerar resumos com IA

## Build Local

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) 1.70+
- [Tauri CLI](https://tauri.app/start/prerequisites/)

### Desenvolvimento

```bash
npm install
npm run tauri dev
```

### Build de produção

```bash
npm run tauri build
```

O instalador será gerado em `src-tauri/target/release/bundle/nsis/`.

## Tecnologias

- **Frontend:** React, TypeScript, Tailwind CSS, Zustand, Tiptap, i18next
- **Backend:** Rust, Tauri v2
- **IA:** OpenAI API / GROK (xAI) — formato OpenAI-compatible
- **Desktop:** System tray, idle detection, autostart (Windows)
