# EasyDaily - Plano de Execução

> **Documento de Referência:** `/home/lucas/easydaily/PRD.md`
>
> Este documento contém o plano de execução dividido em 5 fases sequenciais. Cada fase deve ser completamente validada antes de avançar para a próxima.

---

## Instruções Gerais

### Para o Claude Code

1. **Antes de iniciar qualquer fase**, leia o PRD completo em `/home/lucas/easydaily/PRD.md`
2. **Consulte as seções específicas** do PRD quando indicado (ex: "Ver PRD Seção 4.1")
3. **Use o MCP Context-7** para pesquisar documentação oficial dos frameworks quando necessário
4. **Execute os testes de validação** ao final de cada fase antes de prosseguir
5. **Não avance para a próxima fase** sem que todos os itens de validação estejam OK
6. **O projeto será executado na pasta atual** (`/home/lucas/easydaily/`) - não criar subpastas nem navegar para outros diretórios

### Abordagem Frontend-First

Este projeto segue a metodologia **Frontend-First**:

1. **Primeiro construir a interface visual** - Criar componentes, páginas e elementos de UI
2. **Depois implementar a lógica** - Criar as funções que os elementos da UI vão chamar
3. **Sempre ter algo visual para testar** - A cada funcionalidade, primeiro aparece no frontend, depois funciona

**Exemplo prático:**
- Criar o botão "Resumo de Hoje" na UI → Testar se aparece e responde ao clique
- Depois implementar a chamada para IA → Testar se gera o resumo
- Nunca criar função backend sem ter primeiro o elemento UI que vai usá-la

### Uso do MCP Context-7

O Context-7 é um MCP disponível para pesquisar documentação oficial. Utilize-o para:
- Consultar documentação do Tauri v2
- Consultar documentação do React
- Consultar documentação do TipTap (editor)
- Consultar documentação do Zustand
- Consultar documentação do Tailwind CSS
- Consultar documentação do i18next
- Consultar APIs do Rust (reqwest, serde, tokio, etc.)
- Qualquer outra documentação técnica necessária

**Quando usar:** Sempre que precisar de detalhes de implementação, sintaxe de APIs, configurações específicas ou boas práticas de um framework.

### Sistema de Logs para Debug

Durante todo o desenvolvimento, manter sistema de logging ativo:

**Frontend (React):**
- Criar utilitário de log que escreve no console com prefixos por módulo
- Logs de ações do usuário (cliques, navegação)
- Logs de chamadas para o backend
- Logs de respostas e erros

**Backend (Rust):**
- Usar crate `log` com `env_logger` ou similar
- Logs de inicialização
- Logs de cada command chamado
- Logs de operações de arquivo
- Logs de erros com stack trace

**Persistência:**
- Salvar logs em arquivo durante sessão de desenvolvimento
- Localização: `%APPDATA%/EasyDaily/logs/` ou pasta local `./logs/`
- Rotação diária de arquivos de log
- Incluir flag para desabilitar logs em produção

---

## Visão Geral das Fases

| Fase | Nome | Objetivo Principal |
|------|------|-------------------|
| 1 | Setup e Infraestrutura | Ambiente pronto, projeto criado, estrutura base |
| 2 | Frontend Completo | Toda interface visual funcionando (sem backend real) |
| 3 | Backend Core | Lógica Rust, storage, system tray, scheduler |
| 4 | Integração | Conectar frontend com backend, fluxos completos |
| 5 | IA, Onboarding e Distribuição | Recursos finais e app pronto para distribuir |

---

# FASE 1: Setup e Infraestrutura

## Objetivo
Preparar o ambiente de desenvolvimento, criar o projeto Tauri com React + TypeScript + Vite, instalar todas as dependências e estabelecer a estrutura base.

---

## 1.1 Verificação de Pré-requisitos

Verificar se o ambiente possui as ferramentas necessárias instaladas:
- Node.js versão 18 ou superior
- Rust (via rustup)
- Visual Studio Build Tools com workload de C++

Se algum pré-requisito estiver faltando, orientar o usuário sobre a instalação antes de prosseguir.

**Pesquisa Context-7:** Consultar documentação do Tauri v2 sobre pré-requisitos para Windows caso haja dúvidas específicas.

---

## 1.2 Inicialização do Projeto Tauri

Inicializar o projeto Tauri na pasta atual utilizando o CLI oficial com o template React + TypeScript.

Após a criação, instalar as dependências base do projeto.

**Referência PRD:** Seção 2.1 (Stack Tecnológica)

**Importante:** O projeto deve ser criado na pasta atual (`/home/lucas/easydaily/`), não em uma subpasta.

---

## 1.3 Instalação de Dependências do Frontend

Instalar as seguintes categorias de dependências:

**Estilização:**
- Tailwind CSS com PostCSS e Autoprefixer

**Editor de Texto Rico:**
- TipTap com extensões necessárias para Markdown, placeholder e imagens

**Pesquisa Context-7:** Consultar documentação do TipTap para identificar todas as extensões necessárias para suportar Markdown completo, imagens e formatação.

**State Management:**
- Zustand para gerenciamento de estado global

**Utilitários:**
- date-fns para manipulação de datas
- lucide-react para ícones
- clsx e tailwind-merge para composição de classes CSS
- i18next e react-i18next para internacionalização
- API oficial do Tauri para comunicação com backend

---

## 1.4 Configuração do Tailwind CSS

Inicializar o Tailwind CSS e configurar com a paleta de cores definida no PRD.

**Referência PRD:** Seção 4.1 (Paleta de Cores)

A configuração deve incluir:
- Cores de background (primary #0D0D0D, secondary #1A1A1A, card #242424)
- Cores de accent (primary verde neon #39FF14, hover #32E012)
- Cores de texto (primary #E8E8E8, secondary #A0A0A0)
- Cores de estado (error #FF4444, warning #FFAA00, success #39FF14)
- Cor de border (#333333)
- Font family Inter como padrão

Criar também o arquivo de estilos globais com as diretivas do Tailwind e estilos base para o body.

---

## 1.5 Criação da Estrutura de Pastas

Criar a estrutura de diretórios conforme definido no PRD.

**Referência PRD:** Seção 11 (Estrutura do Projeto)

**Frontend (src/):**
- components/ com subpastas: common, layout, notes, notification, onboarding
- pages/
- hooks/
- stores/
- services/
- locales/
- styles/
- types/
- utils/ (para logger e helpers)

**Backend (src-tauri/src/):**
- commands/
- services/
- models/

**Assets (src-tauri/):**
- icons/
- sounds/

**Logs (desenvolvimento):**
- logs/ na raiz do projeto

---

## 1.6 Configuração do Sistema de Logs

Implementar utilitário de logging para desenvolvimento.

**Frontend - Criar src/utils/logger.ts:**
- Função de log com níveis: debug, info, warn, error
- Prefixo com timestamp e nome do módulo
- Saída no console do navegador
- Flag para habilitar/desabilitar (process.env.NODE_ENV)

**Backend - Configurar logging Rust:**
- Adicionar crates `log` e `env_logger` no Cargo.toml
- Configurar inicialização do logger no main.rs
- Definir nível de log via variável de ambiente

**Pesquisa Context-7:** Consultar documentação do Tauri sobre logging e da crate `log` para configuração.

---

## 1.7 Configuração do tauri.conf.json

Configurar o arquivo principal do Tauri com as seguintes especificações:

**Referência PRD:** Seção 4.3 (Dimensões), Seção 3.1 (System Tray), Seção 7.1 (Instalador)

**Informações do App:**
- Nome do produto: EasyDaily
- Identificador: com.easydaily.app
- Versão inicial: 1.0.0

**Janela Principal:**
- Dimensões: 400x500 pixels
- Não redimensionável
- Centralizada
- Iniciar visível (para desenvolvimento; depois mudar para oculta)

**System Tray:**
- Habilitar tray icon
- Configurar caminho do ícone

**Bundle/Instalador:**
- Target: NSIS
- Modo de instalação: currentUser (não requer admin)

**Pesquisa Context-7:** Consultar documentação do Tauri v2 sobre configuração de system tray e bundle settings para garantir sintaxe correta.

---

## 1.8 Configuração do Cargo.toml

Adicionar as dependências Rust necessárias para o backend.

**Referência PRD:** Seção 2.2 (Arquitetura), Seção 8 (Detecção de Inatividade)

**Dependências necessárias:**
- tauri com feature de tray-icon
- serde com feature derive para serialização JSON
- serde_json para manipulação de JSON
- tokio com features full para async
- reqwest com feature json para requisições HTTP
- chrono com feature serde para datas
- uuid com features v4 e serde para IDs únicos
- dirs para obter diretórios do sistema (AppData)
- winapi com features winuser e sysinfoapi para detectar inatividade
- log para logging
- env_logger para configuração de logs

**Pesquisa Context-7:** Consultar documentação das crates Rust para versões compatíveis e features necessárias.

---

## 1.9 Definição de Tipos TypeScript

Criar o arquivo de tipos com todas as interfaces necessárias para o projeto.

**Referência PRD:** Seção 3.10.2, 3.10.3, 3.10.4 (Formatos JSON)

**Tipos a definir:**
- Note (id, timestamps, content, contentHtml, tags, attachments)
- Attachment (id, filename, type, size)
- DayData (date, notes, summaries)
- Summary (id, timestamp, type, content, provider)
- Tag (id, name, color, isDefault)
- Config (cycleInterval, activeProvider, apiKeys, sound, language, onboardingCompleted, lastSessionDate)
- NotificationType (enum com tipos de notificação)
- Page (enum com páginas da aplicação)

Esses tipos devem espelhar exatamente a estrutura dos JSONs que serão armazenados.

---

## 1.10 Verificação do Setup

Executar o comando de desenvolvimento do Tauri para garantir que tudo está configurado corretamente. O app deve compilar e abrir uma janela (mesmo que vazia).

Verificar se logs estão sendo exibidos no console.

---

## Validação da Fase 1

### Testes Manuais Obrigatórios

| # | Teste | Esperado |
|---|-------|----------|
| 1 | Executar `npm run tauri dev` | Compila sem erros e abre janela |
| 2 | Verificar pasta `src/components/` | Subpastas common, layout, notes, notification, onboarding existem |
| 3 | Verificar pasta `src-tauri/src/` | Subpastas commands, services, models existem |
| 4 | Verificar `tailwind.config.js` | Cores do PRD estão configuradas |
| 5 | Verificar `src-tauri/Cargo.toml` | Todas as dependências listadas |
| 6 | Verificar `src/types/index.ts` | Todos os tipos definidos |
| 7 | Verificar `src/utils/logger.ts` | Logger criado e funcional |
| 8 | Verificar console do app | Logs aparecem ao iniciar |

**Critério de aprovação:** Todos os 8 itens OK para avançar para Fase 2.

---

# FASE 2: Frontend Completo

## Objetivo
Implementar toda a interface visual do aplicativo seguindo a abordagem Frontend-First. Todos os componentes, páginas e interações visuais devem funcionar, mesmo que com dados mockados.

**Princípio:** Ao final desta fase, o usuário deve conseguir navegar por toda a aplicação, ver todas as telas, clicar em todos os botões e ver feedback visual, mesmo que as ações não salvem dados reais.

---

## 2.1 Componentes de Layout

Implementar os componentes estruturais da aplicação.

**Referência PRD:** Seção 4.3 (Dimensões), Seção 3.6 (Páginas)

**PageContainer:**
- Container principal que envolve todo o conteúdo
- Background na cor primary do tema
- Padding interno consistente
- Altura fixa respeitando dimensões da janela (400x500)

**Navbar:**
- Navegação fixa na parte inferior da janela
- Três itens: Ações, Histórico, Configurações
- Cada item com ícone (lucide-react) e label
- Item ativo destacado com cor accent (#39FF14)
- Ao clicar, alterna a página exibida
- Log de navegação ao trocar página

---

## 2.2 Componentes Common

Implementar biblioteca de componentes reutilizáveis.

**Referência PRD:** Seção 4.4 (Componentes de UI)

**Button:**
- Três variantes: primary (fundo verde), secondary (borda verde), ghost (transparente)
- Tamanhos: sm, md, lg
- Estados: default, hover, disabled, loading
- Cores conforme paleta do PRD
- Log ao clicar (para debug)

**Input:**
- Input de texto padrão
- Variante Textarea para textos longos
- Estados: default, focus (borda verde), error (borda vermelha)
- Placeholder estilizado

**Card:**
- Container com background card (#242424)
- Border radius 12px e border #333333
- Variantes com e sem padding

**Tag (Chip):**
- Chip colorido para exibir tags
- Cor de fundo customizável
- Opcional: botão X para remover
- Tamanho compacto

**Modal:**
- Overlay escuro semi-transparente
- Container centralizado
- Animação de entrada (fade + scale)
- Botão de fechar
- Previnir scroll do fundo quando aberto
- Log ao abrir/fechar

**Dropdown/Select:**
- Select customizado com estilo dark
- Lista de opções estilizada
- Indicador de opção selecionada

**Toggle/Switch:**
- Switch para on/off
- Estados visuais claros
- Animação de transição

**Pesquisa Context-7:** Consultar documentação do Tailwind para animações e transições.

---

## 2.3 Gerenciamento de Estado (Zustand)

Implementar store global com Zustand ANTES das páginas, para que as páginas possam usar.

**Referência PRD:** Seção 3.10 (Armazenamento)

**Estados a gerenciar:**
- config: configurações do app (usar valores default mockados)
- tags: lista de tags (incluir 3 tags padrão mockadas)
- currentPage: página ativa (actions/history/settings)
- days: lista de dias para o histórico (mockar alguns dias)
- selectedDay: dia selecionado no histórico
- dayData: dados do dia carregado (mockar algumas notas)
- notification: estado da notificação atual (tipo, visível, timer)
- isLoading: estados de loading por operação
- modals: controle de modais abertos (noteEditor, tagEditor, confirmation, etc.)

**Actions/Mutations:**
- setConfig, updateConfig
- setTags, addTag, updateTag, deleteTag
- setCurrentPage
- setDays, loadDayData, clearDayData
- addNote, updateNote, deleteNote
- showNotification, hideNotification
- setLoading
- openModal, closeModal

**Dados Mockados Iniciais:**
- 3 tags: Tarefa (#39FF14), Reunião (#00D4FF), Estudo (#BF40FF)
- Config com valores padrão do PRD
- 3 dias de exemplo com notas mockadas

**Pesquisa Context-7:** Consultar documentação do Zustand para padrões de store e como estruturar actions.

---

## 2.4 Página de Ações Rápidas

Implementar a página inicial do app com as ações principais.

**Referência PRD:** Seção 3.6.1 (Ações Rápidas)

**Layout:**
- Título "EasyDaily" ou "Ações Rápidas" no topo
- Grid ou lista vertical com 4 cards de ação
- Espaçamento consistente

**Cards de Ação (cada um com ícone, título, descrição curta):**

1. **Adicionar Nota**
   - Ícone: Plus ou PenLine
   - Ao clicar: abre modal com editor de nota
   - Log: "Abrindo editor de nota"

2. **Resumo de Hoje**
   - Ícone: FileText ou Sparkles
   - Ao clicar: abre modal de loading → mostra resultado mockado
   - Log: "Gerando resumo de hoje"

3. **Resumo: Ontem + Hoje**
   - Ícone: Calendar
   - Ao clicar: abre modal de loading → mostra resultado mockado
   - Log: "Gerando resumo combinado"

4. **Daily: Ontem + Plano Hoje**
   - Ícone: Target ou ListChecks
   - Ao clicar: abre modal com campo para digitar plano → depois mostra resultado
   - Log: "Iniciando geração de daily"

**Comportamento visual:**
- Cards com hover state (borda ou background muda)
- Feedback visual ao clicar (scale ou opacidade)
- Transição suave

---

## 2.5 Editor de Notas (Componente Complexo)

Implementar o componente de criação/edição de notas. Este é um componente central.

**Referência PRD:** Seção 3.5 (Campo de Entrada de Nota)

**Estrutura do Modal:**
- Título: "Nova Nota" ou "Editar Nota"
- Área de edição (TipTap)
- Seletor de tags abaixo do editor
- Área de anexos
- Botões de ação (Salvar, Cancelar)

**Editor TipTap:**
- Toolbar com botões: negrito, itálico, código, lista
- Área de texto com placeholder "O que você fez?"
- Suporte a Markdown (renderização em tempo real)
- Emojis suportados via teclado do sistema

**Pesquisa Context-7:** Consultar documentação do TipTap para configurar editor básico, extensões de Markdown e toolbar.

**Seletor de Tags:**
- Lista horizontal de tags disponíveis como chips
- Tags clicáveis para selecionar/deselecionar
- Tags selecionadas ficam com borda destacada
- Múltipla seleção permitida

**Área de Anexos:**
- Botão "Anexar arquivo"
- Área visual para drag & drop (visual apenas nesta fase)
- Lista de anexos mockados ou adicionados
- Cada anexo com preview (imagem) ou ícone (outros) + botão remover
- Contador: "X/5 anexos"

**Botões:**
- Salvar (primary) - Por enquanto só fecha o modal e loga
- Cancelar (ghost) - Fecha o modal

**Log ao salvar:** Exibir no console o conteúdo, tags selecionadas e anexos

---

## 2.6 Página de Histórico

Implementar a página de visualização do histórico de notas.

**Referência PRD:** Seção 3.6.2 (Histórico)

**Layout:**
- Título "Histórico"
- Campo de busca no topo (visual apenas, funcionalidade futura)
- Lista de dias em formato accordion/expansível
- Botões de ação no final

**Componente DayCard:**
- Data formatada (ex: "Hoje - 19/02/2026", "Ontem", ou "15/02/2026")
- Indicador de quantidade de notas ou "(sem notas)"
- Ícone de seta para expandir/colapsar (ChevronDown/ChevronUp)
- Ao clicar no header, expande/colapsa
- Log ao expandir: "Expandindo dia {data}"

**Componente NoteItem (dentro de DayCard expandido):**
- Horário da nota (ex: "09:30")
- Preview do conteúdo (primeiras 2 linhas, truncado)
- Tags como chips coloridos pequenos
- Indicador de anexos (ícone + quantidade) se houver
- Botões de ação ao passar mouse: editar (lápis), deletar (lixeira)

**Ações nos Botões:**
- Editar: abre editor com dados da nota (mockados)
- Deletar: abre modal de confirmação → remove da lista visual

**Botões Fixos na Parte Inferior:**
- "Adicionar Nota" - Abre editor (pode ter seletor de data)
- "Gerar Resumo" - Gera resumo do dia expandido/selecionado

**Estados Visuais:**
- Lista vazia: mensagem "Nenhum registro ainda" + ilustração simples
- Carregando: skeleton ou spinner (simular com delay)
- Dia expandido: altura animada
- Dia colapsado: apenas header visível

---

## 2.7 Página de Configurações

Implementar a página de configurações do app.

**Referência PRD:** Seção 3.6.3 (Configurações), Seção 3.7 (Tags)

**Layout:**
- Título "Configurações"
- Seções empilhadas com headers
- Scroll se conteúdo exceder altura

**Seção: Ciclo de Notificações**
- Label "Intervalo entre lembretes"
- Dropdown com opções: 1h, 2h, 3h, 4h, 6h, 8h
- Ao mudar, atualiza store e loga

**Seção: Integração com IA**
- Dropdown "Provider" com opções: OpenAI, GROK
- Campo "API Key OpenAI" com:
  - Input type password
  - Botão toggle para mostrar/ocultar (ícone olho)
- Campo "API Key GROK" com mesma estrutura
- Ao alterar, atualiza store e loga

**Seção: Gerenciar Tags**
- Lista das tags existentes (do store)
- Cada tag com:
  - Chip colorido com o nome
  - Botão editar (lápis) - abre modal de edição
  - Botão deletar (lixeira) - abre confirmação (se não for padrão)
- Botão "Nova Tag" no final - abre modal de criação

**Modal de Tag (criar/editar):**
- Campo nome
- Color picker ou lista de cores predefinidas
- Botões Salvar/Cancelar

**Seção: Som**
- Toggle "Som de notificação"
- Estado visual claro (on/off)

**Seção: Idioma**
- Dropdown: Português (BR), English (US)
- Ao mudar, atualiza store (i18n será integrado na Fase 5)

**Seção: Tutorial**
- Botão "Ver Tutorial Novamente"
- Ao clicar, abre modal de onboarding (preview visual)

---

## 2.8 Componente de Notificação Popup

Implementar o popup de notificação que aparece periodicamente.

**Referência PRD:** Seção 3.3 (Sistema de Notificações)

**Aparência:**
- Posição fixa no canto inferior direito da janela
- Largura ~320px, altura dinâmica
- Background escuro (#1A1A1A) com borda sutil e sombra
- Border radius

**Estrutura:**
- Botão X no canto superior direito
- Ícone ou ilustração pequena
- Título (varia por tipo)
- Mensagem/descrição
- Botões de ação (variam por tipo)
- Barra de progresso do timer na parte inferior

**Tipos de Notificação (criar variante para cada):**

1. **Resumo de ontem + plano hoje**
   - Título: "Bom dia!"
   - Mensagem: "Quer gerar o resumo de ontem e planejar hoje?"
   - Botões: "Gerar Resumo" (primary), "Depois" (ghost)

2. **Fez algo offline?**
   - Título: "Bem-vindo de volta!"
   - Mensagem: "Fez algo enquanto estava offline?"
   - Botões: "Adicionar Nota" (primary), "Pular" (ghost)

3. **O que fez nas últimas horas?**
   - Título: "Hora do check-in!"
   - Mensagem: "O que você fez nas últimas X horas?"
   - Botões: "Adicionar Nota" (primary), "Pular" (ghost)

4. **Alterar tempo do ciclo?**
   - Título: "Ajustar lembretes?"
   - Mensagem: "Notamos que você pulou alguns lembretes. Quer alterar o intervalo?"
   - Botões: "Configurar" (primary), "Manter" (ghost)

**Barra de Progresso:**
- Simula 5 minutos (300 segundos) no modo visual
- Diminui da direita para esquerda
- Cor accent (#39FF14)

**Animações:**
- Entrada: slide da direita + fade in
- Saída: fade out

**Para teste visual:**
- Criar botão temporário (ou comando de teclado) para mostrar cada tipo de notificação
- Log ao exibir e ao interagir

---

## 2.9 Modal de Confirmação

Implementar modal genérico de confirmação para ações destrutivas.

**Uso:** Deletar nota, deletar tag, etc.

**Estrutura:**
- Ícone de alerta (opcional)
- Título (ex: "Deletar nota?")
- Mensagem (ex: "Esta ação não pode ser desfeita.")
- Botões: "Cancelar" (ghost), "Confirmar" (error/vermelho)

---

## 2.10 Modal de Resultado (Resumo IA)

Implementar modal para exibir resultado de geração de resumo.

**Estados:**
1. **Loading:** Spinner + "Gerando resumo..."
2. **Sucesso:** Texto do resumo formatado + botões
3. **Erro:** Mensagem de erro + botão tentar novamente

**Estrutura (sucesso):**
- Título "Resumo Gerado"
- Área de texto com o resumo (mockado por enquanto)
- Renderizar Markdown se possível
- Botões: "Copiar" (secondary), "Fechar" (ghost)

**Mock de resumo:**
```
## Resumo do Dia - 19/02/2026

**Desenvolvimento:**
• Implementou tela de login
• Corrigiu bug no carrinho

**Reuniões:**
• Daily com o time (09:30)
```

---

## 2.11 Preview do Onboarding

Criar estrutura visual do onboarding (funcionalidade completa na Fase 5).

**Referência PRD:** Seção 3.9 (Onboarding)

**Modal com Steps:**
- Indicador de progresso (dots ou barra)
- Área de conteúdo que muda por step
- Botões "Pular", "Próximo", "Começar"

**Steps visuais (conteúdo mockado):**
1. Boas-vindas - Título + descrição
2. API Key - Campo de input
3. Como funciona - Texto explicativo
4. System Tray - Imagem/ícone ilustrativo
5. Pronto - Mensagem de conclusão

---

## 2.12 Configuração de i18n (Estrutura)

Configurar estrutura de internacionalização para uso futuro.

**Referência PRD:** Seção 9 (Internacionalização)

**Setup:**
- Configurar i18next com react-i18next
- Criar arquivos base: pt-BR.json e en-US.json
- Definir idioma padrão como pt-BR

**Estrutura dos arquivos de tradução:**
- nav: labels da navegação
- pages: títulos de páginas
- actions: labels de ações/botões
- notifications: textos de notificações
- settings: labels de configurações
- common: textos comuns (salvar, cancelar, etc.)
- errors: mensagens de erro

Por enquanto, incluir apenas as strings principais. Completar na Fase 5.

**Pesquisa Context-7:** Consultar documentação do i18next para configuração inicial com React.

---

## 2.13 Hooks Customizados (Interfaces)

Criar hooks que encapsulam lógicas, preparando interfaces para integração com backend.

**useNotes:**
- createNote(data) - Por agora, adiciona ao store mockado
- updateNote(id, data) - Atualiza no store
- deleteNote(id) - Remove do store
- getNotesForDay(date) - Retorna do store

**useTags:**
- createTag(name, color)
- updateTag(id, name, color)
- deleteTag(id)
- getTags()

**useConfig:**
- getConfig()
- updateConfig(partial)

**useNotification:**
- show(type)
- hide()
- Lógica de timer (visual por enquanto)

Esses hooks usarão o store Zustand e, na Fase 4, passarão a chamar commands do Tauri.

---

## 2.14 Montagem do App.tsx

Integrar todos os componentes na aplicação principal.

**Estrutura:**
- Providers (Zustand, i18next)
- PageContainer
- Renderização condicional da página ativa baseado em currentPage do store
- Navbar (sempre visível)
- Modais globais (controlados pelo store)
- NotificationPopup (quando notification.visible = true)

**Adicionar para debug:**
- Botões temporários ou atalhos de teclado para:
  - Mostrar cada tipo de notificação
  - Alternar entre páginas
  - Abrir editor de nota

---

## Validação da Fase 2

### Testes Manuais Obrigatórios

| # | Teste | Esperado |
|---|-------|----------|
| 1 | App abre e mostra página de Ações Rápidas | 4 cards visíveis com ícones, cores corretas |
| 2 | Clicar em cada item da navbar | Página correspondente é exibida, item fica destacado |
| 3 | Clicar em "Adicionar Nota" nas Ações Rápidas | Modal com editor abre |
| 4 | Digitar texto no editor e usar formatação | Texto aparece, formatação funciona |
| 5 | Selecionar e deselecionar tags no editor | Tags destacam quando selecionadas |
| 6 | Clicar Salvar no editor | Modal fecha, log aparece no console |
| 7 | Clicar em "Resumo de Hoje" | Modal de loading aparece, depois mostra resumo mockado |
| 8 | Navegar para Histórico | Lista de dias mockados aparece |
| 9 | Expandir um dia no histórico | Notas do dia aparecem com animação |
| 10 | Clicar em editar nota no histórico | Editor abre com dados da nota |
| 11 | Clicar em deletar nota | Modal de confirmação aparece |
| 12 | Navegar para Configurações | Todas as seções visíveis e estilizadas |
| 13 | Alterar valor no dropdown de intervalo | Valor atualiza visualmente |
| 14 | Criar nova tag | Modal abre, tag aparece na lista após salvar |
| 15 | Editar tag existente | Modal abre com dados, alterações refletem |
| 16 | Toggle de som | Estado visual muda |
| 17 | Exibir notificação popup (via debug) | Popup aparece no canto, timer funciona |
| 18 | Fechar notificação pelo X | Popup desaparece com animação |
| 19 | Verificar cores em toda a UI | Verde neon #39FF14, fundo escuro, conforme PRD |
| 20 | Verificar logs no console | Ações principais estão sendo logadas |

**Critério de aprovação:** Todos os 20 itens OK para avançar para Fase 3.

---

# FASE 3: Backend Core

## Objetivo
Implementar toda a lógica de backend em Rust: armazenamento de dados, system tray, scheduler de notificações, detecção de inatividade e commands para comunicação com frontend.

**Nota:** Mesmo sendo backend, continuamos testando através do frontend criado na Fase 2.

---

## 3.1 Implementação dos Models Rust

Criar structs Rust equivalentes aos tipos TypeScript definidos na Fase 1.

**Referência PRD:** Seção 3.10.2, 3.10.3, 3.10.4 (Formatos JSON)

**Models a implementar:**
- Note com todos os campos e derivação de Serialize/Deserialize
- Attachment
- DayData contendo vetor de Notes e vetor de Summaries
- Summary
- Tag
- Config (com valores default)

Todos os models devem implementar Clone, Debug e os traits de serialização do serde.

**Pesquisa Context-7:** Consultar documentação do serde para padrões de serialização e atributos como rename, default, skip_serializing_if.

---

## 3.2 Serviço de Storage

Implementar o serviço responsável por toda manipulação de arquivos JSON e anexos.

**Referência PRD:** Seção 3.10.1 (Estrutura de Diretórios)

**Funcionalidades a implementar:**

**Gerenciamento de Diretórios:**
- Função para obter o diretório base do app em %APPDATA%/EasyDaily/
- Função para garantir que toda a estrutura de pastas existe (data/, attachments/, logs/)
- Criar estrutura automaticamente na primeira execução
- Log ao criar diretórios

**CRUD de Dados Diários:**
- Ler arquivo JSON de um dia específico (formato: YYYY-MM-DD.json)
- Salvar/atualizar arquivo JSON de um dia
- Listar todos os arquivos de dias existentes (para o histórico)
- Retornar estrutura vazia se arquivo do dia não existir
- Log de cada operação de leitura/escrita

**CRUD de Configurações:**
- Ler config.json
- Salvar config.json
- Criar config padrão se não existir (valores do PRD)

**CRUD de Tags:**
- Ler tags.json
- Salvar tags.json
- Criar tags padrão (Tarefa, Reunião, Estudo) se não existir

**Gerenciamento de Anexos:**
- Salvar arquivo de anexo na pasta correta (attachments/YYYY-MM-DD/)
- Deletar anexo
- Gerar nome único para anexo usando UUID
- Retornar caminho do arquivo salvo

**Pesquisa Context-7:** Consultar documentação da crate `dirs` para obter diretório AppData no Windows. Consultar `std::fs` para operações de arquivo.

---

## 3.3 Serviço de System Tray

Implementar o gerenciamento completo do ícone na bandeja do sistema.

**Referência PRD:** Seção 3.1 (System Tray)

**Menu do Tray a implementar:**
- Item: Adicionar Nota
- Item: Abrir EasyDaily
- Item: Gerar Resumo de Hoje
- Item: Configurar Timer
- Item: Tutorial
- Separador
- Item: Sair

**Comportamentos:**
- Clique simples no ícone deve abrir a janela principal
- Ao clicar em "Sair", encerrar completamente o aplicativo
- Cada item de menu emite evento para o frontend tratar
- Log de cada ação do tray

**Gerenciamento de Janela:**
- Ao fechar a janela (X), apenas ocultar ao invés de fechar o app
- O app deve continuar rodando na tray
- Implementar função para mostrar janela e função para ocultar
- Log ao mostrar/ocultar janela

**Pesquisa Context-7:** Consultar documentação do Tauri v2 sobre TrayIcon, TrayIconBuilder, menu de tray e eventos de tray.

---

## 3.4 Serviço de Scheduler (Cron)

Implementar o sistema de agendamento de notificações periódicas.

**Referência PRD:** Seção 3.4 (Ciclo de Notificações)

**Funcionalidades:**

**Controle do Timer:**
- Iniciar scheduler com intervalo configurado (em horas)
- Parar scheduler
- Atualizar intervalo em tempo real sem reiniciar app
- Manter estado do scheduler (ativo/pausado)

**Emissão de Eventos:**
- Emitir evento para frontend quando ciclo completar
- Incluir no evento o tipo de notificação a exibir
- Log de cada ciclo completado

**Lógica de Skips:**
- Manter contador de skips consecutivos (sem nenhuma nota adicionada)
- Quando contador chegar a 2, emitir evento especial sugerindo alterar config
- Resetar contador quando uma nota for adicionada

**Estado Persistente:**
- Salvar timestamp da última notificação no config
- Ao reiniciar app, calcular tempo restante para próximo ciclo

**Pesquisa Context-7:** Consultar documentação do tokio para implementar timers async e intervalos. Consultar Tauri sobre emissão de eventos do backend para frontend.

---

## 3.5 Serviço de Detecção de Inatividade

Implementar detector de inatividade do usuário usando Windows API.

**Referência PRD:** Seção 8 (Detecção de Inatividade)

**Funcionalidades:**
- Função que retorna quantos segundos o usuário está inativo
- Usa GetLastInputInfo da Windows API
- Compara com GetTickCount para calcular tempo idle

**Integração:**
- Polling a cada 30 segundos para verificar estado
- Threshold de 60 segundos para considerar usuário inativo
- Emitir evento quando usuário retorna de estado idle
- Log ao detectar mudança de estado (ativo → inativo, inativo → ativo)

**Pesquisa Context-7:** Consultar documentação da crate `winapi` para uso de GetLastInputInfo e estrutura LASTINPUTINFO.

---

## 3.6 Detecção de Fullscreen

Implementar verificação se há aplicação em fullscreen ativa.

**Referência PRD:** Seção 3.3.3 (Contextos de Fullscreen)

**Funcionalidade:**
- Função que retorna true se há janela fullscreen ativa (jogo, apresentação)
- Usar Windows API para verificar estado de janelas

**Integração com Scheduler:**
- Antes de emitir notificação, verificar se há fullscreen
- Se sim, aguardar e verificar periodicamente até sair do fullscreen
- Então emitir a notificação
- Log ao detectar fullscreen

**Pesquisa Context-7:** Consultar documentação do winapi sobre detecção de janelas fullscreen (EnumWindows, GetWindowRect, GetSystemMetrics).

---

## 3.7 Implementação dos Commands

Implementar todos os commands Tauri para comunicação IPC com frontend.

**Referência PRD:** Seção 2.2 (Arquitetura)

**Commands de Notas:**
- create_note: Recebe data, conteúdo, tags e lista de attachment IDs. Salva no JSON do dia. Retorna nota criada.
- update_note: Recebe data, note_id e novos dados. Atualiza no JSON. Retorna nota atualizada.
- delete_note: Recebe data e note_id. Remove do JSON e deleta anexos associados. Retorna sucesso.
- get_day_data: Recebe data. Retorna DayData do dia (ou vazio se não existir).
- list_days: Retorna lista de todas as datas que possuem dados, ordenadas decrescente.

**Commands de Config:**
- get_config: Retorna configurações atuais.
- update_config: Recebe Config parcial ou completo. Salva. Atualiza scheduler se intervalo mudou.

**Commands de Tags:**
- get_tags: Retorna todas as tags.
- create_tag: Recebe nome e cor. Cria nova tag com ID gerado. Retorna tag criada.
- update_tag: Recebe id, nome e cor. Atualiza tag. Retorna tag atualizada.
- delete_tag: Recebe id. Remove tag do arquivo.

**Commands de Sistema:**
- show_window: Torna janela principal visível e foca.
- hide_window: Oculta janela principal.
- get_idle_seconds: Retorna tempo de inatividade atual em segundos.
- play_notification_sound: Toca o som de notificação.
- is_fullscreen_app_active: Retorna booleano se há app fullscreen.

**Commands de Anexos:**
- save_attachment: Recebe data da nota, dados binários (base64) e nome original. Salva arquivo. Retorna Attachment com path.
- delete_attachment: Recebe data e filename. Deleta arquivo.
- get_attachment_path: Recebe data e filename. Retorna caminho completo.

**Todos os commands devem:**
- Ter log de entrada (parâmetros) e saída (resultado ou erro)
- Tratar erros e retornar mensagens claras

**Pesquisa Context-7:** Consultar documentação do Tauri v2 sobre definição de commands, atributo #[tauri::command], e como passar dados complexos entre frontend e backend.

---

## 3.8 Setup do main.rs

Configurar o ponto de entrada do aplicativo Rust.

**Funcionalidades a implementar no setup:**
- Inicializar logger (env_logger)
- Inicializar serviço de storage (criar pastas se necessário)
- Carregar configurações
- Configurar system tray com menu
- Registrar handlers de eventos do tray
- Iniciar scheduler com intervalo das configurações
- Iniciar detector de inatividade
- Registrar todos os commands
- Log de inicialização completa

**Eventos a emitir para frontend:**
- notification:show (com tipo)
- notification:idle-pause
- notification:idle-resume
- tray:action (com qual ação)
- startup:ready

**Pesquisa Context-7:** Consultar documentação do Tauri v2 sobre Builder, setup hook, e registro de commands.

---

## 3.9 Fluxo de Inicialização

Implementar a sequência de startup no backend.

**Referência PRD:** Seção 3.2 (Fluxo de Inicialização)

**Sequência:**
1. App inicia, setup completo
2. Emitir evento "startup:summary-prompt" após 2 segundos
3. Aguardar 1 minuto (ou até evento de interação)
4. Emitir evento "startup:offline-prompt"
5. Iniciar scheduler de ciclos normais

**Estados a considerar:**
- Se é primeira execução do dia (comparar com lastSessionDate)
- Se usuário interagiu com as notificações de startup

---

## 3.10 Registro no Windows Startup

Implementar registro automático para iniciar com Windows.

**Localização:** HKCU\Software\Microsoft\Windows\CurrentVersion\Run

**Funcionalidades:**
- Função para adicionar ao startup
- Função para remover do startup
- Verificar se já está registrado
- Log de cada operação

**Pesquisa Context-7:** Consultar documentação do winapi ou crate específica para manipulação de registro do Windows.

---

## Validação da Fase 3

### Testes Manuais Obrigatórios

| # | Teste | Esperado |
|---|-------|----------|
| 1 | Executar app e verificar pasta %APPDATA%/EasyDaily/ | Estrutura de pastas criada (data/, attachments/, logs/) |
| 2 | Verificar se config.json foi criado | Arquivo existe com configurações padrão |
| 3 | Verificar se tags.json foi criado | Arquivo existe com 3 tags padrão |
| 4 | Ícone aparece na bandeja do sistema | Ícone visível na tray |
| 5 | Clicar com botão direito no ícone da tray | Menu aparece com todas as opções |
| 6 | Clicar em "Abrir EasyDaily" no menu | Janela abre e foca |
| 7 | Clicar em "Sair" no menu da tray | App fecha completamente |
| 8 | Fechar janela pelo X | Janela oculta mas app continua na tray |
| 9 | Executar comando get_config via frontend | Retorna configurações do arquivo |
| 10 | Executar comando create_note via frontend | Nota salva, arquivo JSON criado/atualizado |
| 11 | Verificar arquivo JSON do dia após criar nota | Nota presente com todos os campos |
| 12 | Executar comando list_days | Retorna dia com nota criada |
| 13 | Executar comando delete_note | Nota removida do JSON |
| 14 | Deixar mouse/teclado parado por 1+ minuto | get_idle_seconds retorna > 60 |
| 15 | Verificar logs no console/arquivo | Operações estão sendo logadas |

**Critério de aprovação:** Todos os 15 itens OK para avançar para Fase 4.

---

# FASE 4: Integração

## Objetivo
Conectar o frontend (Fase 2) com o backend (Fase 3). Substituir dados mockados por dados reais. Implementar todos os fluxos completos.

**Princípio Frontend-First continua:** Para cada funcionalidade, verificar que o frontend já tem o elemento visual, então conectar com o backend.

---

## 4.1 Integração de Configurações

Conectar página de Settings com backend.

**Remover mocks e usar commands:**
- Ao iniciar app, chamar get_config
- Popular store com dados reais
- Aplicar idioma carregado

**Fluxo de Salvamento:**
- Ao alterar qualquer config no frontend, chamar update_config imediatamente
- Atualizar store local
- Para intervalo: backend atualiza scheduler automaticamente
- Para idioma: aplicar mudança em tempo real no frontend

**Pesquisa Context-7:** Consultar documentação do Tauri sobre invoke para chamar commands e como passar objetos complexos.

---

## 4.2 Integração de Tags

Conectar gerenciamento de tags com backend.

**Substituir mocks:**
- Ao iniciar, chamar get_tags
- Popular store com tags reais

**Criar Tag:**
- Modal coleta nome e cor
- Chamar create_tag
- Atualizar store com tag retornada

**Editar Tag:**
- Modal com dados atuais
- Chamar update_tag
- Atualizar store

**Deletar Tag:**
- Confirmação
- Chamar delete_tag
- Remover do store

**Validações frontend:**
- Nome não pode ser vazio
- Cor deve ser hexadecimal válido

---

## 4.3 Integração de Notas

Conectar editor e histórico com backend.

**Criar Nota:**
- No editor, ao clicar Salvar:
  - Coletar conteúdo, tags selecionadas
  - Para cada anexo novo: chamar save_attachment, coletar ID retornado
  - Chamar create_note com todos os dados
  - Fechar modal
  - Atualizar lista de dias se necessário
  - Log completo da operação

**Editar Nota:**
- Abrir editor com dados da nota
- Permitir alterar conteúdo, tags
- Gerenciar anexos (novos, removidos)
- Chamar update_note
- Atualizar histórico

**Deletar Nota:**
- Confirmação
- Chamar delete_note (backend deleta anexos também)
- Atualizar histórico

**Adicionar Nota em Dia Específico:**
- Seletor de data no editor
- Usar data selecionada no create_note

---

## 4.4 Integração do Histórico

Conectar lista de dias com backend.

**Carregamento Inicial:**
- Chamar list_days
- Renderizar lista de DayCards com datas reais

**Lazy Loading:**
- Dia começa colapsado
- Ao expandir, chamar get_day_data para aquela data
- Popular com notas recebidas
- Manter em cache enquanto expandido

**Dias sem Dados:**
- list_days retorna apenas dias com dados
- Opcionalmente: gerar dias "vazios" para últimos 7 dias

**Atualização:**
- Após criar/editar/deletar nota, atualizar lista

---

## 4.5 Sistema de Notificações Funcional

Conectar popup de notificação com eventos do backend.

**Ouvir Eventos:**
- notification:show - exibir popup do tipo especificado
- notification:idle-pause - pausar timer
- notification:idle-resume - retomar timer
- tray:action - tratar ação do menu tray

**Pesquisa Context-7:** Consultar documentação do Tauri sobre listen/emit para eventos entre backend e frontend.

**Exibir Notificação:**
- Verificar se não há outra ativa
- Montar conteúdo baseado no tipo
- Mostrar popup
- Iniciar timer de 5 minutos
- Tocar som se habilitado (chamar play_notification_sound)

**Timer com Pausa:**
- Receber eventos de idle-pause e idle-resume
- Pausar/retomar contagem
- Barra de progresso reflete corretamente

**Ações:**
- Adicionar Nota: abre editor, esconde notificação
- Skip/Pular: esconde notificação, pode emitir evento para backend contar skip
- Fechar (X): mesmo que skip
- Timeout: mesmo que skip

---

## 4.6 Fluxo de Inicialização Integrado

Conectar sequência de startup.

**Frontend escuta:**
- startup:summary-prompt → mostra notificação tipo 1
- startup:offline-prompt → mostra notificação tipo 2

**Usuário interage:**
- Gerar Resumo → (será feito na Fase 5)
- Adicionar Nota → abre editor
- Pular → fecha notificação

---

## 4.7 Lógica de Skips Consecutivos

Integrar contagem de skips.

**Frontend:**
- Ao pular notificação, emitir evento para backend
- Backend incrementa contador

**Backend:**
- Ao atingir 2 skips, emite notification:show com tipo "suggest-config"
- Reseta contador quando recebe evento de nota criada

**Frontend:**
- Tipo "suggest-config" → mostra notificação perguntando sobre alterar intervalo
- Botão "Configurar" → navega para Settings

---

## 4.8 Verificação de Fullscreen

Integrar checagem de fullscreen.

**Backend (já implementado):**
- Verifica antes de emitir notificação

**Frontend:**
- Não precisa fazer nada especial
- Notificação simplesmente não aparece se houver fullscreen

---

## 4.9 Gerenciamento de Anexos Funcional

Integrar fluxo completo de anexos.

**Upload no Editor:**
- Usuário seleciona arquivo ou arrasta
- Validar tipo e tamanho no frontend
- Converter para base64
- Guardar em lista temporária

**Ao Salvar Nota:**
- Para cada anexo na lista temporária:
  - Chamar save_attachment
  - Receber Attachment com id e path
- Incluir lista de attachments na nota

**Colar Imagem (Ctrl+V):**
- Detectar paste event
- Se imagem no clipboard, converter para base64
- Adicionar à lista de anexos

**Visualização:**
- Para anexos de imagem, usar path retornado para exibir
- Pode ser necessário usar convertFileSrc do Tauri

**Pesquisa Context-7:** Consultar documentação do Tauri sobre acesso a arquivos locais e convertFileSrc.

---

## 4.10 Som de Notificação

Integrar reprodução de som.

**Adicionar arquivo:**
- Baixar som de Pixabay ou Mixkit
- Colocar em src-tauri/sounds/notification.mp3

**Integração:**
- Backend: command play_notification_sound usa áudio player do sistema ou emite evento
- Frontend: se preferir, tocar via Audio API do browser

**Configuração:**
- Verificar config.sound.enabled antes de tocar

---

## Validação da Fase 4

### Testes Manuais Obrigatórios

| # | Teste | Esperado |
|---|-------|----------|
| 1 | Alterar intervalo do ciclo nas configurações | Valor salvo, persiste após reiniciar |
| 2 | Adicionar API Key OpenAI | Key salva em config.json (verificar se não está em plaintext crítico) |
| 3 | Criar nova tag | Tag aparece na UI e em tags.json |
| 4 | Editar tag | Alterações refletem na UI e arquivo |
| 5 | Deletar tag | Tag removida da UI e arquivo |
| 6 | Criar nota com texto | Nota salva, aparece no histórico, arquivo JSON criado |
| 7 | Criar nota com anexo de imagem | Imagem salva em attachments/, referência na nota |
| 8 | Criar nota com múltiplas tags | Tags salvas corretamente |
| 9 | Editar nota existente | Alterações persistem |
| 10 | Deletar nota | Removida do histórico e do JSON |
| 11 | Expandir dia no histórico | Notas carregam do backend |
| 12 | Adicionar nota em dia passado | Nota salva na data correta |
| 13 | Aguardar ciclo do scheduler (testar com 1 min) | Notificação aparece |
| 14 | Verificar pausa do timer em idle | Timer pausa quando inativo |
| 15 | Clicar "Adicionar Nota" na notificação | Editor abre, notificação fecha |
| 16 | Clicar "Pular" na notificação | Notificação fecha |
| 17 | Verificar som ao aparecer notificação | Som toca se habilitado |
| 18 | Desabilitar som e testar | Som não toca |
| 19 | Pular 2 notificações seguidas | Sugestão de alterar config aparece |
| 20 | Verificar sequência de startup | Notificações aparecem na ordem |

**Critério de aprovação:** Todos os 20 itens OK para avançar para Fase 5.

---

# FASE 5: IA, Onboarding e Distribuição

## Objetivo
Implementar integração com APIs de IA para geração de resumos, finalizar tutorial de onboarding, completar internacionalização e preparar aplicativo para distribuição.

---

## 5.1 Serviço de IA no Backend

Implementar integração com APIs de IA.

**Referência PRD:** Seção 3.8 (Integração com IA)

**Command generate_summary:**
- Recebe: notas (array), tipo de resumo, provider atual do config
- Obtém api_key do config baseado no provider
- Monta prompt baseado no tipo
- Faz requisição HTTP
- Retorna texto do resumo ou erro

**Suporte a OpenAI:**
- Endpoint: https://api.openai.com/v1/chat/completions
- Model: gpt-4 ou gpt-4-vision-preview (quando há imagens)
- Headers: Authorization Bearer + Content-Type
- Body: messages com system prompt + user content

**Suporte a GROK (XAI):**
- Pesquisar endpoint atual da API GROK
- Implementar de forma similar
- Adaptar formato de request/response

**Pesquisa Context-7:** Consultar documentação da API OpenAI para formato correto de requisição, especialmente para Vision API com imagens base64. Buscar documentação da API GROK.

**Envio de Imagens:**
- Para notas com anexos de imagem:
  - Ler arquivo do disco
  - Codificar em base64
  - Incluir no content como tipo image_url
- Respeitar limites de tamanho da API
- Log do tamanho do payload

**Tratamento de Erros:**
- Timeout: 30 segundos
- Offline: retornar erro específico "NO_CONNECTION"
- API Key inválida: retornar "INVALID_API_KEY"
- Rate limit: retornar "RATE_LIMITED"
- Erro genérico: logar detalhes, retornar mensagem amigável

---

## 5.2 Prompts de IA

Implementar templates de prompts.

**Referência PRD:** Seção 3.8.5 (Prompts Base)

**Resumo do Dia (tipo: "daily_summary"):**
- System: "Você é um assistente que cria resumos concisos de atividades de trabalho em português."
- User: Instruir a analisar notas e gerar bullet points categorizados por tipo de atividade

**Resumo Combinado (tipo: "combined_summary"):**
- Inclui notas de dois dias
- Separar claramente o que foi feito em cada dia

**Daily Standup (tipo: "standup"):**
- Formato específico:
  - **O que fiz ontem:** (baseado nas notas)
  - **O que vou fazer hoje:** (baseado no input do usuário)
  - **Bloqueios:** (identificar menções ou "Nenhum")

**Personalização:**
- Incluir data no prompt para contexto
- Se houver imagens, instruir a IA a descrevê-las brevemente

---

## 5.3 Interface de Resumo no Frontend

Conectar ações de resumo com backend.

**Ação "Resumo de Hoje":**
1. Coletar notas de hoje via get_day_data
2. Abrir modal com loading
3. Chamar generate_summary com tipo "daily_summary"
4. Exibir resultado ou erro

**Ação "Resumo: Ontem + Hoje":**
1. Coletar notas de ontem e hoje
2. Chamar generate_summary com tipo "combined_summary"
3. Exibir resultado

**Ação "Daily: Ontem + Plano":**
1. Abrir modal com campo para digitar plano de hoje
2. Usuário digita e confirma
3. Coletar notas de ontem
4. Chamar generate_summary com tipo "standup" + plano do usuário
5. Exibir resultado

**Modal de Resultado:**
- Loading: spinner + "Gerando resumo..."
- Sucesso: resumo formatado (renderizar Markdown)
- Erro: mensagem apropriada
- Botões: "Copiar" (usa clipboard API), "Fechar"

**Gerar Resumo do Histórico:**
- No histórico, botão gera resumo do dia selecionado

---

## 5.4 Onboarding Completo

Finalizar fluxo de primeira execução.

**Referência PRD:** Seção 3.9 (Onboarding)

**Verificação no Startup:**
- Carregar config
- Se onboardingCompleted === false, exibir tour

**Steps Funcionais:**

1. **Boas-vindas**
   - Título e descrição
   - Botão "Próximo"

2. **Configurar API Key**
   - Explicação sobre necessidade
   - Campo para inserir key (OpenAI ou GROK)
   - Dropdown para escolher provider
   - Botão "Pular" ou "Próximo"
   - Se preenchido, salvar no config

3. **Como funciona**
   - Explicação sobre ciclo de notificações
   - Pode ter ilustração simples

4. **System Tray**
   - Explicação de onde encontrar o app
   - Mostrar que fica na bandeja

5. **Pronto!**
   - Mensagem de conclusão
   - Botão "Começar"

**Ao Finalizar:**
- Chamar update_config com onboardingCompleted: true
- Fechar modal

**Botão "Ver Tutorial":**
- Reabre o onboarding
- Permite reconfigurar

---

## 5.5 Finalização de i18n

Completar todas as traduções.

**Referência PRD:** Seção 9

**Revisar cobertura:**
- Verificar todas as strings hardcoded
- Substituir por t('key')
- Adicionar em ambos os arquivos de tradução

**Strings a traduzir:**
- Navegação
- Títulos de páginas
- Labels de formulários
- Todos os botões
- Mensagens de notificação (todos os tipos)
- Mensagens de erro
- Textos do onboarding
- Placeholders

**Testar:**
- Trocar idioma nas configurações
- Verificar que toda UI atualiza
- Verificar que não há strings faltando

---

## 5.6 Ícones do Aplicativo

Criar ou obter ícones necessários.

**Arquivos necessários:**
- icon.ico (Windows, múltiplos tamanhos: 16, 32, 48, 256)
- icon.png (Tray, 32x32 ou 64x64)

**Design sugerido:**
- Relacionado a "daily" ou "notas"
- Minimalista
- Funciona em fundo claro e escuro
- Verde neon como cor de destaque

**Colocar em:** src-tauri/icons/

**Pesquisa Context-7:** Consultar documentação do Tauri sobre requisitos de ícones e formatos aceitos.

---

## 5.7 Som de Notificação Final

Garantir que som está configurado corretamente.

**Verificar:**
- Arquivo existe em src-tauri/sounds/notification.mp3
- Duração curta (< 1 segundo)
- Volume adequado

**Testar:**
- Som toca quando notificação aparece
- Configuração de som on/off funciona

---

## 5.8 Build de Produção

Preparar build final do aplicativo.

**Verificações pré-build:**
- Remover console.logs de debug (ou usar flag de produção)
- Verificar que logger está configurado para produção
- Verificar versão no tauri.conf.json
- Verificar que não há credenciais hardcoded
- Alterar janela para iniciar oculta (visible: false)

**Executar build:**
- Comando: npm run tauri build

**Output esperado:**
- Instalador NSIS em: src-tauri/target/release/bundle/nsis/
- Nome: EasyDaily_1.0.0_x64-setup.exe

**Testes pós-build:**
- Instalar em máquina limpa (ou VM)
- Verificar que app inicia
- Verificar tray funciona
- Verificar startup com Windows
- Testar todas as funcionalidades principais

---

## 5.9 Documentação para SmartScreen

Preparar instruções para usuários sobre o warning do Windows.

**Referência PRD:** Seção 7.3

**Criar instruções (pode ser no README ou página de download):**
- Explicar que o warning é normal para apps novos/não assinados
- Passo a passo para instalar:
  1. Clicar em "Mais informações"
  2. Clicar em "Executar assim mesmo"

**Submissão para Microsoft:**
- Acessar Microsoft Security Intelligence Portal
- Submeter o instalador
- Documentar processo para futuras versões

**VirusTotal:**
- Fazer upload do instalador
- Verificar se há falsos positivos
- Se houver, investigar causa

---

## 5.10 README do Projeto

Criar documentação básica.

**Conteúdo:**
- Nome: EasyDaily
- Descrição: O que o app faz
- Screenshots (capturar das telas principais)
- Requisitos do sistema (Windows 10+)
- Como instalar (incluindo nota sobre SmartScreen)
- Como usar (breve visão geral)
- Desenvolvimento local:
  - Pré-requisitos
  - Comandos para rodar
- Tecnologias utilizadas
- Licença

---

## 5.11 Auto-Updater (Opcional)

Se houver tempo, implementar atualização automática.

**Referência PRD:** Seção 7.2

**Setup:**
- Adicionar plugin updater do Tauri
- Gerar par de chaves para assinatura
- Configurar endpoint de updates (GitHub Releases ou servidor)

**Fluxo:**
- Ao iniciar, verificar se há atualização disponível
- Se sim, notificar usuário discretamente
- Usuário decide quando instalar

**Pesquisa Context-7:** Consultar documentação do Tauri v2 sobre plugin de updater e configuração.

---

## Validação da Fase 5

### Testes Manuais Obrigatórios

| # | Teste | Esperado |
|---|-------|----------|
| 1 | Gerar "Resumo de Hoje" (com notas existentes) | Resumo gerado pela IA, formatado |
| 2 | Gerar resumo com imagem anexada | Imagem enviada para Vision API, considerada no resumo |
| 3 | Gerar "Resumo: Ontem + Hoje" | Ambos os dias no resumo |
| 4 | Gerar "Daily: Ontem + Plano" | Formato de daily standup correto |
| 5 | Copiar resumo para clipboard | Texto copiado |
| 6 | Testar com API Key inválida | Mensagem de erro "Chave inválida" |
| 7 | Testar sem internet | Mensagem de erro de conexão |
| 8 | Primeira execução (limpar config) | Tour de onboarding aparece |
| 9 | Completar onboarding | Tour finaliza, não aparece novamente |
| 10 | Clicar "Ver Tutorial" nas configurações | Tour reabre |
| 11 | Trocar idioma para inglês | Toda UI em inglês |
| 12 | Trocar idioma para português | Toda UI em português |
| 13 | Verificar ícone na tray | Correto e visível |
| 14 | Verificar ícone da janela | Correto |
| 15 | Build de produção | Completa sem erros |
| 16 | Instalar via instalador | Funciona |
| 17 | App inicia após instalação | OK |
| 18 | Startup com Windows funciona | App inicia com sistema |
| 19 | Usar app por 10 minutos | Funcionalidades OK |
| 20 | Tamanho do instalador | < 20MB |

**Critério de aprovação:** Todos os 20 itens OK. MVP está completo.

---

# Checklist Final do MVP

Antes de considerar o projeto finalizado:

## Funcionalidades
- [ ] App inicia com Windows automaticamente
- [ ] System tray funciona com menu completo
- [ ] Notificações aparecem no tempo configurado
- [ ] Timer pausa quando usuário está inativo
- [ ] Notas são criadas, editadas e deletadas
- [ ] Anexos funcionam
- [ ] Tags funcionam (CRUD completo)
- [ ] Histórico mostra todos os dias
- [ ] Geração de resumo via IA funciona (OpenAI e GROK)
- [ ] Onboarding aparece para novos usuários
- [ ] Configurações persistem
- [ ] Troca de idioma funciona

## Performance
- [ ] RAM em idle < 50MB
- [ ] Startup < 2 segundos
- [ ] Instalador < 20MB

## Qualidade
- [ ] Nenhum erro no console em uso normal
- [ ] Todas as strings traduzidas
- [ ] Visual consistente com PRD
- [ ] Logs funcionando para debug

## Distribuição
- [ ] Build funciona
- [ ] Instalador funciona
- [ ] Testado em Windows 10
- [ ] Testado em Windows 11
- [ ] README criado

---

**Documento criado em:** 2026-02-19
**Última atualização:** 2026-02-19
**PRD de referência:** `/home/lucas/easydaily/PRD.md`
