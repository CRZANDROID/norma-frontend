# NORMA — Workspace unificado (frontend + backend)

## Layout

| Path | Repo |
|------|------|
| `.` (raíz) | https://github.com/CRZANDROID/norma-frontend |
| `norma-backend/` | https://github.com/CRZANDROID/norma-backend |

Abre siempre `norma.code-workspace` para el multi-root.

## Setup

```bash
bash scripts/setup-workspace.sh
cd norma-backend && pnpm install
# en la raíz del frontend, cuando haya package.json:
pnpm install
```

## Puertos

- Frontend Vite: `5173`
- Backend NestJS: `3000`

## Acceso al backend

El remoto real es `CRZANDROID/norma-backend` (privado). Si `git clone` / `gh repo view` fallan con 404, falta otorgar el repo a la GitHub App de Cursor (*Repository access*).

`norma-backend/` en disco está en `.gitignore` del frontend; es un git repo independiente.
