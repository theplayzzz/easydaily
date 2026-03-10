# Processo de Release - EasyDaily

## Fluxo de Release (Nova Versão)

### 1. Atualizar versão em 3 arquivos

Editar manualmente ou via comando:

```bash
# package.json (raiz)
"version": "X.X.X"

# src-tauri/Cargo.toml
version = "X.X.X"

# src-tauri/tauri.conf.json
"version": "X.X.X"
```

### 2. Commit das alterações

```bash
git add -A
git commit -m "feat: descrição da feature + bump version to X.X.X"
```

### 3. Criar tag anotada

```bash
git tag -a vX.X.X -m "vX.X.X"
```

### 4. Push do commit e da tag

```bash
git push origin main
git push origin vX.X.X
```

### 5. GitHub Actions

O workflow `.github/workflows/release.yml` é disparado automaticamente quando uma tag `v*` é pushada. Ele:

1. Sincroniza a versão (com `--allow-same-version`)
2. Instala dependências
3. Builda o app com Tauri
4. Cria um Release no GitHub com o installer NSIS

## Comando Resumido (Tudo Junto)

```bash
# Após editar as versões nos 3 arquivos:
git add -A && \
git commit -m "feat: descrição + bump version to X.X.X" && \
git tag -a vX.X.X -m "vX.X.X" && \
git push origin main && \
git push origin vX.X.X
```

## Mover Tag (Se Precisar Refazer)

Se errou algo e precisa refazer a tag apontando para outro commit:

```bash
# Deletar tag local e recriar
git tag -d vX.X.X
git tag -a vX.X.X -m "vX.X.X"

# Push forçado da tag (deleta no remote e reenvia)
git push origin :refs/tags/vX.X.X
git push origin vX.X.X
```

## Versões Históricas

| Tag  | Descrição |
|------|-----------|
| v1.0.6 | Summary viewer modal |
| v1.0.5 | Note editor updates |
| v1.0.4 | Fix CI allow same version |
| v1.0.3 | Versão anterior |

## Arquivos do CI

- `.github/workflows/release.yml` - Workflow de build e release
- Usa `TAURI_SIGNING_PRIVATE_KEY` e `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` (secrets do repo)
