# EasyDaily - Product Requirements Document (PRD)

> **Versão:** 1.0
> **Data:** 2026-02-19
> **Status:** Aprovado para desenvolvimento

---

## 1. Visão Geral

### 1.1 O que é o EasyDaily?

EasyDaily é um aplicativo desktop para Windows que ajuda profissionais a documentarem suas atividades ao longo do dia de forma automática e não intrusiva. O app coleta notas periódicas sobre o que o usuário fez e, ao final do dia (ou quando solicitado), gera um resumo formatado usando IA — ideal para reuniões de daily standup, reports semanais ou simplesmente manter um registro pessoal de produtividade.

### 1.2 Problema que Resolve

- Dificuldade de lembrar tudo que foi feito durante o dia/semana
- Perda de tempo preparando resumos para dailies
- Falta de registro histórico de atividades
- Esquecimento de tarefas realizadas entre reuniões

### 1.3 Público-Alvo

- Desenvolvedores de software
- Profissionais que participam de reuniões diárias (daily standups)
- Freelancers que precisam reportar atividades para clientes
- Qualquer profissional que queira documentar sua produtividade

---

## 2. Stack Tecnológica

### 2.1 Decisões Técnicas

| Componente | Tecnologia | Justificativa |
|------------|------------|---------------|
| **Framework Desktop** | Tauri v2 | Leve (~30MB RAM), binário pequeno (~5-10MB), usa WebView2 nativo |
| **Frontend** | React + TypeScript + Vite | Ecosistema maduro, tipagem forte, build rápido |
| **Backend** | Rust | Performance, segurança, integração nativa com Windows |
| **Estilização** | Tailwind CSS | Produtividade, dark mode fácil, bundle otimizado |
| **Editor de Texto** | TipTap ou React-Markdown | Suporte a Markdown com preview em tempo real |
| **Armazenamento** | JSON (1 arquivo por dia) + pasta de anexos | Simples, human-readable, fácil backup |
| **IA** | OpenAI API + GROK (XAI) | GPT-4 Vision para análise de imagens |

### 2.2 Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Ações     │  │  Histórico  │  │   Configurações     │  │
│  │   Rápidas   │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Notificação Custom (Popup)                 ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────────┬──────────────────────────────────┘
                           │ Tauri Commands (IPC)
┌──────────────────────────┴──────────────────────────────────┐
│                    BACKEND (Rust)                            │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │ System Tray   │  │ Timer/Cron    │  │ Storage Manager │  │
│  │ Manager       │  │ Scheduler     │  │ (JSON + Files)  │  │
│  └───────────────┘  └───────────────┘  └─────────────────┘  │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │ Notification  │  │ HTTP Client   │  │ Windows API     │  │
│  │ Handler       │  │ (IA Requests) │  │ (Inatividade)   │  │
│  └───────────────┘  └───────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    SISTEMA DE ARQUIVOS                       │
│  📁 %APPDATA%/EasyDaily/                                     │
│     ├── 📁 data/                                             │
│     │   ├── 📄 2024-01-15.json                              │
│     │   ├── 📄 2024-01-16.json                              │
│     │   └── ...                                              │
│     ├── 📁 attachments/                                      │
│     │   ├── 📁 2024-01-15/                                  │
│     │   │   ├── 🖼️ img_001.png                              │
│     │   │   └── 📎 doc_001.pdf                              │
│     │   └── ...                                              │
│     ├── 📄 config.json                                       │
│     └── 📄 tags.json                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Funcionalidades

### 3.1 System Tray

O aplicativo roda minimizado na bandeja do sistema (área de ícones ocultos do Windows).

**Menu do Tray (clique direito):**
- ➕ Adicionar Nota
- 📋 Abrir EasyDaily
- 📊 Gerar Resumo de Hoje
- ⏰ Configurar Timer
- ❓ Tutorial
- ❌ Sair

**Comportamento:**
- Clique simples no ícone: Abre a janela principal
- App inicia automaticamente com o Windows
- Ícone mostra badge quando há notificação pendente

---

### 3.2 Fluxo de Inicialização

```
[Windows Inicia]
       ↓
[EasyDaily Inicia Automaticamente]
       ↓
[Notificação 1: "Bom dia! Quer gerar o resumo de ontem e planejar hoje?"]
       ↓
   [Usuário interage ou fecha]
       ↓
   [1 minuto depois]
       ↓
[Notificação 2: "Fez algo enquanto estava offline? Adicione uma nota!"]
       ↓
   [Usuário interage ou fecha]
       ↓
[Cron inicia ciclos de X horas]
```

**Regras:**
- Se o usuário fechar o app e reabrir, o mesmo fluxo acontece (considera como nova sessão)
- A notificação de "resumo de ontem" aparece independente do horário
- Ambas as notificações podem ser fechadas sem ação

---

### 3.3 Sistema de Notificações

#### 3.3.1 Aparência
- **Posição:** Canto inferior direito (acima da taskbar)
- **Dimensões:** ~350px largura x altura dinâmica
- **Estilo:** Dark mode, bordas arredondadas, sombra suave
- **Som:** Som próprio curto e sutil (não do sistema)

#### 3.3.2 Comportamento de Tempo
- Notificação fica visível por **5 minutos**
- Timer **pausa** se usuário estiver **inativo** (mouse/teclado parados)
- Timer **retoma** quando detecta atividade
- Detecção via **Windows API** (`GetLastInputInfo`)

#### 3.3.3 Contextos de Fullscreen
- **NÃO** sobrepõe aplicações em fullscreen (jogos, apresentações)
- Fica aguardando até o usuário sair do fullscreen
- Aparece assim que fullscreen é encerrado

#### 3.3.4 Multi-monitor
- Aparece sempre no **monitor principal**

---

### 3.4 Ciclo de Notificações (Cron)

```
[Ciclo 1] ─── 2h ───→ [Notificação: "O que você fez nas últimas horas?"]
                              ↓
                    [Adicionar Nota] ou [Skip]
                              ↓
[Ciclo 2] ─── 2h ───→ [Notificação: "O que você fez nas últimas horas?"]
                              ↓
                    [Adicionar Nota] ou [Skip]
                              ↓
              [Se 2 skips seguidos sem nenhuma nota]
                              ↓
              [Popup: "Quer alterar o tempo do ciclo?"]
                              ↓
                   [Sim → Configurações] ou [Não]
                              ↓
[Ciclo continua normalmente...]
```

**Configurações do Cron:**
- Tempo padrão: 2 horas
- Opções: 1h, 2h, 3h, 4h, 6h, 8h
- Configurável nas Settings

---

### 3.5 Campo de Entrada de Nota

#### 3.5.1 Funcionalidades
- **Markdown completo** com preview em tempo real
- Suporte a **emojis**
- **Ctrl+V** para colar imagens direto do clipboard
- Botão para anexar arquivos (máx. 5 por nota)
- Formatação similar ao WhatsApp:
  - `*texto*` → **texto** (negrito)
  - `_texto_` → *texto* (itálico)
  - ``` `código` ``` → `código`

#### 3.5.2 Preview
- Lado a lado ou toggle entre edição/preview
- Renderização em tempo real enquanto digita

#### 3.5.3 Anexos
- Tipos suportados: imagens (PNG, JPG, GIF), PDFs, documentos
- Limite: 5 anexos por nota
- Tamanho máximo por arquivo: 10MB
- Armazenados em pasta separada, referenciados no JSON

---

### 3.6 Páginas do Aplicativo

#### 3.6.1 Ações Rápidas (Home)

```
┌─────────────────────────────────────────┐
│  EasyDaily              [─] [□] [×]     │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  ➕  Adicionar Nota             │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  📊  Resumo de Hoje             │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  📋  Resumo: Ontem + Hoje       │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  🎯  Daily: Ontem + Plano Hoje  │    │
│  └─────────────────────────────────┘    │
│                                         │
├─────────────────────────────────────────┤
│  [🏠 Ações]  [📜 Histórico]  [⚙️ Config] │
└─────────────────────────────────────────┘
```

**Ações:**

1. **Adicionar Nota**
   - Abre campo de entrada
   - Salva na data de hoje

2. **Resumo de Hoje**
   - Envia notas de hoje para IA
   - Retorna resumo categorizado

3. **Resumo: Ontem + Hoje**
   - Combina notas de ontem e hoje
   - Gera resumo unificado

4. **Daily: Ontem + Plano Hoje**
   - Puxa notas de ontem
   - Abre campo para digitar plano de hoje
   - Gera output no formato daily standup

---

#### 3.6.2 Histórico

```
┌─────────────────────────────────────────┐
│  Histórico              [─] [□] [×]     │
├─────────────────────────────────────────┤
│  🔍 Buscar...                           │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📅 Hoje - 19/02/2026            │ ▼  │
│  ├─────────────────────────────────┤    │
│  │ 09:30 - Revisão de PR #123      │    │
│  │   [Tarefa] [Reunião]            │    │
│  │   📎 screenshot.png             │    │
│  │                    [✏️] [🗑️]    │    │
│  ├─────────────────────────────────┤    │
│  │ 11:45 - Daily com o time        │    │
│  │   [Reunião]                     │    │
│  │                    [✏️] [🗑️]    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📅 18/02/2026                   │ ▶  │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📅 17/02/2026 (sem notas)       │ ▶  │
│  └─────────────────────────────────┘    │
│                                         │
│           [➕ Adicionar Nota]           │
│           [📊 Gerar Resumo]             │
│                                         │
├─────────────────────────────────────────┤
│  [🏠 Ações]  [📜 Histórico]  [⚙️ Config] │
└─────────────────────────────────────────┘
```

**Funcionalidades:**
- Lista de dias (ordem decrescente)
- Dias vazios aparecem com indicador "(sem notas)"
- Clique no dia expande/colapsa
- Cada nota mostra: horário, conteúdo, tags, anexos
- Botões de editar e deletar em cada nota
- Botão "Adicionar Nota" permite adicionar em qualquer dia
- Botão "Gerar Resumo" gera para o dia selecionado
- Dados carregados sob demanda (lazy loading)

---

#### 3.6.3 Configurações

```
┌─────────────────────────────────────────┐
│  Configurações          [─] [□] [×]     │
├─────────────────────────────────────────┤
│                                         │
│  ⏰ CICLO DE NOTIFICAÇÕES               │
│  ┌─────────────────────────────────┐    │
│  │ Intervalo: [2 horas        ▼]  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  🤖 INTEGRAÇÃO COM IA                   │
│  ┌─────────────────────────────────┐    │
│  │ Provider: [OpenAI          ▼]  │    │
│  │                                 │    │
│  │ API Key OpenAI:                 │    │
│  │ [sk-xxxxxxxxxxxxx...    ] [👁️] │    │
│  │                                 │    │
│  │ API Key GROK:                   │    │
│  │ [xai-xxxxxxxxxxxxx...   ] [👁️] │    │
│  └─────────────────────────────────┘    │
│                                         │
│  🏷️ GERENCIAR TAGS                      │
│  ┌─────────────────────────────────┐    │
│  │ [🟢 Tarefa    ] [✏️] [🗑️]       │    │
│  │ [🔵 Reunião   ] [✏️] [🗑️]       │    │
│  │ [🟣 Estudo    ] [✏️] [🗑️]       │    │
│  │         [➕ Nova Tag]           │    │
│  └─────────────────────────────────┘    │
│                                         │
│  🔊 SOM                                 │
│  ┌─────────────────────────────────┐    │
│  │ Som de notificação: [ON 🔊]     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  🌐 IDIOMA                              │
│  ┌─────────────────────────────────┐    │
│  │ [Português (BR)           ▼]   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  📖 [Ver Tutorial Novamente]            │
│                                         │
├─────────────────────────────────────────┤
│  [🏠 Ações]  [📜 Histórico]  [⚙️ Config] │
└─────────────────────────────────────────┘
```

---

### 3.7 Sistema de Tags

#### 3.7.1 Tags Padrão
| Tag | Cor |
|-----|-----|
| Tarefa | Verde (#39FF14) |
| Reunião | Azul (#00D4FF) |
| Estudo | Roxo (#BF40FF) |

#### 3.7.2 Tags Customizadas
- Usuário pode criar novas tags
- Define nome e cor (color picker)
- Pode editar e deletar tags existentes
- Tags deletadas são removidas das notas

#### 3.7.3 Uso nas Notas
- Seleção múltipla de tags por nota
- Tags aparecem como chips coloridos
- Filtragem futura por tag (v2)

---

### 3.8 Integração com IA

#### 3.8.1 Providers Suportados
- **OpenAI** (GPT-4 / GPT-4 Vision)
- **GROK** (XAI)

#### 3.8.2 Configuração
- Usuário fornece própria API key
- Dropdown para selecionar provider ativo
- Key armazenada localmente (criptografada)

#### 3.8.3 Envio de Dados
- **Texto das notas:** Sempre enviado
- **Imagens/Anexos:** Enviados via Vision API
- **Metadados:** Horário, tags

#### 3.8.4 Formato de Output (Categorizado)

```markdown
## Resumo do Dia - 19/02/2026

**Desenvolvimento:**
• Corrigiu bug crítico no módulo de autenticação
• Implementou nova tela de perfil do usuário
• Code review do PR #456

**Reuniões:**
• Daily standup com a equipe (09:30)
• Alinhamento com stakeholders sobre roadmap Q1

**Estudos:**
• Pesquisa sobre otimização de queries SQL
```

#### 3.8.5 Prompts Base

**Resumo do Dia:**
```
Analise as seguintes notas de trabalho e gere um resumo categorizado por tipo de atividade.
Mantenha o resumo conciso e em bullet points.
Use as categorias baseadas nas tags fornecidas.
Se houver imagens, descreva brevemente o que mostram.

Notas:
{notas_formatadas}
```

**Daily (Ontem + Plano Hoje):**
```
Gere um resumo para daily standup no seguinte formato:

**O que fiz ontem:**
(baseado nas notas de ontem)

**O que vou fazer hoje:**
(baseado no plano informado pelo usuário)

**Bloqueios:**
(identifique possíveis bloqueios mencionados ou escreva "Nenhum")

Notas de ontem:
{notas_ontem}

Plano de hoje:
{plano_hoje}
```

#### 3.8.6 Tratamento de Erros
- **Offline:** Exibir erro "Sem conexão. Verifique sua internet."
- **API Key inválida:** "Chave de API inválida. Verifique nas configurações."
- **Rate limit:** "Limite de requisições atingido. Tente novamente em alguns minutos."
- **Erro genérico:** "Erro ao gerar resumo. Tente novamente."

---

### 3.9 Onboarding (Tutorial)

#### 3.9.1 Primeira Execução
Ao abrir pela primeira vez, exibir tour guiado:

1. **Boas-vindas**
   - "Bem-vindo ao EasyDaily! Vamos configurar seu app em 2 minutos."

2. **Configurar API Key**
   - "Para gerar resumos com IA, adicione sua chave de API."
   - Campo para inserir OpenAI ou GROK key
   - Botão "Pular" (pode configurar depois)

3. **Explicação do Ciclo**
   - "A cada X horas, uma notificação vai perguntar o que você fez."
   - "Você pode ajustar o intervalo nas configurações."

4. **System Tray**
   - "O EasyDaily fica na bandeja do sistema."
   - "Clique no ícone para acessar rapidamente."

5. **Pronto!**
   - "Tudo configurado! Comece adicionando sua primeira nota."
   - Botão "Começar"

#### 3.9.2 Tutorial Posterior
- Botão "Ver Tutorial" nas configurações
- Reabre o tour completo

---

### 3.10 Armazenamento de Dados

#### 3.10.1 Estrutura de Diretórios
```
%APPDATA%/EasyDaily/
├── data/
│   ├── 2026-02-19.json
│   ├── 2026-02-18.json
│   └── ...
├── attachments/
│   ├── 2026-02-19/
│   │   ├── note_abc123_img1.png
│   │   └── note_abc123_doc1.pdf
│   └── ...
├── config.json
└── tags.json
```

#### 3.10.2 Formato do JSON Diário

```json
{
  "date": "2026-02-19",
  "notes": [
    {
      "id": "note_abc123",
      "createdAt": "2026-02-19T09:30:00Z",
      "updatedAt": "2026-02-19T09:30:00Z",
      "content": "Revisão de PR #123\n\nCorrigido bug no módulo de auth.",
      "contentHtml": "<p>Revisão de PR #123</p><p>Corrigido bug no módulo de auth.</p>",
      "tags": ["tarefa"],
      "attachments": [
        {
          "id": "att_xyz789",
          "filename": "note_abc123_img1.png",
          "type": "image/png",
          "size": 245000
        }
      ]
    }
  ],
  "summaries": [
    {
      "id": "sum_def456",
      "createdAt": "2026-02-19T18:00:00Z",
      "type": "daily",
      "content": "## Resumo do Dia...",
      "provider": "openai"
    }
  ]
}
```

#### 3.10.3 Formato do config.json

```json
{
  "cycleInterval": 2,
  "activeProvider": "openai",
  "apiKeys": {
    "openai": "encrypted_key_here",
    "grok": "encrypted_key_here"
  },
  "sound": {
    "enabled": true
  },
  "language": "pt-BR",
  "onboardingCompleted": true,
  "lastSessionDate": "2026-02-19",
  "windowPosition": {
    "x": 100,
    "y": 100
  }
}
```

#### 3.10.4 Formato do tags.json

```json
{
  "tags": [
    {
      "id": "tag_001",
      "name": "Tarefa",
      "color": "#39FF14",
      "isDefault": true
    },
    {
      "id": "tag_002",
      "name": "Reunião",
      "color": "#00D4FF",
      "isDefault": true
    },
    {
      "id": "tag_003",
      "name": "Estudo",
      "color": "#BF40FF",
      "isDefault": true
    },
    {
      "id": "tag_004",
      "name": "Bug Fix",
      "color": "#FF4040",
      "isDefault": false
    }
  ]
}
```

---

## 4. Design Visual

### 4.1 Paleta de Cores

| Elemento | Cor | Hex |
|----------|-----|-----|
| **Background Principal** | Preto profundo | `#0D0D0D` |
| **Background Secundário** | Cinza escuro | `#1A1A1A` |
| **Background Cards** | Cinza médio | `#242424` |
| **Accent Principal** | Verde neon | `#39FF14` |
| **Accent Secundário** | Verde hover | `#32E012` |
| **Texto Principal** | Branco suave | `#E8E8E8` |
| **Texto Secundário** | Cinza claro | `#A0A0A0` |
| **Erro** | Vermelho | `#FF4444` |
| **Warning** | Amarelo | `#FFAA00` |
| **Sucesso** | Verde | `#39FF14` |
| **Border** | Cinza | `#333333` |

### 4.2 Tipografia

- **Font Family:** Inter, system-ui, sans-serif
- **Tamanhos:**
  - Título: 18px (bold)
  - Subtítulo: 14px (semibold)
  - Body: 13px (regular)
  - Caption: 11px (regular)

### 4.3 Dimensões da Janela

- **Largura:** 400px
- **Altura:** 500px (mínimo)
- **Altura máxima:** 600px
- **Redimensionável:** Não (janela fixa)

### 4.4 Componentes de UI

#### Botões
```css
/* Botão Primário */
background: #39FF14;
color: #0D0D0D;
border-radius: 8px;
padding: 10px 16px;
font-weight: 600;

/* Botão Secundário */
background: transparent;
border: 1px solid #39FF14;
color: #39FF14;

/* Botão Ghost */
background: transparent;
color: #E8E8E8;
```

#### Inputs
```css
background: #1A1A1A;
border: 1px solid #333333;
border-radius: 8px;
color: #E8E8E8;
/* Focus */
border-color: #39FF14;
```

#### Cards
```css
background: #242424;
border: 1px solid #333333;
border-radius: 12px;
```

---

## 5. Som de Notificação

### 5.1 Especificações
- **Duração:** 0.5 - 1 segundo
- **Estilo:** Sutil, não intrusivo, tom positivo
- **Formato:** MP3 ou WAV

### 5.2 Fontes Recomendadas (Royalty-Free)
- [Pixabay Sound Effects](https://pixabay.com/sound-effects/search/notification/)
- [Mixkit Free Sounds](https://mixkit.co/free-sound-effects/notification/)

### 5.3 Configuração
- Toggle on/off nas configurações
- Volume fixo (não ajustável na v1)

---

## 6. Requisitos de Sistema

### 6.1 Mínimo
- **OS:** Windows 10 (build 1803+)
- **RAM:** 4GB
- **Disco:** 50MB
- **WebView2:** Instalado (Windows 10/11 já vem com ele)

### 6.2 Recomendado
- **OS:** Windows 11
- **RAM:** 8GB
- **Internet:** Para funcionalidades de IA

---

## 7. Distribuição

### 7.1 Instalador
- **Formato:** NSIS (.exe)
- **Instalação:** Per-user (não requer admin)
- **Tamanho esperado:** 5-15MB

### 7.2 Auto-Updater
- Plugin Tauri updater
- Verificação automática ao iniciar
- Notificação quando há atualização disponível
- Usuário decide quando instalar

### 7.3 Assinatura de Código
- **Fase inicial:** Sem certificado (warning do SmartScreen)
- **Mitigação:**
  - Instruções claras para usuários
  - Submissão ao Microsoft Security Intelligence
  - Construção de reputação ao longo do tempo
- **Futuro:** Avaliar certificado OV quando viável

### 7.4 Startup com Windows
- Registro em `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`
- Configurável (pode desativar)

---

## 8. Detecção de Inatividade

### 8.1 Implementação

Usar Windows API `GetLastInputInfo` para detectar último input do usuário.

```rust
use winapi::um::winuser::{GetLastInputInfo, LASTINPUTINFO};

fn get_idle_time_seconds() -> u32 {
    let mut last_input = LASTINPUTINFO {
        cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32,
        dwTime: 0,
    };

    unsafe {
        GetLastInputInfo(&mut last_input);
        let tick_count = winapi::um::sysinfoapi::GetTickCount();
        (tick_count - last_input.dwTime) / 1000
    }
}
```

### 8.2 Lógica
- Polling a cada 30 segundos
- Se idle > 60 segundos, pausa timer da notificação
- Quando idle < 60 segundos, retoma timer

---

## 9. Internacionalização (i18n)

### 9.1 Idiomas Suportados
- Português (BR) - padrão
- English (US)

### 9.2 Implementação
- Arquivos JSON de tradução
- Troca de idioma nas configurações
- Reinício não necessário (hot reload)

### 9.3 Estrutura
```
/src/locales/
├── pt-BR.json
└── en-US.json
```

---

## 10. Roadmap

### 10.1 MVP (v1.0)
- [x] System tray
- [x] Notificações customizadas
- [x] Ciclo de lembretes (cron)
- [x] Campo de notas com Markdown
- [x] Anexos de imagens/arquivos
- [x] Histórico por dia
- [x] Tags (padrão + customizadas)
- [x] Integração OpenAI + GROK
- [x] Geração de resumos
- [x] Configurações
- [x] Onboarding/Tutorial
- [x] PT-BR + EN

### 10.2 Futuro (v2.0+)
- [ ] Filtro por tags no histórico
- [ ] Busca full-text nas notas
- [ ] Export (JSON, CSV, PDF)
- [ ] Backup para cloud (Google Drive, OneDrive)
- [ ] Temas adicionais (light mode)
- [ ] Atalhos de teclado globais
- [ ] Widgets para desktop
- [ ] Integração com calendário
- [ ] Versão mobile (via Tauri Mobile)

---

## 11. Estrutura do Projeto

```
easydaily/
├── src/                          # Frontend React
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Tag.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── PageContainer.tsx
│   │   ├── notes/
│   │   │   ├── NoteEditor.tsx
│   │   │   ├── NoteCard.tsx
│   │   │   └── NoteList.tsx
│   │   ├── notification/
│   │   │   └── NotificationPopup.tsx
│   │   └── onboarding/
│   │       └── TourModal.tsx
│   ├── pages/
│   │   ├── QuickActions.tsx
│   │   ├── History.tsx
│   │   └── Settings.tsx
│   ├── hooks/
│   │   ├── useNotes.ts
│   │   ├── useTags.ts
│   │   ├── useConfig.ts
│   │   └── useAI.ts
│   ├── stores/
│   │   └── appStore.ts
│   ├── services/
│   │   ├── ai.ts
│   │   └── storage.ts
│   ├── locales/
│   │   ├── pt-BR.json
│   │   └── en-US.json
│   ├── styles/
│   │   └── globals.css
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/                    # Backend Rust
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands/
│   │   │   ├── mod.rs
│   │   │   ├── notes.rs
│   │   │   ├── config.rs
│   │   │   ├── ai.rs
│   │   │   └── system.rs
│   │   ├── services/
│   │   │   ├── mod.rs
│   │   │   ├── storage.rs
│   │   │   ├── scheduler.rs
│   │   │   ├── tray.rs
│   │   │   └── idle_detector.rs
│   │   └── models/
│   │       ├── mod.rs
│   │       ├── note.rs
│   │       ├── config.rs
│   │       └── tag.rs
│   ├── icons/
│   │   ├── icon.ico
│   │   └── icon.png
│   ├── sounds/
│   │   └── notification.mp3
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 12. Métricas de Sucesso

### 12.1 Performance
- Uso de RAM em idle: < 50MB
- Tempo de startup: < 1 segundo
- Tamanho do instalador: < 15MB

### 12.2 Usabilidade
- Tempo para adicionar nota: < 10 segundos
- Tempo para gerar resumo: < 5 segundos (excluindo API)

---

## 13. Considerações de Segurança

### 13.1 API Keys
- Armazenadas localmente com criptografia (Tauri secure store)
- Nunca logadas ou enviadas para terceiros
- Usuário pode remover a qualquer momento

### 13.2 Dados do Usuário
- Todos os dados ficam locais
- Nenhum telemetry ou analytics
- Usuário tem controle total

### 13.3 Requisições HTTP
- Apenas para APIs de IA configuradas pelo usuário
- HTTPS obrigatório
- Timeout de 30 segundos

---

## 14. Glossário

| Termo | Definição |
|-------|-----------|
| **Daily** | Reunião diária de alinhamento (daily standup) |
| **Cron** | Sistema de agendamento de tarefas periódicas |
| **System Tray** | Área de ícones ocultos na barra de tarefas do Windows |
| **WebView2** | Runtime do Microsoft Edge usado pelo Tauri |
| **Provider** | Serviço de IA (OpenAI, GROK) |

---

## 15. Referências

- [Tauri v2 Documentation](https://v2.tauri.app/)
- [Tauri System Tray](https://v2.tauri.app/learn/system-tray/)
- [Tauri Updater Plugin](https://v2.tauri.app/plugin/updater/)
- [Windows Code Signing](https://v2.tauri.app/distribute/sign/windows/)
- [OpenAI API](https://platform.openai.com/docs/)
- [Pixabay Sound Effects](https://pixabay.com/sound-effects/)
- [Mixkit Notification Sounds](https://mixkit.co/free-sound-effects/notification/)

---

**Documento criado em:** 2026-02-19
**Última atualização:** 2026-02-19
**Versão do documento:** 1.0
