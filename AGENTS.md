# NORMA — Workspace unificado (frontend + backend)

## Layout

| Path | Repo |
|------|------|
| `.` (raíz) | [norma-frontend](https://github.com/CRZANDROID/norma-frontend) |
| `norma-backend/` | [norma-backend](https://github.com/CRZANDROID/norma-backend) (clonado o bootstrap) |

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

## Notas

- `norma-backend/` está en `.gitignore` del frontend; es un git repo independiente.
- Si el remoto aún no existe, el script usa `bootstrap/norma-backend/` y deja el `origin` apuntando a GitHub.
- Tras crear `CRZANDROID/norma-backend` en GitHub, otorga acceso a Cursor y haz `git push -u origin main` desde `norma-backend/`.
