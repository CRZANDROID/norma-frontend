# NORMA — Frontend

Aplicación React + Vite + Tailwind CSS + Radix UI + NestJS auth + Zustand.

## Requisitos

- Node.js 20+
- pnpm

## Setup local

```bash
pnpm install
cp .env.example .env
pnpm dev
```

App en `http://localhost:5173`  
API NestJS en `http://localhost:3000` (`VITE_API_URL`).

## Estructura

```
src/
  app/           # providers, router, layouts
  features/      # auth, clients, sources, users…
  shared/        # ui, lib (axios, auth-token, cn)
  store/         # Zustand (sesión)
```

## Rutas

| Ruta | Página |
|------|--------|
| `/login` | Login |
| `/dashboard` | Dashboard |
| `/alertas` | Alertas |
| `/clientes` | Clientes |
| `/fuentes` | Fuentes |
| `/usuarios` | Usuarios |

## Ambientes

| Ambiente | Uso | URL objetivo |
|----------|-----|--------------|
| `development` | Local | `http://localhost:5173` |
| `staging` | Validación | TBD |
| `production` | Clientes | TBD |

Variables (`VITE_*` se embeben en build):

| Variable | Descripción |
|----------|-------------|
| `VITE_API_URL` | URL del backend NestJS |
| `VITE_USE_API_MOCK` | Datos locales sin Nest |
| `VITE_DESIGN_PREVIEW` | Salta `/login` (solo UI) |

Auth: `POST /auth/login` (Nest) → JWT en `localStorage` → `Authorization: Bearer <token>` en Axios.

Tablero: [NORMA — Piloto Arca](https://github.com/users/CRZANDROID/projects/1)

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Radix UI
- React Router 7
- Axios
- Zustand

## Documentación para agentes y colaboradores

| Archivo | Contenido |
|---------|-----------|
| [AGENTS.md](./AGENTS.md) | Índice de entrada para cualquier agente |
| [docs/PRODUCT.md](./docs/PRODUCT.md) | Límites de producto del frontend |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Stack, carpeta `app/`+`features/`+`shared/` |
| [docs/SPRINTS.md](./docs/SPRINTS.md) | Qué hace el frontend por sprint |
| [docs/POSTMAN-BACKEND.md](./docs/POSTMAN-BACKEND.md) | Contrato API / pruebas Postman |
