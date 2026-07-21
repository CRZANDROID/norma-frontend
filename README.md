# NORMA — Frontend + Workspace unificado

Frontend del sistema NORMA (React + Vite) y configuración del **workspace especial** que une front y back.

## Repos

| Repo | Rol | URL |
|------|-----|-----|
| `norma-frontend` | App React / Vite (este repo) | https://github.com/CRZANDROID/norma-frontend |
| `norma-backend` | API NestJS | https://github.com/CRZANDROID/norma-backend |

## Abrir el workspace

```bash
bash scripts/setup-workspace.sh
cursor norma.code-workspace
# o: code norma.code-workspace
```

Layout resultante:

```
norma-frontend/          ← este repo
  norma.code-workspace
  norma-backend/         ← clone del repo hermano (gitignore)
  .cursor/environment.json
```

## Acceso Cloud Agents (importante)

`norma-backend` es privado. Cursor solo ve los repos que autorizas en la GitHub App.

1. GitHub → **Settings** → **Applications** → **Authorized GitHub Apps** → **Cursor**
2. En *Repository access*, añade **`CRZANDROID/norma-backend`** (además de `norma-frontend`)
3. En Cursor: Cloud Agents → Environments → entorno multi-repo con ambos repos

Sin ese permiso, el agente no puede clonar https://github.com/CRZANDROID/norma-backend.

## Cloud environment

`.cursor/environment.json` declara **NORMA Full Stack** con:

- dependencia `github.com/CRZANDROID/norma-backend`
- puertos `5173` (front) y `3000` (back)
- terminals de dev para ambos
