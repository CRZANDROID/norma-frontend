# NORMA — Frontend + Workspace unificado

Frontend del sistema NORMA (React + Vite) y configuración del **workspace especial** que une front y back.

## Repos

| Repo | Rol |
|------|-----|
| [norma-frontend](https://github.com/CRZANDROID/norma-frontend) | App React / Vite (este repo) |
| [norma-backend](https://github.com/CRZANDROID/norma-backend) | API NestJS |

## Abrir el workspace

```bash
bash scripts/setup-workspace.sh
cursor norma.code-workspace
# o: code norma.code-workspace
```

Eso deja:

```
norma-frontend/          ← este repo
  norma.code-workspace
  norma-backend/         ← repo hermano (gitignore)
  bootstrap/norma-backend/
  .cursor/environment.json
```

## Cloud Agents (Cursor)

`.cursor/environment.json` declara el entorno **NORMA Full Stack** con:

- dependencia `github.com/CRZANDROID/norma-backend`
- puertos `5173` (front) y `3000` (back)
- terminals de dev para ambos

Cuando el repo backend exista en GitHub, añádelo al entorno multi-repo de Cursor (Cloud Agents → Environments) y otorga acceso a la GitHub App.

## Crear el remoto del backend (una vez)

```bash
# En GitHub: crear CRZANDROID/norma-backend (vacío)
cd norma-backend
git push -u origin main
```
