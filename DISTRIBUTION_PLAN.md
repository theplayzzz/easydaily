# EasyDaily — Plano de Distribuição e Instalação

## Contexto

O projeto já possui a configuração base para gerar um instalador NSIS via Tauri v2 (`tauri.conf.json` com `targets: ["nsis"]`, `installMode: "currentUser"`). Os ícones já existem em `src-tauri/icons/`. O comando `npm run tauri build` é o ponto de partida.

Este documento orienta a implementação em fases incrementais.

---

## Fase 1 — Autostart (Iniciar com o Windows) ✅ CONCLUÍDA

Implementação completa do autostart condicional baseado em config.

### Como Foi Implementado

- **Model**: Campo `autostart: bool` no `Config` (Rust e TypeScript), com `#[serde(default = "default_true")]` para compatibilidade com configs existentes
- **Backend**: Lógica de register/unregister tratada dentro de `update_config` em `commands/config.rs` (abordagem simplificada, sem comando novo)
- **Startup**: `lib.rs` condiciona `register_autostart()` / `unregister_autostart()` ao valor de `config.autostart`
- **Frontend**: Toggle no `SettingsPage` entre os cards de Som e Idioma
- **i18n**: Traduções em pt-BR e en-US

### Arquivos Modificados

| Arquivo | Mudança |
|---|---|
| `src-tauri/src/models/mod.rs` | Campo `autostart` + `default_true()` + Default impl |
| `src-tauri/src/commands/config.rs` | Register/unregister no `update_config` quando `autostart` muda |
| `src-tauri/src/lib.rs` | Condicional baseado em `config.autostart` no setup |
| `src/types/index.ts` | `autostart: boolean` na interface Config |
| `src/pages/SettingsPage.tsx` | Card com Toggle para autostart |
| `src/locales/pt-BR.json` | `settings.autostart`, `settings.autostartDesc` |
| `src/locales/en-US.json` | `settings.autostart`, `settings.autostartDesc` |

---

## Fase 2 — Gerar o Primeiro Instalador (NSIS) ✅ CONCLUÍDA

Build executado com sucesso via `npm run tauri build`.

### Resultado do Build

- **Instalador gerado**: `src-tauri/target/release/bundle/nsis/EasyDaily_1.0.0_x64-setup.exe` (~2.8MB)
- **Executável**: `src-tauri/target/release/EasyDaily.exe`
- **Versão**: 1.0.0 (sincronizada em `package.json`, `tauri.conf.json`, `Cargo.toml`)
- **Warnings do build**: 2 warnings de métodos Rust não utilizados (benignos), 1 warning de chunk size do Vite (748KB > 500KB)

### Configuração NSIS Utilizada

- `installMode: "currentUser"` → instala em `%LOCALAPPDATA%` sem admin
- Identifier: `com.easydaily.app`
- Ícones configurados em `src-tauri/icons/`

### Testes Realizados

- Instalador executa sem erros (SmartScreen bloqueia — esperado sem code signing)
- App abre e fica na bandeja do sistema
- Autostart funciona após reboot
- Dados criados em `%APPDATA%/EasyDaily/`
- Desinstalador remove exe e atalhos; dados em `%APPDATA%` persistem

### Observações

- Sem code signing, o SmartScreen bloqueia na primeira execução (usuário clica "Mais informações" → "Executar assim mesmo"). Aceitável para distribuição inicial.
- Recomendação de distribuição: **GitHub Releases** — prepara o terreno para o auto-updater da Fase 3.

---

## Fase 3 — Auto-Update com Tauri Updater

### Visão Geral

O `tauri-plugin-updater` permite que o app verifique, baixe e instale atualizações automaticamente. O fluxo:

1. App inicia → consulta um endpoint HTTP que retorna JSON com a versão mais recente
2. Compara com a versão local (`tauri.conf.json` version)
3. Se há versão nova → baixa o pacote de update (`.nsis.zip` assinado)
4. Verifica assinatura (Ed25519 — chave gerada pelo Tauri, não é certificado pago)
5. Instala e reinicia o app

### Dependências a Adicionar

**Rust (`Cargo.toml`):**
```
tauri-plugin-updater = "2"
```

**Frontend (`package.json`):**
```
@tauri-apps/plugin-updater
```

**Tauri config (`tauri.conf.json`):**
Adicionar seção `plugins.updater` com:
- `pubkey`: chave pública Ed25519 (gerada pelo `tauri signer generate`)
- `endpoints`: lista de URLs para consultar. Para GitHub Releases, o formato é:
  `https://github.com/OWNER/REPO/releases/latest/download/latest.json`

### Geração das Chaves de Assinatura

Rodar uma vez:
```
npx tauri signer generate -w ~/.tauri/easydaily.key
```

Isso gera:
- `~/.tauri/easydaily.key` — chave privada (NUNCA commitar, guardar como secret no GitHub)
- Output no terminal — chave pública (essa vai no `tauri.conf.json`)

Variáveis de ambiente para o build:
- `TAURI_SIGNING_PRIVATE_KEY` — conteúdo da chave privada
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — senha da chave (se definida)

### Endpoint de Update — GitHub Releases

O Tauri v2 tem suporte nativo para GitHub Releases. Quando o build roda com as chaves de assinatura, ele gera automaticamente um arquivo `latest.json` que contém:
- Versão
- URL do download do `.nsis.zip`
- Assinatura do pacote
- Data de publicação
- Notas de release

Esse `latest.json` é anexado ao Release como asset.

### Implementação no Frontend

Criar um hook `useUpdater` que:
- Na inicialização do app (ou periodicamente), chama `check()` do plugin
- Se há atualização, mostra uma notificação/modal ao usuário com:
  - Versão nova disponível
  - Botão "Atualizar agora" / "Depois"
- Ao confirmar, chama `downloadAndInstall()` que baixa, substitui e reinicia

Opções de UX:
- **Silencioso**: atualiza automaticamente no próximo fechamento do app (mais agressivo, estilo Chrome)
- **Com prompt**: mostra dialog pedindo confirmação (recomendado para um app de produtividade)
- **Passivo**: só mostra badge/indicador nas Settings, usuário atualiza quando quiser

### Configuração do `tauri.conf.json`

Adicionar dentro do JSON raiz:
```json
"plugins": {
  "updater": {
    "pubkey": "CHAVE_PUBLICA_AQUI",
    "endpoints": [
      "https://github.com/OWNER/easydaily/releases/latest/download/latest.json"
    ]
  }
}
```

### Registrar o Plugin no Backend

Em `lib.rs`, adicionar no builder:
```
.plugin(tauri_plugin_updater::Builder::new().build())
```

### Arquivos Afetados

| Arquivo | Mudança |
|---|---|
| `src-tauri/Cargo.toml` | Dependência `tauri-plugin-updater` |
| `package.json` | Dependência `@tauri-apps/plugin-updater` |
| `src-tauri/tauri.conf.json` | Seção `plugins.updater` com pubkey + endpoints |
| `src-tauri/src/lib.rs` | Registrar plugin updater |
| `src/hooks/` | Novo hook `useUpdater.ts` |
| `src/components/` | Modal ou notificação de atualização disponível |
| `src/locales/*.json` | Traduções para update (nova versão disponível, etc.) |

### Riscos e Cuidados

- A chave privada é crítica — se perdida, não é possível assinar novas atualizações. Usuários ficariam presos na versão atual. Guardar backup seguro
- Se o endpoint do update estiver fora do ar, o app deve falhar silenciosamente (não travar)
- A verificação de update deve ser assíncrona e não bloquear a inicialização do app
- Em builds de desenvolvimento (`tauri dev`), desabilitar a checagem de update

---

## Fase 4 — CI/CD com GitHub Actions

### Objetivo

Automatizar o build e a criação de Releases a cada tag push (`v*.*.*`).

### Workflow: Build + Release

O workflow deve:

1. **Trigger**: push de tag `v*` (ex: `v1.1.0`)
2. **Setup**: Windows runner (`windows-latest`), instalar Node.js, Rust, cache de dependências
3. **Build**: `npm ci` → `npm run tauri build`
4. **Signing**: Variáveis `TAURI_SIGNING_PRIVATE_KEY` e `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` via GitHub Secrets
5. **Release**: Criar GitHub Release com:
   - O `.exe` do instalador NSIS
   - O `latest.json` gerado pelo Tauri (para o updater)
   - Changelog/notas de release (extraídas de um CHANGELOG.md ou do commit message)

### GitHub Secrets Necessários

| Secret | Conteúdo |
|---|---|
| `TAURI_SIGNING_PRIVATE_KEY` | Conteúdo da chave privada gerada pelo `tauri signer` |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Senha da chave (se definida) |

### Versionamento Automatizado (Opcional)

Para evitar editar 3 arquivos a cada release, considerar um script ou step no CI que:
- Lê a versão da tag (`v1.2.0` → `1.2.0`)
- Atualiza `package.json`, `tauri.conf.json` e `Cargo.toml` antes do build

Alternativa: usar ferramenta como `cargo-release` ou script bash simples no workflow.

### Estrutura do Workflow

Criar `.github/workflows/release.yml` com:
- Job único rodando em `windows-latest`
- Steps: checkout → setup-node → setup-rust → cache → install deps → build tauri → create release
- A action `tauri-apps/tauri-action` simplifica isso — ela faz o build e cria o Release automaticamente

### Arquivos a Criar

| Arquivo | Conteúdo |
|---|---|
| `.github/workflows/release.yml` | Workflow de build + release |

---

## Fase 5 — Code Signing (Futuro)

### Quando Fazer

Quando o número de downloads justificar o investimento (~$200-400/ano), ou quando o SmartScreen estiver causando abandono significativo de usuários.

### O Que É Necessário

1. Comprar certificado OV (Organization Validation) ou EV (Extended Validation) Code Signing
2. Provedores: DigiCert, Sectigo, GlobalSign
3. EV requer token USB físico (HSM) — mais seguro, remove SmartScreen imediatamente
4. OV pode ser baseado em arquivo — precisa acumular "reputação" no SmartScreen

### Integração com o Build

No `tauri.conf.json`, adicionar configuração de signing:
```json
"windows": {
  "certificateThumbprint": "THUMBPRINT_DO_CERTIFICADO",
  "timestampUrl": "http://timestamp.digicert.com"
}
```

No CI (GitHub Actions), o certificado pode ser importado de um secret Base64-encoded.

### Custo vs. Benefício

| Tipo | Custo/ano | SmartScreen | Complexidade |
|---|---|---|---|
| Sem signing | $0 | Bloqueia sempre | Nenhuma |
| OV | ~$200-400 | Gradual (reputação) | Média |
| EV (HSM) | ~$400-600 | Imediato | Alta (token USB no CI é complexo) |

---

## Ordem de Execução

```
✅ Fase 1 (Autostart) — CONCLUÍDA
  └─→ ✅ Fase 2 (Primeiro build NSIS + testes) — CONCLUÍDA
        └─→ Fase 3 (Tauri Updater + GitHub Releases)
              └─→ Fase 4 (CI/CD com GitHub Actions)
                    └─→ Fase 5 (Code Signing — quando justificar)
```

As Fases 3 e 4 são complementares — o updater precisa de um endpoint (GitHub Releases), e o CI automatiza a publicação nesse endpoint.
